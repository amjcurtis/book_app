'use strict';

// Application dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// Load environment variables from .env file
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({ extended: true }));

// Set file location for EJS templates and static files like CSS
app.set('view engine', 'ejs');
app.use(express.static('public'));

//DATABASE SETUP
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err))

///////////////////////////////
// API Routes
///////////////////////////////

// Render homepage
app.get('/', getBooksFromDatabase);

// Render search form
app.get('/searches/new', newSearch);

// Create new search to Google Books API
app.post('/searches/show', createSearch); // Listens for post (from html form in index.ejs)

// Route to book details view
app.get('/books/book-details/:book_id', getOneBook);

// Catch-all for errors (must come after all other routes)
app.get('*', (request, response) => response.status(404).send('This route does not exist!'));

// Start server listening on port
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

///////////////////////////////
// MODELS
///////////////////////////////

function Book(res) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg'; // Attribution: used in solution code we went over in in-class code review
  this.title = res.title;
  this.author = res.authors;
  this.image_url = res.imageLinks ? res.imageLinks.smallThumbnail : placeholderImage;
  this.description = res.description ? res.description : 'No description available';
  this.isbn = res.industryIdentifiers ? `ISBN_13 ${res.industryIdentifiers[0].identifier}` : 'No ISBN available';
}

///////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////

function getBooksFromDatabase(request, response){
  let SQL = 'SELECT * from books;';
  return client.query(SQL)
    .then(results => response.render('pages/index', {books: results.rows})) // NEED TO SPECIFY INDEX OF rows?
    .catch(error => handleError(error, response));
}

function getOneBook(request, response){
  let SQL =  'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.book_id];
  console.log('values', values);

  return client.query(SQL, values)
    .then(result => {
      // console.log('single', result.rows[0]);
      return response.render('pages/books/book-details', {books: result.rows});
    }) // NEED TO SPECIFY INDEX OF rows?
    .catch(err => handleError (err, response));
}

function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

function newSearch(request, response) {
  response.render('pages/searches/new');
  app.use(express.static('public'));
}

function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log('request.body', request.body);
  console.log('request.body.search', request.body.search);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  console.log('url', url);

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchResults: results }))
    .catch(error => handleError(error, response));

}


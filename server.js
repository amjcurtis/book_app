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

// Render search form
app.get('/', newSearch);

// Create new search to Google Books API
// Listens for post (from html form in index.ejs)
app.post('/searches/show', createSearch); 

// Catch-all for errors (must come after all other routes)
app.get('*', (request, response) => response.status(404).send('This route does not exist!'));

// Start server listening on port
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

//get details page
// app.get('/details/:book_details', viewDetails);

///////////////////////////////
// MODELS
///////////////////////////////

function Book(res) {
  // const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg'; // Attribution: used in solution code we went over in in-class code review

  this.title = res.title;
  this.author = res.authors;
  // TODO Add short-circuit evaluation in case API returns no image
  // TODO Find out why the result chains below were used in the solution code we reviewed in class: 
  // res.imageLinks ? res.imageLinks.smallThumbnail : placeholderImage;
  this.image_url = res.thumbnail; 
  this.description = res.description; // TODO Add short-circuit fallback in case no description?
}

///////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////
function getSearchHistory(request, response){
  let SQL = 'SELECT * from books;';

  return client.query(SQL)
    .then(results => response.render('index', {results: results.rows}))
    .catch(error => handleError(error, response));
}

// function viewDetails(request, response){
//   let SQL =  'SELECT * FROM books WHERE id=$1;';
//   let values = [request.params.'PARAM_GOES_HERE'];

//   return client.query(SQL, values)
//     .then(result => {
//       return response.render('pages/book-details', {task:result.rows[0]});
//     })
//     .catch(err => handleError (err, response));
// }

function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

function newSearch(request, response) {
  response.render('pages/index');
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

function insertIntoDatabase(request, response) {
  
  let newSQL = 'INSERT INTO books (author, title, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ID;';
  console.log('newSQL', newSQL);
  
  
  return client.query(newSQL, newValues)
    .then(result => {

    });
}

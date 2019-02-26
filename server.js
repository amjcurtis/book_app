'use strict';

// Application dependencies
const express = require('express');
const superagent = require('superagent');

// Load environment variables from .env file
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({ extended: true }));

// Set file location for EJS templates and static files like CSS
app.set('view engine', 'ejs');
app.use(express.static('./public'));

///////////////////////////////
// API Routes
///////////////////////////////

// Render search form
app.get('/', newSearch);

// Create new search to Google Books API
app.post('/searches', createSearch);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist!'));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

///////////////////////////////
// MODELS
///////////////////////////////

function Book(request) {
  this.title = request.title;
  this.author = request.authors;
  this.image_url = request.imageLinks.thumbnail; // TODO Add short-circuit evaluation in case API returns no image
  this.description = request.description; // TODO Add shot-circuit fallback in case no description?
}

///////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////

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
  console.log(request.body.search);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  console.log('url', url);

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchResults: results }));
}

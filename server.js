'use strict';

// Application dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

// Load environment variables from .env file
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// Set file location for EJS templates and static files like CSS
app.set('view engine', 'ejs');
app.use(express.static('./public'));

// API Routes

// Test route
app.get('/', (request, response) => {
  response.status(200).send('Hello!!');
});

// Render search form
// app.get('/', newSearch);

// Create new search to Google Books API
// app.post('/searches', createSearch);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist!'));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

DROP TABLE books;

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn NUMERIC(13,0),
  image_url VARCHAR(255),
  description VARCHAR(2000),
  bookshelf VARCHAR(255)
);
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

INSERT INTO books (author, title, isbn, image_url, description, bookshelf) VALUES ('Kipling', 'Jungle Book', '1234567890123', 'asdfsdfasdfasdf', 'sdfsdfsdfdf', 'asdfsdf') RETURNING id;
INSERT INTO books (author, title, isbn, image_url, description, bookshelf) VALUES ('Kipling', 'Jungle Book', '1234567890123', 'asdfsdfasdfasdf', 'sdfsdfsdfdf', 'asdfsdf') RETURNING id;
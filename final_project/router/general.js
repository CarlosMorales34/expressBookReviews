const express = require('express');
const axios = require('axios');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: 'Usarname and password are required.' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'Usarname already exists.' });
  }

  const newUser = { username, password };
  users.push(newUser);

  return res.status(201).json({ message: 'User registered successfully.' });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('URL_DE_TU_API/BOOKS');
    const books = response.data;
    res.json({ books });
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`URL_DE_TU_API/BOOKS/${isbn}`);
    const book = response.data;
    res.json({ book });
  } catch (error) {
    console.error('Error fetching book by ISBN:', error.message);
    res.status(404).json({ message: 'Book not found' });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get(`URL_DE_TU_API/BOOKS?author=${author}`);
    const matchingBooks = response.data;
    res.json({ books: matchingBooks });
  } catch (error) {
    console.error('Error fetching books by author:', error.message);
    res.status(404).json({ message: 'Author not found' });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const response = await axios.get(`URL_DE_TU_API/BOOKS?title=${title}`);
    const matchingBooks = response.data;
    res.json({ books: matchingBooks });
  } catch (error) {
    console.error('Error fetching books by title:', error.message);
    res.status(404).json({ message: 'Title not found' });
  }
});

// Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`URL_DE_TU_API/BOOKS/${isbn}`);
    const book = response.data;

    if (book.reviews && Object.keys(book.reviews).length > 0) {
      res.json({ book });
    } else {
      book.reviews = { message: 'No reviews found' };
      res.status(404).json({ book });
    }
  } catch (error) {
    console.error('Error fetching book and reviews by ISBN:', error.message);
    res.status(404).json({ message: 'Book not found' });
  }
});

module.exports.general = public_users;

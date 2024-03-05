const express = require('express');
const jwt = require('jsonwebtoken');  // Importa jwt desde el paquete jsonwebtoken
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  });
  return usersWithSameName.length > 0;
};

const authenticatedUser = (username, password) => {
  let validUser = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validUser.length > 0;
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    try {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 });

      req.session.authorization = {
        accessToken,
        username
      }

      return res.status(200).json({ message: "User successfully logged in", accessToken, username });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error during token generation" });
    }
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.body;
  const { isbn } = req.params;

  const authorization = req.session.authorization;
    if (!authorization || !authorization.accessToken) {
      return res.status(401).json({ message: "User not authenticated" });
    }

  const loggedInUser = req.session.authorization.username;
  if (isValid(loggedInUser) && books[isbn]) {

    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    if (books[isbn].reviews[loggedInUser]) {
      books[isbn].reviews[loggedInUser] = review;
      return res.status(200).json({ message: "Review update successfully", reviews: books[isbn].reviews });
    } else {
      books[isbn].reviews[loggedInUser] = review;
      return res.status(200).json({ message: "Review added successfully", reviews: books[isbn] });
    }
  } else {
    return res.status(400).json({ message: "User or book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  const authorization = req.session.authorization;
  if (!authorization || !authorization.accessToken) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (books[isbn]) {
    const loggedInUser = authorization.username;

    if (books[isbn].reviews && books[isbn].reviews[loggedInUser]) {
      delete books[isbn].reviews[loggedInUser];
      return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
    } else {
      return res.status(404).json({ message: "Review not found for the user" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

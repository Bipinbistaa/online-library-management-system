-- Online Library Management System Database Schema
-- Creates 7 normalized tables in 3NF

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Table 1: users
CREATE TABLE IF NOT EXISTS users (
  userId INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  address VARCHAR(255),
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive') DEFAULT 'active',
  role ENUM('member', 'admin') DEFAULT 'member'
);

-- Table 2: authors
CREATE TABLE IF NOT EXISTS authors (
  authorId INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  bio TEXT,
  birth_year INT,
  country VARCHAR(50)
);

-- Table 3: categories
CREATE TABLE IF NOT EXISTS categories (
  categoryId INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

-- Table 4: books
CREATE TABLE IF NOT EXISTS books (
  bookId INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  authorId INT NOT NULL,
  categoryId INT NOT NULL,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  publication_year INT,
  publisher VARCHAR(100),
  total_copies INT NOT NULL CHECK (total_copies > 0),
  available_copies INT NOT NULL CHECK (available_copies >= 0),
  description TEXT,
  cover_image VARCHAR(255),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES authors(authorId) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES categories(categoryId) ON DELETE CASCADE
);

-- Table 5: borrows
CREATE TABLE IF NOT EXISTS borrows (
  borrowId INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  bookId INT NOT NULL,
  borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NOT NULL,
  return_date DATE,
  status ENUM('active', 'returned', 'overdue') DEFAULT 'active',
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
  FOREIGN KEY (bookId) REFERENCES books(bookId) ON DELETE CASCADE
);

-- Table 6: reviews
CREATE TABLE IF NOT EXISTS reviews (
  reviewId INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  bookId INT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
  FOREIGN KEY (bookId) REFERENCES books(bookId) ON DELETE CASCADE
);

-- Table 7: admin_logs
CREATE TABLE IF NOT EXISTS admin_logs (
  logId INT PRIMARY KEY AUTO_INCREMENT,
  adminId INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details TEXT,
  FOREIGN KEY (adminId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_borrows_status ON borrows(status);
CREATE INDEX idx_borrows_userId ON borrows(userId);
CREATE INDEX idx_reviews_bookId ON reviews(bookId);

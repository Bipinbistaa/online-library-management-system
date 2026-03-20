USE library_db;

-- View 1: UserBorrowHistory - Get user borrowing records with book details
CREATE OR REPLACE VIEW UserBorrowHistory AS
SELECT 
  b.borrowId,
  b.borrow_date,
  b.due_date,
  b.return_date,
  b.status AS borrow_status,
  u.userId,
  u.username,
  u.full_name,
  u.email,
  bk.bookId,
  bk.title AS book_title,
  bk.isbn,
  a.name AS author_name,
  c.category_name,
  DATEDIFF(COALESCE(b.return_date, CURDATE()), b.due_date) AS days_overdue
FROM borrows b
JOIN users u ON b.userId = u.userId
JOIN books bk ON b.bookId = bk.bookId
JOIN authors a ON bk.authorId = a.authorId
JOIN categories c ON bk.categoryId = c.categoryId;

-- View 2: AvailableBooks - Show books available for borrowing
CREATE OR REPLACE VIEW AvailableBooks AS
SELECT 
  b.bookId,
  b.title,
  b.isbn,
  b.publication_year,
  b.publisher,
  b.available_copies,
  b.total_copies,
  b.description,
  b.cover_image,
  a.name AS author_name,
  a.country AS author_country,
  c.category_name,
  COALESCE(AVG(r.rating), 0) AS avg_rating,
  COUNT(DISTINCT r.reviewId) AS review_count
FROM books b
JOIN authors a ON b.authorId = a.authorId
JOIN categories c ON b.categoryId = c.categoryId
LEFT JOIN reviews r ON b.bookId = r.bookId
WHERE b.available_copies > 0
GROUP BY b.bookId;

-- View 3: TopRatedBooks - Books sorted by average rating
CREATE OR REPLACE VIEW TopRatedBooks AS
SELECT 
  b.bookId,
  b.title,
  b.isbn,
  b.available_copies,
  a.name AS author_name,
  c.category_name,
  COALESCE(AVG(r.rating), 0) AS avg_rating,
  COUNT(DISTINCT r.reviewId) AS review_count,
  COUNT(DISTINCT br.borrowId) AS total_borrows
FROM books b
JOIN authors a ON b.authorId = a.authorId
JOIN categories c ON b.categoryId = c.categoryId
LEFT JOIN reviews r ON b.bookId = r.bookId
LEFT JOIN borrows br ON b.bookId = br.bookId
GROUP BY b.bookId
HAVING review_count > 0
ORDER BY avg_rating DESC, review_count DESC;

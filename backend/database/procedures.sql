USE library_db;

DELIMITER //

-- Procedure 1: BorrowBook - Handle borrowing logic with availability check
CREATE PROCEDURE BorrowBook(
  IN p_userId INT,
  IN p_bookId INT,
  IN p_due_date DATE
)
BEGIN
  DECLARE v_available INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT available_copies INTO v_available
  FROM books
  WHERE bookId = p_bookId
  FOR UPDATE;

  IF v_available IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Book not found';
  END IF;

  IF v_available <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No copies available for borrowing';
  END IF;

  INSERT INTO borrows (userId, bookId, due_date)
  VALUES (p_userId, p_bookId, p_due_date);

  UPDATE books SET available_copies = available_copies - 1
  WHERE bookId = p_bookId;

  COMMIT;
END //

-- Procedure 2: ReturnBook - Handle book return and update availability
CREATE PROCEDURE ReturnBook(
  IN p_borrowId INT
)
BEGIN
  DECLARE v_bookId INT;
  DECLARE v_status VARCHAR(20);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT bookId, status INTO v_bookId, v_status
  FROM borrows
  WHERE borrowId = p_borrowId
  FOR UPDATE;

  IF v_bookId IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Borrow record not found';
  END IF;

  IF v_status = 'returned' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Book already returned';
  END IF;

  UPDATE borrows
  SET status = 'returned', return_date = CURDATE()
  WHERE borrowId = p_borrowId;

  UPDATE books SET available_copies = available_copies + 1
  WHERE bookId = v_bookId;

  COMMIT;
END //

-- Procedure 3: GetUserBorrowHistory - Retrieve user borrowing history
CREATE PROCEDURE GetUserBorrowHistory(
  IN p_userId INT
)
BEGIN
  SELECT 
    b.borrowId,
    b.borrow_date,
    b.due_date,
    b.return_date,
    b.status,
    bk.title AS book_title,
    bk.isbn,
    a.name AS author_name,
    c.category_name,
    CASE 
      WHEN b.status = 'active' AND b.due_date < CURDATE() THEN 'Overdue'
      WHEN b.status = 'active' THEN 'Active'
      WHEN b.status = 'returned' THEN 'Returned'
      ELSE b.status
    END AS borrow_status_label
  FROM borrows b
  JOIN books bk ON b.bookId = bk.bookId
  JOIN authors a ON bk.authorId = a.authorId
  JOIN categories c ON bk.categoryId = c.categoryId
  WHERE b.userId = p_userId
  ORDER BY b.borrow_date DESC;
END //

-- Procedure 4: GetBookStatistics - Get book statistics
CREATE PROCEDURE GetBookStatistics(
  IN p_bookId INT
)
BEGIN
  SELECT 
    bk.bookId,
    bk.title,
    bk.total_copies,
    bk.available_copies,
    bk.total_copies - bk.available_copies AS borrowed_copies,
    COUNT(DISTINCT b.borrowId) AS total_borrows,
    COUNT(DISTINCT CASE WHEN b.status = 'active' THEN b.borrowId END) AS active_borrows,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(DISTINCT r.reviewId) AS total_reviews,
    MAX(b.borrow_date) AS last_borrowed
  FROM books bk
  LEFT JOIN borrows b ON bk.bookId = b.bookId
  LEFT JOIN reviews r ON bk.bookId = r.bookId
  WHERE bk.bookId = p_bookId
  GROUP BY bk.bookId;
END //

DELIMITER ;

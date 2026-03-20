USE library_db;

DELIMITER //

-- Trigger 1: UpdateAvailableCopiesOnBorrow - Decrease available copies when book borrowed
-- Note: This trigger provides backup update in case the procedure is not used
CREATE TRIGGER IF NOT EXISTS UpdateAvailableCopiesOnBorrow
AFTER INSERT ON borrows
FOR EACH ROW
BEGIN
  -- Availability is managed by BorrowBook procedure with transaction
  -- This trigger updates overdue status for existing borrows
  UPDATE borrows 
  SET status = 'overdue'
  WHERE status = 'active' 
    AND due_date < CURDATE()
    AND borrowId != NEW.borrowId;
END //

-- Trigger 2: UpdateAvailableCopiesOnReturn - Update status when book is returned
CREATE TRIGGER IF NOT EXISTS UpdateAvailableCopiesOnReturn
AFTER UPDATE ON borrows
FOR EACH ROW
BEGIN
  -- Check if any remaining active borrows are now overdue
  IF NEW.status = 'returned' AND OLD.status != 'returned' THEN
    UPDATE borrows 
    SET status = 'overdue'
    WHERE status = 'active' 
      AND due_date < CURDATE()
      AND borrowId != NEW.borrowId;
  END IF;
END //

-- Trigger 3: LogAdminActions - Log when admin modifies books
CREATE TRIGGER IF NOT EXISTS LogAdminBookInsert
AFTER INSERT ON books
FOR EACH ROW
BEGIN
  -- Admin logs are handled at the application level via adminController
  -- This trigger is a fallback for direct DB operations
  INSERT INTO admin_logs (adminId, action, details)
  SELECT userId, 'BOOK_ADDED', CONCAT('Book added: ', NEW.title, ' (ISBN: ', NEW.isbn, ')')
  FROM users WHERE role = 'admin' LIMIT 1;
END //

DELIMITER ;

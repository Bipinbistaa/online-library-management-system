const db = require('../config/database');

const borrowBook = async (req, res, next) => {
  try {
    const { bookId, due_date } = req.body;
    const userId = req.user.userId;

    if (!bookId || !due_date) {
      return res.status(400).json({ message: 'Book ID and due date are required' });
    }

    const [books] = await db.query('SELECT * FROM books WHERE bookId = ?', [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (books[0].available_copies <= 0) {
      return res.status(400).json({ message: 'No copies available for borrowing' });
    }

    const [activeBorrows] = await db.query(
      'SELECT borrowId FROM borrows WHERE userId = ? AND bookId = ? AND status = "active"',
      [userId, bookId]
    );

    if (activeBorrows.length > 0) {
      return res.status(400).json({ message: 'You already have an active borrow for this book' });
    }

    await db.query('CALL BorrowBook(?, ?, ?)', [userId, bookId, due_date]);

    const [newBorrow] = await db.query(
      'SELECT b.*, bk.title as book_title FROM borrows b JOIN books bk ON b.bookId = bk.bookId WHERE b.userId = ? AND b.bookId = ? ORDER BY b.borrowId DESC LIMIT 1',
      [userId, bookId]
    );

    res.status(201).json({ message: 'Book borrowed successfully', borrow: newBorrow[0] });
  } catch (error) {
    next(error);
  }
};

const returnBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const [borrows] = await db.query('SELECT * FROM borrows WHERE borrowId = ?', [id]);
    if (borrows.length === 0) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    const borrow = borrows[0];

    if (req.user.role !== 'admin' && borrow.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to return this book' });
    }

    if (borrow.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    await db.query('CALL ReturnBook(?)', [id]);

    res.json({ message: 'Book returned successfully' });
  } catch (error) {
    next(error);
  }
};

const getUserBorrows = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;

    if (req.user.role !== 'admin' && parseInt(userId) !== requestingUserId) {
      return res.status(403).json({ message: 'Not authorized to view these records' });
    }

    const [borrows] = await db.query(`
      SELECT b.*, bk.title as book_title, bk.isbn, a.name as author_name
      FROM borrows b
      JOIN books bk ON b.bookId = bk.bookId
      JOIN authors a ON bk.authorId = a.authorId
      WHERE b.userId = ?
      ORDER BY b.borrow_date DESC
    `, [userId]);

    res.json(borrows);
  } catch (error) {
    next(error);
  }
};

const getBorrowById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [borrows] = await db.query(`
      SELECT b.*, bk.title as book_title, u.username, u.email
      FROM borrows b
      JOIN books bk ON b.bookId = bk.bookId
      JOIN users u ON b.userId = u.userId
      WHERE b.borrowId = ?
    `, [id]);

    if (borrows.length === 0) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    const borrow = borrows[0];

    if (req.user.role !== 'admin' && borrow.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view this record' });
    }

    res.json(borrow);
  } catch (error) {
    next(error);
  }
};

const getAllBorrows = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, bk.title as book_title, u.username, u.full_name
      FROM borrows b
      JOIN books bk ON b.bookId = bk.bookId
      JOIN users u ON b.userId = u.userId
    `;

    const params = [];

    if (status) {
      query += ' WHERE b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.borrow_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [borrows] = await db.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM borrows b';
    if (status) {
      countQuery += ' WHERE b.status = ?';
    }

    const [countResult] = await db.query(countQuery, status ? [status] : []);
    const total = countResult[0].total;

    res.json({
      borrows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { borrowBook, returnBook, getUserBorrows, getBorrowById, getAllBorrows };

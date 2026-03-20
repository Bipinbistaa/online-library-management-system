const db = require('../config/database');

const getDashboard = async (req, res, next) => {
  try {
    const [[totalUsers]] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "member"');
    const [[totalBooks]] = await db.query('SELECT COUNT(*) as count FROM books');
    const [[activeBorrows]] = await db.query('SELECT COUNT(*) as count FROM borrows WHERE status = "active"');
    const [[overdueBorrows]] = await db.query('SELECT COUNT(*) as count FROM borrows WHERE status = "overdue" OR (status = "active" AND due_date < CURDATE())');
    const [[totalReviews]] = await db.query('SELECT COUNT(*) as count FROM reviews');
    const [[availableBooks]] = await db.query('SELECT COUNT(*) as count FROM books WHERE available_copies > 0');

    const [recentBorrows] = await db.query(`
      SELECT b.borrowId, b.borrow_date, b.due_date, b.status,
             bk.title as book_title, u.username, u.full_name
      FROM borrows b
      JOIN books bk ON b.bookId = bk.bookId
      JOIN users u ON b.userId = u.userId
      ORDER BY b.borrow_date DESC
      LIMIT 5
    `);

    const [topBooks] = await db.query(`
      SELECT bk.bookId, bk.title, COUNT(b.borrowId) as borrow_count,
             COALESCE(AVG(r.rating), 0) as avg_rating
      FROM books bk
      LEFT JOIN borrows b ON bk.bookId = b.bookId
      LEFT JOIN reviews r ON bk.bookId = r.bookId
      GROUP BY bk.bookId
      ORDER BY borrow_count DESC
      LIMIT 5
    `);

    res.json({
      stats: {
        totalUsers: totalUsers.count,
        totalBooks: totalBooks.count,
        activeBorrows: activeBorrows.count,
        overdueBorrows: overdueBorrows.count,
        totalReviews: totalReviews.count,
        availableBooks: availableBooks.count
      },
      recentBorrows,
      topBooks
    });
  } catch (error) {
    next(error);
  }
};

const getBooksReport = async (req, res, next) => {
  try {
    const [books] = await db.query(`
      SELECT b.bookId, b.title, b.isbn, b.total_copies, b.available_copies,
             a.name as author_name, c.category_name,
             COUNT(DISTINCT br.borrowId) as total_borrows,
             COALESCE(AVG(r.rating), 0) as avg_rating
      FROM books b
      JOIN authors a ON b.authorId = a.authorId
      JOIN categories c ON b.categoryId = c.categoryId
      LEFT JOIN borrows br ON b.bookId = br.bookId
      LEFT JOIN reviews r ON b.bookId = r.bookId
      GROUP BY b.bookId
      ORDER BY total_borrows DESC
    `);

    res.json(books);
  } catch (error) {
    next(error);
  }
};

const getUsersReport = async (req, res, next) => {
  try {
    const [users] = await db.query(`
      SELECT u.userId, u.username, u.email, u.full_name, u.registration_date, u.status,
             COUNT(DISTINCT b.borrowId) as total_borrows,
             COUNT(DISTINCT r.reviewId) as total_reviews,
             SUM(CASE WHEN b.status = 'active' THEN 1 ELSE 0 END) as active_borrows
      FROM users u
      LEFT JOIN borrows b ON u.userId = b.userId
      LEFT JOIN reviews r ON u.userId = r.userId
      WHERE u.role = 'member'
      GROUP BY u.userId
      ORDER BY total_borrows DESC
    `);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getBorrowsReport = async (req, res, next) => {
  try {
    const [borrows] = await db.query(`
      SELECT b.borrowId, b.borrow_date, b.due_date, b.return_date, b.status,
             bk.title as book_title, bk.isbn,
             u.username, u.full_name, u.email
      FROM borrows b
      JOIN books bk ON b.bookId = bk.bookId
      JOIN users u ON b.userId = u.userId
      ORDER BY b.borrow_date DESC
    `);

    res.json(borrows);
  } catch (error) {
    next(error);
  }
};

const getAdminLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [logs] = await db.query(`
      SELECT l.*, u.username, u.full_name
      FROM admin_logs l
      JOIN users u ON l.adminId = u.userId
      ORDER BY l.action_date DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    const [[total]] = await db.query('SELECT COUNT(*) as count FROM admin_logs');

    res.json({
      logs,
      pagination: {
        total: total.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getBooksReport, getUsersReport, getBorrowsReport, getAdminLogs };

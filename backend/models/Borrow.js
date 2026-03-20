const db = require('../config/database');

class Borrow {
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM borrows WHERE borrowId = ?', [id]);
    return rows[0];
  }

  static async findByUser(userId) {
    const [rows] = await db.query(`
      SELECT b.*, bk.title as book_title
      FROM borrows b
      JOIN books bk ON b.bookId = bk.bookId
      WHERE b.userId = ?
      ORDER BY b.borrow_date DESC
    `, [userId]);
    return rows;
  }

  static async create(borrowData) {
    const { userId, bookId, due_date } = borrowData;
    const [result] = await db.query(
      'INSERT INTO borrows (userId, bookId, due_date) VALUES (?, ?, ?)',
      [userId, bookId, due_date]
    );
    return result.insertId;
  }
}

module.exports = Borrow;

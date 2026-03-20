const db = require('../config/database');

class Review {
  static async findByBook(bookId) {
    const [rows] = await db.query(`
      SELECT r.*, u.username, u.full_name
      FROM reviews r
      JOIN users u ON r.userId = u.userId
      WHERE r.bookId = ?
      ORDER BY r.review_date DESC
    `, [bookId]);
    return rows;
  }

  static async create(reviewData) {
    const { userId, bookId, rating, review_text } = reviewData;
    const [result] = await db.query(
      'INSERT INTO reviews (userId, bookId, rating, review_text) VALUES (?, ?, ?, ?)',
      [userId, bookId, rating, review_text]
    );
    return result.insertId;
  }
}

module.exports = Review;

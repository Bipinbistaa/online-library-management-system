const db = require('../config/database');

const createReview = async (req, res, next) => {
  try {
    const { bookId, rating, review_text } = req.body;
    const userId = req.user.userId;

    if (!bookId || !rating) {
      return res.status(400).json({ message: 'Book ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const [books] = await db.query('SELECT bookId FROM books WHERE bookId = ?', [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const [existing] = await db.query(
      'SELECT reviewId FROM reviews WHERE userId = ? AND bookId = ?',
      [userId, bookId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    const [result] = await db.query(
      'INSERT INTO reviews (userId, bookId, rating, review_text) VALUES (?, ?, ?, ?)',
      [userId, bookId, rating, review_text || null]
    );

    const [newReview] = await db.query(`
      SELECT r.*, u.username, u.full_name
      FROM reviews r
      JOIN users u ON r.userId = u.userId
      WHERE r.reviewId = ?
    `, [result.insertId]);

    res.status(201).json({ message: 'Review created successfully', review: newReview[0] });
  } catch (error) {
    next(error);
  }
};

const getBookReviews = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const [reviews] = await db.query(`
      SELECT r.*, u.username, u.full_name
      FROM reviews r
      JOIN users u ON r.userId = u.userId
      WHERE r.bookId = ?
      ORDER BY r.review_date DESC
    `, [bookId]);

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review_text } = req.body;
    const userId = req.user.userId;

    const [reviews] = await db.query('SELECT * FROM reviews WHERE reviewId = ?', [id]);
    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (reviews[0].userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    await db.query(
      'UPDATE reviews SET rating = ?, review_text = ? WHERE reviewId = ?',
      [rating || reviews[0].rating, review_text || reviews[0].review_text, id]
    );

    const [updated] = await db.query(`
      SELECT r.*, u.username, u.full_name
      FROM reviews r JOIN users u ON r.userId = u.userId
      WHERE r.reviewId = ?
    `, [id]);

    res.json({ message: 'Review updated successfully', review: updated[0] });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const [reviews] = await db.query('SELECT * FROM reviews WHERE reviewId = ?', [id]);
    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (req.user.role !== 'admin' && reviews[0].userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await db.query('DELETE FROM reviews WHERE reviewId = ?', [id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getBookReviews, updateReview, deleteReview };

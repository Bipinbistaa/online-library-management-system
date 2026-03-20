const db = require('../config/database');

class Book {
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM books WHERE bookId = ?', [id]);
    return rows[0];
  }

  static async findAll(filters = {}) {
    let query = 'SELECT b.*, a.name as author_name, c.category_name FROM books b JOIN authors a ON b.authorId = a.authorId JOIN categories c ON b.categoryId = c.categoryId';
    const params = [];
    const conditions = [];

    if (filters.search) {
      conditions.push('(b.title LIKE ? OR a.name LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY b.title ASC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async create(bookData) {
    const { title, authorId, categoryId, isbn, publication_year, publisher, total_copies, description, cover_image } = bookData;
    const [result] = await db.query(
      'INSERT INTO books (title, authorId, categoryId, isbn, publication_year, publisher, total_copies, available_copies, description, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, authorId, categoryId, isbn, publication_year, publisher, total_copies, total_copies, description, cover_image]
    );
    return result.insertId;
  }
}

module.exports = Book;

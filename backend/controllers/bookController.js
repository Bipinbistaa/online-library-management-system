const db = require('../config/database');

const getAllBooks = async (req, res, next) => {
  try {
    const { search, categoryId, authorId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.bookId, b.title, b.isbn, b.publication_year, b.publisher,
             b.total_copies, b.available_copies, b.description, b.cover_image,
             a.name as author_name, a.authorId,
             c.category_name, c.categoryId,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(DISTINCT r.reviewId) as review_count
      FROM books b
      JOIN authors a ON b.authorId = a.authorId
      JOIN categories c ON b.categoryId = c.categoryId
      LEFT JOIN reviews r ON b.bookId = r.bookId
    `;

    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(b.title LIKE ? OR a.name LIKE ? OR b.isbn LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      conditions.push('b.categoryId = ?');
      params.push(categoryId);
    }

    if (authorId) {
      conditions.push('b.authorId = ?');
      params.push(authorId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY b.bookId ORDER BY b.title ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [books] = await db.query(query, params);

    let countQuery = 'SELECT COUNT(DISTINCT b.bookId) as total FROM books b JOIN authors a ON b.authorId = a.authorId JOIN categories c ON b.categoryId = c.categoryId';
    const countParams = [];

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      if (search) {
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (categoryId) countParams.push(categoryId);
      if (authorId) countParams.push(authorId);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      books,
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

const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [books] = await db.query(`
      SELECT b.*, a.name as author_name, a.bio as author_bio, a.country as author_country,
             c.category_name,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(DISTINCT r.reviewId) as review_count
      FROM books b
      JOIN authors a ON b.authorId = a.authorId
      JOIN categories c ON b.categoryId = c.categoryId
      LEFT JOIN reviews r ON b.bookId = r.bookId
      WHERE b.bookId = ?
      GROUP BY b.bookId
    `, [id]);

    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(books[0]);
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const { title, authorId, categoryId, isbn, publication_year, publisher, total_copies, description } = req.body;
    const cover_image = req.file ? req.file.filename : null;

    const [result] = await db.query(
      'INSERT INTO books (title, authorId, categoryId, isbn, publication_year, publisher, total_copies, available_copies, description, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, authorId, categoryId, isbn, publication_year || null, publisher || null, total_copies, total_copies, description || null, cover_image]
    );

    const [newBook] = await db.query('SELECT * FROM books WHERE bookId = ?', [result.insertId]);

    res.status(201).json({ message: 'Book created successfully', book: newBook[0] });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, authorId, categoryId, isbn, publication_year, publisher, total_copies, description } = req.body;

    const [existing] = await db.query('SELECT * FROM books WHERE bookId = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = existing[0];
    const cover_image = req.file ? req.file.filename : book.cover_image;

    const diff = (total_copies || book.total_copies) - book.total_copies;
    const new_available = Math.max(0, book.available_copies + diff);

    await db.query(
      'UPDATE books SET title=?, authorId=?, categoryId=?, isbn=?, publication_year=?, publisher=?, total_copies=?, available_copies=?, description=?, cover_image=? WHERE bookId=?',
      [title || book.title, authorId || book.authorId, categoryId || book.categoryId, isbn || book.isbn, publication_year || book.publication_year, publisher || book.publisher, total_copies || book.total_copies, new_available, description || book.description, cover_image, id]
    );

    const [updated] = await db.query('SELECT * FROM books WHERE bookId = ?', [id]);
    res.json({ message: 'Book updated successfully', book: updated[0] });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT bookId FROM books WHERE bookId = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await db.query('DELETE FROM books WHERE bookId = ?', [id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY category_name');
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (category_name, description) VALUES (?, ?)',
      [category_name, description || null]
    );

    const [newCategory] = await db.query('SELECT * FROM categories WHERE categoryId = ?', [result.insertId]);
    res.status(201).json({ message: 'Category created successfully', category: newCategory[0] });
  } catch (error) {
    next(error);
  }
};

const getAuthors = async (req, res, next) => {
  try {
    const [authors] = await db.query('SELECT * FROM authors ORDER BY name');
    res.json(authors);
  } catch (error) {
    next(error);
  }
};

const createAuthor = async (req, res, next) => {
  try {
    const { name, bio, birth_year, country } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Author name is required' });
    }

    const [result] = await db.query(
      'INSERT INTO authors (name, bio, birth_year, country) VALUES (?, ?, ?, ?)',
      [name, bio || null, birth_year || null, country || null]
    );

    const [newAuthor] = await db.query('SELECT * FROM authors WHERE authorId = ?', [result.insertId]);
    res.status(201).json({ message: 'Author created successfully', author: newAuthor[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook, getCategories, createCategory, getAuthors, createAuthor };

const bcrypt = require('bcryptjs');
const db = require('../config/database');

const getProfile = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT userId, username, email, full_name, phone, address, registration_date, status, role FROM users WHERE userId = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, address, password } = req.body;
    const userId = req.user.userId;

    const [users] = await db.query('SELECT * FROM users WHERE userId = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    let password_hash = users[0].password_hash;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      password_hash = await bcrypt.hash(password, 12);
    }

    await db.query(
      'UPDATE users SET full_name=?, phone=?, address=?, password_hash=? WHERE userId=?',
      [full_name || users[0].full_name, phone || users[0].phone, address || users[0].address, password_hash, userId]
    );

    const [updated] = await db.query(
      'SELECT userId, username, email, full_name, phone, address, registration_date, status, role FROM users WHERE userId = ?',
      [userId]
    );

    res.json({ message: 'Profile updated successfully', user: updated[0] });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT userId, username, email, full_name, phone, registration_date, status, role FROM users';
    const params = [];

    if (search) {
      query += ' WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY registration_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await db.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM users';
    if (search) {
      countQuery += ' WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?';
    }

    const [countResult] = await db.query(countQuery, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []);

    res.json({
      users,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE userId = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.query(
      'UPDATE users SET status=?, role=? WHERE userId=?',
      [status || users[0].status, role || users[0].role, id]
    );

    const [updated] = await db.query(
      'SELECT userId, username, email, full_name, status, role FROM users WHERE userId = ?',
      [id]
    );

    res.json({ message: 'User updated successfully', user: updated[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getAllUsers, updateUser };

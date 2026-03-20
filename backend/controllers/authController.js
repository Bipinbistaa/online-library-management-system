const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, phone, address } = req.body;

    const [existing] = await db.query(
      'SELECT userId FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'User with this email or username already exists' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, full_name, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password_hash, full_name, phone || null, address || null]
    );

    const [newUser] = await db.query(
      'SELECT userId, username, email, full_name, role, status FROM users WHERE userId = ?',
      [result.insertId]
    );

    const token = generateToken(newUser[0]);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser[0]
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

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

module.exports = { register, login, logout, getProfile };

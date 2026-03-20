const db = require('../config/database');

class User {
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE userId = ?', [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const { username, email, password_hash, full_name, phone, address } = userData;
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, full_name, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password_hash, full_name, phone, address]
    );
    return result.insertId;
  }

  static async update(id, userData) {
    const fields = Object.keys(userData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(userData), id];
    await db.query(`UPDATE users SET ${fields} WHERE userId = ?`, values);
  }
}

module.exports = User;

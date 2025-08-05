const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  },

  async create({ email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function (err) {
        if (err) reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
};

module.exports = User;

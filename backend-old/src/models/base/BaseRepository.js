const { db } = require('../../config/database');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  findOne(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  find(conditions = {}, limit = 10, offset = 0) {
    return new Promise((resolve, reject) => {
      let query = `SELECT * FROM ${this.tableName}`;
      const params = [];

      const whereClauses = [];
      Object.entries(conditions).forEach(([key, value]) => {
        whereClauses.push(`${key} = ?`);
        params.push(value);
      });

      if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
      }

      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  create(data) {
    return new Promise((resolve, reject) => {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;

      db.run(query, values, function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];

      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;

      db.run(query, values, function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }
}

module.exports = BaseRepository;

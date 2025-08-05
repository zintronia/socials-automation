const BaseRepository = require('./base/BaseRepository');

class TweetModel extends BaseRepository {
  constructor() {
    super('tweets');
  }

  async findByUserId(userId, options = {}) {
    const { limit = 10, offset = 0, status } = options;
    let query = 'SELECT * FROM tweets WHERE user_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  async getStats(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) as posted,
          SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
        FROM tweets 
        WHERE user_id = ?
      `;
      
      db.get(query, [userId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
}

module.exports = new TweetModel();

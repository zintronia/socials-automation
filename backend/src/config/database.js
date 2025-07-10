const sqlite3 = require('sqlite3').verbose();

// Initialize database
const db = new sqlite3.Database(process.env.DATABASE_URL.replace('sqlite://', ''), (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }

  // Create tables
  const createDocumentsTable = `
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createTweetsTable = `
    CREATE TABLE IF NOT EXISTS tweets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      document_id INTEGER,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      posted_at DATETIME,
      scheduled_at DATETIME,
      twitter_id TEXT,
      keywords TEXT,
      sentiment TEXT,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    )
  `;

  // Create tables only if they don't exist
  db.serialize(() => {
    db.get('SELECT name FROM sqlite_master WHERE type="table" AND name="documents"', (err, row) => {
      if (!row) {
        db.run(createDocumentsTable, (err) => {
          if (err) console.error('Error creating documents table:', err);
        });
      }
    });

    db.get('SELECT name FROM sqlite_master WHERE type="table" AND name="tweets"', (err, row) => {
      if (!row) {
        db.run(createTweetsTable, (err) => {
          if (err) console.error('Error creating tweets table:', err);
        });
      }
    });
  });
});

module.exports = db;

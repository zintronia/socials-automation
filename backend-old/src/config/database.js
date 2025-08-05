const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize SQLite database
const dbPath = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace('sqlite://', '')
  : path.resolve(__dirname, '..', 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }

  console.log('Connected to the SQLite database.');

  // Enable foreign key constraints
  db.get("PRAGMA foreign_keys = ON");

  // Table creation queries
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME DEFAULT NULL
    )
  `;

  const createDocumentsTable = `
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filepath TEXT,
      content TEXT,
      user_id INTEGER,
      mimetype TEXT,
      size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;

  const createTweetsTable = `
    CREATE TABLE IF NOT EXISTS tweets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      document_id INTEGER,
      user_id INTEGER,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      posted_at DATETIME,
      scheduled_at DATETIME,
      twitter_id TEXT,
      keywords TEXT,
      sentiment TEXT,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  // Create tables in a transaction
  db.serialize(() => {
    // Create users table
    db.run(createUsersTable, (err) => {
      if (err) console.error('Error creating users table:', err);
    });

    // Create documents table
    db.run(createDocumentsTable, (err) => {
      if (err) console.error('Error creating documents table:', err);
    });

    // Create tweets table
    db.run(createTweetsTable, (err) => {
      if (err) console.error('Error creating tweets table:', err);
    });
  });
});

// Initialize Redis client
const redis = require('redis');
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis
redisClient.connect().catch(console.error);

// Export both database connections
module.exports = {
  db,
  redis: redisClient,
  // Helper function to close all database connections
  closeConnections: async () => {
    return new Promise((resolve) => {
      db.close((err) => {
        if (err) console.error('Error closing SQLite connection:', err);
        redisClient.quit()
          .then(() => {
            console.log('All database connections closed');
            resolve();
          })
          .catch(console.error);
      });
    });
  }
};


//TWEET GENERATIONS
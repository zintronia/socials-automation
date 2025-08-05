const { db } = require('../src/config/database');

// Migration to add last_login column to users table
const migrate = () => {
  return new Promise((resolve, reject) => {
    db.run(
      `ALTER TABLE users ADD COLUMN last_login DATETIME DEFAULT NULL`,
      [],
      function(err) {
        if (err) {
          // If the column already exists, we can ignore the error
          if (err.message.includes('duplicate column name')) {
            console.log('last_login column already exists');
            return resolve();
          }
          return reject(err);
        }
        console.log('Added last_login column to users table');
        resolve();
      }
    );
  });
};

// Run the migration
migrate()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });

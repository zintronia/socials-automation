const { db } = require('../src/config/database');

// Migration to add mimetype column to documents table
const migrate = () => {
  return new Promise((resolve, reject) => {
    db.run(
      `ALTER TABLE documents ADD COLUMN mimetype TEXT`,
      [],
      function(err) {
        if (err) {
          // If the column already exists, we can ignore the error
          if (err.message.includes('duplicate column name')) {
            console.log('mimetype column already exists');
            return resolve();
          }
          return reject(err);
        }
        console.log('Added mimetype column to documents table');
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

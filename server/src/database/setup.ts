import { database } from '../config/database';
import { logger } from '../utils/logger.utils';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
    try {
        logger.info('Starting database setup...');

        // Read the schema file
        const schemaSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', '001_initial_schema.sql'),
            'utf8'
        );

        // Begin transaction
        await database.query('BEGIN');

        // Execute schema creation
        await database.query(schemaSQL);

        // Commit transaction
        await database.query('COMMIT');

        logger.info('Database setup completed successfully');
    } catch (error) {
        // Rollback on error
        await database.query('ROLLBACK');
        logger.error('Database setup failed:', error);
        throw error;
    }
}

if (require.main === module) {
    setupDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export { setupDatabase };

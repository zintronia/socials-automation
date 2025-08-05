import { database } from '../config/database';
import { logger } from '../utils/logger.utils';
import fs from 'fs';
import path from 'path';

async function seedDatabase() {
    try {
        logger.info('Starting database seeding...');

        // Read the seed file
        const seedSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', '002_seed_default_data.sql'),
            'utf8'
        );

        // Begin transaction
        await database.query('BEGIN');

        // Execute seeding
        await database.query(seedSQL);

        // Commit transaction
        await database.query('COMMIT');

        logger.info('Database seeding completed successfully');
    } catch (error) {
        // Rollback on error
        await database.query('ROLLBACK');
        logger.error('Database seeding failed:', error);
        throw error;
    }
}

if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export { seedDatabase };

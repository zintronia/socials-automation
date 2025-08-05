import { database } from '../config/database';

export async function withTransaction<T>(fn: (client: any) => Promise<T>): Promise<T> {
    const client = await database.getClient();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
} 
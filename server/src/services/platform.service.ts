import { database } from '../config/database';
import { Platform } from '../types';

class PlatformService {
    async getById(id: number): Promise<Platform | null> {
        const query = 'SELECT * FROM platforms WHERE id = $1';
        const result = await database.query(query, [id]);
        return result.rows[0] || null;
    }

    async getAll(): Promise<Platform[]> {
        const query = 'SELECT * FROM platforms WHERE is_active = true ORDER BY name ASC';
        const result = await database.query(query);
        return result.rows;
    }
}

export const platformService = new PlatformService(); 
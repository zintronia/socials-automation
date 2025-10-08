import { database } from '../config/database';
import { logger } from '../utils/logger.utils';

export interface CreateUserInput {
  clerkId: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export const userService = {
  async createUser(userData: CreateUserInput): Promise<User> {
    try {
      const query = `
        INSERT INTO users (id, email, first_name, last_name, profile_image_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [
        userData.clerkId,
        userData.email,
        userData.first_name,
        userData.last_name,
        userData.profile_image_url || null
      ];

      const result = await database.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(clerkId: string, userData: Partial<CreateUserInput>): Promise<User> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      const query = `
        UPDATE users 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      values.push(clerkId);
      const result = await database.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  },

  async findUserByClerkId(clerkId: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await database.query(query, [clerkId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by clerk ID:', error);
      throw error;
    }
  },

  async deleteUser(clerkId: string): Promise<void> {
    try {
      const query = 'DELETE FROM users WHERE id = $1';
      await database.query(query, [clerkId]);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }
};

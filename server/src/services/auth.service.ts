import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/environment';
import { database } from '../config/database';
import { UserModel } from '../models/user.model';
import { logger } from '../utils/logger.utils';

const SALT_ROUNDS = 12;

class AuthService {
    async register({ email, password, first_name, last_name }: any) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
      VALUES ($1, $2, $3, $4, 'user', true)
      RETURNING *
    `;
        const result = await database.query(query, [email, hashedPassword, first_name, last_name]);
        const user = UserModel.fromRow(result.rows[0]);
        logger.info('User registered', { userId: user.id });
        return user;
    }

    async login({ email, password }: any) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await database.query(query, [email]);
        if (result.rows.length === 0) throw new Error('Invalid credentials');
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) throw new Error('Invalid credentials');
        if (!user.is_active) throw new Error('Account is deactivated');
        const token = this.generateToken(user.id);
        const refreshToken = this.generateRefreshToken(user.id);
        logger.info('User logged in', { userId: user.id });
        return {
            user: UserModel.fromRow(user),
            token,
            refreshToken,
            expiresIn: config.jwt.expiresIn
        };
    }

    generateToken(userId: number) {
        const options: SignOptions = { expiresIn: config.jwt.expiresIn as any };
        return jwt.sign({ userId }, config.jwt.secret, options);
    }

    generateRefreshToken(userId: number) {
        const options: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as any };
        return jwt.sign({ userId }, config.jwt.refreshSecret, options);
    }

    verifyToken(token: string) {
        return jwt.verify(token, config.jwt.secret) as any;
    }

    async refreshToken(refreshToken: string) {
        try {
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
            const user = await this.getUserById(decoded.userId);
            if (!user || !user.is_active) {
                throw new Error('Invalid refresh token');
            }

            const newToken = this.generateToken(user.id);
            const newRefreshToken = this.generateRefreshToken(user.id);

            return {
                token: newToken,
                refreshToken: newRefreshToken,
                expiresIn: config.jwt.expiresIn
            };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    async getUserById(userId: number) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await database.query(query, [userId]);
        if (result.rows.length === 0) return null;
        return UserModel.fromRow(result.rows[0]);
    }
}

export const authService = new AuthService(); 
import { BaseModel } from './base.model';
import { User } from '../types';

export class UserModel extends BaseModel implements User {
    email!: string;
    first_name!: string;
    last_name!: string;
    role!: string;
    is_active!: boolean;
    last_login!: Date | null;

    constructor(data: Partial<User>) {
        super(data);
        Object.assign(this, data);
    }

    static fromRow(row: any): UserModel {
        return new UserModel({
            id: row.id,
            email: row.email,
            first_name: row.first_name,
            last_name: row.last_name,
            role: row.role,
            is_active: row.is_active,
            last_login: row.last_login ? new Date(row.last_login) : null,
            created_at: row.created_at ? new Date(row.created_at) : undefined,
            updated_at: row.updated_at ? new Date(row.updated_at) : undefined
        });
    }
} 
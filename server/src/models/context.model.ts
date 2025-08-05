import { BaseModel } from './base.model';
import { Context } from '../types';

export class ContextModel extends BaseModel implements Context {
    user_id!: number;
    template_id?: number;
    platform_id!: number;
    category_id?: number;
    type!: Context['type'];
    title!: string;
    topic?: string;
    brief?: string;
    content!: string;
    source?: string;
    language!: string;
    region?: string;
    mimetype?: string;
    size?: number;
    template_variables!: Record<string, any>;
    tone?: string;
    writing_style?: string;
    target_audience?: string;
    system_instructions?: string;
    is_processed!: boolean;
    processed_at?: Date;
    processing_error?: string;
    metadata!: Record<string, any>;
    // Joined fields
    template_name?: string;
    platform_name?: string;
    category_name?: string;
    tags?: string[];

    constructor(data: Partial<Context>) {
        super(data);
        Object.assign(this, data);
    }

    static fromRow(row: any): ContextModel {
        return new ContextModel({
            ...row,
            created_at: row.created_at ? new Date(row.created_at) : undefined,
            updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
            processed_at: row.processed_at ? new Date(row.processed_at) : undefined,
            template_variables: row.template_variables ? JSON.parse(row.template_variables) : {},
            metadata: row.metadata ? JSON.parse(row.metadata) : {},
            tags: row.tags || []
        });
    }
} 
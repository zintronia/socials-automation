import { BaseModel } from './base.model';
import { Post } from '../types';

export class PostModel extends BaseModel implements Post {
    user_id!: number;
    context_id?: number;
    platform_id!: number;
    content!: string;
    content_type!: string;
    hashtags!: string[];
    mentions!: string[];
    status!: Post['status'];
    scheduled_for?: Date;
    published_at?: Date;
    platform_post_id?: string;
    platform_url?: string;
    platform_response!: Record<string, any>;
    engagement_metrics!: Record<string, any>;
    last_metrics_update?: Date;
    error_message?: string;
    retry_count!: number;
    metadata!: Record<string, any>;
    // Joined fields
    context_title?: string;
    platform_name?: string;
    user_email?: string;

    constructor(data: Partial<Post>) {
        super(data);
        Object.assign(this, data);
    }

    static fromRow(row: any): PostModel {
        return new PostModel({
            ...row,
            created_at: row.created_at ? new Date(row.created_at) : undefined,
            updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
            scheduled_for: row.scheduled_for ? new Date(row.scheduled_for) : undefined,
            published_at: row.published_at ? new Date(row.published_at) : undefined,
            last_metrics_update: row.last_metrics_update ? new Date(row.last_metrics_update) : undefined,
            hashtags: row.hashtags || [],
            mentions: row.mentions || [],
            platform_response: row.platform_response ? JSON.parse(row.platform_response) : {},
            engagement_metrics: row.engagement_metrics ? JSON.parse(row.engagement_metrics) : {},
            metadata: row.metadata ? JSON.parse(row.metadata) : {},
        });
    }
} 
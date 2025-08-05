import { BaseModel } from './base.model';
import { ContextTemplate, TemplateVariable } from '../types';

export class ContextTemplateModel extends BaseModel implements ContextTemplate {
    user_id?: number;
    platform_id!: number;
    template_type_id!: number;
    category_id?: number;
    name!: string;
    description?: string;
    system_instructions!: string;
    tone!: string;
    writing_style!: string;
    target_audience!: string;
    use_hashtags!: boolean;
    max_hashtags!: number;
    hashtag_strategy!: string;
    include_cta!: boolean;
    cta_type?: string;
    content_structure!: Record<string, any>;
    engagement_level!: string;
    call_to_action_templates!: string[];
    is_default!: boolean;
    is_public!: boolean;
    is_active!: boolean;
    usage_count!: number;
    // Joined fields
    category_name?: string;
    platform_name?: string;
    template_type_name?: string;
    variables?: TemplateVariable[];

    constructor(data: Partial<ContextTemplate>) {
        super(data);
        Object.assign(this, data);
    }

    static fromRow(row: any): ContextTemplateModel {
        return new ContextTemplateModel({
            ...row,
            created_at: row.created_at ? new Date(row.created_at) : undefined,
            updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
            content_structure: row.content_structure ? JSON.parse(row.content_structure) : {},
            call_to_action_templates: row.call_to_action_templates || [],
            variables: row.variables || []
        });
    }
} 
import Joi from 'joi';

export const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(64).required(),
    first_name: Joi.string().max(50).required(),
    last_name: Joi.string().max(50).required()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const createContextSchema = Joi.object({
    type: Joi.string().valid('document', 'text', 'url').default('text'),
    title: Joi.string().max(255).required(),
    topic: Joi.string().max(100).optional(),
    brief: Joi.string().max(500).optional(),
    content: Joi.string().required(),
    source: Joi.string().max(500).optional(),
    mimetype: Joi.string().optional(),
    size: Joi.number().integer().min(0).optional()
});

export const createTemplateSchema = Joi.object({
    platform_id: Joi.number().required(),
    category_id: Joi.number().optional(),
    name: Joi.string().max(100).required(),
    description: Joi.string().max(500).optional(),
    system_instructions: Joi.string().required(),
    tone: Joi.string().required(),
    writing_style: Joi.string().required(),
    target_audience: Joi.string().required(),
    use_hashtags: Joi.boolean().optional(),
    max_hashtags: Joi.number().optional(),
    hashtag_strategy: Joi.string().optional(),
    include_cta: Joi.boolean().optional(),
    cta_type: Joi.string().optional(),
    content_structure: Joi.object().optional(),
    engagement_level: Joi.string().optional(),
    call_to_action_templates: Joi.array().items(Joi.string()).optional(),
    is_public: Joi.boolean().optional()
});

export const generatePostSchema = Joi.object({
    context_id: Joi.number().optional(),
    prompt: Joi.string().optional(),
    campaign_id: Joi.number().required(),
    platforms: Joi.array()
        .items(
            Joi.object({
                platform_id: Joi.number().required(),
                template_id: Joi.number().optional(),
                social_account_id: Joi.number().optional(),
                scheduled_for: Joi.date().optional(),
            })
        )
        .min(1)
        .required(),
}).or('context_id', 'prompt');

export const updatePostSchema = Joi.object({
    content: Joi.string().optional(),
    campaign_id: Joi.number().optional(),
    scheduled_for: Joi.date().optional()
});

export const createCampaignSchema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional()
});

export const updateCampaignSchema = Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).optional(),
});
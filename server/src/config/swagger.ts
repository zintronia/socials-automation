import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './environment';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Social Media Automation API',
            version: '1.0.0',
            description: 'Comprehensive API for social media content automation, AI-powered post generation, and multi-platform publishing.',
            contact: {
                name: 'API Support',
                email: 'support@socialmediaautomation.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: `http://localhost:${config.server.port}/api/${config.api.version}`,
                description: 'Development server'
            },
            {
                url: `https://api.socialmediaautomation.com/api/${config.api.version}`,
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token obtained from login endpoint'
                }
            },
            schemas: {
                // Common Schemas
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Indicates if the request was successful'
                        },
                        message: {
                            type: 'string',
                            description: 'Response message'
                        },
                        data: {
                            description: 'Response data'
                        },
                        error: {
                            type: 'string',
                            description: 'Error message if any'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Response timestamp'
                        }
                    }
                },
                PaginationParams: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'integer',
                            minimum: 1,
                            default: 1,
                            description: 'Page number'
                        },
                        limit: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 100,
                            default: 10,
                            description: 'Number of items per page'
                        },
                        sortBy: {
                            type: 'string',
                            description: 'Field to sort by'
                        },
                        sortOrder: {
                            type: 'string',
                            enum: ['ASC', 'DESC'],
                            default: 'DESC',
                            description: 'Sort order'
                        }
                    }
                },
                PaginatedResponse: {
                    type: 'object',
                    allOf: [
                        { $ref: '#/components/schemas/ApiResponse' },
                        {
                            type: 'object',
                            properties: {
                                pagination: {
                                    type: 'object',
                                    properties: {
                                        page: { type: 'integer' },
                                        limit: { type: 'integer' },
                                        total: { type: 'integer' },
                                        totalPages: { type: 'integer' },
                                        hasNext: { type: 'boolean' },
                                        hasPrev: { type: 'boolean' }
                                    }
                                }
                            }
                        }
                    ]
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            description: 'Error message'
                        },
                        error: {
                            type: 'string',
                            description: 'Error code'
                        },
                        details: {
                            description: 'Additional error details'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },

                // User Schemas
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        first_name: {
                            type: 'string',
                            description: 'User first name'
                        },
                        last_name: {
                            type: 'string',
                            description: 'User last name'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin'],
                            description: 'User role'
                        },
                        is_active: {
                            type: 'boolean',
                            description: 'Whether user account is active'
                        },
                        last_login: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'Last login timestamp'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Account creation timestamp'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                CreateUserRequest: {
                    type: 'object',
                    required: ['email', 'password', 'first_name', 'last_name'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        password: {
                            type: 'string',
                            minLength: 8,
                            description: 'User password (minimum 8 characters)'
                        },
                        first_name: {
                            type: 'string',
                            minLength: 1,
                            description: 'User first name'
                        },
                        last_name: {
                            type: 'string',
                            minLength: 1,
                            description: 'User last name'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        password: {
                            type: 'string',
                            description: 'User password'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        user: {
                            $ref: '#/components/schemas/User'
                        },
                        token: {
                            type: 'string',
                            description: 'JWT access token'
                        },
                        refreshToken: {
                            type: 'string',
                            description: 'JWT refresh token'
                        },
                        expiresIn: {
                            type: 'string',
                            description: 'Token expiration time'
                        }
                    }
                },

                // Platform Schemas
                Platform: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Platform ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Platform name'
                        },
                        type: {
                            type: 'string',
                            description: 'Platform type'
                        },
                        icon_url: {
                            type: 'string',
                            format: 'uri',
                            nullable: true,
                            description: 'Platform icon URL'
                        },
                        is_active: {
                            type: 'boolean',
                            description: 'Whether platform is active'
                        },
                        max_content_length: {
                            type: 'integer',
                            description: 'Maximum content length allowed'
                        },
                        supports_media: {
                            type: 'boolean',
                            description: 'Whether platform supports media uploads'
                        },
                        supported_media_types: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Supported media file types'
                        },
                        platform_constraints: {
                            type: 'object',
                            description: 'Platform-specific constraints'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },

                // Template Schemas
                ContextTemplate: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Template ID'
                        },
                        user_id: {
                            type: 'integer',
                            nullable: true,
                            description: 'User ID (null for public templates)'
                        },
                        platform_id: {
                            type: 'integer',
                            description: 'Platform ID'
                        },
                        category_id: {
                            type: 'integer',
                            nullable: true,
                            description: 'Category ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Template name'
                        },
                        description: {
                            type: 'string',
                            description: 'Template description'
                        },
                        system_instructions: {
                            type: 'string',
                            description: 'AI system instructions'
                        },
                        tone: {
                            type: 'string',
                            description: 'Content tone'
                        },
                        writing_style: {
                            type: 'string',
                            description: 'Writing style'
                        },
                        target_audience: {
                            type: 'string',
                            description: 'Target audience'
                        },
                        use_hashtags: {
                            type: 'boolean',
                            description: 'Whether to use hashtags'
                        },
                        max_hashtags: {
                            type: 'integer',
                            description: 'Maximum number of hashtags'
                        },
                        hashtag_strategy: {
                            type: 'string',
                            description: 'Hashtag strategy'
                        },
                        include_cta: {
                            type: 'boolean',
                            description: 'Whether to include call-to-action'
                        },
                        cta_type: {
                            type: 'string',
                            description: 'Call-to-action type'
                        },
                        content_structure: {
                            type: 'object',
                            description: 'Content structure configuration'
                        },
                        engagement_level: {
                            type: 'string',
                            description: 'Engagement level'
                        },
                        call_to_action_templates: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Call-to-action templates'
                        },
                        is_default: {
                            type: 'boolean',
                            description: 'Whether this is a default template'
                        },
                        is_public: {
                            type: 'boolean',
                            description: 'Whether template is public'
                        },
                        is_active: {
                            type: 'boolean',
                            description: 'Whether template is active'
                        },
                        usage_count: {
                            type: 'integer',
                            description: 'Number of times template has been used'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time'
                        },
                        category_name: {
                            type: 'string',
                            description: 'Category name (joined field)'
                        },
                        platform_name: {
                            type: 'string',
                            description: 'Platform name (joined field)'
                        }
                    }
                },
                CreateTemplateRequest: {
                    type: 'object',
                    required: ['platform_id', 'name', 'system_instructions', 'tone', 'writing_style', 'target_audience'],
                    properties: {
                        platform_id: {
                            type: 'integer',
                            description: 'Platform ID'
                        },
                        category_id: {
                            type: 'integer',
                            description: 'Category ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Template name'
                        },
                        description: {
                            type: 'string',
                            description: 'Template description'
                        },
                        system_instructions: {
                            type: 'string',
                            description: 'AI system instructions'
                        },
                        tone: {
                            type: 'string',
                            description: 'Content tone'
                        },
                        writing_style: {
                            type: 'string',
                            description: 'Writing style'
                        },
                        target_audience: {
                            type: 'string',
                            description: 'Target audience'
                        },
                        use_hashtags: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether to use hashtags'
                        },
                        max_hashtags: {
                            type: 'integer',
                            minimum: 0,
                            description: 'Maximum number of hashtags'
                        },
                        hashtag_strategy: {
                            type: 'string',
                            description: 'Hashtag strategy'
                        },
                        include_cta: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether to include call-to-action'
                        },
                        cta_type: {
                            type: 'string',
                            description: 'Call-to-action type'
                        },
                        content_structure: {
                            type: 'object',
                            description: 'Content structure configuration'
                        },
                        engagement_level: {
                            type: 'string',
                            description: 'Engagement level'
                        },
                        call_to_action_templates: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Call-to-action templates'
                        },
                        is_public: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether template is public'
                        }
                    }
                },

                // Context Schemas
                Context: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Context ID'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        template_id: {
                            type: 'integer',
                            nullable: true,
                            description: 'Template ID'
                        },
                        platform_id: {
                            type: 'integer',
                            description: 'Platform ID'
                        },
                        category_id: {
                            type: 'integer',
                            nullable: true,
                            description: 'Category ID'
                        },
                        type: {
                            type: 'string',
                            enum: ['document', 'text', 'youtube', 'url', 'manual'],
                            description: 'Context type'
                        },
                        title: {
                            type: 'string',
                            description: 'Context title'
                        },
                        topic: {
                            type: 'string',
                            description: 'Context topic'
                        },
                        brief: {
                            type: 'string',
                            description: 'Context brief'
                        },
                        content: {
                            type: 'string',
                            description: 'Context content'
                        },
                        source: {
                            type: 'string',
                            description: 'Content source'
                        },
                        language: {
                            type: 'string',
                            description: 'Content language'
                        },
                        region: {
                            type: 'string',
                            description: 'Content region'
                        },
                        mimetype: {
                            type: 'string',
                            description: 'File MIME type'
                        },
                        size: {
                            type: 'integer',
                            description: 'File size in bytes'
                        },
                        template_variables: {
                            type: 'object',
                            description: 'Template variables values'
                        },
                        tone: {
                            type: 'string',
                            description: 'Content tone'
                        },
                        writing_style: {
                            type: 'string',
                            description: 'Writing style'
                        },
                        target_audience: {
                            type: 'string',
                            description: 'Target audience'
                        },
                        system_instructions: {
                            type: 'string',
                            description: 'AI system instructions'
                        },
                        is_processed: {
                            type: 'boolean',
                            description: 'Whether context has been processed'
                        },
                        processed_at: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'Processing timestamp'
                        },
                        processing_error: {
                            type: 'string',
                            nullable: true,
                            description: 'Processing error message'
                        },
                        metadata: {
                            type: 'object',
                            description: 'Additional metadata'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time'
                        },
                        template_name: {
                            type: 'string',
                            description: 'Template name (joined field)'
                        },
                        platform_name: {
                            type: 'string',
                            description: 'Platform name (joined field)'
                        },
                        category_name: {
                            type: 'string',
                            description: 'Category name (joined field)'
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Context tags'
                        }
                    }
                },
                CreateContextRequest: {
                    type: 'object',
                    required: ['platform_id', 'type', 'title', 'content'],
                    properties: {
                        template_id: {
                            type: 'integer',
                            description: 'Template ID'
                        },
                        platform_id: {
                            type: 'integer',
                            description: 'Platform ID'
                        },
                        category_id: {
                            type: 'integer',
                            description: 'Category ID'
                        },
                        type: {
                            type: 'string',
                            enum: ['document', 'text', 'youtube', 'url', 'manual'],
                            description: 'Context type'
                        },
                        title: {
                            type: 'string',
                            description: 'Context title'
                        },
                        topic: {
                            type: 'string',
                            description: 'Context topic'
                        },
                        brief: {
                            type: 'string',
                            description: 'Context brief'
                        },
                        content: {
                            type: 'string',
                            description: 'Context content'
                        },
                        source: {
                            type: 'string',
                            description: 'Content source'
                        },
                        language: {
                            type: 'string',
                            default: 'en',
                            description: 'Content language'
                        },
                        region: {
                            type: 'string',
                            description: 'Content region'
                        },
                        mimetype: {
                            type: 'string',
                            description: 'File MIME type'
                        },
                        size: {
                            type: 'integer',
                            description: 'File size in bytes'
                        },
                        template_variables: {
                            type: 'object',
                            description: 'Template variables values'
                        },
                        tone: {
                            type: 'string',
                            description: 'Content tone'
                        },
                        writing_style: {
                            type: 'string',
                            description: 'Writing style'
                        },
                        target_audience: {
                            type: 'string',
                            description: 'Target audience'
                        },
                        system_instructions: {
                            type: 'string',
                            description: 'AI system instructions'
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Context tags'
                        }
                    }
                },

                // Post Schemas
                Post: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Post ID'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        context_id: {
                            type: 'integer',
                            nullable: true,
                            description: 'Context ID'
                        },
                        template_id: {
                            type: 'integer',
                            nullable: true,
                            description: 'Template ID used for generation'
                        },
                        platform_id: {
                            type: 'integer',
                            description: 'Platform ID'
                        },
                        campaign_id: {
                            type: 'integer',
                            nullable: true,
                            description: 'Campaign ID'
                        },
                        content: {
                            type: 'string',
                            description: 'Post content'
                        },
                        content_type: {
                            type: 'string',
                            description: 'Content type'
                        },
                        hashtags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Post hashtags'
                        },
                        mentions: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Post mentions'
                        },
                        status: {
                            type: 'string',
                            enum: ['draft', 'scheduled', 'published', 'failed'],
                            description: 'Post status'
                        },
                        scheduled_for: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'Scheduled publication time'
                        },
                        published_at: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'Publication timestamp'
                        },
                        platform_post_id: {
                            type: 'string',
                            nullable: true,
                            description: 'Platform post ID'
                        },
                        platform_url: {
                            type: 'string',
                            format: 'uri',
                            nullable: true,
                            description: 'Platform post URL'
                        },
                        platform_response: {
                            type: 'object',
                            description: 'Platform API response'
                        },
                        engagement_metrics: {
                            type: 'object',
                            description: 'Post engagement metrics'
                        },
                        last_metrics_update: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'Last metrics update timestamp'
                        },
                        error_message: {
                            type: 'string',
                            nullable: true,
                            description: 'Error message if failed'
                        },
                        retry_count: {
                            type: 'integer',
                            description: 'Number of retry attempts'
                        },
                        metadata: {
                            type: 'object',
                            description: 'Additional metadata'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time'
                        },
                        context_title: {
                            type: 'string',
                            description: 'Context title (joined field)'
                        },
                        platform_name: {
                            type: 'string',
                            description: 'Platform name (joined field)'
                        },
                        user_email: {
                            type: 'string',
                            description: 'User email (joined field)'
                        }
                    }
                },
                CreatePostRequest: {
                    type: 'object',
                    required: ['user_id', 'platform_id', 'content'],
                    properties: {
                        user_id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        context_id: {
                            type: 'integer',
                            description: 'Context ID'
                        },
                        template_id: {
                            type: 'integer',
                            description: 'Template ID used for generation'
                        },
                        platform_id: {
                            type: 'integer',
                            description: 'Platform ID'
                        },
                        campaign_id: {
                            type: 'integer',
                            description: 'Campaign ID'
                        },
                        content: {
                            type: 'string',
                            description: 'Post content'
                        },
                        content_type: {
                            type: 'string',
                            default: 'text',
                            description: 'Content type'
                        },
                        hashtags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Post hashtags'
                        },
                        mentions: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Post mentions'
                        },
                        status: {
                            type: 'string',
                            enum: ['draft', 'scheduled', 'published', 'failed'],
                            default: 'draft',
                            description: 'Post status'
                        },
                        scheduled_for: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Scheduled publication time'
                        },
                        metadata: {
                            type: 'object',
                            description: 'Additional metadata'
                        }
                    }
                },
                GeneratePostRequest: {
                    type: 'object',
                    required: ['context_id', 'platform_id'],
                    properties: {
                        context_id: {
                            type: 'integer',
                            description: 'Context ID to generate post from'
                        },
                        platform_id: {
                            type: 'integer',
                            description: 'Platform ID'
                        },
                        campaign_id: {
                            type: 'integer',
                            description: 'Campaign ID to add the generated post to'
                        },
                        scheduled_for: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Scheduled publication time'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts'
    ]
};

export const specs = swaggerJsdoc(options); 
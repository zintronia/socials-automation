import { Context, ContextTemplate, Platform, AIGenerationRequest, AIGenerationResponse } from '../../../types';
import { LLMProvider } from '../types';

export abstract class BaseLLMProvider implements LLMProvider {
    abstract generatePost(request: AIGenerationRequest): Promise<AIGenerationResponse>;

    protected buildSystemPrompt(template: ContextTemplate, platform: Platform): string {
        const baseInstructions = `
You are an expert social media content creator specializing in ${platform.name} content.

PLATFORM CONSTRAINTS:
- Maximum content length: ${platform.max_content_length} characters
- Supported media types: ${platform.supported_media_types?.join(', ')}
- Platform-specific rules: ${JSON.stringify(platform.platform_constraints)}

CONTENT REQUIREMENTS:
- Tone: ${template.tone}
- Writing Style: ${template.writing_style}
- Target Audience: ${template.target_audience}
- Content Category: ${template.category_id}

TEMPLATE INSTRUCTIONS:
${template.system_instructions}

FORMATTING RULES:
${this.getPlatformFormattingRules(platform)}

ENGAGEMENT OPTIMIZATION:
- Include ${template.use_hashtags ? `up to ${template.max_hashtags} relevant hashtags` : 'no hashtags'}
- Hashtag strategy: ${template.hashtag_strategy}
- Include call-to-action: ${template.include_cta ? 'Yes' : 'No'}
- CTA Type: ${template.cta_type}
- Engagement level: ${template.engagement_level}

OUTPUT FORMAT:
Return ONLY the final post content, properly formatted for ${platform.name}.
Do not include explanations or metadata.
        `;
        return baseInstructions.trim();
    }

    protected buildUserPrompt(context: Context | undefined, template: ContextTemplate, prompt?: string): string {
        // If raw prompt is provided, use it directly as the main content source
        if (prompt && prompt.trim().length > 0) {
            return prompt.trim();
        }

        if (!context) {
            // Fallback safety: if neither prompt nor context is available
            return 'Create a short, engaging social media post based on the template settings.';
        }

        let composed = `
CONTENT SOURCE:
Title: ${context.title}
Topic: ${context.topic || 'Not specified'}
Brief: ${context.brief || 'Not provided'}

MAIN CONTENT:
${context.content}

ADDITIONAL CONTEXT:
- Language: ${context.language}
- Region: ${context.region || 'Global'}
- Source Type: ${context.type}
`;

        if (context.template_variables) {
            composed += `\n\nTEMPLATE VARIABLES:\n`;
            Object.entries(context.template_variables).forEach(([key, value]) => {
                composed += `- ${key}: ${value}\n`;
            });
        }

        composed += this.getCategorySpecificInstructions(template?.category_id);
        composed += `\n\nGenerate an engaging ${template.tone} post that will resonate with ${template.target_audience}.`;
        return composed.trim();
    }

    protected getPlatformFormattingRules(platform: Platform): string {
        const rules: Record<string, string> = {
            'Twitter': `
- Keep it concise and punchy
- Use line breaks for readability
- Include relevant hashtags at the end
- Consider thread format for longer content
            `,
            'LinkedIn': `
- Start with a compelling hook
- Use professional language
- Include paragraph breaks
- End with a thought-provoking question
- Use relevant professional hashtags
            `,
            'Instagram': `
- Start with an attention-grabbing first line
- Use emojis strategically
- Include line breaks for readability
- Use a mix of popular and niche hashtags
- Include a clear call-to-action
            `,
            'Facebook': `
- Write in a conversational tone
- Use storytelling when appropriate
- Include engaging questions
- Use minimal hashtags (2-3 max)
            `
        };
        return rules[platform.name] || 'Follow general social media best practices';
    }

    protected getCategorySpecificInstructions(categoryId?: number): string {
        if (!categoryId) return '';

        const instructions: Record<number, string> = {
            1: '\nFocus on promotional messaging while providing value to the audience.',
            2: '\nPrioritize educational value and actionable insights.',
            3: '\nMaximize engagement potential with questions and interactive elements.',
            4: '\nCreate entertaining content that brings joy and shareability.',
            5: '\nPresent information clearly and objectively.',
            6: '\nUse authentic, personal storytelling approach.',
        };
        return instructions[categoryId] || '';
    }
}

import OpenAI from 'openai';
import { AIGenerationRequest, AIGenerationResponse } from '../../../types';
import { BaseLLMProvider } from '../base-provider';
import { LLMConfig } from '../types';
import { logger } from '../../../utils/logger.utils';

export class OpenAIProvider extends BaseLLMProvider {
    private openai: OpenAI;

    constructor(config: LLMConfig) {
        super();
        this.openai = new OpenAI({
            apiKey: config.apiKey,
        });
    }

    async generatePost(request: AIGenerationRequest): Promise<AIGenerationResponse> {
        try {
            const { context, template, platform } = request;
            const systemPrompt = this.buildSystemPrompt(template, platform);
            const userPrompt = this.buildUserPrompt(context, template);

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 2000,
                temperature: 0.7,
            });

            const generatedContent = completion.choices[0]?.message?.content;
            if (!generatedContent) throw new Error('No content generated from OpenAI');

            return {
                content: generatedContent,
                usage: completion.usage,
                model: completion.model,
            };
        } catch (error) {
            logger.error('OpenAI generation error:', error);
            throw new Error('Failed to generate content with OpenAI');
        }
    }
}

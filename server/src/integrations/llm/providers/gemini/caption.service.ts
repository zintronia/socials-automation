import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIGenerationRequest, AIGenerationResponse } from '../../../../types';
import { BaseLLMProvider } from '../../Instruction/caption.instructions';
import { logger } from '../../../../utils/logger.utils';
import { LLMConfig } from '../../types';

export class GeminiProvider extends BaseLLMProvider {
    private genAI: GoogleGenerativeAI;
    private model: string;

    constructor(config: LLMConfig) {
        super();
        this.genAI = new GoogleGenerativeAI(config.apiKey);
        this.model = config.model;
    }

    async generatePost(request: AIGenerationRequest): Promise<AIGenerationResponse> {
        try {
            const { context, template, platform, prompt } = request;
            const systemPrompt = this.buildSystemPrompt(template, platform);
            const userPrompt = this.buildUserPrompt(context, template, prompt);

            logger.info('🤖 Generating content with Gemini AI');
            logger.info('📝 System Prompt:', { systemPrompt });
            logger.info('✍️ User Prompt:', { userPrompt });
            logger.info('---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------',);
            const model = this.genAI.getGenerativeModel({ model: this.model });

            const finalPrompt = `${systemPrompt}\n\n${userPrompt}`;
            const result = await model.generateContent(finalPrompt);
            const response = await result.response;
            const generatedContent = response.text();

            if (!generatedContent) {
                throw new Error('No content generated from Gemini');
            }
            console.log(`✨ Generated Content:`, generatedContent);

            logger.info(`✨ Generated Content----------;`, generatedContent);

            return {
                content: generatedContent,
                model: this.model,
                usage: {
                    prompt_tokens: -1, // Gemini doesn't provide token counts
                    completion_tokens: -1,
                    total_tokens: -1
                }
            };
        } catch (error) {
            logger.error('Gemini generation error:', error);
            throw new Error('Failed to generate content with Gemini');
        }
    }
}

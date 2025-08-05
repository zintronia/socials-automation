import { LLMConfig, LLMProvider } from './types';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { config } from '../../config/environment';

class LLMService {
    private provider: LLMProvider;

    constructor() {
        const llmConfig: LLMConfig = {
            provider: config.ai.provider as 'openai' | 'gemini',
            apiKey: config.ai.apiKey,
            model: config.ai.model,
            maxTokens: config.ai.maxTokens,
            temperature: 0.7,
            timeout: config.ai.timeout
        };

        this.provider = this.createProvider(llmConfig);
    }

    private createProvider(config: LLMConfig): LLMProvider {
        switch (config.provider) {
            case 'openai':
                return new OpenAIProvider(config);
            case 'gemini':
                return new GeminiProvider(config);
            default:
                throw new Error(`Unsupported LLM provider: ${config.provider}`);
        }
    }

    public getProvider(): LLMProvider {
        return this.provider;
    }
}

export const llmService = new LLMService();

import { AIGenerationRequest, AIGenerationResponse } from '../../types';

export interface LLMProvider {
    generatePost(request: AIGenerationRequest): Promise<AIGenerationResponse>;
}

export interface LLMConfig {
    provider: 'openai' | 'gemini';
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature?: number;
    timeout?: number;
}

export interface LLMResponse {
    content: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    model: string;
}

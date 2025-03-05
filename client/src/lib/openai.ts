import { apiRequest } from '@/lib/queryClient';

// Message interface matching OpenAI's API structure
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Response interface from our backend chat endpoint
export interface ChatResponse {
  message: string;
  conversationId: number;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

/**
 * Send a message to the AI model through our backend API
 * @param wrapperId - The ID of the wrapper to use
 * @param message - The message text to send
 * @param conversationId - Optional conversation ID for continuing a conversation
 * @returns The response from the AI model
 */
export async function sendMessage(
  wrapperId: number,
  message: string,
  conversationId?: number | null
): Promise<ChatResponse> {
  try {
    const response = await apiRequest('POST', '/api/chat', {
      wrapperId,
      message,
      conversationId
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to communicate with the AI model');
  }
}

/**
 * Format tokens usage information
 * @param usage - The usage object returned from the API
 * @returns Formatted token usage string
 */
export function formatTokenUsage(usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) {
  if (!usage) return 'No token usage data available';
  
  return `Tokens: ${usage.total_tokens} (${usage.prompt_tokens} prompt + ${usage.completion_tokens} completion)`;
}

/**
 * Estimate the cost of a conversation based on token usage
 * @param model - The model name
 * @param usage - The usage object returned from the API
 * @returns Estimated cost in USD
 */
export function estimateCost(model: string, usage?: { prompt_tokens: number; completion_tokens: number }) {
  if (!usage) return 0;
  
  // Estimated costs per 1000 tokens (as of May 2024)
  const costs: Record<string, { prompt: number; completion: number }> = {
    'gpt-4o': { prompt: 0.005, completion: 0.015 },
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 }
  };
  
  // Default to gpt-3.5-turbo pricing if model not found
  const modelCosts = costs[model] || costs['gpt-3.5-turbo'];
  
  const promptCost = (usage.prompt_tokens / 1000) * modelCosts.prompt;
  const completionCost = (usage.completion_tokens / 1000) * modelCosts.completion;
  
  return promptCost + completionCost;
}

import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

export function isAiConfigured() {
  return Boolean(env.aiApiKey);
}

export async function generateAiResponse({ system = '', user = '' }) {
  if (!isAiConfigured()) {
    throw ApiError.serviceUnavailable(
      'AI Tutor is not configured yet. Ask the administrator to add the AI API key to the server.',
      'AI_NOT_CONFIGURED'
    );
  }

  let response;
  try {
    response = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.aiApiKey}`,
      },
      body: JSON.stringify({
        model: env.aiModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.4,
        max_tokens: 700,
      }),
      signal: AbortSignal.timeout(60000),
    });
  } catch (cause) {
    throw ApiError.badGateway('The AI provider could not be reached. Please try again later.', 'AI_PROVIDER_ERROR');
  }

  if (!response.ok) {
    throw ApiError.badGateway('The AI provider could not complete the request. Please try again later.', 'AI_PROVIDER_ERROR');
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw ApiError.badGateway('The AI provider returned an empty response. Please try again.', 'AI_PROVIDER_ERROR');
  }

  return content;
}
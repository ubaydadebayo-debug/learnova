import api from './api';

const ENDPOINT = '/ai';

export function listConversations() {
  return api.get(`${ENDPOINT}/conversations`);
}

export function createConversation(payload = {}) {
  return api.post(`${ENDPOINT}/conversations`, payload);
}

export function getConversation(conversationId) {
  return api.get(`${ENDPOINT}/conversations/${encodeURIComponent(conversationId)}`);
}

export function sendMessage(conversationId, payload = {}) {
  return api.post(`${ENDPOINT}/conversations/${encodeURIComponent(conversationId)}/messages`, payload);
}

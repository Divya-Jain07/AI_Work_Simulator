import { getConversationHistory, saveMessage } from './conversationMemory.js';
import { buildTeammateSystemPrompt } from './promptBuilder.js';
import { createChatCompletion, logAIError } from './aiClient.js';
import Task from '../models/Task.js';

const toChatRole = (role) => (role === 'assistant' || role === 'model' ? 'assistant' : 'user');

const normalizeHistory = (messages = []) => {
  const normalized = [];

  messages
    .filter((message) => message?.content && String(message.content).trim())
    .slice(-12)
    .forEach((message) => {
      const role = toChatRole(message.role);
      const content = String(message.content).trim();
      const last = normalized[normalized.length - 1];

      if (last?.role === role) {
        last.content += `\n\n${content}`;
        return;
      }

      normalized.push({ role, content });
    });

  return normalized;
};

/**
 * AI Teammate Conversation Handler.
 * Uses Groq with role context, active task context, recent conversation memory, and retry handling.
 */
export const chatWithTeammateService = async ({ userId, roleId, role, teammate, currentMessage, workspaceType, history = [] }) => {
  try {
    const messageText = String(currentMessage || '').trim();
    if (!messageText) {
      const error = new Error('Message is required');
      error.statusCode = 400;
      throw error;
    }

    const currentTask = await Task.findOne({ assignedTo: userId, role: roleId })
      .sort({ createdAt: -1 });

    const storedHistory = await getConversationHistory(userId, roleId);
    const rawHistory = storedHistory.length > 0 ? storedHistory : history;

    await saveMessage(userId, roleId, 'user', messageText);

    const systemPrompt = buildTeammateSystemPrompt({
      role,
      teammate,
      currentTask,
      workspaceType
    });

    const reply = await createChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        ...normalizeHistory(rawHistory),
        { role: 'user', content: messageText }
      ],
      temperature: 0.65,
      maxTokens: 700
    });

    await saveMessage(userId, roleId, 'model', reply);

    return reply;
  } catch (error) {
    logAIError(error);
    error.statusCode = error.statusCode || 503;
    throw error;
  }
};

import Message from '../models/Message.js';

/**
 * Retrieves the recent conversation history for a specific user and workplace role.
 * Returns messages sorted chronologically (oldest first).
 */
export const getConversationHistory = async (userId, roleId, limit = 20) => {
  try {
    const messages = await Message.find({ userId, roleId })
      .sort({ createdAt: -1 })
      .limit(limit);

    // Reverse to chronological order (oldest first)
    const sorted = messages.reverse();

    return sorted.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      content: msg.content
    }));
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    return [];
  }
};

/**
 * Saves a new message to the conversation history database.
 */
export const saveMessage = async (userId, roleId, role, content) => {
  try {
    const message = await Message.create({
      userId,
      roleId,
      role: role === 'model' ? 'model' : 'user',
      content: content.trim()
    });
    return message;
  } catch (error) {
    console.error('Error in saveMessage:', error);
    return null;
  }
};

/**
 * Clears the conversation history for a user and role.
 */
export const clearConversationHistory = async (userId, roleId) => {
  try {
    await Message.deleteMany({ userId, roleId });
    return true;
  } catch (error) {
    console.error('Error in clearConversationHistory:', error);
    return false;
  }
};

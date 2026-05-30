import { generateUniqueTask } from './taskGenerator.js';

/**
 * Automated retry utility with exponential backoff.
 */
export const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    console.warn(`Service call failed. Retrying in ${delay}ms... (Remaining retries: ${retries})`, error);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

/**
 * AI Manager Orchestrator.
 * Assigns a unique, personalized task to the user with automatic retries and cache invalidation tokens.
 */
export const assignManagerTask = async ({ user, role, userSkills }) => {
  // Generate a random cache invalidation token/nonce to prevent duplicate payloads
  const cacheNonce = `nonce_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  // Wrap unique task generation in the retry mechanism
  const task = await retryRequest(
    () => generateUniqueTask({ user, role, userSkills }),
    3, // 3 retries
    800 // base delay
  );

  return {
    ...task,
    cacheNonce // Nonce included in task object to bypass downstream payload caches
  };
};

import { assignManagerTask } from './aiManager.js';
import { chatWithTeammateService } from './aiTeammate.js';
import { createChatCompletion, logAIError } from './aiClient.js';

export const generateTask = async (userSkills) => {
  const prompt = `You are an AI Manager in a tech company. 
Create a realistic software engineering task for an intern based on these current skill levels (out of 100): ${JSON.stringify(userSkills)}.
The task should be practical, focused, and take about an hour to complete. 
Return the response as a JSON string with the following exact keys: "title", "description", "requirements" (array of strings), and "difficulty" (Easy, Medium, Hard). Do not include markdown blocks like \`\`\`json, just the raw JSON object.`;

  try {
    const responseText = await createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75,
      maxTokens: 900
    });
    return JSON.parse(cleanJson(responseText));
  } catch (error) {
    logAIError(error);
    throw new Error('Failed to generate task');
  }
};

const cleanJson = (text) => {
  const cleaned = String(text || '').replace(/```json\n?|\n?```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
};

const parseJsonOrFallback = (text, fallback) => {
  try {
    return JSON.parse(cleanJson(text));
  } catch (error) {
    console.error('AI JSON parse error:', error);
    return fallback;
  }
};

const normalizeEvaluation = (evaluation, fallback = {}) => {
  const normalized = {
    ...fallback,
    ...evaluation
  };

  normalized.strengths = Array.isArray(normalized.strengths) ? normalized.strengths : [];
  normalized.weaknesses = Array.isArray(normalized.weaknesses) ? normalized.weaknesses : [];
  normalized.suggestions = Array.isArray(normalized.suggestions) ? normalized.suggestions : [];
  normalized.recommendations = Array.isArray(normalized.recommendations) ? normalized.recommendations : [];
  normalized.skills = normalized.skills || normalized.skillUpdates || fallback.skills || {};
  normalized.skillUpdates = normalized.skillUpdates || normalized.skills || fallback.skillUpdates || {};

  return normalized;
};

export const generateTaskForRole = async ({ user, role, manager }) => {
  try {
    const userSkills = user.roleSkills?.[role.id] || role.skills;
    const task = await assignManagerTask({ user, role, userSkills });
    return task;
  } catch (error) {
    logAIError(error);
    return manager.fallbackTask(role);
  }
};

export const chatWithTeammate = async (history, currentMessage) => {
  try {
    const systemPrompt = `You are an AI Teammate. Be helpful, concise, and friendly. Guide the user but do not write all the code for them.`;
    return createChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history
          .filter((msg) => msg?.content)
          .slice(-12)
          .map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: String(msg.content)
          })),
        { role: 'user', content: String(currentMessage || '').trim() }
      ],
      temperature: 0.65,
      maxTokens: 700
    });
  } catch (error) {
    logAIError(error);
    throw new Error('Failed to communicate with teammate');
  }
};

export const chatWithRoleTeammate = async ({ user, history = [], currentMessage, role, manager }) => {
  try {
    const teammate = {
      name: role.teammateName,
      title: role.teammateTitle
    };
    const reply = await chatWithTeammateService({
      userId: user._id,
      roleId: role.id,
      role,
      teammate,
      currentMessage,
      workspaceType: role.id,
      history
    });
    return reply;
  } catch (error) {
    logAIError(error);
    throw error;
  }
};

export const evaluateSubmission = async (task, submissionContent) => {
  const prompt = `You are a Senior Engineer evaluating a code submission from an intern.
Task Title: ${task.title}
Task Description: ${task.description}

Intern's Submission:
${submissionContent}

Evaluate the submission. Return the response as a JSON string with the following exact keys: "score" (number from 0 to 100), "feedback" (detailed string feedback), "skillUpdates" (object with keys "problemSolving", "coding", "communication", each having a number indicating the change, e.g., +2 or -1). Do not include markdown blocks like \`\`\`json, just the raw JSON object.`;

  try {
    const responseText = await createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.35,
      maxTokens: 900
    });
    return JSON.parse(cleanJson(responseText));
  } catch (error) {
    logAIError(error);
    throw new Error('Failed to evaluate submission');
  }
};

export const evaluateSubmissionForRole = async ({ task, submission, role, evaluator }) => {
  const prompt = evaluator.buildEvaluationPrompt({ task, submission, role });

  try {
    const responseText = await createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.35,
      maxTokens: 1000
    });
    const fallback = evaluator.fallbackEvaluation();
    return normalizeEvaluation(parseJsonOrFallback(responseText, fallback), fallback);
  } catch (error) {
    logAIError(error);
    return evaluator.fallbackEvaluation();
  }
};

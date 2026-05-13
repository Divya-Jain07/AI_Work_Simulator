import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const generateTask = async (userSkills) => {
  const prompt = `You are an AI Manager in a tech company. 
Create a realistic software engineering task for an intern based on these current skill levels (out of 100): ${JSON.stringify(userSkills)}.
The task should be practical, focused, and take about an hour to complete. 
Return the response as a JSON string with the following exact keys: "title", "description", "requirements" (array of strings), and "difficulty" (Easy, Medium, Hard). Do not include markdown blocks like \`\`\`json, just the raw JSON object.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean up if it contains markdown
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Error generating task:", error);
    throw new Error('Failed to generate task');
  }
};

const cleanJson = (text) => text.replace(/```json\n?|\n?```/g, '').trim();

const parseJsonOrFallback = (text, fallback) => {
  try {
    return JSON.parse(cleanJson(text));
  } catch (error) {
    console.error('AI JSON parse error:', error);
    return fallback;
  }
};

export const generateTaskForRole = async ({ user, role, manager }) => {
  const prompt = manager.buildTaskPrompt({ user, role });

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return {
      ...manager.fallbackTask(role),
      ...parseJsonOrFallback(responseText, manager.fallbackTask(role)),
      role: role.id
    };
  } catch (error) {
    console.error('AI Error generating role task:', error);
    return manager.fallbackTask(role);
  }
};

export const chatWithTeammate = async (history, currentMessage) => {
  try {
    // Gemini requires the first message to be from the 'user'.
    // We filter out the initial greeting from the 'model' if it's the first message.
    let validHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    
    while (validHistory.length > 0 && validHistory[0].role === 'model') {
      validHistory.shift();
    }

    const chat = model.startChat({
      history: validHistory,
    });

    const systemPrompt = `You are an AI Teammate. Be helpful, concise, and friendly. Guide the user but do not write all the code for them.`;
    const result = await chat.sendMessage(`System Prompt: ${systemPrompt}\nUser: ${currentMessage}`);
    return result.response.text();
  } catch (error) {
    console.error("AI Error chatting:", error);
    throw new Error('Failed to communicate with teammate');
  }
};

export const chatWithRoleTeammate = async ({ history = [], currentMessage, role, manager }) => {
  try {
    const validHistory = history
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))
      .filter((msg, index) => index > 0 || msg.role === 'user');

    const chat = model.startChat({ history: validHistory });
    const result = await chat.sendMessage(`System Prompt: ${manager.teammateSystemPrompt(role)}\nUser: ${currentMessage}`);
    return result.response.text();
  } catch (error) {
    console.error('AI Error chatting with role teammate:', error);
    return 'I hit an issue reaching the AI service, but here is the practical next step: restate the failure, isolate one reproducible case, and verify your fix against the acceptance criteria.';
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
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Error evaluating submission:", error);
    throw new Error('Failed to evaluate submission');
  }
};

export const evaluateSubmissionForRole = async ({ task, submission, role, evaluator }) => {
  const prompt = evaluator.buildEvaluationPrompt({ task, submission, role });

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const fallback = evaluator.fallbackEvaluation();
    return {
      ...fallback,
      ...parseJsonOrFallback(responseText, fallback)
    };
  } catch (error) {
    console.error('AI Error evaluating role submission:', error);
    return evaluator.fallbackEvaluation();
  }
};

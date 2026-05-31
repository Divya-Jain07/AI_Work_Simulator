import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import * as aiService from './aiService.js';
import {
  applySkillUpdates,
  buildRoleContext,
  getEvaluatorForRole,
  getManagerForRole,
  getUserRole,
  initializeRoleSkills,
  resolveRole
} from './roleEngine.js';

export const switchUserRole = async ({ user, roleId }) => {
  const role = resolveRole(roleId);
  user.activeWorkRole = role.id;
  user.roleSkills = initializeRoleSkills(user.roleSkills || {});
  user.markModified?.('roleSkills');
  await user.save();

  return await buildRoleContext(user, role.id);
};

export const assignRoleTask = async ({ user, requestedRoleId }) => {
  const role = resolveRole(requestedRoleId || getUserRole(user).id);
  const manager = getManagerForRole(role.id);
  const roleContext = await buildRoleContext(user, role.id);
  const generatedTask = await aiService.generateTaskForRole({ user, role, manager });

  const task = await Task.create({
    title: generatedTask.title,
    description: generatedTask.description,
    category: generatedTask.category,
    requirements: generatedTask.requirements || [],
    acceptanceCriteria: generatedTask.acceptanceCriteria || [],
    difficulty: generatedTask.difficulty || 'Medium',
    deadline: generatedTask.deadline || 'Before EOD',
    businessContext: generatedTask.businessContext,
    skillTargets: generatedTask.skillTargets || [],
    datasetName: generatedTask.datasetName,
    datasetSchema: generatedTask.datasetSchema,
    chartData: generatedTask.chartData,
    evaluationCriteria: role.evaluationCriteria,
    role: role.id,
    assignedTo: user._id,
    manager: {
      name: `${role.label} Manager`,
      title: 'AI Engineering Manager',
      behavior: role.headline
    }
  });

  return { task, roleContext };
};

// Force all recommendation URLs to be LinkedIn Learning keyword-search URLs.
// The AI model ignores prompt instructions and generates direct course links,
// so we sanitize server-side to guarantee working search URLs every time.
const sanitizeRecommendations = (recommendations = []) =>
  recommendations.map(rec => {
    const url = rec.courseUrl || '';
    const isDirectLink =
      url.includes('linkedin.com/learning/') &&
      !url.includes('/search?');
    if (isDirectLink) {
      const keywords = encodeURIComponent(
        (rec.courseTitle || rec.text || 'professional development')
          .replace(/[^a-zA-Z0-9 ]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 80)
      );
      return { ...rec, courseUrl: `https://www.linkedin.com/learning/search?keywords=${keywords}` };
    }
    return rec;
  });

export const evaluateRoleSubmission = async ({ user, taskId, content }) => {
  const task = await Task.findOne({ _id: taskId, assignedTo: user._id });
  if (!task) {
    const error = new Error('Task not found or not assigned to user');
    error.statusCode = 404;
    throw error;
  }

  const role = resolveRole(task.role || user.activeWorkRole);
  const evaluator = getEvaluatorForRole(role.id);
  const evaluation = await aiService.evaluateSubmissionForRole({
    task,
    submission: content,
    role,
    evaluator
  });

  // Sanitize recommendation URLs regardless of what the AI returned
  const safeRecommendations = sanitizeRecommendations(evaluation.recommendations);

  // Mongoose Maps do not support keys with dots. Sanitize skill keys.
  const safeSkillUpdates = {};
  if (evaluation.skillUpdates) {
    for (const [key, value] of Object.entries(evaluation.skillUpdates)) {
      const safeKey = key.replace(/\./g, '_');
      safeSkillUpdates[safeKey] = value;
    }
  }

  const submission = await Submission.create({
    task: task._id,
    user: user._id,
    role: role.id,
    content,
    score: evaluation.score,
    feedback: evaluation.feedback,
    strengths: evaluation.strengths || [],
    weaknesses: evaluation.weaknesses || [],
    suggestions: evaluation.suggestions || [],
    recommendations: safeRecommendations,
    skillUpdates: safeSkillUpdates
  });

  task.status = 'Evaluated';
  task.lastEvaluationScore = evaluation.score;
  await task.save();

  const updatedSkillGraph = applySkillUpdates(user, role.id, safeSkillUpdates);
  await user.save();

  return {
    submission,
    evaluation: { ...evaluation, recommendations: safeRecommendations },
    newSkills: user.skills,
    skillGraph: updatedSkillGraph,
    roleContext: await buildRoleContext(user, role.id)
  };
};

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

  return buildRoleContext(user, role.id);
};

export const assignRoleTask = async ({ user, requestedRoleId }) => {
  const role = resolveRole(requestedRoleId || getUserRole(user).id);
  const manager = getManagerForRole(role.id);
  const roleContext = buildRoleContext(user, role.id);
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
    evaluationCriteria: role.evaluationCriteria,
    role: role.id,
    assignedTo: user._id,
    manager: {
      name: role.teammateName,
      title: 'AI Engineering Manager',
      behavior: role.headline
    }
  });

  return { task, roleContext };
};

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
    skillUpdates: evaluation.skillUpdates || {}
  });

  task.status = 'Evaluated';
  task.lastEvaluationScore = evaluation.score;
  await task.save();

  const updatedSkillGraph = applySkillUpdates(user, role.id, evaluation.skillUpdates);
  await user.save();

  return {
    submission,
    evaluation,
    newSkills: user.skills,
    skillGraph: updatedSkillGraph,
    roleContext: buildRoleContext(user, role.id)
  };
};

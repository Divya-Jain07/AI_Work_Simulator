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
import { buildWorkplaceActivityEvent, calculatePerformanceSnapshot } from './performanceEngine.js';
import SkillProgress from '../models/SkillProgress.js';
import Evaluation from '../models/Evaluation.js';
import { createActivity, getDashboardSnapshot } from './dashboardEngine.js';
import { evolveSkills } from './skillEngine.js';

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
    evaluationCriteria: role.evaluationCriteria,
    role: role.id,
    assignedTo: user._id,
    manager: {
      name: role.teammateName,
      title: 'AI Engineering Manager',
      behavior: role.headline
    }
  });

  const performance = await calculatePerformanceSnapshot({ user, roleId: role.id });
  await createActivity({
    userId: user._id,
    role: role.id,
    type: 'task',
    title: `AI Manager assigned ${task.category}`,
    detail: task.title,
    metadata: { taskId: task._id, difficulty: task.difficulty }
  });
  const dashboardSnapshot = await getDashboardSnapshot({ user, roleId: role.id });

  return {
    task,
    roleContext,
    performance,
    activityEvent: buildWorkplaceActivityEvent({ type: 'task', role, task, performance }),
    dashboardSnapshot
  };
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
    recommendations: evaluation.recommendations || [],
    skillUpdates: evaluation.skillUpdates || {}
  });

  task.status = 'Evaluated';
  task.lastEvaluationScore = evaluation.score;
  await task.save();

  const updatedSkillGraph = applySkillUpdates(user, role.id, evaluation.skillUpdates);
  const evolvedSkills = evolveSkills({
    role: role.id,
    currentSkills: updatedSkillGraph,
    task,
    evaluation
  });
  user.roleSkills = {
    ...(user.roleSkills || {}),
    [role.id]: evolvedSkills
  };
  user.markModified?.('roleSkills');
  await user.save();
  const skillProgress = await SkillProgress.findOneAndUpdate(
    { userId: user._id, role: role.id },
    { skills: evolvedSkills },
    { upsert: true, new: true }
  );
  await Evaluation.create({
    userId: user._id,
    taskId: task._id,
    submissionId: submission._id,
    role: role.id,
    score: evaluation.score,
    skills: evaluation.skills || evolvedSkills,
    strengths: evaluation.strengths || [],
    weaknesses: evaluation.weaknesses || [],
    recommendations: evaluation.recommendations || [],
    confidence: evaluation.confidence || submission.score || 0
  });
  const performance = await calculatePerformanceSnapshot({ user, roleId: role.id, evaluation });
  await createActivity({
    userId: user._id,
    role: role.id,
    type: 'evaluation',
    title: `${role.label} evaluation completed`,
    detail: `Score ${submission.score}. Skills updated from ${task.title}.`,
    metadata: { taskId: task._id, submissionId: submission._id, skillProgress: skillProgress.skills }
  });
  const dashboardSnapshot = await getDashboardSnapshot({ user, roleId: role.id });

  return {
    submission,
    evaluation,
    newSkills: user.skills,
    skillGraph: evolvedSkills,
    roleContext: await buildRoleContext(user, role.id),
    performance,
    activityEvent: buildWorkplaceActivityEvent({ type: 'evaluation', role, task, evaluation, performance }),
    dashboardSnapshot
  };
};

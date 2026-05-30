import Task from '../models/Task.js';
import Submission from '../models/Submission.js';

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)));

const average = (values) => {
  const numeric = values.filter((value) => Number.isFinite(value));
  if (!numeric.length) return 0;
  return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
};

const normalizeScore = (score) => {
  if (!Number.isFinite(score)) return 0;
  return score <= 10 ? score * 10 : score;
};

const buildRecommendations = ({ roleId, confidenceScore, recentScores, completedTasks }) => {
  const recommendations = [];

  if (confidenceScore < 55) {
    recommendations.push('Ask your AI teammate to break the current task into one testable next step.');
  }

  if (recentScores.length >= 2 && recentScores[0] < recentScores[recentScores.length - 1]) {
    recommendations.push('Review the evaluator feedback trend before submitting the next iteration.');
  }

  if (completedTasks < 2) {
    recommendations.push('Complete two role-specific tasks to unlock a more reliable skill trend.');
  }

  if (roleId === 'data_analyst') {
    recommendations.push('Document one business implication for every metric shift you report.');
  }

  if (roleId === 'uiux_designer') {
    recommendations.push('Pair every design critique with a specific accessibility or hierarchy fix.');
  }

  return recommendations.slice(0, 4);
};

export const calculatePerformanceSnapshot = async ({ user, roleId, evaluation = null }) => {
  const [tasks, submissions] = await Promise.all([
    Task.find({ assignedTo: user._id, role: roleId }).sort({ createdAt: -1 }).limit(20),
    Submission.find({ user: user._id, role: roleId }).sort({ createdAt: -1 }).limit(10)
  ]);

  const recentScores = submissions.map((submission) => normalizeScore(submission.score));
  const completedTasks = tasks.filter((task) => ['Submitted', 'Evaluated'].includes(task.status)).length;
  const taskCompletionRate = tasks.length ? (completedTasks / tasks.length) * 100 : 0;
  const averageScore = average(recentScores);
  const skillGraph = user.roleSkills?.[roleId] || {};
  const skillAverage = average(Object.values(skillGraph).map(Number));
  const confidenceScore = clamp((averageScore * 0.42) + (skillAverage * 0.38) + (taskCompletionRate * 0.2));
  const trustLevel = confidenceScore >= 82 ? 'High' : confidenceScore >= 62 ? 'Growing' : 'Needs evidence';
  const latestScore = normalizeScore(evaluation?.score ?? submissions[0]?.score);

  return {
    roleId,
    confidenceScore,
    trustLevel,
    completedTasks,
    totalTasks: tasks.length,
    averageScore: clamp(averageScore),
    dataQuality: clamp(68 + (confidenceScore * 0.22) + (completedTasks * 1.5)),
    insightPipeline: clamp(42 + completedTasks * 8 + recentScores.length * 4),
    stakeholderRequests: Math.max(2, 6 - Math.floor(completedTasks / 2)),
    latestScore,
    skillGrowth: skillGraph,
    recommendations: buildRecommendations({ roleId, confidenceScore, recentScores, completedTasks }),
    updatedAt: new Date().toISOString()
  };
};

export const buildWorkplaceActivityEvent = ({ type, role, task, evaluation, performance }) => {
  const score = normalizeScore(evaluation?.score);

  if (type === 'evaluation') {
    return {
      type,
      title: `${role.label} evaluation completed`,
      detail: `Score ${score || performance.latestScore}/100. Confidence is now ${performance.confidenceScore}%.`,
      performance
    };
  }

  if (type === 'task') {
    return {
      type,
      title: 'AI Manager recalculated your workplace',
      detail: task?.title || 'New role-specific task assigned.',
      performance
    };
  }

  return {
    type,
    title: 'Workplace performance updated',
    detail: `Trust level: ${performance.trustLevel}.`,
    performance
  };
};

import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import SkillProgress from '../models/SkillProgress.js';
import ActivityFeed from '../models/ActivityFeed.js';
import { generateAdaptiveDashboard, toDashboardWidgets } from './adaptiveDashboardEngine.js';
import { generatePipelineMix, toPipelineCards } from './pipelineEngine.js';
import { generateRecommendations } from './recommendationEngine.js';

const toObject = (mapLike = {}) => {
  if (mapLike instanceof Map) return Object.fromEntries(mapLike);
  return mapLike || {};
};

export const createActivity = async ({ userId, role, type, title, detail, metadata = {} }) => {
  return ActivityFeed.create({ userId, role, type, title, detail, metadata });
};

export const getDashboardSnapshot = async ({ user, roleId }) => {
  const [tasks, submissions, skillProgress, feed] = await Promise.all([
    Task.find({ assignedTo: user._id, role: roleId }).sort({ createdAt: -1 }).lean(),
    Submission.find({ user: user._id, role: roleId }).sort({ createdAt: -1 }).limit(20).lean(),
    SkillProgress.findOne({ userId: user._id, role: roleId }).lean(),
    ActivityFeed.find({ userId: user._id, role: roleId }).sort({ createdAt: -1 }).limit(12).lean()
  ]);

  const skills = toObject(skillProgress?.skills) || toObject(user.roleSkills?.[roleId]);
  const pipelineMix = generatePipelineMix({ tasks });
  const metrics = generateAdaptiveDashboard({ tasks, submissions, skillProgress: skills });
  const recommendations = generateRecommendations({ skills, submissions, tasks, metrics });

  return {
    roleId,
    pipelineMix,
    pipelineCards: toPipelineCards(pipelineMix),
    widgets: toDashboardWidgets(metrics),
    metrics,
    skillGraph: skills,
    recommendations,
    feed: feed.map((event) => ({
      id: String(event._id),
      type: event.type,
      title: event.title,
      detail: event.detail,
      createdAt: event.createdAt
    })),
    updatedAt: new Date().toISOString()
  };
};

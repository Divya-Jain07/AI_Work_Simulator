import * as aiService from '../services/aiService.js';
import { assignRoleTask, evaluateRoleSubmission } from '../services/taskOrchestrator.js';
import { getManagerForRole, getUserRole, resolveRole } from '../services/roleEngine.js';
import { getConversationHistory } from '../services/conversationMemory.js';
import { createActivity, getDashboardSnapshot } from '../services/dashboardEngine.js';

export const assignTask = async (req, res) => {
  try {
    // Prevent Response Caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const result = await assignRoleTask({ user: req.user, requestedRoleId: req.body?.roleId });
    req.app.get('io')?.to(`user:${req.user._id}`).emit('task:assigned', result);
    if (result.dashboardSnapshot) {
      req.app.get('io')?.to(`user:${req.user._id}`).emit('dashboard:updated', result.dashboardSnapshot);
    }
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const chatTeammate = async (req, res) => {
  try {
    const { history, message, roleId } = req.body;
    // Always resolve the FULL role object (includes teammateName, teammateTitle, skills, etc.)
    // buildRoleContext().activeRole only carries {id, label, headline} which would lose teammate info.
    const role = resolveRole(roleId || getUserRole(req.user).id);
    const manager = getManagerForRole(role.id);

    // Prevent Response Caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const reply = await aiService.chatWithRoleTeammate({
      user: req.user,
      history,
      currentMessage: message,
      role,
      manager
    });
    await createActivity({
      userId: req.user._id,
      role: role.id,
      type: 'teammate',
      title: `${role.teammateName} reviewed your workspace question`,
      detail: String(message || '').slice(0, 120)
    });
    const dashboardSnapshot = await getDashboardSnapshot({ user: req.user, roleId: role.id });
    req.app.get('io')?.to(`user:${req.user._id}`).emit('dashboard:updated', dashboardSnapshot);
    res.json({ reply, dashboardSnapshot });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: process.env.NODE_ENV === 'production'
        ? 'AI teammate is temporarily unavailable. Please try again in a moment.'
        : `AI teammate is temporarily unavailable: ${error.message}`
    });
  }
};

export const submitAndEvaluate = async (req, res) => {
  try {
    const { taskId, content } = req.body;

    // Prevent Response Caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const result = await evaluateRoleSubmission({ user: req.user, taskId, content });
    req.app.get('io')?.to(`user:${req.user._id}`).emit('submission:evaluated', result);
    if (result.dashboardSnapshot) {
      req.app.get('io')?.to(`user:${req.user._id}`).emit('dashboard:updated', result.dashboardSnapshot);
    }
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { roleId } = req.query;
    const activeRole = roleId || req.user.activeWorkRole;

    // Prevent Response Caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const history = await getConversationHistory(req.user._id, activeRole);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



import * as aiService from '../services/aiService.js';
import { assignRoleTask, evaluateRoleSubmission } from '../services/taskOrchestrator.js';
import { buildRoleContext, getManagerForRole, getUserRole } from '../services/roleEngine.js';

export const assignTask = async (req, res) => {
  try {
    const result = await assignRoleTask({ user: req.user, requestedRoleId: req.body?.roleId });
    req.app.get('io')?.to(`user:${req.user._id}`).emit('task:assigned', result);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const chatTeammate = async (req, res) => {
  try {
    const { history, message, roleId } = req.body;
    const role = roleId ? (await buildRoleContext(req.user, roleId)).activeRole : getUserRole(req.user);
    const manager = getManagerForRole(role.id);
    const reply = await aiService.chatWithRoleTeammate({
      history,
      currentMessage: message,
      role,
      manager
    });
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitAndEvaluate = async (req, res) => {
  try {
    const { taskId, content } = req.body;
    const result = await evaluateRoleSubmission({ user: req.user, taskId, content });
    req.app.get('io')?.to(`user:${req.user._id}`).emit('submission:evaluated', result);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

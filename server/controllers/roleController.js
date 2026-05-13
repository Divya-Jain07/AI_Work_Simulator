import { buildRoleContext, getAvailableRoles } from '../services/roleEngine.js';
import { switchUserRole } from '../services/taskOrchestrator.js';

export const listRoles = async (req, res) => {
  res.json({
    roles: getAvailableRoles(),
    current: buildRoleContext(req.user)
  });
};

export const getRoleContext = async (req, res) => {
  res.json(buildRoleContext(req.user, req.params.roleId));
};

export const changeRole = async (req, res) => {
  try {
    const roleContext = await switchUserRole({ user: req.user, roleId: req.body.roleId });
    req.app.get('io')?.to(`user:${req.user._id}`).emit('role:changed', roleContext);
    res.json(roleContext);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

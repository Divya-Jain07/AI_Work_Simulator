import { getUserRole, resolveRole } from '../services/roleEngine.js';
import { getDashboardSnapshot } from '../services/dashboardEngine.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const role = resolveRole(req.query.roleId || getUserRole(req.user).id);
    const snapshot = await getDashboardSnapshot({ user: req.user, roleId: role.id });
    res.json(snapshot);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

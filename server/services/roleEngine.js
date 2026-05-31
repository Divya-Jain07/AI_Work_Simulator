import { DEFAULT_WORKPLACE_ROLE, WORKPLACE_ROLES, normalizeRoleId } from '../config/roleConfig.js';
import Submission from '../models/Submission.js';
import frontendManager from '../../ai-services/agents/frontendManager.js';
import backendManager from '../../ai-services/agents/backendManager.js';
import analystManager from '../../ai-services/agents/analystManager.js';
import uiuxManager from '../../ai-services/agents/uiuxManager.js';
import frontendEvaluator from '../../ai-services/evaluators/frontendEvaluator.js';
import backendEvaluator from '../../ai-services/evaluators/backendEvaluator.js';
import analystEvaluator from '../../ai-services/evaluators/analystEvaluator.js';
import uiuxEvaluator from '../../ai-services/evaluators/uiuxEvaluator.js';

const managers = {
  frontend: frontendManager,
  backend: backendManager,
  analyst: analystManager,
  uiux: uiuxManager
};

const evaluators = {
  frontend: frontendEvaluator,
  backend: backendEvaluator,
  analyst: analystEvaluator,
  uiux: uiuxEvaluator
};

export const getAvailableRoles = () => Object.values(WORKPLACE_ROLES).map((role) => ({
  id: role.id,
  label: role.label,
  headline: role.headline,
  taskCategories: role.taskCategories,
  dashboardWidgets: role.dashboardWidgets,
  teammateName: role.teammateName,
  teammateTitle: role.teammateTitle,
  evaluationCriteria: role.evaluationCriteria,
  learningRecommendations: role.learningRecommendations,
  defaultSkillGraph: role.skills
}));

export const resolveRole = (roleId) => {
  const normalized = normalizeRoleId(roleId || DEFAULT_WORKPLACE_ROLE);
  return WORKPLACE_ROLES[normalized];
};

export const getUserRole = (user) => resolveRole(user?.activeWorkRole || user?.workRole || DEFAULT_WORKPLACE_ROLE);

export const getManagerForRole = (roleId) => {
  const role = resolveRole(roleId);
  return managers[role.managerKey];
};

export const getEvaluatorForRole = (roleId) => {
  const role = resolveRole(roleId);
  return evaluators[role.evaluatorKey];
};

export const buildRoleContext = async (user, roleId) => {
  const role = resolveRole(roleId || user?.activeWorkRole);
  const roleSkills = getRoleSkillGraph(user, role.id);

  let learningRecommendations = role.learningRecommendations;

  if (user?._id) {
    try {
      const latestSubmission = await Submission.findOne({ user: user._id, role: role.id })
        .sort({ createdAt: -1 });

      if (latestSubmission) {
        if (latestSubmission.recommendations && latestSubmission.recommendations.length > 0) {
          learningRecommendations = latestSubmission.recommendations.map(rec => ({
            type: rec.type,
            text: rec.text,
            courseTitle: rec.courseTitle,
            courseUrl: rec.courseUrl
          }));
        } else if (latestSubmission.weaknesses?.length || latestSubmission.suggestions?.length) {
          // Fallback map if the submission has legacy weaknesses/suggestions but no structured recommendations
          const legacyRecs = [];
          (latestSubmission.weaknesses || []).forEach(w => {
            legacyRecs.push({
              type: 'weakness',
              text: w,
              courseTitle: `Learn about ${w.slice(0, 30)}...`,
              courseUrl: `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(w)}`
            });
          });
          (latestSubmission.suggestions || []).forEach(s => {
            legacyRecs.push({
              type: 'suggestion',
              text: s,
              courseTitle: `Learn about ${s.slice(0, 30)}...`,
              courseUrl: `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(s)}`
            });
          });
          if (legacyRecs.length > 0) {
            learningRecommendations = legacyRecs;
          }
        }
      }
    } catch (err) {
      console.error("Failed to query dynamic learning recommendations:", err);
    }
  }

  return {
    activeRole: {
      id: role.id,
      label: role.label,
      headline: role.headline
    },
    taskCategories: role.taskCategories,
    dashboardWidgets: role.dashboardWidgets,
    teammate: {
      name: role.teammateName,
      title: role.teammateTitle,
      systemPrompt: getManagerForRole(role.id).teammateSystemPrompt(role)
    },
    evaluationCriteria: role.evaluationCriteria,
    learningRecommendations,
    skillGraph: roleSkills
  };
};

export const initializeRoleSkills = (existing = {}) => {
  const existingObject = existing instanceof Map ? Object.fromEntries(existing) : existing;
  const roleSkills = { ...existingObject };
  Object.values(WORKPLACE_ROLES).forEach((role) => {
    // Start every skill key at 0 for new users; preserve any previously earned values.
    const zeroBase = Object.fromEntries(Object.keys(role.skills).map((k) => [k, 0]));
    let currentSkills = roleSkills[role.id] || {};
    const isLegacy = Object.keys(currentSkills).length > 0 && Object.keys(role.skills).every(k => currentSkills[k] === role.skills[k]);
    if (isLegacy) {
      currentSkills = {};
    }

    roleSkills[role.id] = {
      ...zeroBase,
      ...currentSkills
    };
  });
  return roleSkills;
};

export const getRoleSkillGraph = (user, roleId) => {
  const role = resolveRole(roleId);
  let rawSkills = user?.roleSkills instanceof Map
    ? user.roleSkills.get(role.id)
    : user?.roleSkills?.[role.id];

  // Fix legacy hardcoded data bug: If rawSkills matches the hardcoded defaults, ignore it
  const isLegacy = rawSkills && Object.keys(role.skills).every(k => rawSkills[k] === role.skills[k]);
  if (isLegacy) {
    rawSkills = null;
  }

  // Build a zero-baseline from the role's skill keys so new users always
  // start at 0 instead of inheriting the hardcoded fallback numbers.
  const zeroBase = Object.fromEntries(Object.keys(role.skills).map((k) => [k, 0]));
  return {
    ...zeroBase,
    ...(rawSkills || {})
  };
};

export const applySkillUpdates = (user, roleId, skillUpdates = {}) => {
  const role = resolveRole(roleId);
  const roleSkills = initializeRoleSkills(user.roleSkills || {});
  // Use the initialized (zero-based) skills as the starting point, not the hardcoded defaults.
  const current = { ...(roleSkills[role.id] || {}) };

  Object.entries(skillUpdates).forEach(([skill, delta]) => {
    const currentValue = Number(current[skill] || 0);
    const nextValue = Math.max(0, Math.min(100, currentValue + Number(delta || 0)));
    current[skill] = nextValue;
  });

  roleSkills[role.id] = current;
  user.roleSkills = roleSkills;
  user.markModified?.('roleSkills');

  const legacyAverage = Object.values(current).reduce((sum, value) => sum + Number(value || 0), 0) / Math.max(Object.keys(current).length, 1);
  user.skills.problemSolving = Math.round(legacyAverage);
  user.skills.coding = Math.round((current.react || current.apiDesign || current.dataCleaning || current.visualHierarchy || legacyAverage));
  user.skills.communication = Math.round(current.communication || legacyAverage);

  return current;
};

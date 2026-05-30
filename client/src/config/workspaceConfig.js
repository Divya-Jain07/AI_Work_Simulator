import { lazy } from 'react';
import {
  FiBarChart2,
  FiCode,
  FiDatabase,
  FiEye,
  FiGitBranch,
  FiMonitor,
  FiServer,
  FiTerminal,
  FiZap
} from 'react-icons/fi';

export const WORKSPACE_ROLE = {
  UI_UX_DESIGNER: 'uiux_designer',
  FRONTEND_ENGINEER: 'frontend_developer',
  BACKEND_ENGINEER: 'backend_developer',
  DATA_ANALYST: 'data_analyst'
};

export const TASK_TYPE = {
  ACCESSIBILITY_AUDIT: 'ACCESSIBILITY_AUDIT',
  WIREFRAME_TASK: 'WIREFRAME_TASK',
  KPI_ANALYSIS: 'KPI_ANALYSIS',
  SQL_TASK: 'SQL_TASK',
  BUG_FIX_TASK: 'BUG_FIX_TASK',
  API_TASK: 'API_TASK'
};

const lazyWorkspace = (exportName) => lazy(() => (
  import('../components/workspaces/AdaptiveWorkspaces.jsx')
    .then((module) => ({ default: module[exportName] }))
));

export const workspaceMap = {
  [WORKSPACE_ROLE.UI_UX_DESIGNER]: {
    [TASK_TYPE.ACCESSIBILITY_AUDIT]: lazyWorkspace('AccessibilityWorkspace'),
    [TASK_TYPE.WIREFRAME_TASK]: lazyWorkspace('WireframeWorkspace')
  },
  [WORKSPACE_ROLE.DATA_ANALYST]: {
    [TASK_TYPE.KPI_ANALYSIS]: lazyWorkspace('AnalyticsWorkspace'),
    [TASK_TYPE.SQL_TASK]: lazyWorkspace('SQLWorkspace')
  },
  [WORKSPACE_ROLE.FRONTEND_ENGINEER]: {
    [TASK_TYPE.BUG_FIX_TASK]: lazyWorkspace('FrontendBugWorkspace')
  },
  [WORKSPACE_ROLE.BACKEND_ENGINEER]: {
    [TASK_TYPE.API_TASK]: lazyWorkspace('BackendAPIWorkspace')
  }
};

export const workspaceSidebarMap = {
  [WORKSPACE_ROLE.UI_UX_DESIGNER]: [
    { id: 'review', label: 'Review Board', icon: FiEye }
  ],
  [WORKSPACE_ROLE.DATA_ANALYST]: [
    { id: 'sql', label: 'SQL', icon: FiDatabase },
    { id: 'dashboards', label: 'Dashboards', icon: FiBarChart2 },
    { id: 'kpis', label: 'KPIs', icon: FiZap },
    { id: 'insights', label: 'Insights', icon: FiGitBranch }
  ],
  [WORKSPACE_ROLE.FRONTEND_ENGINEER]: [
    { id: 'files', label: 'Files', icon: FiCode },
    { id: 'terminal', label: 'Terminal', icon: FiTerminal },
    { id: 'preview', label: 'Preview', icon: FiMonitor },
    { id: 'git', label: 'Git Changes', icon: FiGitBranch }
  ],
  [WORKSPACE_ROLE.BACKEND_ENGINEER]: [
    { id: 'api', label: 'API Testing', icon: FiServer },
    { id: 'schema', label: 'Schema', icon: FiDatabase },
    { id: 'response', label: 'Inspector', icon: FiEye },
    { id: 'logs', label: 'Server Logs', icon: FiTerminal }
  ]
};

export const teammatePersonaMap = {
  [WORKSPACE_ROLE.UI_UX_DESIGNER]: { name: 'Lina', title: 'Senior Product Designer' },
  [WORKSPACE_ROLE.FRONTEND_ENGINEER]: { name: 'Maya', title: 'Senior React Engineer' },
  [WORKSPACE_ROLE.DATA_ANALYST]: { name: 'Neha', title: 'Lead Business Analyst' },
  [WORKSPACE_ROLE.BACKEND_ENGINEER]: { name: 'Arjun', title: 'Senior API Architect' }
};

export const inferTaskType = (task) => {
  const role = task?.role || WORKSPACE_ROLE.FRONTEND_ENGINEER;
  const text = `${task?.title || ''} ${task?.category || ''} ${task?.description || ''}`.toLowerCase();

  if (role === WORKSPACE_ROLE.UI_UX_DESIGNER) {
    if (/wireframe|prototype|component|responsive|mobile/.test(text)) return TASK_TYPE.WIREFRAME_TASK;
    return TASK_TYPE.ACCESSIBILITY_AUDIT;
  }

  if (role === WORKSPACE_ROLE.DATA_ANALYST) {
    if (/sql|csv|query|dataset|clean|import/.test(text)) return TASK_TYPE.SQL_TASK;
    return TASK_TYPE.KPI_ANALYSIS;
  }

  if (role === WORKSPACE_ROLE.BACKEND_ENGINEER) return TASK_TYPE.API_TASK;
  return TASK_TYPE.BUG_FIX_TASK;
};

export const resolveWorkspaceDefinition = (task) => {
  const role = task?.role || WORKSPACE_ROLE.FRONTEND_ENGINEER;
  const taskType = inferTaskType(task);
  const Workspace = workspaceMap[role]?.[taskType]
    || workspaceMap[WORKSPACE_ROLE.FRONTEND_ENGINEER][TASK_TYPE.BUG_FIX_TASK];

  return {
    role,
    taskType,
    Workspace,
    sidebarItems: workspaceSidebarMap[role] || workspaceSidebarMap[WORKSPACE_ROLE.FRONTEND_ENGINEER],
    teammatePersona: teammatePersonaMap[role] || teammatePersonaMap[WORKSPACE_ROLE.FRONTEND_ENGINEER]
  };
};

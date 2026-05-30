import {
  FiCode,
  FiDatabase,
  FiEye,
  FiServer
} from 'react-icons/fi';
import { TASK_TYPE, WORKSPACE_ROLE } from '../../config/workspaceConfig';

const createTab = (id, label, icon, taskTypes) => ({ id, label, icon, taskTypes });

export const tabsByRole = {
  [WORKSPACE_ROLE.DATA_ANALYST]: [
    createTab('sql', 'SQL Workspace', FiDatabase, [TASK_TYPE.SQL_TASK, TASK_TYPE.KPI_ANALYSIS])
  ],
  [WORKSPACE_ROLE.UI_UX_DESIGNER]: [
    createTab('review', 'Review Board', FiEye)
  ],
  [WORKSPACE_ROLE.FRONTEND_ENGINEER]: [
    createTab('code', 'Code Workspace', FiCode)
  ],
  [WORKSPACE_ROLE.BACKEND_ENGINEER]: [
    createTab('api', 'API Playground', FiServer)
  ]
};

export const getWorkspaceTabs = (role, taskType) => {
  const tabs = tabsByRole[role] || tabsByRole[WORKSPACE_ROLE.FRONTEND_ENGINEER];
  return tabs.filter((tab) => !tab.taskTypes || tab.taskTypes.includes(taskType));
};

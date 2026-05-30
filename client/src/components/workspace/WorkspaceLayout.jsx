import { useEffect, useMemo } from 'react';
import WorkspaceTabs from './WorkspaceTabs';
import TabContentRenderer from './TabContentRenderer';
import { getWorkspaceTabs } from './workspaceTabsConfig';
import { WORKSPACE_ROLE } from '../../config/workspaceConfig';
import { useWorkspaceTabStore } from './workspaceTabStore';
import styles from './WorkspaceLayout.module.css';

const WorkspaceLayout = ({ definition, task, value, onChange, onSubmit, submitting, disabled }) => {
  const workspaceId = `${task?._id || 'draft'}-${definition.role}-${definition.taskType}`;
  const tabs = useMemo(() => getWorkspaceTabs(definition.role, definition.taskType), [definition.role, definition.taskType]);
  const fallbackTab = tabs[0]?.id;
  const activeTabFromStore = useWorkspaceTabStore((state) => state.activeTabs[workspaceId]);
  const visitedTabsFromStore = useWorkspaceTabStore((state) => state.visitedTabs[workspaceId] || []);
  const setActiveTab = useWorkspaceTabStore((state) => state.setActiveTab);
  const markVisited = useWorkspaceTabStore((state) => state.markVisited);
  const activeTab = tabs.some((tab) => tab.id === activeTabFromStore) ? activeTabFromStore : fallbackTab;
  const showTabs = tabs.length > 1 && !([WORKSPACE_ROLE.DATA_ANALYST, WORKSPACE_ROLE.UI_UX_DESIGNER].includes(definition.role) && tabs.length === 1);
  const visitedTabs = useMemo(() => (
    Array.from(new Set([activeTab, ...visitedTabsFromStore].filter(Boolean)))
  ), [activeTab, visitedTabsFromStore]);

  useEffect(() => {
    if (fallbackTab && !activeTabFromStore) {
      setActiveTab(workspaceId, fallbackTab);
    }
  }, [activeTabFromStore, fallbackTab, setActiveTab, workspaceId]);

  useEffect(() => {
    if (activeTab) markVisited(workspaceId, activeTab);
  }, [activeTab, markVisited, workspaceId]);

  const handleTabChange = (tabId) => setActiveTab(workspaceId, tabId);

  if (!activeTab) return null;

  return (
    <section className={`${styles.workspaceFrame} ${!showTabs ? styles.workspaceFrameSingle : ''}`} aria-label="Tabbed submission workspace">
      {showTabs && (
        <WorkspaceTabs
          role={definition.role}
          taskType={definition.taskType}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
      <TabContentRenderer
        tabs={tabs}
        activeTab={activeTab}
        visitedTabs={visitedTabs}
        role={definition.role}
        Workspace={definition.Workspace}
        task={task}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        submitting={submitting}
        disabled={disabled}
      />
    </section>
  );
};

export default WorkspaceLayout;

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiLayers } from 'react-icons/fi';
import { getWorkspaceTabs } from './workspaceTabsConfig';
import styles from './WorkspaceLayout.module.css';

const WorkspaceTabs = ({ role, taskType, activeTab, onTabChange }) => {
  const tabs = useMemo(() => getWorkspaceTabs(role, taskType), [role, taskType]);

  return (
    <div className={styles.tabBarShell}>
      <select
        className={styles.mobileSelect}
        value={activeTab}
        onChange={(event) => onTabChange(event.target.value)}
        aria-label="Workspace tab"
      >
        {tabs.map((tab) => (
          <option key={tab.id} value={tab.id}>{tab.label}</option>
        ))}
      </select>

      <div className={styles.tabScroller} role="tablist" aria-label="Submission workspace tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon || FiLayers;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.tabButton} ${isActive ? styles.tabActive : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon />
              {tab.label}
              {isActive && <motion.span layoutId="workspace-tab-underline" className={styles.activeUnderline} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkspaceTabs;

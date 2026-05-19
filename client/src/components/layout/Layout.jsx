import { useContext, useState } from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';
import { WorkplaceContext } from '../../context/workplaceContextObject';
import { FiMenu } from 'react-icons/fi';

const Layout = ({ children }) => {
  const { roleContext, connected } = useContext(WorkplaceContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('main_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('main_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={sidebarCollapsed} />
      <main className={styles.mainContent}>
        <div className={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className={styles.sidebarToggle} 
              onClick={toggleSidebar}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <FiMenu />
            </button>
            <div>
              <span className={styles.topbarEyebrow}>AI Workplace Simulator</span>
              <h2>{roleContext?.activeRole?.label || 'Workspace Overview'}</h2>
            </div>
          </div>
          <div className={styles.topbarActions}>
            <span className={styles.syncStatus}>
              <i className={connected ? styles.connectedDot : styles.offlineDot}></i>
              {connected ? 'Live' : 'Fallback'}
            </span>
          </div>
        </div>
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

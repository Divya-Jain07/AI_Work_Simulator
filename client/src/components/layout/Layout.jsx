import { useContext } from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';
import { WorkplaceContext } from '../../context/workplaceContextObject';

const Layout = ({ children }) => {
  const { roleContext, connected } = useContext(WorkplaceContext);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.topbar}>
          <div>
            <span className={styles.topbarEyebrow}>AI Workplace Simulator</span>
            <h2>{roleContext?.activeRole?.label || 'Workspace Overview'}</h2>
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

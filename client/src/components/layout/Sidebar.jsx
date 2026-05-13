import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { WorkplaceContext } from '../../context/workplaceContextObject';
import styles from './Layout.module.css';
import { FiHome, FiBriefcase, FiUser, FiLogOut, FiCpu } from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { roleContext } = useContext(WorkplaceContext);

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}><FiCpu /></div>
        <span>WorkSim AI</span>
      </div>

      <div className={styles.roleSummary}>
        <span>Active role</span>
        <strong>{roleContext?.activeRole?.label || 'Loading role'}</strong>
        <p>{roleContext?.teammate?.name || 'AI'} is assigned as your teammate.</p>
      </div>
      
      <nav className={styles.nav}>
        <Link to="/" className={styles.navItem}>
          <FiHome /> Dashboard
        </Link>
        <div className={styles.navItem}>
          <FiBriefcase /> Tasks
        </div>
        <div className={styles.navItem}>
          <FiUser /> Profile
        </div>
      </nav>

      <div className={styles.sidebarBottom}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{user?.name?.charAt(0)}</div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userRole}>{roleContext?.activeRole?.label || user?.role}</span>
          </div>
        </div>
        <button onClick={logout} className={styles.logoutBtn}>
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

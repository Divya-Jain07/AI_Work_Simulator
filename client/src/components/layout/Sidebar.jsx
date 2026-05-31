import { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { WorkplaceContext } from '../../context/workplaceContextObject';
import styles from './Layout.module.css';
import { FiHome, FiBriefcase, FiUser, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { ThemeContext } from '../../context/ThemeContext';

const roleAccent = {
  frontend_developer: styles.frontend,
  backend_developer: styles.backend,
  data_analyst: styles.analyst,
  uiux_designer: styles.uiux
};

const Sidebar = ({ collapsed }) => {
  const { user, logout } = useContext(AuthContext);
  const { roleContext, activeRoleId } = useContext(WorkplaceContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${roleAccent[activeRoleId] || ''}`}>
      <div className={styles.logo}>
        <Link to="/" className={styles.brandLink}>
          {!collapsed ? (
            <>
              <span>WorkSim</span>
              <span className={styles.logoBox}>AI</span>
            </>
          ) : (
            <span className={styles.logoBoxCollapsed}>AI</span>
          )}
        </Link>
      </div>

      {!collapsed && (
        <div className={styles.roleSummary}>
          <span>ACTIVE ROLE</span>
          <strong>{roleContext?.activeRole?.label || 'Loading role'}</strong>
          <p>{roleContext?.teammate?.name || 'AI'} is assigned as your teammate.</p>
        </div>
      )}

      <nav className={styles.nav}>
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''} ${collapsed ? styles.navItemCollapsed : ''}`}
          title={collapsed ? "Dashboard" : undefined}
        >
          <FiHome /> {!collapsed && <span>Dashboard</span>}
        </NavLink>
        <NavLink
          to="/choose-role?switch=1"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''} ${collapsed ? styles.navItemCollapsed : ''}`}
          title={collapsed ? "Switch role" : undefined}
        >
          <FiBriefcase /> {!collapsed && <span>Switch role</span>}
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''} ${collapsed ? styles.navItemCollapsed : ''}`}
          title={collapsed ? "Profile" : undefined}
        >
          <FiUser /> {!collapsed && <span>Profile</span>}
        </NavLink>
      </nav>

      <div className={styles.sidebarBottom}>
        <Link to="/profile" className={`${styles.userInfo} ${collapsed ? styles.userInfoCollapsed : ''}`} title={collapsed ? user?.name : undefined}>
          <div className={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
          {!collapsed && (
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userRole}>{roleContext?.activeRole?.label || user?.role}</span>
            </div>
          )}
        </Link>
        <button 
          type="button" 
          onClick={toggleTheme} 
          className={`${styles.logoutBtn} ${collapsed ? styles.logoutBtnCollapsed : ''}`}
          title={collapsed ? "Toggle Theme" : undefined}
          style={{ marginBottom: '0.5rem' }}
        >
          {theme === 'dark' ? <FiSun /> : <FiMoon />} {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button 
          type="button" 
          onClick={handleLogout} 
          className={`${styles.logoutBtn} ${collapsed ? styles.logoutBtnCollapsed : ''}`}
          title={collapsed ? "Logout" : undefined}
        >
          <FiLogOut /> {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

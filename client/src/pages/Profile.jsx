import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { WorkplaceContext } from '../context/workplaceContextObject';
import styles from './Profile.module.css';

const formatSkill = (skill) => skill
  .replace(/([A-Z])/g, ' $1')
  .replace(/^./, (letter) => letter.toUpperCase());

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { roleContext } = useContext(WorkplaceContext);
  const [theme, setTheme] = useState(() => localStorage.getItem('workspace_theme') || 'dark');
  const skillEntries = Object.entries(roleContext?.skillGraph || {});

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('workspace_theme', theme);
  }, [theme]);

  return (
    <div className={styles.profile}>
      <section className={styles.hero}>
        <div className={styles.avatar}>{user?.name?.charAt(0) || '?'}</div>
        <div>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
          <span className={styles.roleBadge}>{roleContext?.activeRole?.label || 'No role selected'}</span>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Active workplace</h2>
        <p>{roleContext?.activeRole?.headline}</p>
        <p className={styles.muted}>
          Teammate: {roleContext?.teammate?.name} · {roleContext?.teammate?.title}
        </p>
        <Link to="/choose-role?switch=1" className={styles.linkBtn}>Switch role</Link>
      </section>

      <section className={styles.panel}>
        <div className={styles.settingHeader}>
          <div>
            <h2>Theme</h2>
            <p className={styles.muted}>Choose how the workspace appears on this device.</p>
          </div>
          <div className={styles.themeToggle} role="group" aria-label="Theme selection">
            <button
              type="button"
              className={theme === 'dark' ? styles.themeActive : ''}
              onClick={() => setTheme('dark')}
            >
              Dark
            </button>
            <button
              type="button"
              className={theme === 'light' ? styles.themeActive : ''}
              onClick={() => setTheme('light')}
            >
              Light
            </button>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Skill graph</h2>
        <div className={styles.skills}>
          {skillEntries.length === 0 ? (
            <p className={styles.muted}>Skills will appear after your first evaluation.</p>
          ) : skillEntries.map(([skill, value]) => (
            <div key={skill} className={styles.skillRow}>
              <div className={styles.skillHeader}>
                <span>{formatSkill(skill)}</span>
                <span>{value}/100</span>
              </div>
              <div className={styles.bar}>
                <div className={styles.fill} style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Profile;

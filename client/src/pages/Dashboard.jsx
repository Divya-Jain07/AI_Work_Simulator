import { useContext, useEffect, useMemo } from 'react';
import { WorkplaceContext } from '../context/workplaceContextObject';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiRadio,
  FiTarget,
  FiZap
} from 'react-icons/fi';
import { useDashboardStore } from '../engine/dashboardStore';
import styles from './Dashboard.module.css';

const roleAccent = {
  frontend_developer: styles.frontend,
  backend_developer: styles.backend,
  data_analyst: styles.analyst,
  uiux_designer: styles.uiux
};

const formatSkill = (skill) => skill
  .replace(/([A-Z])/g, ' $1')
  .replace(/^./, (letter) => letter.toUpperCase());

const Dashboard = () => {
  const {
    roleContext,
    tasks,
    connected,
    loading,
    assigning,
    activity,
    activeRoleId,
    requestTask
  } = useContext(WorkplaceContext);
  const snapshot = useDashboardStore((state) => state.snapshot);
  const setSnapshot = useDashboardStore((state) => state.setSnapshot);
  const navigate = useNavigate();

  const activeRole = roleContext?.activeRole;
  const roleTasks = tasks.filter(t => t.role === activeRoleId);
  const latestTask = roleTasks[0];
  const completedCount = roleTasks.filter((task) => task.status === 'Evaluated').length;
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-analytics', activeRoleId],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:5000/api/dashboard?roleId=${activeRoleId}`);
      return data;
    },
    enabled: !!activeRoleId,
    staleTime: 20_000
  });

  useEffect(() => {
    if (dashboardData) setSnapshot(dashboardData);
  }, [dashboardData, setSnapshot]);

  const liveSnapshot = snapshot?.roleId === activeRoleId ? snapshot : dashboardData;
  const skillEntries = Object.entries(liveSnapshot?.skillGraph || roleContext?.skillGraph || {});

  const taskMix = useMemo(() => (
    liveSnapshot?.pipelineCards?.length
      ? liveSnapshot.pipelineCards
      : Object.entries(roleTasks.reduce((mix, task) => {
        const category = task.category || 'Uncategorized';
        mix[category] = (mix[category] || 0) + 1;
        return mix;
      }, {})).map(([label, count]) => ({ key: label, label, count }))
  ), [liveSnapshot, roleTasks]);

  const dashboardWidgets = useMemo(() => (
    liveSnapshot?.widgets?.length
      ? liveSnapshot.widgets
      : [
        { key: 'activeTasks', label: 'Active tasks', value: roleTasks.length, detail: 'Current assigned task history' },
        { key: 'evaluatedTasks', label: 'Evaluated', value: completedCount, detail: 'Completed submissions with evaluator scores' },
        { key: 'openTasks', label: 'Open work', value: Math.max(0, roleTasks.length - completedCount), detail: 'Tasks still affecting dashboard confidence' }
      ]
  ), [completedCount, liveSnapshot, roleTasks.length]);

  const recommendations = liveSnapshot?.recommendations || [];
  const feed = liveSnapshot?.feed?.length ? liveSnapshot.feed : activity;

  const handleRequestTask = async () => {
    try {
      const task = await requestTask();
      if (task?._id) navigate(`/task/${task._id}`);
    } catch (err) {
      alert(`Failed to assign task: ${err.message}`);
    }
  };

  return (
    <div className={`${styles.dashboard} ${roleAccent[activeRoleId] || ''}`}>
      <section className={styles.commandCenter}>
        <div className={styles.heroCopy}>
          <div className={styles.livePill}>
            <span className={connected ? styles.liveDot : styles.offlineDot}></span>
            {connected ? 'Realtime sync active' : 'HTTP fallback active'}
          </div>
          <h1>{activeRole?.label || 'AI Workplace'} Command Center</h1>
          <p>{activeRole?.headline || 'Choose a role to activate your adaptive workplace.'}</p>
        </div>
        <div className={styles.heroActions}>
          <button className={styles.primaryAction} onClick={handleRequestTask} disabled={assigning || loading}>
            <FiZap />
            {assigning ? 'AI Manager assigning...' : 'Get live task'}
          </button>
          <div className={styles.managerCard}>
            <span>AI teammate</span>
            <strong>{roleContext?.teammate?.name || 'AI Teammate'}</strong>
            <small>{roleContext?.teammate?.title || 'Role-aware collaborator'}</small>
          </div>
        </div>
      </section>

      <AnimatePresence mode="sync">
        <motion.div
          key={activeRoleId}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className={styles.grid}
        >
          <div className={styles.mainColumn}>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <FiBriefcase />
                <span>Active tasks</span>
                <strong>{roleTasks.length}</strong>
              </div>
              <div className={styles.metricCard}>
                <FiCheckCircle />
                <span>Evaluated</span>
                <strong>{completedCount}</strong>
              </div>
              <div className={styles.metricCard}>
                <FiClock />
                <span>Current deadline</span>
                <strong>{latestTask?.deadline || 'Waiting'}</strong>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.eyebrow}>AI Manager Queue</span>
                  <h2>Role-specific assignments</h2>
                </div>
                <FiRadio />
              </div>

              {loading ? (
                <div className={styles.emptyState}>Loading role pipeline...</div>
              ) : roleTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  Your manager has not assigned a {activeRole?.label} task yet.
                </div>
              ) : (
                <div className={styles.taskList}>
                  {roleTasks.map((task) => (
                    <button key={task._id} className={styles.taskItem} onClick={() => navigate(`/task/${task._id}`)}>
                      <div>
                        <div className={styles.taskMeta}>
                          <span>{task.category}</span>
                          <span>{task.deadline}</span>
                        </div>
                        <h3>{task.title}</h3>
                        <p>{task.businessContext || task.description}</p>
                      </div>
                      <div className={styles.taskStatus}>
                        <span className={`${styles.statusBadge} ${styles[`status${task.status?.replace(' ', '')}`]}`}>
                          {task.status}
                        </span>
                        <FiArrowRight />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.eyebrow}>Pipeline Mix</span>
                  <h2>Task categories from history</h2>
                </div>
                <FiLayers />
              </div>
              <div className={styles.categoryGrid}>
                {taskMix.length === 0 ? (
                  <div className={styles.emptyState}>No task history yet. Request a task to start pipeline analytics.</div>
                ) : taskMix.map((item) => (
                  <div key={item.key || item.label} className={styles.categoryItem}>
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className={styles.sideColumn}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.eyebrow}>Adaptive Dashboard</span>
                  <h2>Live widgets</h2>
                </div>
                <FiBarChart2 />
              </div>
              <div className={styles.widgetList}>
                {dashboardWidgets.map((widget) => (
                  <motion.div key={widget.key} className={styles.widgetItem} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <span>{widget.label}</span>
                    <strong>{widget.value}</strong>
                    <small>{widget.detail}</small>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.eyebrow}>Skill Graph</span>
                  <h2>{activeRole?.label} growth</h2>
                </div>
                <FiTarget />
              </div>
              <div className={styles.skillsList}>
                {skillEntries.map(([skill, value]) => (
                  <div key={skill} className={styles.skillItem}>
                    <div className={styles.skillHeader}>
                      <span>{formatSkill(skill)}</span>
                      <span>{value}/100</span>
                    </div>
                    <div className={styles.progressBar}>
                      <motion.div
                        className={styles.progressFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.eyebrow}>Learning</span>
                  <h2>Recommendations</h2>
                </div>
                <FiActivity />
              </div>
              <div className={styles.recommendations}>
                {recommendations.length === 0 && <small className={styles.muted}>Recommendations appear after real task or evaluation history exists.</small>}
                {recommendations.map((item, i) => {
                  const text = typeof item === 'string' ? item : item?.text || String(item);
                  const url = typeof item === 'object' ? item?.courseUrl : null;
                  return url ? (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className={styles.recLink}>
                      {text}
                    </a>
                  ) : (
                    <span key={i}>{text}</span>
                  );
                })}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.eyebrow}>Live Feed</span>
                  <h2>Workplace events</h2>
                </div>
              </div>
              <div className={styles.feedList}>
                {feed.length === 0 ? (
                  <small className={styles.muted}>Task assignments, evaluations, skill changes, and AI actions will appear here.</small>
                ) : feed.map((event) => (
                  <div key={event.id} className={styles.feedItem}>
                    <strong>{event.title}</strong>
                    <span>{event.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;

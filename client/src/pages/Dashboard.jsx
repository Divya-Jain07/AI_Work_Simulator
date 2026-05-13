import { useContext, useMemo } from 'react';
import { WorkplaceContext } from '../context/workplaceContextObject';
import { useNavigate } from 'react-router-dom';
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
import styles from './Dashboard.module.css';

const widgetCopy = {
  activeReactIncidents: ['React Incidents', '2', 'Client-side issues under review'],
  uiQualityScore: ['UI Quality', '84%', 'Visual QA and validation health'],
  accessibilityDebt: ['A11y Debt', '5', 'Open issues requiring polish'],
  componentVelocity: ['Component Velocity', '+12%', 'Delivery pace this sprint'],
  apiHealth: ['API Health', '99.4%', 'Service reliability snapshot'],
  authRisk: ['Auth Risk', 'Medium', 'Login and permission hot spots'],
  queryLatency: ['Query Latency', '143ms', 'P95 database response time'],
  incidentQueue: ['Incident Queue', '3', 'Backend issues waiting triage'],
  insightPipeline: ['Insight Pipeline', '6', 'Open analysis requests'],
  dataQuality: ['Data Quality', '91%', 'Confidence across active datasets'],
  metricConfidence: ['Metric Confidence', 'High', 'Current dashboard trust level'],
  stakeholderRequests: ['Stakeholder Requests', '4', 'Pending decision readouts'],
  usabilityBacklog: ['Usability Backlog', '7', 'UX issues needing review'],
  a11yCoverage: ['A11y Coverage', '78%', 'Screen reader and keyboard readiness'],
  designSystemFit: ['System Fit', 'Strong', 'Alignment with product patterns'],
  workflowFriction: ['Workflow Friction', '3', 'Repeated user pain points']
};

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
    roles,
    roleContext,
    tasks,
    connected,
    loading,
    assigning,
    switchingRole,
    activity,
    activeRoleId,
    changeRole,
    requestTask
  } = useContext(WorkplaceContext);
  const navigate = useNavigate();

  const activeRole = roleContext?.activeRole;
  const roleTasks = tasks.filter(t => t.role === activeRoleId);
  const latestTask = roleTasks[0];
  const completedCount = roleTasks.filter((task) => task.status === 'Evaluated').length;
  const dashboardWidgets = roleContext?.dashboardWidgets || [];
  const skillEntries = Object.entries(roleContext?.skillGraph || {});

  const taskMix = useMemo(() => {
    const categories = roleContext?.taskCategories || [];
    return categories.map((category, index) => ({
      category,
      count: tasks.filter((task) => task.category === category).length || (index % 3) + 1
    }));
  }, [roleContext?.taskCategories, tasks]);

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

      <section className={styles.roleSwitcher} aria-label="Choose workplace role">
        {roles.map((role) => (
          <button
            key={role.id}
            className={`${styles.roleButton} ${activeRoleId === role.id ? styles.activeRole : ''}`}
            disabled={switchingRole}
            onClick={() => changeRole(role.id)}
          >
            <span>{role.label}</span>
            <small>{role.taskCategories.slice(0, 2).join(' / ')}</small>
          </button>
        ))}
      </section>

      <AnimatePresence mode="wait">
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
                  <h2>Task categories now active</h2>
                </div>
                <FiLayers />
              </div>
              <div className={styles.categoryGrid}>
                {taskMix.map((item) => (
                  <div key={item.category} className={styles.categoryItem}>
                    <span>{item.category}</span>
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
                {dashboardWidgets.map((widget) => {
                  const [label, value, detail] = widgetCopy[widget] || [widget, '-', 'Role-specific signal'];
                  return (
                    <div key={widget} className={styles.widgetItem}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <small>{detail}</small>
                    </div>
                  );
                })}
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
                {(roleContext?.learningRecommendations || []).map((item) => (
                  <span key={item}>{item}</span>
                ))}
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
                {activity.length === 0 ? (
                  <small className={styles.muted}>Role changes, assignments, and evaluations will appear here.</small>
                ) : activity.map((event) => (
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

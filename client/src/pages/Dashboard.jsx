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
  FiZap,
  FiAlertTriangle,
  FiCode,
  FiTerminal,
  FiSettings
} from 'react-icons/fi';
import styles from './Dashboard.module.css';

const getTaskIcon = (category, title) => {
  const text = `${category || ''} ${title || ''}`.toLowerCase();
  
  if (text.includes('bug') || text.includes('fix') || text.includes('error') || text.includes('fail') || text.includes('issue')) {
    return { 
      icon: <FiAlertTriangle />, 
      wrapperClass: styles.iconBugWrapper 
    };
  }
  if (text.includes('api') || text.includes('backend') || text.includes('query') || text.includes('auth') || text.includes('data') || text.includes('server') || text.includes('db')) {
    return { 
      icon: <FiTerminal />, 
      wrapperClass: styles.iconApiWrapper 
    };
  }
  if (text.includes('react') || text.includes('ui') || text.includes('form') || text.includes('state') || text.includes('performance') || text.includes('view') || text.includes('css')) {
    return { 
      icon: <FiCode />, 
      wrapperClass: styles.iconUiWrapper 
    };
  }
  if (text.includes('design') || text.includes('accessibility') || text.includes('ux') || text.includes('layout') || text.includes('hierarchy') || text.includes('polish')) {
    return { 
      icon: <FiLayers />, 
      wrapperClass: styles.iconDesignWrapper 
    };
  }
  return { 
    icon: <FiSettings />, 
    wrapperClass: styles.iconDefaultWrapper 
  };
};

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
    roleContext,
    tasks,
    connected,
    loading,
    assigning,
    activity,
    activeRoleId,
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
                <div className={styles.metricIconCircle}>
                  <FiBriefcase />
                </div>
                <div className={styles.metricText}>
                  <span>Active tasks</span>
                  <strong>{roleTasks.length}</strong>
                  <small className={styles.metricDetail}>In progress</small>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIconCircle}>
                  <FiCheckCircle />
                </div>
                <div className={styles.metricText}>
                  <span>Evaluated</span>
                  <strong>{completedCount}</strong>
                  <small className={styles.metricDetail}>Completed</small>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIconCircle}>
                  <FiClock />
                </div>
                <div className={styles.metricText}>
                  <span>Current deadline</span>
                  <strong>{latestTask?.deadline || '10 minutes'}</strong>
                  <small className={styles.metricDetail}>Due soon</small>
                </div>
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
                  {roleTasks.map((task) => {
                    const { icon, wrapperClass } = getTaskIcon(task.category, task.title);
                    return (
                      <button key={task._id} className={styles.taskItem} onClick={() => navigate(`/task/${task._id}`)}>
                        <div className={styles.taskLeftSection}>
                          <div className={`${styles.taskIconCircle} ${wrapperClass}`}>
                            {icon}
                          </div>
                          <div className={styles.taskDetails}>
                            <div className={styles.taskMeta}>
                              <span>{task.category}</span>
                              <span className={styles.metaDot}>•</span>
                              <span>{task.deadline}</span>
                            </div>
                            <h3>{task.title}</h3>
                            <p>{task.businessContext || task.description}</p>
                          </div>
                        </div>
                        <div className={styles.taskStatus}>
                          <span className={`${styles.statusBadge} ${styles[`status${task.status?.replace(' ', '')}`]}`}>
                            {task.status}
                          </span>
                          <FiArrowRight />
                        </div>
                      </button>
                    );
                  })}
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
        <span className={styles.eyebrow}>Learning</span>
        <h2>Recommendations</h2>
      </div>
      <FiActivity />
    </div>
    <div className={styles.recommendations}>
      {(roleContext?.learningRecommendations || []).map((item, i) => {
        const text = typeof item === 'string' ? item : item?.text || String(item);
        const reason = typeof item === 'object' && item?.reason ? item.reason : null;
        const url = typeof item === 'object' && item?.courseUrl ? item.courseUrl : `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(text)}`;
        return (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className={styles.recLink}>
            <strong>{text}</strong>
            {reason && <p className={styles.recReason}>{reason}</p>}
          </a>
        );
      })}
    </div>
  </div>


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

          </aside>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;

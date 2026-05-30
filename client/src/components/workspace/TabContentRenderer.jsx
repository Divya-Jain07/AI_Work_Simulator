import { Suspense, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { WorkplaceContext } from '../../context/workplaceContextObject';
import { WORKSPACE_ROLE } from '../../config/workspaceConfig';
import { DesignWorkspace } from '../workspaces/DesignWorkspace';
import BackendAPIPlayground from './backend/BackendAPIPlayground';
import SQLWorkspace from './sql/SQLWorkspace';
import styles from './WorkspaceLayout.module.css';

const LoadingPanel = () => (
  <div className={styles.panelChrome}>
    <div className={styles.glassCard}>
      <span>Loading workspace panel...</span>
    </div>
  </div>
);

const formatRole = (role) => (role || 'workspace').replaceAll('_', ' ');

const metricCards = (task, performance) => [
  { label: 'Workflow confidence', value: `${performance?.confidenceScore || task?.lastEvaluationScore || 72}%`, detail: 'Live readiness estimate' },
  { label: 'Task stage', value: task?.status || 'In Progress', detail: task?.category || 'Adaptive workflow' },
  { label: 'AI review depth', value: task?.difficulty || 'Medium', detail: 'Evaluator context level' }
];

const chartData = [
  { label: 'Mon', score: 62, quality: 71 },
  { label: 'Tue', score: 68, quality: 74 },
  { label: 'Wed', score: 73, quality: 77 },
  { label: 'Thu', score: 78, quality: 82 },
  { label: 'Fri', score: 84, quality: 86 }
];

const OverviewPanel = ({ task }) => {
  const { performance } = useContext(WorkplaceContext);
  return (
    <div className={styles.panelChrome}>
      <div className={styles.panelGrid}>
        {metricCards(task, performance).map((metric) => (
          <section key={metric.label} className={styles.glassCard}>
            <h3>{metric.label}</h3>
            <strong className={styles.metricValue}>{metric.value}</strong>
            <span>{metric.detail}</span>
          </section>
        ))}
      </div>
      <div className={styles.largeGrid} style={{ marginTop: '0.85rem' }}>
        <section className={styles.glassCard}>
          <h3>Workspace brief</h3>
          <p>{task?.businessContext || task?.description || 'The adaptive workspace is ready for this assignment.'}</p>
        </section>
        <section className={styles.glassCard}>
          <h3>Workflow signals</h3>
          <div className={styles.flowRows}>
            <div className={styles.flowRow}><i /><span>Role context</span><strong>{formatRole(task?.role)}</strong></div>
            <div className={styles.flowRow}><i /><span>Submission mode</span><strong>Live draft</strong></div>
            <div className={styles.flowRow}><i /><span>Evaluation</span><strong>{task?.status === 'Evaluated' ? 'Complete' : 'Pending'}</strong></div>
          </div>
        </section>
      </div>
    </div>
  );
};

const ChartsPanel = () => (
  <div className={styles.panelChrome}>
    <div className={styles.largeGrid}>
      <section className={styles.glassCard}>
        <h3>Trend detection</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.22)' }} />
            <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="quality" stroke="#22c55e" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>
      <section className={styles.glassCard}>
        <h3>Anomaly distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.22)' }} />
            <Bar dataKey="quality" fill="#8b5cf6" radius={[7, 7, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  </div>
);

const InsightsPanel = () => (
  <div className={styles.panelChrome}>
    <div className={styles.insightList}>
      {[
        ['Priority insight', 'The strongest signal is quality drift after the latest workflow stage. Validate assumptions before submission.'],
        ['Recommendation', 'Frame your answer around business impact, measurable tradeoffs, and the next action.'],
        ['AI confidence', 'Confidence improves when the submission includes evidence, edge cases, and implementation detail.']
      ].map(([title, detail]) => (
        <section key={title} className={styles.insightItem}>
          <h3>{title}</h3>
          <p>{detail}</p>
        </section>
      ))}
    </div>
  </div>
);

const StakeholderPanel = ({ task }) => (
  <div className={styles.panelChrome}>
    <div className={styles.panelGrid}>
      {['Product', 'Engineering', 'Leadership'].map((team) => (
        <section key={team} className={styles.glassCard}>
          <h3>{team}</h3>
          <p>{team} needs the submission to connect {task?.category || 'the task'} to clear delivery risk and user impact.</p>
        </section>
      ))}
    </div>
  </div>
);

const EvaluationPanel = ({ task }) => (
  <div className={styles.panelChrome}>
    <div className={styles.largeGrid}>
      <section className={styles.glassCard}>
        <h3>AI evaluation readiness</h3>
        <strong className={styles.metricValue}>{task?.lastEvaluationScore || (task?.status === 'Evaluated' ? 86 : 64)}%</strong>
        <p>{task?.status === 'Evaluated' ? 'Evaluation is complete. Review feedback in the left evaluator lens.' : 'Submit when your workspace answer covers requirements, acceptance criteria, and business context.'}</p>
      </section>
      <section className={styles.glassCard}>
        <h3>Improvement suggestions</h3>
        <ul>
          <li>Make the recommendation specific and measurable.</li>
          <li>Call out risks, assumptions, and validation steps.</li>
          <li>Connect the work to the current role and stakeholder need.</li>
        </ul>
      </section>
    </div>
  </div>
);

const CodeUtilityPanel = ({ tabId }) => {
  const copy = {
    preview: ['Browser preview', 'Responsive preview and runtime behavior checks appear here.'],
    terminal: ['Terminal', 'Run log, failing checks, and debugging notes are grouped in this workspace tab.'],
    git: ['Git changes', 'Track implementation notes, touched modules, and review-ready diff context.'],
    schema: ['Database schema', 'Inspect collections, indexes, relationships, and data contract assumptions.'],
    response: ['Response inspector', 'Review status codes, payload shape, latency, and error behavior.'],
    logs: ['Server logs', 'Trace request lifecycle, middleware checks, database access, and service errors.']
  }[tabId] || ['Workspace panel', 'Contextual tools are ready for this task.'];

  return (
    <div className={styles.panelChrome}>
      <section className={styles.glassCard}>
        <span className={styles.statusPill}>Live tool</span>
        <h3>{copy[0]}</h3>
        <p>{copy[1]}</p>
      </section>
    </div>
  );
};

const primaryTabs = new Set(['review', 'code', 'api']);

const resolvePanel = ({ tabId, role, Workspace, task, value, onChange, onSubmit, submitting, disabled }) => {
  if (role === WORKSPACE_ROLE.BACKEND_ENGINEER) {
    return (
      <BackendAPIPlayground
        task={task}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        submitting={submitting}
        disabled={disabled}
      />
    );
  }

  if (role === WORKSPACE_ROLE.UI_UX_DESIGNER && tabId === 'review') {
    return (
      <DesignWorkspace
        task={task}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        submitting={submitting}
        disabled={disabled}
      />
    );
  }

  if (primaryTabs.has(tabId)) return <Workspace task={task} value={value} onChange={onChange} disabled={disabled} />;
  if (role === WORKSPACE_ROLE.DATA_ANALYST && tabId === 'sql') {
    return (
      <SQLWorkspace
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        submitting={submitting}
        disabled={disabled}
      />
    );
  }
  if (tabId === 'overview') return <OverviewPanel task={task} />;
  if (tabId === 'charts') return <ChartsPanel />;
  if (tabId === 'insights' || tabId === 'feedback') return <InsightsPanel />;
  if (tabId === 'stakeholders') return <StakeholderPanel task={task} />;
  if (tabId === 'evaluation') return <EvaluationPanel task={task} />;
  if (tabId === 'sql') return <SQLWorkspace value={value} onChange={onChange} onSubmit={onSubmit} submitting={submitting} disabled={disabled} />;
  return <CodeUtilityPanel tabId={tabId} />;
};

const TabContentRenderer = ({ tabs, activeTab, visitedTabs, role, Workspace, task, value, onChange, onSubmit, submitting, disabled }) => (
  <div className={styles.contentShell}>
    <Suspense fallback={<LoadingPanel />}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const shouldMount = isActive || visitedTabs.includes(tab.id);

        return (
          <div
            key={tab.id}
            className={`${styles.panelLayer} ${isActive ? styles.panelActive : styles.panelHidden}`}
            role="tabpanel"
            aria-hidden={!isActive}
          >
            <AnimatePresence mode="wait">
              {shouldMount && (
                <motion.div
                  key={tab.id}
                  style={{ height: '100%', minHeight: 0 }}
                  initial={isActive ? { opacity: 0, y: 8 } : false}
                  animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {resolvePanel({ tabId: tab.id, role, Workspace, task, value, onChange, onSubmit, submitting, disabled })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </Suspense>
  </div>
);

export default TabContentRenderer;

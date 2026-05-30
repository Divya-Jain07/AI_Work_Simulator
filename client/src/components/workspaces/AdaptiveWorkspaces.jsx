import { ApiPlayground, CodeWorkspace, DataDashboard } from './Workspaces';
import { DesignWorkspace } from './DesignWorkspace';
import styles from './AdaptiveWorkspaces.module.css';

const Shell = ({ children, panel }) => (
  <div className={styles.adaptiveShell}>
    <div className={styles.workspaceMain}>{children}</div>
    <aside className={styles.adaptivePanel}>{panel}</aside>
  </div>
);

export const AccessibilityWorkspace = (props) => (
  <Shell
    panel={
      <>
        <div className={styles.panelBlock}>
          <h3>Accessibility analyzer</h3>
          <p>Heatmap, contrast pins, typography checks, spacing drift, and focus-state risk are active.</p>
        </div>
        <div className={styles.panelBlock}>
          <h3>Workflow stage</h3>
          <span className={styles.statusPill}>Audit in progress</span>
        </div>
      </>
    }
  >
    <DesignWorkspace {...props} />
  </Shell>
);

export const WireframeWorkspace = (props) => (
  <Shell
    panel={
      <>
        <div className={styles.panelBlock}>
          <h3>Component toolkit</h3>
          <div className={styles.toolList}>
            <div className={styles.toolItem}><strong>CTA block</strong><small>Primary</small></div>
            <div className={styles.toolItem}><strong>Pricing card</strong><small>Reusable</small></div>
            <div className={styles.toolItem}><strong>Form group</strong><small>Validated</small></div>
          </div>
        </div>
        <div className={styles.panelBlock}>
          <h3>Mobile preview</h3>
          <div className={styles.mobileFrame}><i /><span /><b /></div>
        </div>
      </>
    }
  >
    <DesignWorkspace {...props} />
  </Shell>
);

export const AnalyticsWorkspace = (props) => (
  <Shell
    panel={
      <>
        <div className={styles.panelBlock}>
          <h3>AI copilot mode</h3>
          <p>Monitoring KPI shifts, insight scoring, confidence changes, stakeholder requests, and anomaly risk.</p>
        </div>
        <div className={styles.panelBlock}>
          <h3>Live mutation source</h3>
          <span className={styles.statusPill}>Business events streaming</span>
        </div>
      </>
    }
  >
    <DataDashboard {...props} />
  </Shell>
);

export const SQLWorkspace = (props) => (
  <Shell
    panel={
      <>
        <div className={styles.panelBlock}>
          <h3>Dataset viewer</h3>
          <div className={styles.requestGrid}>
            <strong>Table</strong><span>user_cohorts_v2</span>
            <strong>Rows</strong><span>18,420</span>
            <strong>Freshness</strong><span>Live</span>
          </div>
        </div>
        <div className={styles.panelBlock}>
          <h3>Query output</h3>
          <p>Top churn segment: trial users from paid search. Confidence: 82%.</p>
        </div>
      </>
    }
  >
    <DataDashboard {...props} />
  </Shell>
);

export const FrontendBugWorkspace = (props) => (
  <CodeWorkspace {...props} language="javascript" />
);

export const BackendAPIWorkspace = (props) => (
  <Shell
    panel={
      <>
        <div className={styles.panelBlock}>
          <h3>Database schema</h3>
          <div className={styles.requestGrid}>
            <strong>users</strong><span>email index active</span>
            <strong>tasks</strong><span>assignedTo + role</span>
            <strong>submissions</strong><span>score + feedback</span>
          </div>
        </div>
        <div className={styles.panelBlock}>
          <h3>Response inspector</h3>
          <span className={styles.statusPill}>200 OK</span>
          <p>Latency 82ms. Auth middleware passed.</p>
        </div>
        <div className={styles.panelBlock}>
          <h3>Server logs</h3>
          <div className={styles.terminal}>
            <span>auth: token verified</span><br />
            <span>api: request validated</span><br />
            <span>db: indexed query used</span>
          </div>
        </div>
      </>
    }
  >
    <ApiPlayground {...props} />
  </Shell>
);

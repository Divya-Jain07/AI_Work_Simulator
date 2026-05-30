import { useContext, useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Background, Handle, MarkerType, Position, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { FiActivity, FiAlertTriangle, FiBarChart2, FiCpu, FiDatabase, FiGitPullRequest, FiRefreshCw, FiTrendingDown, FiTrendingUp, FiZap } from 'react-icons/fi';
import { WorkplaceContext } from '../../context/workplaceContextObject';
import styles from './Workspaces.module.css';

export const CodeWorkspace = ({ value, onChange, language = "javascript" }) => {
  return (
    <div className={styles.workspaceContainer}>
      <Editor
        height="100%"
        defaultLanguage={language}
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 18,
          lineHeight: 30,
          wordWrap: 'on',
          padding: { top: 28 },
          scrollBeyondLastLine: false,
          lineNumbersMinChars: 3,
          overviewRulerBorder: false,
          renderLineHighlight: 'line',
          readOnly: false
        }}
      />
    </div>
  );
};

export const ApiPlayground = ({ value, onChange }) => {
  const [method, setMethod] = useState('POST');
  const [url, setUrl] = useState('https://api.workplace.local/v1/auth');
  
  useEffect(() => {
    if (!value) {
      onChange(`// API Playground Simulation\n// Method: ${method}\n// URL: ${url}\n// Request Body:\n{\n  \n}`);
    }
  }, [method, onChange, url, value]);

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.apiHeader}>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className={styles.apiSelect}>
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>PATCH</option>
          <option>DELETE</option>
        </select>
        <input 
          type="text" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          className={styles.apiInput}
          placeholder="Enter API endpoint URL"
        />
        <button className={styles.apiSend}>Send Request</button>
      </div>
      <div className={styles.apiBody}>
        <div className={styles.apiLabel}>Request Body (JSON)</div>
        <Editor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={value}
          onChange={(val) => onChange(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 18 }
          }}
        />
      </div>
    </div>
  );
};

const analystEvents = [
  'CEO requested churn analysis by cohort',
  'Marketing asked for campaign ROI split',
  'Finance flagged expansion revenue variance',
  'Product requested onboarding funnel replay'
];

const chartFeedback = [
  'This visualization hides outlier distribution in enterprise accounts.',
  'Retention dip aligns with onboarding form changes. Segment by acquisition source.',
  'The KPI tile needs confidence context before executive review.',
  'Anomaly is statistically meaningful but needs business impact framing.'
];

const PipelineNode = ({ data }) => (
  <div className={styles.pipelineNode}>
    <Handle type="target" position={Position.Left} />
    <strong>{data.label}</strong>
    <span>{data.detail}</span>
    <Handle type="source" position={Position.Right} />
  </div>
);

const nodeTypes = { pipeline: PipelineNode };

export const DataDashboard = ({ value, onChange }) => {
  const { performance, activity, tasks } = useContext(WorkplaceContext);
  const [tick, setTick] = useState(0);
  const [activeRequest, setActiveRequest] = useState(0);
  const [queryStatus, setQueryStatus] = useState('Synced');

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((current) => current + 1);
      setActiveRequest((current) => (current + 1) % analystEvents.length);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  const metrics = useMemo(() => {
    const confidence = performance?.confidenceScore || 67;
    const completed = performance?.completedTasks || tasks.filter((task) => task.status === 'Evaluated').length;
    const pulse = Math.sin(tick / 2);

    return {
      confidence: Math.min(98, Math.max(42, Math.round(confidence + pulse * 4))),
      dataQuality: Math.min(99, Math.max(50, Math.round((performance?.dataQuality || 81) + pulse * 3))),
      pipeline: Math.min(100, Math.max(35, Math.round((performance?.insightPipeline || 58) + completed * 2 + pulse * 5))),
      requests: performance?.stakeholderRequests || Math.max(2, 7 - completed),
      anomaly: Math.abs(Math.round(9 + pulse * 5))
    };
  }, [performance, tasks, tick]);

  const trendData = useMemo(() => (
    Array.from({ length: 12 }, (_, index) => {
      const wave = Math.sin((tick + index) / 2.6);
      return {
        week: `W${index + 1}`,
        retention: Math.round(64 + index * 1.4 + wave * 5),
        activation: Math.round(48 + index * 2.1 + Math.cos((tick + index) / 3) * 4),
        churn: Math.round(22 - index * 0.6 + Math.sin((tick + index) / 1.8) * 3)
      };
    })
  ), [tick]);

  const segmentData = useMemo(() => [
    { name: 'Enterprise', value: 82 + (tick % 4) },
    { name: 'Mid-market', value: 68 - (tick % 3) },
    { name: 'Startup', value: 57 + (tick % 5) },
    { name: 'Trial', value: 43 - (tick % 4) }
  ], [tick]);

  const pipelineNodes = useMemo(() => [
    { id: 'dataset', type: 'pipeline', position: { x: 0, y: 72 }, data: { label: 'Live datasets', detail: 'user_cohorts_v2 + revenue_events' } },
    { id: 'anomaly', type: 'pipeline', position: { x: 245, y: 18 }, data: { label: 'Anomaly detection', detail: `${metrics.anomaly}% churn spike flagged` } },
    { id: 'confidence', type: 'pipeline', position: { x: 245, y: 132 }, data: { label: 'Confidence engine', detail: `${metrics.confidence}% decision confidence` } },
    { id: 'recommendation', type: 'pipeline', position: { x: 500, y: 72 }, data: { label: 'AI recommendation', detail: 'Prioritize onboarding cohort repair' } }
  ], [metrics.anomaly, metrics.confidence]);

  const pipelineEdges = useMemo(() => [
    { id: 'e1', source: 'dataset', target: 'anomaly', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2', source: 'dataset', target: 'confidence', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e3', source: 'anomaly', target: 'recommendation', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e4', source: 'confidence', target: 'recommendation', markerEnd: { type: MarkerType.ArrowClosed } }
  ], []);

  const runQuery = () => {
    setQueryStatus('Running');
    setTimeout(() => {
      setQueryStatus('Updated');
      onChange?.(value || `SELECT cohort, retention_rate, churn_risk\nFROM user_cohorts_v2\nWHERE week >= current_date - interval '12 weeks'\nORDER BY churn_risk DESC;`);
    }, 700);
  };

  return (
    <div className={styles.analyticsWorkspace}>
      <header className={styles.analyticsHeader}>
        <div>
          <span className={styles.analyticsBadge}>PowerBI-style AI analytics copilot</span>
          <h2>Revenue Retention Command Center</h2>
          <p>Live datasets, SQL workspace, anomaly detection, and stakeholder-ready insight scoring.</p>
        </div>
        <button className={styles.refreshBtn} onClick={runQuery}><FiRefreshCw /> {queryStatus}</button>
      </header>

      <section className={styles.kpiStrip}>
        <motion.div className={styles.kpiCard} animate={{ y: [0, -2, 0] }} transition={{ duration: 2.6, repeat: Infinity }}>
          <FiActivity />
          <span>Confidence score</span>
          <strong>{metrics.confidence}%</strong>
        </motion.div>
        <div className={styles.kpiCard}>
          <FiDatabase />
          <span>Data quality</span>
          <strong>{metrics.dataQuality}%</strong>
        </div>
        <div className={styles.kpiCard}>
          <FiGitPullRequest />
          <span>Insight pipeline</span>
          <strong>{metrics.pipeline}</strong>
        </div>
        <div className={styles.kpiCard}>
          <FiAlertTriangle />
          <span>Open requests</span>
          <strong>{metrics.requests}</strong>
        </div>
      </section>

      <div className={styles.analyticsGrid}>
        <section className={styles.chartPanel}>
          <div className={styles.panelTitle}><FiTrendingUp /> Retention and activation trends</div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={trendData}>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="week" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.24)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="retention" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="activation" stroke="#22c55e" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className={styles.chartPanel}>
          <div className={styles.panelTitle}><FiBarChart2 /> Segment health</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={segmentData}>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.24)', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className={styles.sqlPanel}>
          <div className={styles.panelTitle}><FiDatabase /> SQL workspace</div>
          <Editor
            height="255px"
            defaultLanguage="sql"
            theme="vs-dark"
            value={value || `SELECT cohort,\n       retention_rate,\n       activation_rate,\n       churn_risk\nFROM user_cohorts_v2\nWHERE week >= current_date - interval '12 weeks'\nORDER BY churn_risk DESC;`}
            onChange={(val) => onChange(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineHeight: 20,
              padding: { top: 14 },
              scrollBeyondLastLine: false
            }}
          />
        </section>

        <section className={styles.pipelinePanel}>
          <div className={styles.panelTitle}><FiZap /> AI insight pipeline</div>
          <ReactFlow nodes={pipelineNodes} edges={pipelineEdges} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}>
            <Background color="rgba(148,163,184,0.2)" gap={18} />
          </ReactFlow>
        </section>
      </div>

      <aside className={styles.analyticsSidebar}>
        <div className={styles.sidePanel}>
          <div className={styles.panelTitle}><FiTrendingDown /> AI insight generation</div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="churnGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area dataKey="churn" stroke="#fb7185" fill="url(#churnGradient)" />
            </AreaChart>
          </ResponsiveContainer>
          <p>Retention dropped after onboarding redesign. Enterprise cohorts recover faster than trial cohorts.</p>
        </div>

        <div className={styles.sidePanel}>
          <div className={styles.panelTitle}><FiAlertTriangle /> Stakeholder requests</div>
          {[analystEvents[activeRequest], ...analystEvents.filter((_, index) => index !== activeRequest)].slice(0, 4).map((event, index) => (
            <div key={`${event}-${index}`} className={styles.requestItem}>
              <span>{index === 0 ? 'Live' : 'Queued'}</span>
              <strong>{event}</strong>
            </div>
          ))}
        </div>

        <div className={styles.sidePanel}>
          <div className={styles.panelTitle}><FiCpu /> AI chart feedback</div>
          {chartFeedback.map((feedback, index) => (
            <div key={feedback} className={styles.feedbackItem}>
              <i>{index + 1}</i>
              <span>{feedback}</span>
            </div>
          ))}
        </div>

        <div className={styles.sidePanel}>
          <div className={styles.panelTitle}><FiActivity /> Business intelligence feed</div>
          {(activity.length ? activity : [{ title: 'Workspace simulation started', detail: 'Waiting for live evaluator events.' }]).slice(0, 4).map((event, index) => (
            <div key={`${event.title}-${index}`} className={styles.feedRow}>
              <strong>{event.title}</strong>
              <span>{event.detail}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

// DesignFeedbackBoard has been replaced by the premium DesignWorkspace component imported above.

export const RichTextEditor = ({ value, onChange }) => {
  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.richTextToolbar}>
        <button><strong>B</strong></button>
        <button><em>I</em></button>
        <button><u>U</u></button>
        <div className={styles.separator}></div>
        <button>H1</button>
        <button>H2</button>
        <div className={styles.separator}></div>
        <button>List</button>
        <button>Link</button>
      </div>
      <textarea 
        className={styles.textArea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start writing your report..."
      />
    </div>
  );
};


import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import Editor from '@monaco-editor/react';
import styles from './Workspaces.module.css';
import { DesignWorkspace } from './DesignWorkspace';

export const CodeWorkspace = ({ value, onChange, language = "javascript" }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <div className={styles.workspaceContainer}>
      <Editor
        height="100%"
        defaultLanguage={language}
        theme={theme === 'dark' ? "vs-dark" : "light"}
        value={value}
        onChange={(val) => onChange(val || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 22,
          wordWrap: 'on',
          padding: { top: 18 },
          scrollBeyondLastLine: false
        }}
      />
    </div>
  );
};

export const ApiPlayground = ({ value, onChange }) => {
  const { theme } = useContext(ThemeContext);
  const [method, setMethod] = useState('POST');
  const [url, setUrl] = useState('https://api.workplace.local/v1/auth');
  
  useEffect(() => {
    if (!value) {
      onChange(`// API Playground Simulation\n// Method: ${method}\n// URL: ${url}\n// Request Body:\n{\n  \n}`);
    }
  }, []);

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
          theme={theme === 'dark' ? "vs-dark" : "light"}
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

// ── Dataset schema + sample data ─────────────────────────────────────────
const SCHEMA = [
  { name: 'user_id',       type: 'INTEGER',  nullable: false, unique: true,  example: '10482',              desc: 'Primary key, auto-incremented user identifier.' },
  { name: 'cohort_month',  type: 'VARCHAR',  nullable: false, unique: false, example: '2024-03',            desc: 'YYYY-MM of user signup.' },
  { name: 'plan',          type: 'ENUM',     nullable: false, unique: false, example: 'pro',                desc: 'Subscription tier: free | starter | pro | enterprise.' },
  { name: 'country',       type: 'VARCHAR',  nullable: true,  unique: false, example: 'IN',                 desc: 'ISO 3166-1 alpha-2 country code.' },
  { name: 'sessions_d30',  type: 'INTEGER',  nullable: false, unique: false, example: '14',                 desc: 'Sessions in the last 30 days.' },
  { name: 'revenue_usd',   type: 'DECIMAL',  nullable: true,  unique: false, example: '49.00',              desc: 'Monthly revenue contribution, NULL for free tier.' },
  { name: 'churned',       type: 'BOOLEAN',  nullable: false, unique: false, example: 'false',              desc: 'True if user cancelled in the period.' },
  { name: 'feature_flags', type: 'JSON',     nullable: true,  unique: false, example: '{"dark_mode":true}', desc: 'Active feature flags for the user.' },
  { name: 'created_at',    type: 'TIMESTAMP',nullable: false, unique: false, example: '2024-03-12 08:41:00',desc: 'UTC timestamp of account creation.' },
  { name: 'last_seen_at',  type: 'TIMESTAMP',nullable: true,  unique: false, example: '2025-05-28 14:20:33',desc: 'UTC timestamp of last activity.' },
];

const CHART_DATA = {
  revenue_by_month: {
    label: 'Monthly Revenue (USD)',
    data: [
      { x: 'Jan', y: 18400 }, { x: 'Feb', y: 21300 }, { x: 'Mar', y: 19800 },
      { x: 'Apr', y: 24500 }, { x: 'May', y: 27100 }, { x: 'Jun', y: 25600 },
      { x: 'Jul', y: 29800 }, { x: 'Aug', y: 31200 }, { x: 'Sep', y: 28900 },
    ]
  },
  sessions_by_plan: {
    label: 'Avg Sessions / Plan',
    data: [
      { x: 'Free', y: 3.2 }, { x: 'Starter', y: 9.4 }, { x: 'Pro', y: 18.7 }, { x: 'Enterprise', y: 31.1 }
    ]
  },
  churn_by_cohort: {
    label: 'Churn Rate % by Cohort Month',
    data: [
      { x: 'Sep', y: 8.2 }, { x: 'Oct', y: 7.6 }, { x: 'Nov', y: 9.1 },
      { x: 'Dec', y: 11.3 }, { x: 'Jan', y: 6.8 }, { x: 'Feb', y: 5.4 },
      { x: 'Mar', y: 4.9 }, { x: 'Apr', y: 4.1 }, { x: 'May', y: 3.6 },
    ]
  },
  users_by_country: {
    label: 'User Count by Country',
    data: [
      { x: 'IN', y: 4820 }, { x: 'US', y: 3910 }, { x: 'BR', y: 2100 },
      { x: 'DE', y: 1540 }, { x: 'GB', y: 1320 }, { x: 'FR', y: 980 }
    ]
  },
};

const TYPE_COLORS = {
  INTEGER: '#818cf8', VARCHAR: '#34d399', ENUM: '#f59e0b',
  BOOLEAN: '#f43f5e', DECIMAL: '#06b6d4', JSON: '#a78bfa', TIMESTAMP: '#fb923c',
};

// ── Shared mini SVG chart renderer ──────────────────────────────────────────
const MiniChart = ({ dataset, chartType, color = '#818cf8', data }) => {
  const d = data || CHART_DATA[dataset]?.data || [];
  if (!d.length) return null;

  const W = 520, H = 220, PL = 52, PR = 16, PT = 16, PB = 32;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxY = Math.max(...d.map(p => p.y));
  const minY = chartType === 'scatter' ? Math.min(...d.map(p => p.y)) : 0;
  const scaleY = v => cH - ((v - minY) / (maxY - minY || 1)) * cH;
  const scaleX = (i, n) => (i / (n - 1 || 1)) * cW;
  const barW = Math.max(8, cW / d.length - 6);

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => {
    const yv = minY + f * (maxY - minY);
    const y = PT + scaleY(yv);
    return { y, label: yv >= 1000 ? `${(yv/1000).toFixed(1)}k` : yv.toFixed(1) };
  });

  const renderBars = () => d.map((p, i) => {
    const bh = scaleY(minY) - scaleY(p.y);
    const x = PL + (i / d.length) * cW + (cW / d.length - barW) / 2;
    const y = PT + scaleY(p.y);
    return (
      <g key={i}>
        <rect x={x} y={y} width={barW} height={Math.max(2, bh)} fill={color} fillOpacity={0.85} rx={3} />
        <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={9} fill="#94a3b8">{p.x}</text>
      </g>
    );
  });

  const renderLine = () => {
    const pts = d.map((p, i) => `${PL + scaleX(i, d.length)},${PT + scaleY(p.y)}`).join(' ');
    const area = `M${PL},${PT + cH} L${d.map((p, i) => `${PL + scaleX(i, d.length)},${PT + scaleY(p.y)}`).join(' L')} L${PL + cW},${PT + cH} Z`;
    return (
      <>
        <path d={area} fill={color} fillOpacity={0.12} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {d.map((p, i) => (
          <circle key={i} cx={PL + scaleX(i, d.length)} cy={PT + scaleY(p.y)} r={4} fill={color} stroke="#0f172a" strokeWidth={2}>
            <title>{p.x}: {p.y}</title>
          </circle>
        ))}
        {d.map((p, i) => (
          <text key={i} x={PL + scaleX(i, d.length)} y={H - 8} textAnchor="middle" fontSize={9} fill="#94a3b8">{p.x}</text>
        ))}
      </>
    );
  };

  const renderScatter = () => d.map((p, i) => (
    <g key={i}>
      <circle cx={PL + scaleX(i, d.length)} cy={PT + scaleY(p.y)} r={6} fill={color} fillOpacity={0.8} stroke={color} strokeWidth={1.5}>
        <title>{p.x}: {p.y}</title>
      </circle>
      <text x={PL + scaleX(i, d.length)} y={H - 8} textAnchor="middle" fontSize={9} fill="#94a3b8">{p.x}</text>
    </g>
  ));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {gridLines.map((gl, i) => (
        <g key={i}>
          <line x1={PL} y1={gl.y} x2={PL + cW} y2={gl.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <text x={PL - 6} y={gl.y + 4} textAnchor="end" fontSize={9} fill="#64748b">{gl.label}</text>
        </g>
      ))}
      {chartType === 'bar'     && renderBars()}
      {chartType === 'line'    && renderLine()}
      {chartType === 'scatter' && renderScatter()}
    </svg>
  );
};

// ── Schema Viewer ────────────────────────────────────────────────────────────
const SchemaViewer = ({ schema = SCHEMA, datasetName = 'user_cohorts_v2.csv' }) => {
  const [selected, setSelected] = useState(null);
  return (
    <div className={styles.schemaContainer}>
      <div className={styles.schemaTitle}>
        <span className={styles.schemaTableName}>📋 {datasetName}</span>
        <span className={styles.schemaMeta}>{schema.length} columns · ~48,200 rows · last updated 2025-05-28</span>
      </div>
      <div className={styles.schemaTable}>
        <div className={styles.schemaHead}>
          <div>Column</div><div>Type</div><div>Nullable</div><div>Unique</div><div>Example</div>
        </div>
        {schema.map(col => (
          <div
            key={col.name}
            className={`${styles.schemaRow} ${selected === col.name ? styles.schemaRowSelected : ''}`}
            onClick={() => setSelected(selected === col.name ? null : col.name)}
          >
            <div className={styles.schemaColName}>{col.name}</div>
            <div><span className={styles.schemaType} style={{ background: `${TYPE_COLORS[col.type]}22`, color: TYPE_COLORS[col.type] }}>{col.type}</span></div>
            <div className={col.nullable ? styles.schemaYes : styles.schemaNo}>{col.nullable ? 'YES' : 'NOT NULL'}</div>
            <div className={col.unique ? styles.schemaYes : styles.schemaNeutral}>{col.unique ? '✓ UNIQUE' : '—'}</div>
            <div className={styles.schemaExample}>{col.example}</div>
          </div>
        ))}
      </div>
      {selected && (() => {
        const col = schema.find(c => c.name === selected);
        return (
          <div className={styles.schemaDetail}>
            <strong>{col.name}</strong>
            <span>{col.desc}</span>
            <code>ALTER TABLE {datasetName.replace(/\.csv$/, '')} RENAME COLUMN {col.name} TO new_name;</code>
          </div>
        );
      })()}
    </div>
  );
};

// ── Chart Builder ────────────────────────────────────────────────────────────
const CHART_COLORS = ['#818cf8', '#34d399', '#f59e0b', '#f43f5e', '#06b6d4'];
const ChartBuilder = ({ chartData = CHART_DATA }) => {
  const [dataset, setDataset]   = useState(Object.keys(chartData)[0] || 'revenue_by_month');
  const [chartType, setChartType] = useState('bar');
  const [colorIdx, setColorIdx] = useState(0);

  const ds = chartData[dataset] || Object.values(chartData)[0] || { label: 'No Data', data: [] };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartControls}>
        <div className={styles.chartControlGroup}>
          <label>Dataset</label>
          <select value={dataset} onChange={e => setDataset(e.target.value)} className={styles.chartSelect}>
            {Object.entries(chartData).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.chartControlGroup}>
          <label>Chart Type</label>
          <div className={styles.chartTypeRow}>
            {['bar', 'line', 'scatter'].map(t => (
              <button key={t} className={`${styles.chartTypeBtn} ${chartType === t ? styles.chartTypeBtnActive : ''}`} onClick={() => setChartType(t)}>
                {t === 'bar' ? '▌▌▌' : t === 'line' ? '⟋' : '⠿'} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.chartControlGroup}>
          <label>Color</label>
          <div className={styles.colorSwatches}>
            {CHART_COLORS.map((c, i) => (
              <div key={i} className={`${styles.colorSwatch} ${colorIdx === i ? styles.colorSwatchActive : ''}`}
                style={{ background: c }} onClick={() => setColorIdx(i)} />
            ))}
          </div>
        </div>
      </div>
      <div className={styles.chartArea}>
        <div className={styles.chartTitle}>{ds.label}</div>
        <MiniChart dataset={dataset} chartType={chartType} color={CHART_COLORS[colorIdx]} data={ds.data} />
      </div>
      <div className={styles.chartStats}>
        {(() => {
          const vals = ds.data.map(d => d.y);
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          const max = Math.max(...vals);
          const min = Math.min(...vals);
          return (
            <>
              <div className={styles.chartStat}><span>Min</span><strong>{min.toLocaleString()}</strong></div>
              <div className={styles.chartStat}><span>Max</span><strong>{max.toLocaleString()}</strong></div>
              <div className={styles.chartStat}><span>Avg</span><strong>{avg.toFixed(1)}</strong></div>
              <div className={styles.chartStat}><span>Points</span><strong>{vals.length}</strong></div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

// ── DataDashboard ─────────────────────────────────────────────────────────────
export const DataDashboard = ({ value, onChange, task }) => {
  const { theme } = useContext(ThemeContext);
  const [activeDataTab, setActiveDataTab] = useState('query');

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.dataHeader}>
        <div className={styles.dataTabs}>
          {[['query','Query Editor'],['schema','Schema Viewer'],['chart','Chart Builder']].map(([id, label]) => (
            <button
              key={id}
              className={activeDataTab === id ? styles.activeTab : ''}
              onClick={() => setActiveDataTab(id)}
            >{label}</button>
          ))}
        </div>
        <div className={styles.datasetInfo}>Dataset: {task?.datasetName || 'user_cohorts_v2.csv'}</div>
      </div>
      <div className={styles.dataWorkspace}>
        {activeDataTab === 'query' && (
          <Editor
            height="100%"
            defaultLanguage="sql"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={value}
            onChange={(val) => onChange(val || '')}
            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 18 } }}
          />
        )}
        {activeDataTab === 'schema' && <SchemaViewer schema={task?.datasetSchema} datasetName={task?.datasetName} />}
        {activeDataTab === 'chart'  && <ChartBuilder chartData={task?.chartData} />}
      </div>
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

export const getWorkspaceComponent = (role) => {
  switch(role) {
    case 'frontend_developer':
      return CodeWorkspace;
    case 'backend_developer':
      return ApiPlayground;
    case 'data_analyst':
      return DataDashboard;
    case 'uiux_designer':
      return DesignWorkspace;
    default:
      return RichTextEditor;
  }
};

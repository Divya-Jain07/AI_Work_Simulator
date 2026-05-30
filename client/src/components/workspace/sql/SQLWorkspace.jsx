import { useCallback, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiAlertTriangle,
  FiBarChart2,
  FiChevronDown,
  FiClock,
  FiDatabase,
  FiPlay,
  FiRefreshCw,
  FiZap
} from 'react-icons/fi';

const API_URL = 'http://localhost:5000';

const defaultQuery = `SELECT cohort, retention, risk
FROM cohorts
WHERE risk = 'high';`;

const datasets = {
  cohorts: [
    { cohort: 'enterprise', segment: 'Enterprise', risk: 'low', users: 1240, retention: 82, activation_rate: 74, revenue: 184000 },
    { cohort: 'mid_market', segment: 'Mid-market', risk: 'medium', users: 2180, retention: 69, activation_rate: 61, revenue: 126500 },
    { cohort: 'startup', segment: 'Startup', risk: 'high', users: 3420, retention: 58, activation_rate: 48, revenue: 74200 },
    { cohort: 'trial', segment: 'Trial', risk: 'critical', users: 4860, retention: 43, activation_rate: 35, revenue: 22100 },
    { cohort: 'partner', segment: 'Partner', risk: 'low', users: 760, retention: 88, activation_rate: 79, revenue: 96500 }
  ],
  retention_metrics: [
    { cohort: 'enterprise', week: 1, retention: 94, active_users: 1166, churned_users: 74 },
    { cohort: 'enterprise', week: 4, retention: 82, active_users: 1017, churned_users: 223 },
    { cohort: 'mid_market', week: 1, retention: 86, active_users: 1875, churned_users: 305 },
    { cohort: 'mid_market', week: 4, retention: 69, active_users: 1504, churned_users: 676 },
    { cohort: 'startup', week: 1, retention: 74, active_users: 2531, churned_users: 889 },
    { cohort: 'startup', week: 4, retention: 58, active_users: 1984, churned_users: 1436 },
    { cohort: 'trial', week: 1, retention: 62, active_users: 3013, churned_users: 1847 },
    { cohort: 'trial', week: 4, retention: 43, active_users: 2090, churned_users: 2770 }
  ],
  campaign_data: [
    { campaign: 'Lifecycle Nudge', channel: 'email', spend: 12000, impressions: 82000, clicks: 6200, conversions: 920, revenue: 43800 },
    { campaign: 'Activation Webinar', channel: 'webinar', spend: 18000, impressions: 21000, clicks: 4100, conversions: 760, revenue: 68400 },
    { campaign: 'Search Capture', channel: 'paid_search', spend: 26000, impressions: 142000, clicks: 9300, conversions: 840, revenue: 51200 },
    { campaign: 'Partner Launch', channel: 'partner', spend: 9000, impressions: 38000, clicks: 5200, conversions: 1100, revenue: 79200 }
  ],
  users: [
    { user_id: 1001, name: 'Avery Stone', cohort: 'enterprise', plan: 'enterprise', country: 'US', is_active: true },
    { user_id: 1002, name: 'Mina Patel', cohort: 'mid_market', plan: 'growth', country: 'IN', is_active: true },
    { user_id: 1003, name: 'Leo Chen', cohort: 'startup', plan: 'starter', country: 'SG', is_active: false },
    { user_id: 1004, name: 'Noah Kim', cohort: 'trial', plan: 'trial', country: 'KR', is_active: false },
    { user_id: 1005, name: 'Sofia Ramos', cohort: 'partner', plan: 'enterprise', country: 'BR', is_active: true }
  ]
};

const schemaTables = Object.entries(datasets).map(([table, rows]) => [table, Object.keys(rows[0] || {}).join(', ')]);

const formatSql = (sql = '') => sql
  .replace(/\s+(FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN)\s+/gi, '\n$1 ')
  .replace(/\s+(AND|OR)\s+/gi, '\n  $1 ')
  .replace(/,\s*/g, ',\n       ')
  .trim();

const StudioButton = ({ children, className = '', ...props }) => (
  <button
    className={`inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-white/10 bg-white/[0.06] px-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/35 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-55 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Panel = ({ title, meta, icon: Icon, children, className = '' }) => (
  <section className={`grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-lg border border-white/10 bg-[#0b1220]/95 shadow-2xl shadow-black/25 ${className}`}>
    <header className="flex min-h-11 items-center justify-between gap-3 border-b border-white/10 bg-slate-950/78 px-3">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon className="shrink-0 text-cyan-300" />}
        <h3 className="truncate text-sm font-black text-slate-100">{title}</h3>
      </div>
      {meta && <span className="shrink-0 text-xs font-semibold text-slate-500">{meta}</span>}
    </header>
    <div className="min-h-0 overflow-hidden">{children}</div>
  </section>
);

const DataTable = ({ rows, emptyLabel = 'No rows to display.' }) => {
  const columns = useMemo(() => Object.keys(rows?.[0] || {}), [rows]);

  if (!columns.length) {
    return (
      <div className="grid h-full min-h-48 place-items-center p-6 text-center">
        <p className="text-sm font-semibold text-slate-400">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="min-w-[48rem] w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="sticky top-0 z-10 bg-slate-950">
          <tr>
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap border-b border-white/10 px-5 py-3 text-xs font-black uppercase tracking-wide text-cyan-100">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${JSON.stringify(row)}`} className="transition hover:bg-cyan-300/[0.06]">
              {columns.map((column) => (
                <td key={`${rowIndex}-${column}`} className="whitespace-nowrap border-b border-white/[0.06] px-5 py-3 text-slate-200">
                  {row[column] === null || row[column] === undefined ? <span className="text-slate-600">NULL</span> : String(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DatasetPreview = ({ activeDataset, setActiveDataset }) => {
  const rows = datasets[activeDataset] || [];

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]">
      <div className="flex min-w-0 gap-1 overflow-x-auto border-b border-white/10 bg-slate-950/40 p-2">
        {Object.keys(datasets).map((table) => (
          <button
            key={table}
            type="button"
            onClick={() => setActiveDataset(table)}
            className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-black transition ${
              activeDataset === table
                ? 'bg-cyan-300/16 text-cyan-100'
                : 'text-slate-500 hover:bg-white/[0.06] hover:text-slate-200'
            }`}
          >
            {table}
          </button>
        ))}
      </div>
      <DataTable rows={rows} />
    </div>
  );
};

const InsightCard = ({ result, error, isRunning }) => {
  const message = useMemo(() => {
    if (isRunning) return 'Executing the statement and waiting for result metadata.';
    if (error) return 'The query failed. Review the Monaco marker and error output before rerunning.';
    if (!result) return 'Run a SQL statement to generate an analysis note from the live result.';
    if (!result.rows?.length) return 'The query executed successfully but returned no rows.';
    return `Returned ${result.rows.length} rows across ${result.columns.length} fields. Validate filters and compare cohorts before submitting.`;
  }, [error, isRunning, result]);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 p-3">
      <div className="rounded-lg border border-cyan-300/18 bg-cyan-300/[0.07] p-3">
        <p className="text-sm leading-6 text-slate-300">{message}</p>
      </div>
      <div className="grid min-h-0 gap-2 overflow-auto sm:grid-cols-3 lg:grid-cols-1">
        {[
          ['Rows', result?.rows?.length ?? 0],
          ['Columns', result?.columns?.length ?? 0],
          ['Timing', result?.executionTime || '0ms']
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-white/10 bg-slate-950/55 p-3">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
            <strong className="mt-1 block text-xl text-white">{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

const Drawer = ({ id, title, openDrawer, setOpenDrawer, children }) => {
  const isOpen = openDrawer === id;

  return (
    <div className="border-t border-white/10">
      <button
        type="button"
        onClick={() => setOpenDrawer(isOpen ? null : id)}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-bold text-slate-300 transition hover:bg-white/[0.04]"
      >
        {title}
        <FiChevronDown className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResizeHandle = ({ direction, onPointerDown }) => (
  <button
    type="button"
    aria-label={direction === 'vertical' ? 'Resize columns' : 'Resize rows'}
    onPointerDown={onPointerDown}
    className={`hidden rounded-full bg-transparent transition hover:bg-cyan-300/10 lg:block ${
      direction === 'vertical' ? 'cursor-col-resize' : 'cursor-row-resize'
    }`}
  >
    <span className={`mx-auto block rounded-full bg-white/10 ${direction === 'vertical' ? 'h-full w-px' : 'h-px w-full'}`} />
  </button>
);

export const SQLWorkspace = ({ value, onChange, onSubmit, submitting, disabled }) => {
  const [query, setQuery] = useState(value || defaultQuery);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Ready');
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [activeDataset, setActiveDataset] = useState('cohorts');
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const setEditorMarkers = useCallback((message = '') => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel?.();

    if (!monaco || !model) return;

    monaco.editor.setModelMarkers(model, 'sql-workspace', message ? [{
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: Math.max(1, model.getLineCount()),
      endColumn: model.getLineMaxColumn(Math.max(1, model.getLineCount())),
      message,
      severity: monaco.MarkerSeverity.Error
    }] : []);
  }, []);

  const updateQuery = (nextQuery) => {
    setQuery(nextQuery);
    onChange?.(nextQuery);
    if (error) {
      setError('');
      setEditorMarkers('');
    }
  };

  const runQuery = async () => {
    const sql = query.trim();
    if (!sql) {
      setError('Enter a SQL query before running it.');
      setEditorMarkers('Enter a SQL query before running it.');
      return;
    }

    setIsRunning(true);
    setStatus('Executing query...');
    setError('');
    setEditorMarkers('');

    try {
      const response = await fetch(`${API_URL}/api/sql/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'SQL execution failed.');
      }

      setResult(data);
      setStatus(`Completed in ${data.executionTime}`);
      setHistory((current) => [
        { id: `${Date.now()}`, query: sql, rowCount: data.rowCount ?? data.rows.length, executionTime: data.executionTime, success: true },
        ...current
      ].slice(0, 8));
    } catch (runError) {
      const message = runError.message || 'SQL execution failed.';
      setResult({ columns: [], rows: [], executionTime: '0ms' });
      setError(message);
      setStatus('Failed');
      setEditorMarkers(message);
      setHistory((current) => [
        { id: `${Date.now()}`, query: sql, rowCount: 0, executionTime: '0ms', success: false },
        ...current
      ].slice(0, 8));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-[#07101f] text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0b1220] px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-black text-white">SQL Analytics Studio</h2>
          <p className={`truncate text-xs font-semibold ${error ? 'text-rose-300' : result ? 'text-emerald-300' : 'text-slate-500'}`}>{status}</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <StudioButton onClick={runQuery} disabled={isRunning} className="border-emerald-300/35 bg-emerald-400/12 text-emerald-50">
            {isRunning ? <FiRefreshCw className="animate-spin" /> : <FiPlay />} Run Query
          </StudioButton>
          <StudioButton onClick={() => updateQuery(formatSql(query || defaultQuery))}><FiZap /> Format</StudioButton>
        </div>
      </header>

      <main
        className="grid min-h-0 gap-3 overflow-auto p-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(28rem,0.85fr)] xl:grid-rows-[minmax(23rem,1fr)_minmax(16rem,0.75fr)] xl:overflow-hidden"
      >
        <Panel title="SQL Editor" icon={FiDatabase} className="min-h-[24rem] xl:min-h-0">
          <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto]">
            <div className="min-h-0 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={query}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monacoRef.current = monaco;
                }}
                onChange={(nextValue) => updateQuery(nextValue || '')}
                options={{
                  fontSize: 14,
                  lineHeight: 23,
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  padding: { top: 18, bottom: 18 },
                  smoothScrolling: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2
                }}
              />
            </div>
            <div className="border-t border-white/10 bg-black/25 px-4 py-2 font-mono text-xs leading-5 text-slate-400">
              {isRunning ? 'executing query...' : error ? `error: ${error}` : result ? `ok: ${result.rows.length} rows in ${result.executionTime}` : 'connected: cohorts, retention_metrics, campaign_data, users'}
            </div>
          </div>
        </Panel>

        <Panel title="Dataset Preview" meta={activeDataset} icon={FiDatabase} className="min-h-[22rem] xl:min-h-0">
          <DatasetPreview activeDataset={activeDataset} setActiveDataset={setActiveDataset} />
        </Panel>

        <Panel
          title={error ? 'Query Error' : 'Query Results'}
          meta={result ? `${result.rows.length} rows / ${result.columns.length} columns` : 'waiting'}
          icon={error ? FiAlertTriangle : FiBarChart2}
          className="min-h-[18rem] xl:min-h-0"
        >
          {error ? (
            <div className="m-4 rounded-lg border border-rose-400/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
              {error}
            </div>
          ) : (
            <DataTable rows={result?.rows || []} emptyLabel="Run a query to render live output rows." />
          )}
        </Panel>

        <Panel title="AI Insights" meta={result?.executionTime || 'idle'} icon={FiZap} className="min-h-[18rem] xl:min-h-0">
          <InsightCard result={result} error={error} isRunning={isRunning} />
        </Panel>
      </main>

      <footer className="border-t border-white/10 bg-[#0b1220]">
        <Drawer id="schema" title="Dataset schema drawer" openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {schemaTables.map(([table, columns]) => (
              <button
                key={table}
                type="button"
                onClick={() => {
                  setActiveDataset(table);
                  setOpenDrawer(null);
                }}
                className="rounded-md border border-white/10 bg-slate-950/60 p-3 text-left transition hover:border-cyan-300/35"
              >
                <strong className="block text-sm text-white">{table}</strong>
                <span className="text-xs leading-5 text-slate-400">{columns}</span>
              </button>
            ))}
          </div>
        </Drawer>
        <Drawer id="history" title="Query history drawer" openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
          <div className="grid max-h-48 gap-2 overflow-auto sm:grid-cols-2 lg:grid-cols-3">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No executed queries yet.</p>
            ) : history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateQuery(item.query)}
                className="rounded-md border border-white/10 bg-slate-950/60 p-3 text-left transition hover:border-cyan-300/40"
              >
                <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                  <span className={item.success ? 'text-emerald-300' : 'text-rose-300'}>{item.success ? 'success' : 'failed'}</span>
                  <span className="inline-flex items-center gap-1 text-slate-500"><FiClock /> {item.executionTime}</span>
                </div>
                <p className="line-clamp-2 font-mono text-xs leading-5 text-slate-300">{item.query}</p>
              </button>
            ))}
          </div>
        </Drawer>
      </footer>
    </div>
  );
};

export default SQLWorkspace;

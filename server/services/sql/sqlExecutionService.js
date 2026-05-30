import alasql from 'alasql';
import { performance } from 'node:perf_hooks';

const datasets = {
  cohorts: [
    { cohort_id: 1, cohort: 'enterprise', segment: 'Enterprise', risk: 'low', users: 1240, retention: 82, activation_rate: 74, revenue: 184000, start_month: '2026-01' },
    { cohort_id: 2, cohort: 'mid_market', segment: 'Mid-market', risk: 'medium', users: 2180, retention: 69, activation_rate: 61, revenue: 126500, start_month: '2026-02' },
    { cohort_id: 3, cohort: 'startup', segment: 'Startup', risk: 'high', users: 3420, retention: 58, activation_rate: 48, revenue: 74200, start_month: '2026-03' },
    { cohort_id: 4, cohort: 'trial', segment: 'Trial', risk: 'critical', users: 4860, retention: 43, activation_rate: 35, revenue: 22100, start_month: '2026-04' },
    { cohort_id: 5, cohort: 'partner', segment: 'Partner', risk: 'low', users: 760, retention: 88, activation_rate: 79, revenue: 96500, start_month: '2026-05' }
  ],
  retention_metrics: [
    { metric_id: 1, cohort: 'enterprise', week: 1, retention: 94, active_users: 1166, churned_users: 74 },
    { metric_id: 2, cohort: 'enterprise', week: 4, retention: 82, active_users: 1017, churned_users: 223 },
    { metric_id: 3, cohort: 'mid_market', week: 1, retention: 86, active_users: 1875, churned_users: 305 },
    { metric_id: 4, cohort: 'mid_market', week: 4, retention: 69, active_users: 1504, churned_users: 676 },
    { metric_id: 5, cohort: 'startup', week: 1, retention: 74, active_users: 2531, churned_users: 889 },
    { metric_id: 6, cohort: 'startup', week: 4, retention: 58, active_users: 1984, churned_users: 1436 },
    { metric_id: 7, cohort: 'trial', week: 1, retention: 62, active_users: 3013, churned_users: 1847 },
    { metric_id: 8, cohort: 'trial', week: 4, retention: 43, active_users: 2090, churned_users: 2770 }
  ],
  campaign_data: [
    { campaign_id: 1, campaign: 'Lifecycle Nudge', channel: 'email', spend: 12000, impressions: 82000, clicks: 6200, conversions: 920, revenue: 43800 },
    { campaign_id: 2, campaign: 'Activation Webinar', channel: 'webinar', spend: 18000, impressions: 21000, clicks: 4100, conversions: 760, revenue: 68400 },
    { campaign_id: 3, campaign: 'Search Capture', channel: 'paid_search', spend: 26000, impressions: 142000, clicks: 9300, conversions: 840, revenue: 51200 },
    { campaign_id: 4, campaign: 'Partner Launch', channel: 'partner', spend: 9000, impressions: 38000, clicks: 5200, conversions: 1100, revenue: 79200 }
  ],
  users: [
    { user_id: 1001, name: 'Avery Stone', cohort: 'enterprise', plan: 'enterprise', country: 'US', signup_date: '2026-01-08', last_active_date: '2026-05-25', is_active: true },
    { user_id: 1002, name: 'Mina Patel', cohort: 'mid_market', plan: 'growth', country: 'IN', signup_date: '2026-02-14', last_active_date: '2026-05-22', is_active: true },
    { user_id: 1003, name: 'Leo Chen', cohort: 'startup', plan: 'starter', country: 'SG', signup_date: '2026-03-02', last_active_date: '2026-04-18', is_active: false },
    { user_id: 1004, name: 'Noah Kim', cohort: 'trial', plan: 'trial', country: 'KR', signup_date: '2026-04-11', last_active_date: '2026-04-29', is_active: false },
    { user_id: 1005, name: 'Sofia Ramos', cohort: 'partner', plan: 'enterprise', country: 'BR', signup_date: '2026-05-03', last_active_date: '2026-05-28', is_active: true },
    { user_id: 1006, name: 'Grace Miller', cohort: 'startup', plan: 'starter', country: 'US', signup_date: '2026-03-19', last_active_date: '2026-05-17', is_active: true },
    { user_id: 1007, name: 'Omar Haddad', cohort: 'trial', plan: 'trial', country: 'AE', signup_date: '2026-04-23', last_active_date: '2026-05-05', is_active: false }
  ]
};

const createDatabase = () => {
  const db = new alasql.Database();

  Object.entries(datasets).forEach(([tableName, rows]) => {
    db.exec(`CREATE TABLE ${tableName}`);
    db.tables[tableName].data = rows.map((row) => ({ ...row }));
  });

  return db;
};

const normalizeQuery = (query = '') => query.trim().replace(/;+\s*$/, '');

const validateReadOnlyQuery = (query) => {
  if (!query) {
    return 'Enter a SQL query before running it.';
  }

  if (query.split(';').filter((statement) => statement.trim()).length > 1) {
    return 'Run one SQL statement at a time.';
  }

  if (!/^(select|with)\b/i.test(query)) {
    return 'Only read-only SELECT queries are supported in this workspace.';
  }

  if (/\b(insert|update|delete|drop|alter|create|truncate|replace|attach|detach)\b/i.test(query)) {
    return 'Mutation and schema-changing statements are disabled for this in-memory review database.';
  }

  return null;
};

const toRowsAndColumns = (result) => {
  const rows = Array.isArray(result) ? result : [];
  const columns = Array.from(rows.reduce((keys, row) => {
    Object.keys(row || {}).forEach((key) => keys.add(key));
    return keys;
  }, new Set()));

  return { columns, rows };
};

export const executeSqlQuery = (rawQuery) => {
  const query = normalizeQuery(rawQuery);
  const validationError = validateReadOnlyQuery(query);

  if (validationError) {
    return {
      success: false,
      columns: [],
      rows: [],
      error: validationError,
      executionTime: '0ms'
    };
  }

  const db = createDatabase();
  const startedAt = performance.now();

  try {
    const result = db.exec(query);
    const executionTime = `${Math.max(1, Math.round(performance.now() - startedAt))}ms`;
    const { columns, rows } = toRowsAndColumns(result);

    return {
      success: true,
      columns,
      rows,
      rowCount: rows.length,
      executionTime
    };
  } catch (error) {
    const executionTime = `${Math.max(1, Math.round(performance.now() - startedAt))}ms`;

    return {
      success: false,
      columns: [],
      rows: [],
      error: error.message || 'SQL execution failed.',
      executionTime
    };
  }
};

export const getSqlSchema = () => Object.entries(datasets).map(([table, rows]) => ({
  table,
  columns: Object.keys(rows[0] || {}),
  rowCount: rows.length
}));

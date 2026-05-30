import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { FiClock, FiPlay } from 'react-icons/fi';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const defaultBody = `{
  "email": "user@workplace.local",
  "password": "secure-password",
  "rememberDevice": true
}`;

const initialResponse = {
  ready: true,
  message: 'Send a request to evaluate this backend solution.'
};

const resolveInitialBody = (value) => {
  if (!value?.trim()) return defaultBody;
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return defaultBody;
  }
};

const formatJson = (value) => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

const getTaskText = (task) => [
  task?.title,
  task?.category,
  task?.description,
  task?.businessContext,
  ...(task?.requirements || []),
  ...(task?.acceptanceCriteria || []),
  ...(task?.evaluationCriteria || [])
].filter(Boolean).join(' ').toLowerCase();

const includesAny = (text, patterns) => patterns.some((pattern) => pattern.test(text));

const parseRequestBody = (body) => {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
};

const statusTextByCode = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error'
};

const makeResult = (status, data, startedAt, latencySeed = 0) => ({
  status,
  statusText: statusTextByCode[status] || 'Response',
  time: `${Math.max(36, Date.now() - startedAt + latencySeed)}ms`,
  data
});

const evaluateMissingResourceTask = ({ code, requestBody, startedAt }) => {
  const handles404 = includesAny(code, [
    /status\s*\(\s*404\s*\)/,
    /\.status\s*\(\s*404\s*\)/,
    /404/,
    /not\s+found/,
    /findbyid/,
    /findone/
  ]);
  const requestedId = requestBody?.userId || requestBody?.id || 'missing-user-42';

  if (handles404) {
    return makeResult(404, {
      status: 404,
      error: 'User not found',
      resourceId: requestedId,
      matchedRequirement: 'missing resource endpoint'
    }, startedAt, 18);
  }

  return makeResult(500, {
    status: 500,
    error: 'Missing resource path still falls through',
    expected: 'Return status(404) with a not found error when the user does not exist.',
    resourceId: requestedId
  }, startedAt, 24);
};

const evaluateXssTask = ({ code, requestBody, startedAt }) => {
  const sanitizesScripts = includesAny(code, [
    /sanitize/,
    /escape/,
    /dompurify/i,
    /xss/i,
    /replace\s*\(/,
    /strip/i
  ]);
  const payload = requestBody?.comment || requestBody?.html || requestBody?.message || '<script>alert("xss")</script>';

  if (sanitizesScripts) {
    return makeResult(200, {
      success: true,
      sanitized: true,
      originalContainsScript: /<script/i.test(String(payload)),
      output: String(payload).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    }, startedAt, 16);
  }

  return makeResult(422, {
    success: false,
    sanitized: false,
    error: 'Potential script tag reached the response unsanitized',
    expected: 'Strip, escape, or sanitize script content before persisting or returning HTML.'
  }, startedAt, 22);
};

const evaluateAuthTask = ({ code, requestBody, startedAt }) => {
  const validatesJwt = includesAny(code, [
    /jwt\.verify/i,
    /verifytoken/i,
    /verify\s*\([^)]*token/i,
    /authorization/i,
    /bearer/i,
    /authenticate/i,
    /requireauth/i,
    /401/,
    /unauthorized/i
  ]);
  const hasToken = Boolean(requestBody?.token || requestBody?.authorization);

  if (validatesJwt) {
    return makeResult(hasToken ? 200 : 401, hasToken ? {
      success: true,
      authenticated: true,
      message: 'JWT accepted'
    } : {
      status: 401,
      message: 'Unauthorized',
      reason: 'Missing or invalid JWT'
    }, startedAt, 14);
  }

  return makeResult(403, {
    status: 403,
    message: 'Authentication check was not enforced',
    expected: 'Validate Authorization Bearer JWT before allowing the request.'
  }, startedAt, 20);
};

const evaluateValidationTask = ({ code, requestBody, startedAt }) => {
  const validatesInput = includesAny(code, [
    /validate/i,
    /required/i,
    /schema/i,
    /joi/i,
    /zod/i,
    /400/,
    /422/
  ]);
  const missingFields = ['email', 'password'].filter((field) => !requestBody?.[field]);

  if (validatesInput && missingFields.length) {
    return makeResult(400, {
      status: 400,
      error: 'Validation failed',
      missingFields
    }, startedAt, 12);
  }

  if (validatesInput) {
    return makeResult(200, {
      success: true,
      validated: true,
      acceptedFields: Object.keys(requestBody || {})
    }, startedAt, 12);
  }

  return makeResult(422, {
    status: 422,
    error: 'Request validation was not detected',
    expected: 'Validate required fields and reject malformed input.'
  }, startedAt, 18);
};

const evaluateGenericBackendTask = ({ task, code, requestBody, method, url, startedAt }) => {
  const taskText = getTaskText(task);
  const signals = [
    ['status handling', /status\s*\(|res\.status|return\s+.*status/i.test(code)],
    ['error branch', /catch|throw|error|try\s*\{/i.test(code)],
    ['async data access', /async|await|find|fetch|axios|query|save/i.test(code)],
    ['request validation', /validate|required|schema|body|params/i.test(code)]
  ];
  const passed = signals.filter(([, ok]) => ok).map(([label]) => label);
  const missing = signals.filter(([, ok]) => !ok).map(([label]) => label);
  const status = missing.length <= 1 ? 200 : 422;

  return makeResult(status, {
    success: status === 200,
    task: task?.title || 'Backend API task',
    method,
    endpoint: url,
    evaluatedAgainst: taskText.slice(0, 140) || 'backend requirements',
    requestEcho: requestBody,
    passed,
    missing,
    message: status === 200
      ? 'Request behavior matches the submitted solution signals.'
      : 'The submitted solution is missing backend behavior required by this task.'
  }, startedAt, 10 + missing.length * 8);
};

const simulateApiCall = ({ task, code, body, method, url }) => new Promise((resolve) => {
  const startedAt = Date.now();
  const taskText = getTaskText(task);
  const normalizedCode = `${code || ''}\n${body || ''}`.toLowerCase();
  const requestBody = parseRequestBody(body) || {};

  window.setTimeout(() => {
    if (includesAny(taskText, [/missing\s+resource/, /not\s+found/, /\b404\b/, /resource\s+endpoint/])) {
      resolve(evaluateMissingResourceTask({ code: normalizedCode, requestBody, startedAt }));
      return;
    }

    if (includesAny(taskText, [/xss/, /script\s+tag/, /sanitize/, /sanitization/, /html\s+injection/])) {
      resolve(evaluateXssTask({ code: normalizedCode, requestBody, startedAt }));
      return;
    }

    if (includesAny(taskText, [/auth/, /jwt/, /token/, /unauthorized/, /\b401\b/])) {
      resolve(evaluateAuthTask({ code: normalizedCode, requestBody, startedAt }));
      return;
    }

    if (includesAny(taskText, [/validation/, /validate/, /required\s+field/, /bad\s+request/, /\b400\b/, /\b422\b/])) {
      resolve(evaluateValidationTask({ code: normalizedCode, requestBody, startedAt }));
      return;
    }

    resolve(evaluateGenericBackendTask({ task, code: normalizedCode, requestBody, method, url, startedAt }));
  }, 520);
});

const methodTone = {
  GET: 'text-emerald-200',
  POST: 'text-cyan-200',
  PUT: 'text-amber-200',
  PATCH: 'text-violet-200',
  DELETE: 'text-red-200'
};

export const BackendAPIPlayground = ({ task, value, onChange }) => {
  const [method, setMethod] = useState('POST');
  const [url, setUrl] = useState('https://api.workplace.local/v1/auth');
  const [body, setBody] = useState(() => resolveInitialBody(value));
  const [response, setResponse] = useState({
    status: 200,
    statusText: 'OK',
    time: '82ms',
    data: initialResponse
  });
  const [isSending, setIsSending] = useState(false);

  const responseJson = useMemo(() => JSON.stringify(response.data, null, 2), [response]);

  const updateBody = (nextBody) => {
    setBody(nextBody);
  };

  useEffect(() => {
    onChange?.([
      `${method} ${url}`,
      '',
      'Request Body:',
      formatJson(body),
      '',
      `Response: ${response.status} ${response.statusText}`,
      `Time: ${response.time}`,
      JSON.stringify(response.data, null, 2)
    ].join('\n'));
  }, [method, url, body, response, onChange]);

  const sendRequest = async () => {
    setIsSending(true);
    const result = await simulateApiCall({
      task,
      code: value,
      body,
      method,
      url
    });
    setResponse(result);
    setIsSending(false);
  };

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(320px,1fr)_minmax(220px,0.72fr)] gap-4 overflow-hidden bg-[#071329] p-4 text-slate-200">
      <section className="grid min-w-0 gap-3 rounded-xl border border-[#163053] bg-[#0b1a33] p-3 md:grid-cols-[minmax(7rem,0.18fr)_minmax(0,1fr)_auto]">
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Method</span>
          <select
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            className={`h-11 w-full rounded-lg border border-[#163053] bg-[#071329] px-3 text-sm font-black outline-none transition focus:border-cyan-300/45 ${methodTone[method]}`}
          >
            {methods.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>

        <label className="min-w-0">
          <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">URL</span>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#163053] bg-[#071329] px-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/45"
            placeholder="https://api.workplace.local/v1/auth"
          />
        </label>

        <button
          type="button"
          onClick={sendRequest}
          disabled={isSending}
          className="mt-auto inline-flex h-11 min-w-max items-center justify-center gap-2 rounded-lg border border-emerald-300/35 bg-emerald-400/14 px-5 text-sm font-black text-emerald-50 transition hover:bg-emerald-400/22 disabled:cursor-wait disabled:opacity-60"
        >
          <FiPlay /> {isSending ? 'Sending...' : 'Send Request'}
        </button>
      </section>

      <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-[#163053] bg-[#0b1a33]">
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[#163053] px-4">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-300">Request Body (JSON)</h3>
          <button
            type="button"
            onClick={() => updateBody(formatJson(body))}
            className="rounded-md border border-[#163053] bg-[#071329] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-cyan-300/45"
          >
            Format JSON
          </button>
        </div>
        <Editor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={body}
          onChange={(nextValue) => updateBody(nextValue || '')}
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
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true
          }}
        />
      </section>

      <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-[#163053] bg-[#0b1a33]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#163053] px-4 py-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-300">Response</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/35 bg-emerald-400/14 px-3 py-1.5 text-xs font-black text-emerald-100">
              Status: {response.status} {response.statusText}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#163053] bg-[#071329] px-3 py-1.5 text-xs font-black text-slate-300">
              <FiClock /> Time: {response.time}
            </span>
          </div>
        </div>
        <Editor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={responseJson}
          options={{
            readOnly: true,
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
      </section>
    </div>
  );
};

export default BackendAPIPlayground;

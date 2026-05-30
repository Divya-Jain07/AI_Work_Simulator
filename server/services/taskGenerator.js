import Task from '../models/Task.js';
import { buildTaskGenerationPrompt } from './promptBuilder.js';
import { createChatCompletion, logAIError } from './aiClient.js';

const cleanJson = (text) => {
  const cleaned = String(text || '').replace(/```json\n?|\n?```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
};

// Static Task Pool categorized by role
export const TASK_POOL = {
  frontend_developer: [
    {
      title: 'Fix React double render in task filter select',
      description: 'The task filter dropdown causes double rendering of the task list, resulting in multiple API calls. Identify the state trigger causing this and optimize it using useCallback or useMemo.',
      category: 'React bugs',
      requirements: [
        'Analyze rendering cycles of TaskFilter component',
        'Memoize filter change handler with useCallback',
        'Prevent double API requests'
      ],
      difficulty: 'Medium',
      deadline: '2 hours',
      businessContext: 'Double rendering degrades client-side application performance and increases database query load.',
      acceptanceCriteria: [
        'Task list renders exactly once upon selecting a filter',
        'API is queried only once per dropdown change event'
      ],
      skillTargets: ['react', 'stateManagement']
    },
    {
      title: 'Optimize form validation for register fields',
      description: 'The registration page lacks validation warnings on email formats and password lengths before submitting the form. Implement clean inline client-side validations on input blur events.',
      category: 'Form validation',
      requirements: [
        'Add regex check for standard email formatting',
        'Enforce minimum password length of 8 characters',
        'Show custom UI validation states'
      ],
      difficulty: 'Easy',
      deadline: '1 hour',
      businessContext: 'Preventing malformed entries before submission improves registration conversion and reduces server validation overhead.',
      acceptanceCriteria: [
        'Invalid emails trigger an error helper message on blur',
        'Passwords under 8 characters disable the submit button and show warnings'
      ],
      skillTargets: ['react', 'communication']
    },
    {
      title: 'Fix workspace keyboard navigation access',
      description: 'The primary dashboard dropdown menus are currently not accessible via keyboard tab controls, locking out keyboard-only users.',
      category: 'UI fixes',
      requirements: [
        'Add proper tabIndex properties to dropdown elements',
        'Handle Space and Enter key events to trigger dropdown expansion',
        'Implement focus trap within the opened dropdown'
      ],
      difficulty: 'Medium',
      deadline: '3 hours',
      businessContext: 'Accessibility compliance is critical for enterprise contracts and ensures all users can navigate the platform.',
      acceptanceCriteria: [
        'Dropdown can be focused and toggled via keyboard keys',
        'Focus transitions cleanly between dropdown options'
      ],
      skillTargets: ['accessibility', 'react']
    },
    {
      title: 'Implement component lazy loading for speed',
      description: 'The workspace page has a heavy initial load time because all role workspaces are loaded upfront. Split the components using React.lazy and Suspense.',
      category: 'Performance tuning',
      requirements: [
        'Identify heavy workspace components in routes or loaders',
        'Wrap import calls in React.lazy()',
        'Add a custom skeleton placeholder within Suspense'
      ],
      difficulty: 'Hard',
      deadline: '4 hours',
      businessContext: 'Faster page loads directly correlate to higher user retention and better workspace UX.',
      acceptanceCriteria: [
        'Lazy loaded code split chunks are generated during build',
        'Workspace page displays a smooth fallback skeleton while loading chunks'
      ],
      skillTargets: ['react', 'stateManagement']
    }
  ],
  backend_developer: [
    {
      title: 'Fix GET endpoint status code for missing resource',
      description: 'The GET /api/tasks/:id endpoint currently returns a 500 status code when an ID is not found. Fix it to return a clean 404 Not Found instead.',
      category: 'API debugging',
      requirements: [
        'Trace Express middleware and router parameter checks',
        'Modify status code return from 500 to 404 when task is null',
        'Include a descriptive error message in the response body'
      ],
      difficulty: 'Easy',
      deadline: '30 minutes',
      businessContext: 'Clients should not see 500 errors for non-existent items; 404 is the correct REST protocol.',
      acceptanceCriteria: [
        'Querying a missing ID returns status code 404',
        'Querying a valid ID still returns status code 200 with the task'
      ],
      skillTargets: ['apiDesign', 'reliability']
    },
    {
      title: 'Add secure HttpOnly cookies for credentials',
      description: 'Authentication JWT tokens are currently sent in plaintext JSON responses and saved in localStorage, exposing them to XSS scripts. Re-architect the login response to use secure, HttpOnly, SameSite cookies.',
      category: 'Authentication fixes',
      requirements: [
        'Configure Express res.cookie() properties',
        'Set httpOnly, secure, and sameSite properties to true',
        'Update token parser middleware to read from request cookies'
      ],
      difficulty: 'Medium',
      deadline: '2 hours',
      businessContext: 'Securing credentials in HttpOnly cookies prevents malicious scripts from stealing user session tokens.',
      acceptanceCriteria: [
        'JWT token is sent via Set-Cookie header on successful authentication',
        'Cookie is inaccessible to document.cookie in browser scripts'
      ],
      skillTargets: ['authentication', 'reliability']
    },
    {
      title: 'Index database queries on user emails',
      description: 'The authentication database queries the entire user collection on every login. Speed up email lookup queries by creating a unique index on the email field.',
      category: 'Database optimization',
      requirements: [
        'Locate User Schema definition in backend code',
        'Add unique: true and index: true properties to the email field',
        'Verify MongoDB database indexes list via admin tool'
      ],
      difficulty: 'Easy',
      deadline: '45 minutes',
      businessContext: 'Query latency increases as the user database grows; indexes keep login lookups O(1).',
      acceptanceCriteria: [
        'User search by email queries use the index instead of performing full collection scans',
        'Duplicate emails fail database insert validation'
      ],
      skillTargets: ['databaseModeling', 'reliability']
    },
    {
      title: 'Cleanse HTML inputs to prevent XSS payloads',
      description: 'Workspace submission content allows raw HTML, exposing other users to scripts. Sanitize incoming payload characters using a library or strict string replacements.',
      category: 'Validation hardening',
      requirements: [
        'Add sanitize middleware to submission endpoints',
        'Escape HTML tag entities from code input strings',
        'Return 400 Bad Request if script tags are detected'
      ],
      difficulty: 'Medium',
      deadline: '2 hours',
      businessContext: 'Unsanitized input allows malicious users to inject script tags that run in context of other users.',
      acceptanceCriteria: [
        'Submitting standard code works normally',
        'Submitting <script> tags is intercepted and fails validation'
      ],
      skillTargets: ['apiDesign', 'authentication']
    }
  ],
  uiux_designer: [
    {
      title: 'Audit and redesign high-contrast dashboard layouts',
      description: 'The dashboard buttons and text violate WCAG AA color contrast guidelines (less than 4.5:1 ratio). Recalculate color values to improve clarity for low vision users.',
      category: 'Accessibility fixes',
      requirements: [
        'Identify text and background colors on critical buttons',
        'Recalculate colors to meet WCAG AA contrast ratio standards',
        'Update CSS variables with the new accessible values'
      ],
      difficulty: 'Easy',
      deadline: '1 hour',
      businessContext: 'Ensuring color contrast compatibility allows visually impaired users to navigate the product and meets legal accessibility mandates.',
      acceptanceCriteria: [
        'Text and button contrast ratios are at least 4.5:1',
        'Focus states are visually distinct on keyboard focus'
      ],
      skillTargets: ['accessibility', 'visualHierarchy']
    },
    {
      title: 'Adjust workspace visual scanning hierarchy',
      description: 'The instructions pane has header sizes and line heights that make it difficult to scan. Redesign typography scale and margins to improve scannability.',
      category: 'UI improvements',
      requirements: [
        'Define a consistent typography scale (h1, h2, paragraph)',
        'Increase paragraph line-height to 1.5rem for readability',
        'Incorporate clean whitespace margins between layout blocks'
      ],
      difficulty: 'Easy',
      deadline: '1 hour',
      businessContext: 'Poor typographic scanning slows down user workflow, leading to frustration and lower task completions.',
      acceptanceCriteria: [
        'Instruction cards follow clear sizing rules',
        'Headings stand out distinctly from body copy'
      ],
      skillTargets: ['visualHierarchy', 'interactionDesign']
    },
    {
      title: 'Simplify onboarding checkout interface friction',
      description: 'The workspace onboarding has too many form fields, causing user drop-off. Analyze the workflow steps and propose a unified progressive disclosure flow.',
      category: 'UX reviews',
      requirements: [
        'Break down signup information requirements into two clear stages',
        'Add a progress indicator to guide user steps',
        'Remove non-essential input fields from initial stage'
      ],
      difficulty: 'Medium',
      deadline: '3 hours',
      businessContext: 'Reducing checkout and onboarding friction directly increases customer acquisition conversion rates.',
      acceptanceCriteria: [
        'First step requires only email and name',
        'A progress indicator shows active step 1/2'
      ],
      skillTargets: ['productThinking', 'interactionDesign']
    }
  ],
  data_analyst: [
    {
      title: 'Build empty cell cleaner for CSV imports',
      description: 'User workspace imports are crashing due to missing cells in raw files. Build a data cleaning utility to parse CSV files and replace empty cells with fallback defaults.',
      category: 'CSV analysis',
      requirements: [
        'Detect empty cells or null values in input rows',
        'Impute missing numeric values with column averages',
        'Flag records with critical missing fields'
      ],
      difficulty: 'Medium',
      deadline: '2 hours',
      businessContext: 'Dirty raw datasets crash database insertions and corrupt business metrics downstream.',
      acceptanceCriteria: [
        'Importer handles CSV rows with missing cells without crashing',
        'Cleaned records are written correctly with fallback defaults'
      ],
      skillTargets: ['dataCleaning', 'statisticalReasoning']
    },
    {
      title: 'Pinpoint user retention drop-off drivers',
      description: 'Weekly user retention has dropped by 12%. Analyze the mock usage data logs to identify the point where users are abandoning the platform.',
      category: 'Insight generation',
      requirements: [
        'Query mock event logs grouped by day-of-onboarding',
        'Calculate retention rate drop per day of first week',
        'Write executive summary identifying the main drop-off screen'
      ],
      difficulty: 'Medium',
      deadline: '3 hours',
      businessContext: 'Understanding where and why users leave allows product teams to target high-impact UX fixes.',
      acceptanceCriteria: [
        'Daily retention breakdown is correctly calculated',
        'Main drop-off point is explicitly named with evidence'
      ],
      skillTargets: ['businessInsight', 'communication']
    },
    {
      title: 'Interpret data metrics dashboard variations',
      description: 'The weekly analytics report shows a conflicting spike in page views alongside a drop in session duration. Formulate a hypothesis explaining this pattern.',
      category: 'Dashboard interpretation',
      requirements: [
        'Compare page views to unique sessions',
        'Analyze bounce rate changes over same time period',
        'Propose 2 actionable tests to confirm your hypothesis'
      ],
      difficulty: 'Easy',
      deadline: '1 hour',
      businessContext: 'Spikes in page views can be misleading if users are simply reloading broken pages repeatedly.',
      acceptanceCriteria: [
        'Hypothesis reconciles page view increase and duration decrease',
        'Tests are realistic and measurable'
      ],
      skillTargets: ['businessInsight', 'statisticalReasoning']
    }
  ]
};

/**
 * Unique task generator service.
 * Fetches user's history, selects unused task from pool, and uses AI to customize/specialize it.
 */
export const generateUniqueTask = async ({ user, role, userSkills }) => {
  const userId = user._id;
  const roleId = role.id;

  try {
    // 1. Fetch previously assigned tasks to track history
    const assignedTasks = await Task.find({ assignedTo: userId, role: roleId }).select('title');
    const assignedTaskTitles = assignedTasks.map(t => t.title);

    const pool = TASK_POOL[roleId] || TASK_POOL.frontend_developer;
    
    // 2. Identify unused tasks in the pool
    const unusedTasks = pool.filter(task => !assignedTaskTitles.includes(task.title));

    let selectedBaseTask = null;
    let fallbackToUsed = false;

    if (unusedTasks.length > 0) {
      // Randomly select one unused task
      selectedBaseTask = unusedTasks[Math.floor(Math.random() * unusedTasks.length)];
    } else {
      // Pool is fully exhausted! Select any random task from pool
      selectedBaseTask = pool[Math.floor(Math.random() * pool.length)];
      fallbackToUsed = true;
    }

    // 3. Construct prompt to customize the task
    const prompt = buildTaskGenerationPrompt({ role, userSkills, assignedTaskTitles });
    
    // Supplement prompt with the chosen base task to customize
    const customizationPrompt = `
You must base your generation on the following starter task structure.
Starter Task Structure:
${JSON.stringify(selectedBaseTask)}

${prompt}

Instructions:
1. Customize the starter task's description and requirements dynamically to reflect the user's skill level.
2. If the user skills are low, make requirements simpler. If high, make them more technical.
${fallbackToUsed ? '3. CRITICAL: The pool is exhausted. Create a task with a brand new, UNIQUE title, description, and requirements that is different from all completed tasks listed above!' : '3. Make sure to keep the exact title of the starter task so we can trace its usage.'}
`;

    // 4. Query AI Service
    try {
      const text = await createChatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are an AI workplace manager generating realistic, non-repetitive internship tasks. Return only valid JSON.'
          },
          { role: 'user', content: customizationPrompt }
        ],
        temperature: 0.85,
        maxTokens: 1100
      });
      const cleaned = cleanJson(text);
      const parsedTask = JSON.parse(cleaned);

      return {
        ...selectedBaseTask,
        ...parsedTask,
        role: roleId
      };
    } catch (aiError) {
      logAIError(aiError);
      return {
        ...selectedBaseTask,
        role: roleId
      };
    }
  } catch (err) {
    logAIError(err);
    // Ultimate hardcoded fallback from the pool
    const pool = TASK_POOL[roleId] || TASK_POOL.frontend_developer;
    return {
      ...pool[0],
      role: roleId
    };
  }
};

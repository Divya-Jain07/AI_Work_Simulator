export const WORKPLACE_ROLES = {
  frontend_developer: {
    id: 'frontend_developer',
    label: 'Frontend Developer',
    managerKey: 'frontend',
    evaluatorKey: 'frontend',
    teammateName: 'Maya',
    teammateTitle: 'Senior Frontend Engineer',
    headline: 'Owns polished React experiences, interface quality, and client-side reliability.',
    taskCategories: ['React bugs', 'UI fixes', 'Form validation', 'State management', 'Performance tuning'],
    dashboardWidgets: ['activeReactIncidents', 'uiQualityScore', 'accessibilityDebt', 'componentVelocity'],
    skills: {
      react: 58,
      accessibility: 44,
      stateManagement: 51,
      testing: 39,
      communication: 62
    },
    evaluationCriteria: [
      'Correct React state and component boundaries',
      'Reliable validation and edge case handling',
      'Accessible, responsive UI behavior',
      'Clear implementation notes'
    ],
    learningRecommendations: [
      'React rendering patterns and state colocation',
      'Form validation edge cases',
      'Component testing with user-focused assertions'
    ]
  },
  backend_developer: {
    id: 'backend_developer',
    label: 'Backend Developer',
    managerKey: 'backend',
    evaluatorKey: 'backend',
    teammateName: 'Arjun',
    teammateTitle: 'Staff Backend Engineer',
    headline: 'Owns resilient APIs, authentication flows, and data integrity.',
    taskCategories: ['API debugging', 'Authentication fixes', 'Database optimization', 'Validation hardening', 'Service reliability'],
    dashboardWidgets: ['apiHealth', 'authRisk', 'queryLatency', 'incidentQueue'],
    skills: {
      apiDesign: 56,
      authentication: 46,
      databaseModeling: 49,
      reliability: 43,
      communication: 60
    },
    evaluationCriteria: [
      'Correct API behavior and status codes',
      'Secure authentication and authorization handling',
      'Efficient database access patterns',
      'Operationally useful error handling'
    ],
    learningRecommendations: [
      'JWT authorization failure modes',
      'MongoDB query and index design',
      'Express service boundary patterns'
    ]
  },
  data_analyst: {
    id: 'data_analyst',
    label: 'Data Analyst',
    managerKey: 'analyst',
    evaluatorKey: 'analyst',
    teammateName: 'Neha',
    teammateTitle: 'Analytics Lead',
    headline: 'Turns messy workplace data into crisp insight and executive-ready recommendations.',
    taskCategories: ['CSV analysis', 'Insight generation', 'Dashboard interpretation', 'Metric QA', 'Experiment readouts'],
    dashboardWidgets: ['insightPipeline', 'dataQuality', 'metricConfidence', 'stakeholderRequests'],
    skills: {
      dataCleaning: 55,
      businessInsight: 50,
      visualization: 47,
      statisticalReasoning: 42,
      communication: 64
    },
    evaluationCriteria: [
      'Sound interpretation of data and assumptions',
      'Useful business insight, not just calculation',
      'Clear data quality caveats',
      'Concise stakeholder communication'
    ],
    learningRecommendations: [
      'Exploratory analysis checklists',
      'Metric definition and anomaly review',
      'Narrative charting for business decisions'
    ]
  },
  uiux_designer: {
    id: 'uiux_designer',
    label: 'UI/UX Designer',
    managerKey: 'uiux',
    evaluatorKey: 'uiux',
    teammateName: 'Lina',
    teammateTitle: 'Principal Product Designer',
    headline: 'Improves product clarity, accessibility, hierarchy, and workflow ergonomics.',
    taskCategories: ['UI improvements', 'Accessibility fixes', 'UX reviews', 'Interaction polish', 'Design QA'],
    dashboardWidgets: ['usabilityBacklog', 'a11yCoverage', 'designSystemFit', 'workflowFriction'],
    skills: {
      visualHierarchy: 57,
      accessibility: 45,
      interactionDesign: 50,
      productThinking: 48,
      communication: 63
    },
    evaluationCriteria: [
      'Strong hierarchy and scanning behavior',
      'Accessible interaction and content choices',
      'Practical product reasoning',
      'Specific, actionable design recommendations'
    ],
    learningRecommendations: [
      'Accessibility-first design review',
      'Information hierarchy in SaaS dashboards',
      'Writing concise product critique'
    ]
  }
};

export const DEFAULT_WORKPLACE_ROLE = 'frontend_developer';

export const normalizeRoleId = (roleId) => {
  if (!roleId) return DEFAULT_WORKPLACE_ROLE;
  const normalized = String(roleId).trim().toLowerCase().replace(/[\s-]+/g, '_');
  return WORKPLACE_ROLES[normalized] ? normalized : DEFAULT_WORKPLACE_ROLE;
};

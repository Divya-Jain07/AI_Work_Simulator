export const ROLE_CATALOG = {
  frontend_developer: {
    id: 'frontend_developer',
    label: 'Frontend Developer',
    teammateName: 'Maya',
    teammateTitle: 'Senior Frontend Engineer',
    headline: 'Owns polished React experiences, interface quality, and client-side reliability.',
    taskCategories: ['React bugs', 'UI fixes', 'Form validation', 'State management', 'Performance tuning'],
    dashboardWidgets: ['activeReactIncidents', 'uiQualityScore', 'accessibilityDebt', 'componentVelocity'],
    evaluationCriteria: [
      'Correct React state and component boundaries',
      'Reliable validation and edge case handling',
      'Accessible, responsive UI behavior',
      'Clear implementation notes'
    ],
    learningRecommendations: [
      { text: 'React rendering & state colocation', reason: 'Based on frequent state management bugs' },
      { text: 'Form validation edge cases', reason: 'Recommended to improve client-side reliability' },
      { text: 'User-focused component testing', reason: 'Based on recent UI testing gaps' }
    ],
    defaultSkillGraph: {
      react: 58,
      accessibility: 44,
      stateManagement: 51,
      testing: 39,
      communication: 62
    }
  },
  backend_developer: {
    id: 'backend_developer',
    label: 'Backend Developer',
    teammateName: 'Arjun',
    teammateTitle: 'Staff Backend Engineer',
    headline: 'Owns resilient APIs, authentication flows, and data integrity.',
    taskCategories: ['API debugging', 'Authentication fixes', 'Database optimization', 'Validation hardening', 'Service reliability'],
    dashboardWidgets: ['apiHealth', 'authRisk', 'queryLatency', 'incidentQueue'],
    evaluationCriteria: [
      'Correct API behavior and status codes',
      'Secure authentication and authorization handling',
      'Efficient database access patterns',
      'Operationally useful error handling'
    ],
    learningRecommendations: [
      { text: 'JWT auth failure modes', reason: 'Based on your recent authentication tasks' },
      { text: 'MongoDB query optimization', reason: 'Recommended to lower query latency' },
      { text: 'Express service boundaries', reason: 'Based on API architecture feedback' }
    ],
    defaultSkillGraph: {
      apiDesign: 56,
      authentication: 46,
      databaseModeling: 49,
      reliability: 43,
      communication: 60
    }
  },
  data_analyst: {
    id: 'data_analyst',
    label: 'Data Analyst',
    teammateName: 'Neha',
    teammateTitle: 'Analytics Lead',
    headline: 'Turns messy workplace data into crisp insight and executive-ready recommendations.',
    taskCategories: ['CSV analysis', 'Insight generation', 'Dashboard interpretation', 'Metric QA', 'Experiment readouts'],
    dashboardWidgets: ['insightPipeline', 'dataQuality', 'metricConfidence', 'stakeholderRequests'],
    evaluationCriteria: [
      'Sound interpretation of data and assumptions',
      'Useful business insight, not just calculation',
      'Clear data quality caveats',
      'Concise stakeholder communication'
    ],
    learningRecommendations: [
      { text: 'Exploratory analysis checklists', reason: 'Based on gaps in recent metric QA' },
      { text: 'Metric anomaly review', reason: 'Recommended to improve insight generation' },
      { text: 'Narrative charting for business', reason: 'Based on stakeholder communication feedback' }
    ],
    defaultSkillGraph: {
      dataCleaning: 55,
      businessInsight: 50,
      visualization: 47,
      statisticalReasoning: 42,
      communication: 64
    }
  },
  uiux_designer: {
    id: 'uiux_designer',
    label: 'UI/UX Designer',
    teammateName: 'Lina',
    teammateTitle: 'Principal Product Designer',
    headline: 'Improves product clarity, accessibility, hierarchy, and workflow ergonomics.',
    taskCategories: ['UI improvements', 'Accessibility fixes', 'UX reviews', 'Interaction polish', 'Design QA'],
    dashboardWidgets: ['usabilityBacklog', 'a11yCoverage', 'designSystemFit', 'workflowFriction'],
    evaluationCriteria: [
      'Strong hierarchy and scanning behavior',
      'Accessible interaction and content choices',
      'Practical product reasoning',
      'Specific, actionable design recommendations'
    ],
    learningRecommendations: [
      { text: 'Accessibility-first design', reason: 'Based on recent a11y coverage audits' },
      { text: 'SaaS dashboard hierarchy', reason: 'Recommended to reduce workflow friction' },
      { text: 'Concise product critique', reason: 'Based on your design QA reviews' }
    ],
    defaultSkillGraph: {
      visualHierarchy: 57,
      accessibility: 45,
      interactionDesign: 50,
      productThinking: 48,
      communication: 63
    }
  }
};

export const ROLE_LIST = Object.values(ROLE_CATALOG);
export const DEFAULT_ROLE_ID = 'frontend_developer';

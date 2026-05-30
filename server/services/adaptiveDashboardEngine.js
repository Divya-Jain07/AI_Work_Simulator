const normalizeScore = (score) => {
  if (!Number.isFinite(score)) return 0;
  return score <= 10 ? score * 10 : score;
};

const average = (values) => {
  const usable = values.filter(Number.isFinite);
  return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : 0;
};

const labelConfidence = (score) => {
  if (score >= 85) return 'High';
  if (score >= 65) return 'Medium';
  return 'Low';
};

export const generateAdaptiveDashboard = ({ tasks = [], submissions = [], skillProgress = {} }) => {
  const scores = submissions.map((submission) => normalizeScore(submission.score));
  const avgScore = average(scores);
  const failedSubmissions = scores.filter((score) => score > 0 && score < 55).length;
  const completedTasks = tasks.filter((task) => task.status === 'Evaluated').length;
  const unfinishedTasks = tasks.filter((task) => task.status !== 'Evaluated').length;
  const consistency = scores.length > 1
    ? Math.max(0, 100 - Math.round(Math.max(...scores) - Math.min(...scores)))
    : Math.round(avgScore);
  const skillValues = Object.values(skillProgress).map(Number);
  const skillAverage = average(skillValues);
  const qualityScore = Math.round((avgScore * 0.45) + (skillAverage * 0.35) + (consistency * 0.2));
  const confidenceScore = Math.round((avgScore * 0.55) + (consistency * 0.25) + (completedTasks * 4) - (failedSubmissions * 8));
  const boundedConfidence = Math.max(0, Math.min(100, confidenceScore));
  const trustLevel = boundedConfidence >= 85 ? 'Trusted' : boundedConfidence >= 65 ? 'Growing' : 'Needs evidence';

  return {
    metricConfidence: labelConfidence(boundedConfidence),
    confidenceScore: boundedConfidence,
    stakeholderRequests: Math.max(0, unfinishedTasks + failedSubmissions),
    openAnalysisRequests: unfinishedTasks,
    trustLevel,
    qualityScore: Math.max(0, Math.min(100, qualityScore || 0)),
    failedSubmissions,
    consistency,
    averageEvaluationScore: Math.round(avgScore || 0)
  };
};

export const toDashboardWidgets = (metrics) => [
  {
    key: 'metricConfidence',
    label: 'Metric confidence',
    value: metrics.metricConfidence,
    detail: `${metrics.confidenceScore}/100 weighted by score consistency`
  },
  {
    key: 'stakeholderRequests',
    label: 'Stakeholder requests',
    value: metrics.stakeholderRequests,
    detail: 'Open requests inferred from unfinished or failed work'
  },
  {
    key: 'trustLevel',
    label: 'Trust level',
    value: metrics.trustLevel,
    detail: 'Dashboard reliability based on submission quality'
  },
  {
    key: 'qualityScore',
    label: 'Quality score',
    value: `${metrics.qualityScore}%`,
    detail: 'Evaluation, skill, and consistency blend'
  }
];

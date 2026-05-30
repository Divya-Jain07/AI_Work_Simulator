const difficultyWeight = {
  Easy: 0.8,
  Medium: 1,
  Hard: 1.25
};

const roleDefaults = {
  uiux_designer: ['accessibility', 'typography', 'visualHierarchy', 'spacing'],
  data_analyst: ['sql', 'businessInsight', 'statisticalReasoning', 'dataVisualization'],
  frontend_developer: ['react', 'debugging', 'responsiveness', 'testing'],
  backend_developer: ['apiArchitecture', 'databaseOptimization', 'reliability', 'security']
};

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

export const evolveSkills = ({ role, currentSkills = {}, task, evaluation = {} }) => {
  const skills = { ...currentSkills };
  const score = Number(evaluation.score <= 10 ? evaluation.score * 10 : evaluation.score) || 0;
  const weight = difficultyWeight[task?.difficulty] || 1;
  const updateSource = evaluation.skillUpdates || evaluation.skills || {};
  const targetSkills = task?.skillTargets?.length ? task.skillTargets : roleDefaults[role] || [];

  targetSkills.forEach((skill) => {
    const base = Number(skills[skill] ?? 45);
    const explicitDelta = Number(updateSource[skill]);
    const scoreDelta = ((score - 60) / 18) * weight;
    skills[skill] = clamp(base + (Number.isFinite(explicitDelta) ? explicitDelta * weight : scoreDelta));
  });

  Object.entries(updateSource).forEach(([skill, delta]) => {
    const base = Number(skills[skill] ?? currentSkills[skill] ?? 45);
    skills[skill] = clamp(base + Number(delta || 0) * weight);
  });

  return skills;
};

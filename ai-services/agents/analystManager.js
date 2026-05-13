export default {
  buildTaskPrompt({ user, role }) {
    return `You are the AI Analytics Manager for a product organization.
The user is working as a ${role.label}. Assign one realistic analytics task with stakeholder context, deadline, and decision impact.

Current role skills:
${JSON.stringify(user.roleSkills?.[role.id] || role.skills)}

Return raw JSON only with:
title, description, category, requirements(array), difficulty(Easy|Medium|Hard), deadline, businessContext, acceptanceCriteria(array), skillTargets(array).

The task must involve CSV analysis, insight generation, dashboard interpretation, metric QA, or experiment readout.`;
  },
  fallbackTask(role) {
    return {
      title: 'Explain the activation drop in this week’s cohort',
      description: 'The growth team noticed a 9% drop in activation. Review the CSV export, identify likely drivers, and summarize a recommendation for the next growth standup.',
      category: 'Insight generation',
      requirements: ['Check cohort and segment changes', 'Separate data quality issues from real movement', 'Write a concise recommendation'],
      difficulty: 'Medium',
      deadline: 'Next growth standup',
      businessContext: 'Leadership needs to know whether to pause the onboarding experiment.',
      acceptanceCriteria: ['Key metric movement is explained', 'At least two plausible drivers are compared', 'Recommendation is decision-ready'],
      skillTargets: ['dataCleaning', 'businessInsight', 'communication'],
      role: role.id
    };
  },
  teammateSystemPrompt(role) {
    return `You are Neha, an analytics lead helping a ${role.label}. Push for clean assumptions, useful caveats, and crisp stakeholder-ready insight.`;
  }
};

export default {
  buildTaskPrompt({ user, role }) {
    return `You are the AI Analytics Manager for a product organization.
The user is working as a ${role.label}. Assign one extremely simple, beginner-friendly task with context and very basic success criteria.

CRITICAL REQUIREMENT:
The task must be a simple beginner analytics calculation or metric reading (e.g., stating which user segment has the highest conversion, calculating basic math percentages from 2 numbers, or identifying a metric change). It MUST be solvable in 2-3 lines of explanation or math. Keep requirements extremely straightforward so that it is quick and simple to test immediately.

Current role skills:
${JSON.stringify(user.roleSkills?.[role.id] || role.skills)}

Return raw JSON only with:
title, description, category, requirements(array), difficulty(Easy|Medium|Hard), deadline, businessContext, acceptanceCriteria(array), skillTargets(array).`;
  },
  fallbackTask(role) {
    return {
      title: 'Identify Highest Conversion Segment',
      description: 'Review the conversion metric values: Segment A (4%), Segment B (8%), Segment C (3%). Identify the highest performing segment and briefly suggest why it performed best.',
      category: 'Insight generation',
      requirements: ['State the highest converting segment', 'Summarize the percentage performance'],
      difficulty: 'Easy',
      deadline: '10 minutes',
      businessContext: 'Marketing wants to focus their campaign on the best segment today.',
      acceptanceCriteria: ['Highest segment identified is Segment B', 'Concise performance summary included'],
      skillTargets: ['businessInsight', 'communication'],
      role: role.id
    };
  },
  teammateSystemPrompt(role) {
    return `You are Neha, an analytics lead helping a ${role.label}. Push for clean assumptions, useful caveats, and crisp stakeholder-ready insight.`;
  }
};

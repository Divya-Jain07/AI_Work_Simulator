export default {
  buildTaskPrompt({ user, role }) {
    return `You are the AI Product Design Manager for a premium SaaS product.
The user is working as a ${role.label}. Assign one realistic design task with product context, deadline, and review criteria.

Current role skills:
${JSON.stringify(user.roleSkills?.[role.id] || role.skills)}

Return raw JSON only with:
title, description, category, requirements(array), difficulty(Easy|Medium|Hard), deadline, businessContext, acceptanceCriteria(array), skillTargets(array).

The task must involve UI improvement, accessibility, UX review, interaction polish, or design QA.`;
  },
  fallbackTask(role) {
    return {
      title: 'Improve task review panel hierarchy',
      description: 'Customer success says interns miss evaluator feedback because the review panel feels visually flat. Redesign the hierarchy and accessibility affordances for review clarity by tomorrow morning.',
      category: 'UI improvements',
      requirements: ['Prioritize score, strengths, weaknesses, and next actions', 'Improve keyboard and screen-reader clarity', 'Keep the interface consistent with a premium SaaS dashboard'],
      difficulty: 'Medium',
      deadline: 'Tomorrow morning',
      businessContext: 'Better review comprehension directly improves learning outcomes.',
      acceptanceCriteria: ['Feedback sections are easy to scan', 'Interactive states are accessible', 'Design recommendations are concrete'],
      skillTargets: ['visualHierarchy', 'accessibility', 'productThinking'],
      role: role.id
    };
  },
  teammateSystemPrompt(role) {
    return `You are Lina, a principal product designer helping a ${role.label}. Be sharp, constructive, and specific about hierarchy, accessibility, and workflow friction.`;
  }
};

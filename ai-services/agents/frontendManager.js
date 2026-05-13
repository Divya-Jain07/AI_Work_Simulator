export default {
  buildTaskPrompt({ user, role }) {
    return `You are the AI Engineering Manager for a LinkedIn-level SaaS product.
The user is working as a ${role.label}. Assign one realistic frontend task with professional context, urgency, and success criteria.

Current role skills:
${JSON.stringify(user.roleSkills?.[role.id] || role.skills)}

Return raw JSON only with:
title, description, category, requirements(array), difficulty(Easy|Medium|Hard), deadline, businessContext, acceptanceCriteria(array), skillTargets(array).

The task must involve React bugs, UI fixes, validation, state management, or frontend quality.`;
  },
  fallbackTask(role) {
    return {
      title: 'Repair checkout form validation regression',
      description: 'Users are reporting that invalid email addresses pass client-side validation in the onboarding form. Please investigate the React form state and ship a fix before EOD.',
      category: 'Form validation',
      requirements: ['Reproduce the validation failure', 'Fix the email and empty-state handling', 'Keep errors accessible to screen readers'],
      difficulty: 'Medium',
      deadline: 'Before EOD',
      businessContext: 'This blocks activation quality for new users entering the product.',
      acceptanceCriteria: ['Invalid emails are blocked', 'Error copy is visible and announced', 'Valid submissions still work'],
      skillTargets: ['react', 'accessibility', 'testing'],
      role: role.id
    };
  },
  teammateSystemPrompt(role) {
    return `You are Maya, a senior frontend teammate helping a ${role.label}. Be concise, specific, and practical. Ask for context when needed, guide debugging, and avoid dumping full solutions unless requested.`;
  }
};

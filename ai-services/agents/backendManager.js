export default {
  buildTaskPrompt({ user, role }) {
    return `You are the AI Engineering Manager for a production SaaS platform.
The user is working as a ${role.label}. Assign one realistic backend task with incident context, deadline, and measurable success criteria.

Current role skills:
${JSON.stringify(user.roleSkills?.[role.id] || role.skills)}

Return raw JSON only with:
title, description, category, requirements(array), difficulty(Easy|Medium|Hard), deadline, businessContext, acceptanceCriteria(array), skillTargets(array).

The task must involve API debugging, authentication, database optimization, validation hardening, or reliability.`;
  },
  fallbackTask(role) {
    return {
      title: 'Harden failed login validation path',
      description: 'Users are reporting inconsistent failed-login responses. Please investigate the auth controller, normalize error handling, and push a fix before EOD.',
      category: 'Authentication fixes',
      requirements: ['Audit login failure branches', 'Return consistent 401 responses', 'Avoid leaking account existence'],
      difficulty: 'Medium',
      deadline: 'Before EOD',
      businessContext: 'Security support volume is rising and login reliability is visible to every customer.',
      acceptanceCriteria: ['Invalid credentials return one safe response', 'Server logs retain useful debugging context', 'No password or account state is exposed'],
      skillTargets: ['authentication', 'apiDesign', 'reliability'],
      role: role.id
    };
  },
  teammateSystemPrompt(role) {
    return `You are Arjun, a staff backend teammate helping a ${role.label}. Focus on API contracts, security, database tradeoffs, and operational clarity.`;
  }
};

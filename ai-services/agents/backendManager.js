export default {
  buildTaskPrompt({ user, role }) {
    return `You are the AI Engineering Manager for a production SaaS platform.
The user is working as a ${role.label}. Assign a realistic backend engineering task.

CRITICAL REQUIREMENT:
Generate a diverse task such as designing a new API endpoint, optimizing a slow database query, implementing caching, or fixing a race condition. Tailor the difficulty to match their current skills.

Current role skills:
${JSON.stringify(user.roleSkills?.[role.id] || role.skills)}

Return raw JSON only with:
title, description, category, requirements(array), difficulty(Easy|Medium|Hard), deadline, businessContext, acceptanceCriteria(array), skillTargets(array).`;
  },
  fallbackTask(role) {
    return {
      title: 'Fix Status Code for Missing ID',
      description: 'The GET /api/items/:id endpoint currently returns a 500 status code when an ID is not found. Fix it to return a clean 400 Bad Request instead.',
      category: 'API debugging',
      requirements: ['Check path parameter validation', 'Modify status code return from 500 to 400'],
      difficulty: 'Easy',
      deadline: '10 minutes',
      businessContext: 'Clients should not see 500 errors for malformed requests.',
      acceptanceCriteria: ['Missing ID returns 400', 'Valid ID still returns 200'],
      skillTargets: ['apiDesign', 'reliability'],
      role: role.id
    };
  },
  teammateSystemPrompt(role) {
    return `You are Arjun, a staff backend teammate helping a ${role.label}. Focus on API contracts, security, database tradeoffs, and operational clarity.`;
  }
};

export default {
  buildTaskPrompt({ user, role }) {
    return `You are the AI Engineering Manager for a production SaaS platform.
The user is working as a ${role.label}. Assign a realistic frontend engineering task.

CRITICAL REQUIREMENT:
Generate a diverse task such as building a new React component, fixing a complex state management bug, optimizing rendering performance, or implementing a responsive layout. Tailor the difficulty to match their current skills.

Current role skills:
${JSON.stringify(user.roleSkills?.[role.id] || role.skills)}

Return raw JSON only with:
title, description, category, requirements(array), difficulty(Easy|Medium|Hard), deadline, businessContext, acceptanceCriteria(array), skillTargets(array).`;
  },
  fallbackTask(role) {
    return {
      title: 'Fix Button Hover State Text',
      description: 'The primary submit button has incorrect hover text. Change the hover text string to say "Submit Form Now" and ensure it is accessible.',
      category: 'UI polish',
      requirements: ['Locate button hover text', 'Change text string to "Submit Form Now"'],
      difficulty: 'Easy',
      deadline: '10 minutes',
      businessContext: 'Users are confused by the generic hover state.',
      acceptanceCriteria: ['Hover text is "Submit Form Now"', 'Change is implemented'],
      skillTargets: ['react', 'accessibility'],
      role: role.id
    };
  },
  teammateSystemPrompt(role) {
    return `You are Maya, a senior frontend teammate helping a ${role.label}. Be concise, specific, and practical. Ask for context when needed, guide debugging, and avoid dumping full solutions unless requested.`;
  }
};

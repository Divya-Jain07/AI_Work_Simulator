export default {
  buildTaskPrompt({ user, role }) {
    return `You are the AI Engineering Manager for a production SaaS platform.
The user is working as a ${role.label}. Assign one extremely simple, beginner-friendly task with context and very basic success criteria.

CRITICAL REQUIREMENT:
The task must be a simple beginner bug or small modification (e.g., changing a button label, fixing a basic text hover state, correcting a simple CSS contrast issue, or adding a simple counter limit check). It MUST be solvable in 2-3 lines of code or explanation. Keep requirements extremely straightforward so that it is quick and simple to test immediately.

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

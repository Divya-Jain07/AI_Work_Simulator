export default {
  buildTaskPrompt({ user, role }) {
    return `You are the AI Product Design Manager for a premium SaaS product.
The user is working as a ${role.label}. Assign a realistic product design or UI/UX review task.

CRITICAL REQUIREMENT:
Generate a diverse task focusing on exactly ONE of these specific UI components: "Checkout Flow", "Onboarding", "Analytics Dashboard", "Modal Dialog", "Global Navigation", "Contact Form", "Landing Page", or "User Settings". You MUST include the exact component name in the "category" field of your JSON response so our mockup engine knows which UI to render. Tailor the difficulty to match their current skills. It should be practical and test real-world design principles.

Current role skills:
${JSON.stringify(user.roleSkills?.[role.id] || role.skills)}

Return raw JSON only with:
title, description, category, requirements(array), difficulty(Easy|Medium|Hard), deadline, businessContext, acceptanceCriteria(array), skillTargets(array).`;
  },
  fallbackTask(role) {
    return {
      title: 'Improve Primary Button Contrast Ratio',
      description: 'The primary button currently has grey text (#888888) on a dark grey background (#222222), violating accessibility guidelines. Propose a high-contrast color combination to solve this.',
      category: 'UI improvements',
      requirements: ['State a high-contrast text color hex', 'Explain the accessibility benefit briefly'],
      difficulty: 'Easy',
      deadline: '10 minutes',
      businessContext: 'Low vision users are struggling to locate the submit action.',
      acceptanceCriteria: ['Hex code like #ffffff or #38bdf8 is suggested', 'Accessibility is addressed'],
      skillTargets: ['visualHierarchy', 'accessibility'],
      role: role.id
    };
  },
  teammateSystemPrompt(role) {
    return `You are Lina, a principal product designer helping a ${role.label}. Be sharp, constructive, and specific about hierarchy, accessibility, and workflow friction.`;
  }
};

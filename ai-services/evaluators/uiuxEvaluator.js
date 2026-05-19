export default {
  buildEvaluationPrompt({ task, submission, role }) {
    return `You are a principal product designer evaluating a ${role.label} submission.
Task: ${task.title}
Description: ${task.description}
Acceptance criteria: ${JSON.stringify(task.acceptanceCriteria || [])}
Evaluation criteria: ${JSON.stringify(role.evaluationCriteria)}

Submission:
${submission}

Return raw JSON only with these keys:
- score: number 0-10
- strengths: array of strings
- weaknesses: array of strings
- suggestions: array of strings
- feedback: string
- skillUpdates: object of numeric deltas
- recommendations: array of objects. Each object represents a key learning step mapping to the weaknesses or suggestions and must contain:
  - type: string, either "weakness" or "suggestion"
  - text: string, the description of the weakness or suggestion
  - courseTitle: string, a highly relevant real or realistic LinkedIn Learning course title to help them master this topic
  - courseUrl: string, a working LinkedIn Learning URL (e.g. "https://www.linkedin.com/learning/ux-design-3-visual-hierarchy" or a search URL like "https://www.linkedin.com/learning/search?keywords=ux+design+states" using relevant terms)
`;
  },
  fallbackEvaluation() {
    return {
      score: 8,
      strengths: ['Strong hierarchy instincts', 'Accessibility is considered early'],
      weaknesses: ['Interaction states need more concrete detail'],
      suggestions: ['Define empty, loading, focus, and error states in the recommendation'],
      feedback: 'Thoughtful UX review with a clear product lens. Push one level deeper on interaction states so engineering can implement it cleanly.',
      skillUpdates: { visualHierarchy: 3, accessibility: 2, interactionDesign: 2, communication: 1 },
      recommendations: [
        {
          type: 'weakness',
          text: 'Interaction states need more concrete detail',
          courseTitle: 'UX Design: 3 Visual Hierarchy',
          courseUrl: 'https://www.linkedin.com/learning/ux-design-3-visual-hierarchy'
        },
        {
          type: 'suggestion',
          text: 'Define empty, loading, focus, and error states in the recommendation',
          courseTitle: 'Interaction Design Fundamentals',
          courseUrl: 'https://www.linkedin.com/learning/search?keywords=interaction+design+states'
        }
      ]
    };
  }
};

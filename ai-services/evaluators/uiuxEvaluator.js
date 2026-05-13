export default {
  buildEvaluationPrompt({ task, submission, role }) {
    return `You are a principal product designer evaluating a ${role.label} submission.
Task: ${task.title}
Description: ${task.description}
Acceptance criteria: ${JSON.stringify(task.acceptanceCriteria || [])}
Evaluation criteria: ${JSON.stringify(role.evaluationCriteria)}

Submission:
${submission}

Return raw JSON only with:
score(number 0-10), strengths(array), weaknesses(array), suggestions(array), feedback(string), skillUpdates(object of numeric deltas).`;
  },
  fallbackEvaluation() {
    return {
      score: 8,
      strengths: ['Strong hierarchy instincts', 'Accessibility is considered early'],
      weaknesses: ['Interaction states need more concrete detail'],
      suggestions: ['Define empty, loading, focus, and error states in the recommendation'],
      feedback: 'Thoughtful UX review with a clear product lens. Push one level deeper on interaction states so engineering can implement it cleanly.',
      skillUpdates: { visualHierarchy: 3, accessibility: 2, interactionDesign: 2, communication: 1 }
    };
  }
};

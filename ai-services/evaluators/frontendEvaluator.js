export default {
  buildEvaluationPrompt({ task, submission, role }) {
    return `You are a senior frontend engineer evaluating a ${role.label} submission.
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
      strengths: ['Clear component-level reasoning', 'Good attention to validation behavior'],
      weaknesses: ['Could describe edge case coverage more explicitly'],
      suggestions: ['Add null checks for API responses and include one regression test'],
      feedback: 'Solid frontend submission with practical validation thinking. The next step is to make the edge cases and test coverage easier for reviewers to verify.',
      skillUpdates: { react: 3, accessibility: 1, testing: 2, communication: 1 }
    };
  }
};

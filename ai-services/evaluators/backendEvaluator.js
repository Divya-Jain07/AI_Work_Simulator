export default {
  buildEvaluationPrompt({ task, submission, role }) {
    return `You are a staff backend engineer evaluating a ${role.label} submission.
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
      strengths: ['Good API contract awareness', 'Security implications are addressed'],
      weaknesses: ['Database and logging impact could be clearer'],
      suggestions: ['Add explicit authorization checks and document expected failure responses'],
      feedback: 'Strong backend reasoning with practical attention to secure behavior. Tighten the operational details so the fix is easier to support in production.',
      skillUpdates: { apiDesign: 2, authentication: 3, reliability: 2, communication: 1 }
    };
  }
};

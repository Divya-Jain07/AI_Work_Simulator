export default {
  buildEvaluationPrompt({ task, submission, role }) {
    return `You are an analytics lead evaluating a ${role.label} submission.
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
      strengths: ['Clear business framing', 'Useful caveats around data quality'],
      weaknesses: ['Could quantify confidence and segment impact more directly'],
      suggestions: ['Compare at least two segments and state the decision your analysis supports'],
      feedback: 'Good analyst-style response that connects data to a business question. Make the recommendation sharper by quantifying confidence and tradeoffs.',
      skillUpdates: { dataCleaning: 2, businessInsight: 3, visualization: 1, communication: 2 }
    };
  }
};

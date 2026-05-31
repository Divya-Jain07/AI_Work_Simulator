export default {
  buildEvaluationPrompt({ task, submission, role }) {
    return `You are an analytics lead evaluating a ${role.label} submission.
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
  - courseUrl: string, a working LinkedIn Learning search URL based on keywords (e.g. "https://www.linkedin.com/learning/search?keywords=data+analyst+insight" using relevant terms). Do NOT generate direct course links, only search URLs.
`;
  },
  fallbackEvaluation() {
    return {
      score: 8,
      strengths: ['Clear business framing', 'Useful caveats around data quality'],
      weaknesses: ['Could quantify confidence and segment impact more directly'],
      suggestions: ['Compare at least two segments and state the decision your analysis supports'],
      feedback: 'Good analyst-style response that connects data to a business question. Make the recommendation sharper by quantifying confidence and tradeoffs.',
      skillUpdates: { dataCleaning: 2, businessInsight: 3, visualization: 1, communication: 2 },
      recommendations: [
        {
          type: 'weakness',
          text: 'Could quantify confidence and segment impact more directly',
          courseTitle: 'Business Intelligence for Beginners',
          courseUrl: 'https://www.linkedin.com/learning/search?keywords=business+intelligence+beginners'
        },
        {
          type: 'suggestion',
          text: 'Compare at least two segments and state the decision your analysis supports',
          courseTitle: 'Data-Driven Decision Making',
          courseUrl: 'https://www.linkedin.com/learning/search?keywords=data+driven+decision+making'
        }
      ]
    };
  }
};

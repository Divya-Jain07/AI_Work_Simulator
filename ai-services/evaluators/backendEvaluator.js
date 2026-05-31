export default {
  buildEvaluationPrompt({ task, submission, role }) {
    return `You are a staff backend engineer evaluating a ${role.label} submission.
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
  - courseUrl: string, a working LinkedIn Learning search URL based on keywords (e.g. "https://www.linkedin.com/learning/search?keywords=backend+api+design" using relevant terms). Do NOT generate direct course links, only search URLs.
`;
  },
  fallbackEvaluation() {
    return {
      score: 8,
      strengths: ['Good API contract awareness', 'Security implications are addressed'],
      weaknesses: ['Database and logging impact could be clearer'],
      suggestions: ['Add explicit authorization checks and document expected failure responses'],
      feedback: 'Strong backend reasoning with practical attention to secure behavior. Tighten the operational details so the fix is easier to support in production.',
      skillUpdates: { apiDesign: 2, authentication: 3, reliability: 2, communication: 1 },
      recommendations: [
        {
          type: 'weakness',
          text: 'Database and logging impact could be clearer',
          courseTitle: 'Node.js: Real-Time Logging and Monitoring',
          courseUrl: 'https://www.linkedin.com/learning/search?keywords=node+js+logging'
        },
        {
          type: 'suggestion',
          text: 'Add explicit authorization checks and document expected failure responses',
          courseTitle: 'Web Security: OAuth and OpenID Connect',
          courseUrl: 'https://www.linkedin.com/learning/search?keywords=web+security+oauth'
        }
      ]
    };
  }
};

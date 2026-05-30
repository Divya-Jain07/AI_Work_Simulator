export default {
  buildEvaluationPrompt({ task, submission, role }) {
    return `You are a senior frontend engineer evaluating a ${role.label} submission.
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
- skills: object of numeric 0-10 analytics by role skill
- skillUpdates: object of numeric growth deltas
- recommendations: array of objects. Each object represents a key learning step mapping to the weaknesses or suggestions and must contain:
  - type: string, either "weakness" or "suggestion"
  - text: string, the description of the weakness or suggestion
  - courseTitle: string, a highly relevant real or realistic LinkedIn Learning course title to help them master this topic
  - courseUrl: string, a working LinkedIn Learning URL (e.g. "https://www.linkedin.com/learning/react-js-essential-training" or a search URL like "https://www.linkedin.com/learning/search?keywords=react+state+management" using relevant terms)
`;
  },
  fallbackEvaluation() {
    return {
      score: 8,
      skills: { react: 8, accessibility: 6, testing: 7, communication: 7 },
      strengths: ['Clear component-level reasoning', 'Good attention to validation behavior'],
      weaknesses: ['Could describe edge case coverage more explicitly'],
      suggestions: ['Add null checks for API responses and include one regression test'],
      feedback: 'Solid frontend submission with practical validation thinking. The next step is to make the edge cases and test coverage easier for reviewers to verify.',
      skillUpdates: { react: 3, accessibility: 1, testing: 2, communication: 1 },
      recommendations: [
        {
          type: 'weakness',
          text: 'Could describe edge case coverage more explicitly',
          courseTitle: 'React: Testing and Debugging',
          courseUrl: 'https://www.linkedin.com/learning/react-testing-and-debugging'
        },
        {
          type: 'suggestion',
          text: 'Add null checks for API responses and include one regression test',
          courseTitle: 'JavaScript: Robust Code and Error Handling',
          courseUrl: 'https://www.linkedin.com/learning/search?keywords=javascript+error+handling'
        }
      ]
    };
  }
};

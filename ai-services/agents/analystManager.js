export default {
  buildTaskPrompt({ user, role }) {
    return `You are the AI Analytics Manager for a product organization.
The user is working as a ${role.label}. Assign a realistic data analytics or reporting task.

CRITICAL REQUIREMENT:
Generate a diverse task such as cohort analysis, revenue modeling, churn prediction, A/B test analysis, or funnel drop-off investigation. Tailor the difficulty to match their current skills. It should require meaningful SQL querying, data interpretation, or business insight generation.

Current role skills:
${JSON.stringify(user.roleSkills?.[role.id] || role.skills)}

Return raw JSON only with:
title, description, category, requirements(array), difficulty(Easy|Medium|Hard), deadline, businessContext, acceptanceCriteria(array), skillTargets(array), datasetName(string), datasetSchema(array of objects with name, type, nullable, unique, example, desc), chartData(object mapping chart keys to {label: string, data: array of {x: string, y: number}}).`;
  },
  fallbackTask(role) {
    return {
      title: 'Identify Highest Conversion Segment',
      description: 'Review the conversion metric values: Segment A (4%), Segment B (8%), Segment C (3%). Identify the highest performing segment and briefly suggest why it performed best.',
      category: 'Insight generation',
      requirements: ['State the highest converting segment', 'Summarize the percentage performance'],
      difficulty: 'Easy',
      deadline: '10 minutes',
      businessContext: 'Marketing wants to focus their campaign on the best segment today.',
      acceptanceCriteria: ['Highest segment identified is Segment B', 'Concise performance summary included'],
      skillTargets: ['businessInsight', 'communication'],
      datasetName: 'marketing_segments.csv',
      datasetSchema: [
        { name: 'segment_name', type: 'VARCHAR', nullable: false, unique: true, example: 'Segment A', desc: 'Name of the marketing segment' },
        { name: 'conversion_rate', type: 'DECIMAL', nullable: false, unique: false, example: '4.00', desc: 'Conversion rate percentage' }
      ],
      chartData: {
        conversions_by_segment: {
          label: 'Conversion Rate by Segment (%)',
          data: [
            { x: 'Segment A', y: 4.0 },
            { x: 'Segment B', y: 8.0 },
            { x: 'Segment C', y: 3.0 }
          ]
        }
      },
      role: role.id
    };
  },
  teammateSystemPrompt(role) {
    return `You are Neha, an analytics lead helping a ${role.label}. Push for clean assumptions, useful caveats, and crisp stakeholder-ready insight.`;
  }
};

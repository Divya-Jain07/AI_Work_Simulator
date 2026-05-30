const courseForSkill = (skill) => {
  const readable = skill.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
  return {
    text: `${readable} is the next best growth area based on your recent evaluations.`,
    courseTitle: `${readable} professional practice`,
    courseUrl: `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(readable)}`
  };
};

export const generateRecommendations = ({ skills = {}, submissions = [], tasks = [], metrics = {} }) => {
  const weakest = Object.entries(skills)
    .sort(([, a], [, b]) => Number(a) - Number(b))
    .slice(0, 3)
    .map(([skill]) => courseForSkill(skill));

  const failed = submissions.some((submission) => Number(submission.score <= 10 ? submission.score * 10 : submission.score) < 55);
  const unfinished = tasks.filter((task) => task.status !== 'Evaluated').length;
  const recommendations = [...weakest];

  if (failed) {
    recommendations.unshift({
      text: 'Review evaluator weaknesses before starting another task; your recent score needs recovery.',
      courseTitle: 'Turning feedback into measurable improvement',
      courseUrl: 'https://www.linkedin.com/learning/search?keywords=feedback+improvement'
    });
  }

  if (metrics.confidenceScore < 65) {
    recommendations.push({
      text: 'Complete a focused practice task to raise metric confidence and stabilize your trend.',
      courseTitle: 'Building professional consistency',
      courseUrl: 'https://www.linkedin.com/learning/search?keywords=professional+consistency'
    });
  }

  if (unfinished > 0) {
    recommendations.push({
      text: `${unfinished} unfinished task${unfinished === 1 ? '' : 's'} are reducing dashboard trust. Close one before requesting more work.`,
      courseTitle: 'Prioritizing technical work',
      courseUrl: 'https://www.linkedin.com/learning/search?keywords=prioritization+technical+work'
    });
  }

  return recommendations.slice(0, 5);
};

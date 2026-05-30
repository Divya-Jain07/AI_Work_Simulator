const normalizeKey = (category = 'general') => String(category)
  .trim()
  .replace(/[^a-zA-Z0-9]+(.)/g, (_, letter) => letter.toUpperCase())
  .replace(/^[A-Z]/, (letter) => letter.toLowerCase()) || 'general';

export const generatePipelineMix = ({ tasks = [] }) => {
  return tasks.reduce((mix, task) => {
    const key = normalizeKey(task.category || task.title);
    mix[key] = (mix[key] || 0) + 1;
    return mix;
  }, {});
};

export const toPipelineCards = (pipelineMix = {}) => Object.entries(pipelineMix)
  .map(([key, count]) => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()),
    count
  }))
  .sort((a, b) => b.count - a.count);

import Task from '../models/Task.js';
import Submission from '../models/Submission.js';

export const getTasks = async (req, res) => {
  try {
    const query = { assignedTo: req.user._id };
    if (req.query.roleId) query.role = req.query.roleId;
    if (req.query.status) query.status = req.query.status;

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task && task.assignedTo.toString() === req.user._id.toString()) {
      res.json(task);
    } else {
      res.status(404).json({ message: 'Task not found or not assigned to user' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id, task: req.params.taskId });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

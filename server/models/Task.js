import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  role: {
    type: String,
    enum: ['frontend_developer', 'backend_developer', 'data_analyst', 'uiux_designer'],
    default: 'frontend_developer',
    index: true
  },
  category: { type: String, default: 'General' },
  deadline: { type: String, default: 'Before EOD' },
  businessContext: { type: String },
  requirements: [{ type: String }],
  acceptanceCriteria: [{ type: String }],
  evaluationCriteria: [{ type: String }],
  skillTargets: [{ type: String }],
  datasetName: { type: String },
  datasetSchema: { type: mongoose.Schema.Types.Mixed },
  chartData: { type: mongoose.Schema.Types.Mixed },
  manager: {
    name: { type: String },
    title: { type: String },
    behavior: { type: String }
  },
  difficulty: { type: String, default: 'Medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Submitted', 'Evaluated'], default: 'Pending' },
  lastEvaluationScore: { type: Number }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;

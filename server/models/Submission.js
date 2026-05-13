import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: ['frontend_developer', 'backend_developer', 'data_analyst', 'uiux_designer'],
    default: 'frontend_developer',
    index: true
  },
  content: { type: String, required: true },
  score: { type: Number },
  feedback: { type: String },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  suggestions: [{ type: String }],
  skillUpdates: { type: Map, of: Number, default: {} }
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;

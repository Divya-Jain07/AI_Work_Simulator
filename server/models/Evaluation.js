import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
  role: {
    type: String,
    enum: ['frontend_developer', 'backend_developer', 'data_analyst', 'uiux_designer'],
    required: true,
    index: true
  },
  score: { type: Number, default: 0 },
  skills: { type: Map, of: Number, default: {} },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  recommendations: [{ type: mongoose.Schema.Types.Mixed }],
  confidence: { type: Number, default: 0 }
}, { timestamps: true });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export default Evaluation;

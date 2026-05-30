import mongoose from 'mongoose';

const skillProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: {
    type: String,
    enum: ['frontend_developer', 'backend_developer', 'data_analyst', 'uiux_designer'],
    required: true,
    index: true
  },
  skills: { type: Map, of: Number, default: {} }
}, { timestamps: true });

skillProgressSchema.index({ userId: 1, role: 1 }, { unique: true });

const SkillProgress = mongoose.model('SkillProgress', skillProgressSchema);
export default SkillProgress;

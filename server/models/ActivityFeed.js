import mongoose from 'mongoose';

const activityFeedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: {
    type: String,
    enum: ['frontend_developer', 'backend_developer', 'data_analyst', 'uiux_designer'],
    required: true,
    index: true
  },
  type: { type: String, required: true },
  title: { type: String, required: true },
  detail: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const ActivityFeed = mongoose.model('ActivityFeed', activityFeedSchema);
export default ActivityFeed;

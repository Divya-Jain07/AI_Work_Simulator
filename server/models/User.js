import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { DEFAULT_WORKPLACE_ROLE, WORKPLACE_ROLES } from '../config/roleConfig.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['intern', 'manager'], default: 'intern' },
  activeWorkRole: {
    type: String,
    enum: Object.keys(WORKPLACE_ROLES),
    default: DEFAULT_WORKPLACE_ROLE
  },
  roleSkills: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  skills: {
    problemSolving: { type: Number, default: 0 },
    coding: { type: Number, default: 0 },
    communication: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;

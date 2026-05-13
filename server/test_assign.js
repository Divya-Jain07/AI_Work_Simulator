import mongoose from 'mongoose';
import Task from './models/Task.js';
import dotenv from 'dotenv';
import { assignRoleTask } from './services/taskOrchestrator.js';
import User from './models/User.js';

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-workplace').then(async () => {
  try {
    const user = await User.findOne();
    if (!user) {
      console.log("No user found.");
      process.exit(1);
    }
    console.log("Found user:", user._id);
    const result = await assignRoleTask({ user, requestedRoleId: 'data_analyst' });
    console.log("Successfully assigned task:", result.task.title);
  } catch (error) {
    console.error("Failed to assign task:", error);
  }
  process.exit(0);
});

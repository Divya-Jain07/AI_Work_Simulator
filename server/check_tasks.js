import mongoose from 'mongoose';
import Task from './models/Task.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-workplace').then(async () => {
  const tasks = await Task.find({}, 'title role category assignedTo');
  console.log('Tasks in DB:');
  console.log(tasks);
  process.exit(0);
});

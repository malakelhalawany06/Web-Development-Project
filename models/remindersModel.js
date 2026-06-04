import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: "6a208401e30bc831fb7d9635" }, 
  text: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  dueDate: { type: String, default: "" }, 
  notes: { type: String, trim: true, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Reminder', reminderSchema, 'reminders');
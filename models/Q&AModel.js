import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tag: { type: String, default: 'all' },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }], 
  answers: [{
    text: { type: String, required: true },
    author: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  author: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    major: { type: String, required: true },
    academicYear: { type: String, required: true }
  },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Question', questionSchema, 'Q&A');
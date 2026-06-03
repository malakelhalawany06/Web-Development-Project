const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, trim: true },
  tag: { type: String, default: 'General' },
  author: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  answers: [{
    text: { type: String, required: true },
    author: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);
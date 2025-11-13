const mongoose = require('mongoose');


const FeedbackSchema = new mongoose.Schema({
name: { type: String, required: true, trim: true },
course: { type: String, required: true, trim: true },
rating: { type: Number, required: true, min: 1, max: 5 },
comments: { type: String, trim: true, default: '' },
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Feedback', FeedbackSchema);
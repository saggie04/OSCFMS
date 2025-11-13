const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');


// POST /api/feedback - create feedback
router.post('/', async (req, res) => {
try {
const { name, course, rating, comments } = req.body;


// basic server-side validation
if (!name || !course || !rating) {
return res.status(400).json({ error: 'name, course and rating are required' });
}


const numericRating = Number(rating);
if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
}


const fb = new Feedback({ name, course, rating: numericRating, comments });
const saved = await fb.save();
res.status(201).json(saved);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'server error' });
}
});


// GET /api/feedback - list feedbacks (optional ?course=)
router.get('/', async (req, res) => {
try {
const filter = {};
if (req.query.course) filter.course = req.query.course;
const list = await Feedback.find(filter).sort({ createdAt: -1 }).limit(200);
res.json(list);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'server error' });
}
});


module.exports = router;
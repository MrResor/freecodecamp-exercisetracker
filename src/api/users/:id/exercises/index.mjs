import express from 'express';
import { db } from '../../../../db.mjs';

const exercises = express.Router();

exercises.post('/api/users/:id/exercises', async (req, res) => {

    const body = req.body;
    const { id } = req.params;
    let { description, duration, date } = body;

    // sanitize inputs
  
    if (duration === undefined || !description) {
        return res.status(400).json({ error: 'Description and duration are required' });
    }
    duration = parseInt(duration);
    if (isNaN(duration)) {
        return res.status(400).json({ error: 'Duration must be a number' });
    }
    if (date && isNaN(Date.parse(date))) {
        return res.status(400).json({ error: 'Date must be a valid date' });
    }
    if (date) {
        date = new Date(date);
    } else {
        date = new Date();
    }

    date = date.toDateString();
    let response = await db.add_exercise(id, description, duration, date);
    if (response[0] === 404) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(response[0]).json({
        _id: id,
        username: response[1],
        date: date,
        duration: duration,
        description: description
    });
});

export { exercises };
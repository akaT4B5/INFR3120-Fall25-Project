const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Task = require('../models/Task.js');

// GET tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST task
router.post('/', auth, async (req, res) => {
    try {
        const { subject, taskName, dueDate, description } = req.body;
        const newTask = new Task({
            subject, taskName, dueDate, description, user: req.user.id
        });
        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT task
router.put('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(task);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// DELETE task
router.delete('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
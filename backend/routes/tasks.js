const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Import the guard
const Task = require('../models/Task'); // Import the Task model

// @route   GET /api/tasks
// @desc    Get all tasks for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Find tasks where the "user" field matches the logged-in user's ID
        // .sort({ date: -1 }) sorts them by newest first
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/tasks
// @desc    Add a new task
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { subject, taskName, dueDate, description } = req.body;

        const newTask = new Task({
            subject,
            taskName,
            dueDate,
            description,
            user: req.user.id // CRITICAL: Link this task to the specific user
        });

        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { subject, taskName, dueDate, description } = req.body;

    // Build task object
    const taskFields = {};
    if (subject) taskFields.subject = subject;
    if (taskName) taskFields.taskName = taskName;
    if (dueDate) taskFields.dueDate = dueDate;
    if (description) taskFields.description = description;

    try {
        let task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Make sure user owns the task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task = await Task.findByIdAndUpdate(
            req.params.id, 
            { $set: taskFields }, 
            { new: true }
        );

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Make sure user owns the task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.json({ message: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
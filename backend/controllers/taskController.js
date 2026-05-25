import Task from '../models/Task.js';
import Course from '../models/Course.js';

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).populate('course', 'title color');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Set task
// @route   POST /api/tasks
// @access  Private
export const setTask = async (req, res) => {
  try {
    const { title, courseId, deadline } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({ message: 'Please add title and courseId' });
    }

    // Verify course belongs to user
    const course = await Course.findById(courseId);
    if (!course || course.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Course not found or unauthorized' });
    }

    const task = await Task.create({
      title,
      course: courseId,
      deadline: deadline ? new Date(deadline) : undefined,
      user: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check for user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    task.status = req.body.status || 'completed';
    const updatedTask = await task.save();

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check for user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await task.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get today's tasks
// @route   GET /api/tasks/today
// @access  Private
export const getTodayTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      user: req.user.id,
      deadline: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('course', 'title color');
    
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

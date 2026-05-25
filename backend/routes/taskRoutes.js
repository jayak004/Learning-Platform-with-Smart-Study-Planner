import express from 'express';
import { getTasks, setTask, updateTaskStatus, deleteTask, getTodayTasks } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/today').get(protect, getTodayTasks);
router.route('/').get(protect, getTasks).post(protect, setTask);
router.route('/:id').delete(protect, deleteTask);
router.route('/:id/status').put(protect, updateTaskStatus);

export default router;

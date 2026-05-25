import express from 'express';
import { getCourses, getCourseById, setCourse, deleteCourse } from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getCourses).post(protect, setCourse);
router.route('/:id').get(protect, getCourseById).delete(protect, deleteCourse);

export default router;

import express from 'express';
import { getMaterials, getAllMaterials, createMaterial, toggleMaterialStatus, deleteMaterial } from '../controllers/materialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllMaterials)
  .post(protect, createMaterial);

router.route('/course/:courseId')
  .get(protect, getMaterials);

router.route('/:id')
  .delete(protect, deleteMaterial);

router.route('/:id/status')
  .put(protect, toggleMaterialStatus);

export default router;

import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getStudentStats } from '../controllers/studentController.js';

const router = express.Router();

router.get('/stats', verifyToken, getStudentStats);

export default router;
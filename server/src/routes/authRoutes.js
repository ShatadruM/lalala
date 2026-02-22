import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getMyStatus } from '../controllers/authController.js';

const router = express.Router();


router.get('/me', verifyToken, getMyStatus);

export default router;
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getMyStatus } from '../controllers/authController.js';

const router = express.Router();

// Protected Route: Requires a valid JWT
router.get('/me', verifyToken, getMyStatus);

export default router;
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { addTokens } from '../controllers/adminController.js';

const router = express.Router();

// CHAINING MIDDLEWARE:
// 1. Verify Token (Is logged in?)
// 2. Require Admin (Is role === 'admin'?)
// 3. Execute Logic
router.post('/credit', verifyToken, requireAdmin, addTokens);

export default router;
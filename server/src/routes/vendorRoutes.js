import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { requireVendor } from '../middleware/vendor.js';
import { deductTokens, getVendorStats } from '../controllers/vendorController.js';

const router = express.Router();

router.post('/deduct', verifyToken, requireVendor, deductTokens);
router.get('/stats', verifyToken, requireVendor, getVendorStats);

export default router;
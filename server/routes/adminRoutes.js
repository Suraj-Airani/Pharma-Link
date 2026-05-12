import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { cleanupGuestData } from '../controllers/adminController.js';

const router = express.Router();

// Admin-only: purge all guest-created data
router.post('/cleanup', authMiddleware, cleanupGuestData);

export default router;

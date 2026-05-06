import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getVendors,
    getVendorById,
    createVendor,
    updateVendor,
    deleteVendor,
} from '../controllers/vendorController.js';

const router = express.Router();

// Public routes
router.get('/', getVendors);
router.get('/:id', getVendorById);

// Protected routes
router.post('/', authMiddleware, createVendor);
router.put('/:id', authMiddleware, updateVendor);
router.delete('/:id', authMiddleware, deleteVendor);

export default router;

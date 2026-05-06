import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    getLowStock,
    getExpiringSoon,
} from '../controllers/medicineController.js';

const router = express.Router();

// Public routes
router.get('/low-stock', getLowStock);
router.get('/expiring-soon', getExpiringSoon);
router.get('/', getMedicines);
router.get('/:id', getMedicineById);

// Protected routes
router.post('/', authMiddleware, createMedicine);
router.put('/:id', authMiddleware, updateMedicine);
router.delete('/:id', authMiddleware, deleteMedicine);

export default router;

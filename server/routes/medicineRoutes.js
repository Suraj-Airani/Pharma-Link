import express from 'express';
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

// Specialized routes (must be BEFORE /:id to avoid conflict)
router.get('/low-stock', getLowStock);
router.get('/expiring-soon', getExpiringSoon);

// Standard CRUD routes
router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', createMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

export default router;

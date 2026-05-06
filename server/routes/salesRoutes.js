import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getSales,
    getSaleById,
    createSale,
    deleteSale,
} from '../controllers/salesController.js';

const router = express.Router();

router.get('/', authMiddleware, getSales);
router.get('/:id', authMiddleware, getSaleById);
router.post('/', authMiddleware, createSale);
router.delete('/:id', authMiddleware, deleteSale);

export default router;

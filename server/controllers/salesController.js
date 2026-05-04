import { pool } from '../config/db.js';

// GET /api/sales — List all sales
export const getSales = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Sales ORDER BY sale_date DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ message: 'Failed to fetch sales', error: error.message });
    }
};

// GET /api/sales/:id — Get a single sale with its items
export const getSaleById = async (req, res) => {
    try {
        const [sale] = await pool.query('SELECT * FROM Sales WHERE sale_id = ?', [req.params.id]);

        if (sale.length === 0) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        const [items] = await pool.query(`
            SELECT si.*, m.name AS medicine_name 
            FROM SaleItems si 
            LEFT JOIN Medicines m ON si.medicine_id = m.medicine_id 
            WHERE si.sale_id = ?
        `, [req.params.id]);

        res.status(200).json({ ...sale[0], items });
    } catch (error) {
        console.error('Error fetching sale:', error);
        res.status(500).json({ message: 'Failed to fetch sale', error: error.message });
    }
};

// POST /api/sales — Create a sale (TRANSACTIONAL)
export const createSale = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { sale_date, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            connection.release();
            return res.status(400).json({ message: 'At least one item is required. Format: { sale_date, items: [{ medicine_id, quantity }] }' });
        }

        // Validate each item
        for (const item of items) {
            if (!item.medicine_id || !item.quantity) {
                connection.release();
                return res.status(400).json({ message: 'Each item must have medicine_id and quantity' });
            }
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                connection.release();
                return res.status(400).json({ message: 'Quantity must be a positive integer' });
            }
        }

        // Begin transaction
        await connection.beginTransaction();

        let total_amount = 0;

        // Step 1: Check availability for ALL items (lock rows)
        for (const item of items) {
            const [medicine] = await connection.query(
                'SELECT medicine_id, name, stock_quantity, price FROM Medicines WHERE medicine_id = ? FOR UPDATE',
                [item.medicine_id]
            );

            if (medicine.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ message: `Medicine with ID ${item.medicine_id} not found` });
            }

            if (item.quantity > medicine[0].stock_quantity) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: `Insufficient stock for "${medicine[0].name}". Available: ${medicine[0].stock_quantity}, Requested: ${item.quantity}`,
                });
            }

            // Store price for later use
            item.unit_price = parseFloat(medicine[0].price);
            item.medicine_name = medicine[0].name;
            total_amount += item.unit_price * item.quantity;
        }

        total_amount = parseFloat(total_amount.toFixed(2));

        // Step 2: Insert Sale header
        const [saleResult] = await connection.query(
            'INSERT INTO Sales (sale_date, total_amount) VALUES (?, ?)',
            [sale_date || new Date().toISOString().slice(0, 19).replace('T', ' '), total_amount]
        );

        const sale_id = saleResult.insertId;

        // Step 3: Insert SaleItems + deduct stock for each item
        for (const item of items) {
            await connection.query(
                'INSERT INTO SaleItems (sale_id, medicine_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [sale_id, item.medicine_id, item.quantity, item.unit_price]
            );

            await connection.query(
                'UPDATE Medicines SET stock_quantity = stock_quantity - ? WHERE medicine_id = ?',
                [item.quantity, item.medicine_id]
            );
        }

        await connection.commit();
        connection.release();

        res.status(201).json({
            message: 'Sale recorded successfully',
            saleId: sale_id,
            total_amount,
            items: items.map(i => ({
                medicine: i.medicine_name,
                quantity: i.quantity,
                unit_price: i.unit_price,
            })),
        });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Error creating sale:', error);
        res.status(500).json({ message: 'Failed to create sale', error: error.message });
    }
};

// DELETE /api/sales/:id — Delete a sale (and restore stock)
export const deleteSale = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Check sale exists
        const [sale] = await connection.query('SELECT * FROM Sales WHERE sale_id = ?', [req.params.id]);

        if (sale.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Get all items to restore stock
        const [items] = await connection.query('SELECT * FROM SaleItems WHERE sale_id = ?', [req.params.id]);

        // Restore stock for each item
        for (const item of items) {
            await connection.query(
                'UPDATE Medicines SET stock_quantity = stock_quantity + ? WHERE medicine_id = ?',
                [item.quantity, item.medicine_id]
            );
        }

        // Delete sale items then sale
        await connection.query('DELETE FROM SaleItems WHERE sale_id = ?', [req.params.id]);
        await connection.query('DELETE FROM Sales WHERE sale_id = ?', [req.params.id]);

        await connection.commit();
        connection.release();

        res.status(200).json({ message: 'Sale deleted and stock restored successfully' });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Error deleting sale:', error);
        res.status(500).json({ message: 'Failed to delete sale', error: error.message });
    }
};

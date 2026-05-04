import { pool } from '../config/db.js';

// GET /api/medicines — List all medicines (with vendor name)
export const getMedicines = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.*, v.name AS vendor_name 
            FROM Medicines m 
            LEFT JOIN Vendors v ON m.vendor_id = v.vendor_id 
            ORDER BY m.name ASC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ message: 'Failed to fetch medicines', error: error.message });
    }
};

// GET /api/medicines/low-stock — Medicines where stock_quantity < 10
export const getLowStock = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.*, v.name AS vendor_name 
            FROM Medicines m 
            LEFT JOIN Vendors v ON m.vendor_id = v.vendor_id 
            WHERE m.stock_quantity < 100 
            ORDER BY m.stock_quantity ASC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching low-stock medicines:', error);
        res.status(500).json({ message: 'Failed to fetch low-stock medicines', error: error.message });
    }
};

// GET /api/medicines/expiring-soon — Medicines expiring within the next 60 days
export const getExpiringSoon = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.*, v.name AS vendor_name 
            FROM Medicines m 
            LEFT JOIN Vendors v ON m.vendor_id = v.vendor_id 
            WHERE m.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY) 
            ORDER BY m.expiry_date ASC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching expiring medicines:', error);
        res.status(500).json({ message: 'Failed to fetch expiring medicines', error: error.message });
    }
};

// GET /api/medicines/:id — Get a single medicine by ID
export const getMedicineById = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.*, v.name AS vendor_name 
            FROM Medicines m 
            LEFT JOIN Vendors v ON m.vendor_id = v.vendor_id 
            WHERE m.medicine_id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching medicine:', error);
        res.status(500).json({ message: 'Failed to fetch medicine', error: error.message });
    }
};

// POST /api/medicines — Create a new medicine (with input validation)
export const createMedicine = async (req, res) => {
    try {
        const { name, category, price, stock_quantity, expiry_date, vendor_id } = req.body;

        // Required fields check
        if (!name || !category || price == null || stock_quantity == null || !expiry_date) {
            return res.status(400).json({ message: 'Missing required fields: name, category, price, stock_quantity, expiry_date' });
        }

        // Input Validation: price and quantity must be positive numbers
        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }

        if (!Number.isInteger(stock_quantity) || stock_quantity < 0) {
            return res.status(400).json({ message: 'Stock quantity must be a non-negative integer' });
        }

        const [result] = await pool.query(
            'INSERT INTO Medicines (name, category, price, stock_quantity, expiry_date, vendor_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category, price, stock_quantity, expiry_date, vendor_id || null]
        );

        res.status(201).json({
            message: 'Medicine created successfully',
            medicineId: result.insertId,
        });
    } catch (error) {
        console.error('Error creating medicine:', error);
        res.status(500).json({ message: 'Failed to create medicine', error: error.message });
    }
};

// PUT /api/medicines/:id — Update an existing medicine (with input validation)
export const updateMedicine = async (req, res) => {
    try {
        const { name, category, price, stock_quantity, expiry_date, vendor_id } = req.body;

        if (!name || !category || price == null || stock_quantity == null || !expiry_date) {
            return res.status(400).json({ message: 'Missing required fields: name, category, price, stock_quantity, expiry_date' });
        }

        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }

        if (!Number.isInteger(stock_quantity) || stock_quantity < 0) {
            return res.status(400).json({ message: 'Stock quantity must be a non-negative integer' });
        }

        const [result] = await pool.query(
            'UPDATE Medicines SET name = ?, category = ?, price = ?, stock_quantity = ?, expiry_date = ?, vendor_id = ? WHERE medicine_id = ?',
            [name, category, price, stock_quantity, expiry_date, vendor_id || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.status(200).json({ message: 'Medicine updated successfully' });
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ message: 'Failed to update medicine', error: error.message });
    }
};

// DELETE /api/medicines/:id — Delete a medicine
export const deleteMedicine = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Medicines WHERE medicine_id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.status(200).json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'Failed to delete medicine', error: error.message });
    }
};

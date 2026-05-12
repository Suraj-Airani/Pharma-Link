import { pool } from '../config/db.js';

// GET /api/vendors — List all vendors (for dropdowns & table)
export const getVendors = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Vendors ORDER BY name ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ message: 'Failed to fetch vendors', error: error.message });
    }
};

// GET /api/vendors/:id — Get a single vendor by ID
export const getVendorById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Vendors WHERE vendor_id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching vendor:', error);
        res.status(500).json({ message: 'Failed to fetch vendor', error: error.message });
    }
};

// POST /api/vendors — Create a new vendor
export const createVendor = async (req, res) => {
    try {
        const { name, contact_person, phone, email } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Vendor name is required' });
        }

        // Set created_by based on user role
        const created_by = req.user.role === 'guest' ? 'guest' : 'admin';

        const [result] = await pool.query(
            'INSERT INTO Vendors (name, contact_person, phone, email, created_by) VALUES (?, ?, ?, ?, ?)',
            [name, contact_person || null, phone || null, email || null, created_by]
        );

        res.status(201).json({
            message: 'Vendor created successfully',
            vendorId: result.insertId,
        });
    } catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({ message: 'Failed to create vendor', error: error.message });
    }
};

// PUT /api/vendors/:id — Update an existing vendor
export const updateVendor = async (req, res) => {
    try {
        const { name, contact_person, phone, email } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Vendor name is required' });
        }

        // Guest guard: check if this record is admin-owned
        if (req.user.role === 'guest') {
            const [existing] = await pool.query(
                'SELECT created_by FROM Vendors WHERE vendor_id = ?',
                [req.params.id]
            );

            if (existing.length === 0) {
                return res.status(404).json({ message: 'Vendor not found' });
            }

            // Simulated success — don't touch admin data
            if (existing[0].created_by === 'admin') {
                return res.status(200).json({ message: 'Vendor updated successfully' });
            }
        }

        const [result] = await pool.query(
            'UPDATE Vendors SET name = ?, contact_person = ?, phone = ?, email = ? WHERE vendor_id = ?',
            [name, contact_person || null, phone || null, email || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json({ message: 'Vendor updated successfully' });
    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ message: 'Failed to update vendor', error: error.message });
    }
};

// DELETE /api/vendors/:id — Delete a vendor (with safety check)
export const deleteVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;

        // Guest guard: check if this record is admin-owned
        if (req.user.role === 'guest') {
            const [existing] = await pool.query(
                'SELECT created_by FROM Vendors WHERE vendor_id = ?',
                [vendorId]
            );

            if (existing.length === 0) {
                return res.status(404).json({ message: 'Vendor not found' });
            }

            // Simulated success — don't touch admin data
            if (existing[0].created_by === 'admin') {
                return res.status(200).json({ message: 'Vendor deleted successfully' });
            }
        }

        // Safety Check: block deletion if vendor is linked to any medicines
        const [medicines] = await pool.query(
            'SELECT COUNT(*) AS count FROM Medicines WHERE vendor_id = ?',
            [vendorId]
        );

        if (medicines[0].count > 0) {
            return res.status(409).json({
                message: `Cannot delete vendor — ${medicines[0].count} medicine(s) are linked to this vendor. Reassign or remove them first.`,
            });
        }

        const [result] = await pool.query('DELETE FROM Vendors WHERE vendor_id = ?', [vendorId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({ message: 'Failed to delete vendor', error: error.message });
    }
};

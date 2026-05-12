import { pool } from '../config/db.js';

// POST /api/admin/cleanup — Purge all guest-created data
export const cleanupGuestData = async (req, res) => {
    try {
        // Only admins can trigger cleanup
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied — admin only' });
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Delete SaleItems linked to guest sales
            const [saleItems] = await connection.query(`
                DELETE si FROM SaleItems si
                INNER JOIN Sales s ON si.sale_id = s.sale_id
                WHERE s.created_by = 'guest'
            `);

            // 2. Delete guest sales
            const [sales] = await connection.query(
                "DELETE FROM Sales WHERE created_by = 'guest'"
            );

            // 3. Delete guest medicines
            const [medicines] = await connection.query(
                "DELETE FROM Medicines WHERE created_by = 'guest'"
            );

            // 4. Delete guest vendors (only those not linked to any remaining medicines)
            const [vendors] = await connection.query(`
                DELETE v FROM Vendors v
                LEFT JOIN Medicines m ON v.vendor_id = m.vendor_id
                WHERE v.created_by = 'guest' AND m.medicine_id IS NULL
            `);

            await connection.commit();
            connection.release();

            res.status(200).json({
                message: 'Guest data purged successfully',
                purged: {
                    saleItems: saleItems.affectedRows,
                    sales: sales.affectedRows,
                    medicines: medicines.affectedRows,
                    vendors: vendors.affectedRows,
                },
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Error cleaning up guest data:', error);
        res.status(500).json({ message: 'Failed to cleanup guest data', error: error.message });
    }
};

import { useState, useEffect } from 'react';
import API from '../../utils/api';
import StatCard from '../../components/StatCard/StatCard';
import DataTable from '../../components/DataTable/DataTable';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import styles from './Dashboard.module.css';

import boxIcon from '../../assets/light-icons/box-solid.png';
import alertIcon from '../../assets/alert.png';
import expiryIcon from '../../assets/light-icons/expiry.png';
import truckIcon from '../../assets/light-icons/truck.png';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalMedicines: 0,
        lowStock: 0,
        expiringSoon: 0,
        totalVendors: 0,
    });
    const [lowStockMeds, setLowStockMeds] = useState([]);
    const [expiringMeds, setExpiringMeds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [medicinesRes, lowStockRes, expiringRes, vendorsRes] = await Promise.all([
                API.get('/api/medicines'),
                API.get('/api/medicines/low-stock'),
                API.get('/api/medicines/expiring-soon'),
                API.get('/api/vendors'),
            ]);

            setStats({
                totalMedicines: medicinesRes.data.length,
                lowStock: lowStockRes.data.length,
                expiringSoon: expiringRes.data.length,
                totalVendors: vendorsRes.data.length,
            });

            setLowStockMeds(lowStockRes.data.slice(0, 5));
            setExpiringMeds(expiringRes.data.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (qty) => {
        if (qty === 0) return 'Out of Stock';
        if (qty < 100) return 'Low Stock';
        return 'In Stock';
    };

    const lowStockColumns = [
        { key: 'name', label: 'Medicine' },
        { key: 'category', label: 'Category' },
        {
            key: 'stock_quantity',
            label: 'Stock',
            render: (val, row) => (
                <div className={styles.stockCell}>
                    <span>{val}</span>
                    <StatusBadge status={getStockStatus(val)} />
                </div>
            ),
        },
        { key: 'vendor_name', label: 'Vendor', render: (val) => val || '—' },
    ];

    const expiringColumns = [
        { key: 'name', label: 'Medicine' },
        { key: 'category', label: 'Category' },
        {
            key: 'expiry_date',
            label: 'Expiry Date',
            render: (val) => val ? new Date(val).toLocaleDateString() : '—',
        },
        {
            key: 'stock_quantity',
            label: 'Stock',
            render: (val) => val,
        },
    ];

    if (loading) {
        return <div className={styles.loading}>Loading dashboard...</div>;
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <p className={styles.subtitle}>Overview of your pharmacy</p>
            </div>

            <div className={styles.statsGrid}>
                <StatCard icon={boxIcon} label="Total Medicines" value={stats.totalMedicines} />
                <StatCard icon={alertIcon} label="Low Stock" value={stats.lowStock} accent="#f39c12" />
                <StatCard icon={expiryIcon} label="Expiring Soon" value={stats.expiringSoon} accent="#e74c3c" />
                <StatCard icon={truckIcon} label="Total Vendors" value={stats.totalVendors} />
            </div>

            {lowStockMeds.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>⚠️ Low Stock Alerts</h2>
                        <span className={styles.sectionCount}>{stats.lowStock} items</span>
                    </div>
                    <DataTable
                        columns={lowStockColumns}
                        data={lowStockMeds}
                        searchPlaceholder="Search low stock..."
                    />
                </div>
            )}

            {expiringMeds.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>🕐 Expiring Soon</h2>
                        <span className={styles.sectionCount}>{stats.expiringSoon} items</span>
                    </div>
                    <DataTable
                        columns={expiringColumns}
                        data={expiringMeds}
                        searchPlaceholder="Search expiring..."
                    />
                </div>
            )}
        </div>
    );
};

export default Dashboard;

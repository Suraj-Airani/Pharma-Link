import { useState } from 'react';
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import userIcon from '../../assets/light-icons/user.png';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';

const Header = () => {
    const { admin, role, logout } = useAuth();
    const navigate = useNavigate();
    const [cleaning, setCleaning] = useState(false);
    const [showCleanupDialog, setShowCleanupDialog] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCleanup = async () => {
        setShowCleanupDialog(false);
        setCleaning(true);
        try {
            const res = await API.post('/api/admin/cleanup');
            const { cleaned } = res.data;
            toast.success(
                `Cleaned: ${cleaned.medicines} medicines, ${cleaned.vendors} vendors, ${cleaned.sales} sales`
            );
        } catch (error) {
            const msg = error.response?.data?.message || 'Cleanup failed';
            toast.error(msg);
        } finally {
            setCleaning(false);
        }
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.brand}>
                    <img src="/icon.png" alt="PharmaLink" className={styles.logo} />
                    <h1 className={styles.title}>PharmaLink</h1>
                </div>
                <div className={styles.actions}>
                    {role === 'admin' && (
                        <button
                            className={styles.cleanupBtn}
                            onClick={() => setShowCleanupDialog(true)}
                            disabled={cleaning}
                        >
                            {cleaning ? 'Cleaning...' : '🧹 Clean Guest Data'}
                        </button>
                    )}
                    {role === 'guest' && (
                        <span className={styles.demoBadge}>Demo Mode</span>
                    )}
                    <div className={styles.adminInfo}>
                        <img src={userIcon} alt="Admin" className={styles.adminIcon} />
                        <span className={styles.adminName}>{admin?.username || 'Admin'}</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <ConfirmDialog
                isOpen={showCleanupDialog}
                title="Clean Up Demo Data"
                message="This will permanently delete all guest-created medicines, vendors, sales, and sale items. Admin data will remain untouched. This action cannot be undone."
                confirmLabel="Clean Up"
                onConfirm={handleCleanup}
                onCancel={() => setShowCleanupDialog(false)}
            />
        </>
    );
};

export default Header;

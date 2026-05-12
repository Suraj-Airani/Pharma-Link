import { useState } from 'react';
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import userIcon from '../../assets/light-icons/user.png';

const Header = () => {
    const { admin, role, logout } = useAuth();
    const navigate = useNavigate();
    const [cleaning, setCleaning] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCleanup = async () => {
        if (!window.confirm('Clean all guest-created data? This cannot be undone.')) return;

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
        <header className={styles.header}>
            <div className={styles.brand}>
                <img src="/icon.png" alt="PharmaLink" className={styles.logo} />
                <h1 className={styles.title}>PharmaLink</h1>
            </div>
            <div className={styles.actions}>
                {role === 'admin' && (
                    <button
                        className={styles.cleanupBtn}
                        onClick={handleCleanup}
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
    );
};

export default Header;

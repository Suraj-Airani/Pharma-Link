import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userIcon from '../../assets/light-icons/user.png';

const Header = () => {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className={styles.header}>
            <div className={styles.brand}>
                <img src="/icon.png" alt="PharmaLink" className={styles.logo} />
                <h1 className={styles.title}>PharmaLink</h1>
            </div>
            <div className={styles.actions}>
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

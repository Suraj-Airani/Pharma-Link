import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

import homeIcon from '../../assets/light-icons/home.png';
import boxIcon from '../../assets/light-icons/box-solid.png';
import handshakeIcon from '../../assets/light-icons/handshake.png';
import receiptIcon from '../../assets/light-icons/receipt.png';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: homeIcon },
    { to: '/inventory', label: 'Inventory', icon: boxIcon },
    { to: '/vendors', label: 'Vendors', icon: handshakeIcon },
    { to: '/billing', label: 'Billing', icon: receiptIcon },
];

const Sidebar = ({ isOpen, onClose }) => {
    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={onClose} />}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                            onClick={onClose}
                        >
                            <img src={item.icon} alt={item.label} className={styles.navIcon} />
                            <span className={styles.navLabel}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;

import styles from './StatusBadge.module.css';

const statusMap = {
    'In Stock': 'success',
    'Low Stock': 'warning',
    'Out of Stock': 'danger',
    'Expired': 'danger',
    'Expiring Soon': 'warning',
};

const StatusBadge = ({ status }) => {
    const variant = statusMap[status] || 'default';

    return (
        <span className={`${styles.badge} ${styles[variant]}`}>
            {status}
        </span>
    );
};

export default StatusBadge;

import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <div className={styles.iconWrap}>
                    <span className={styles.icon}>⚠</span>
                </div>
                <h3 className={styles.title}>{title || 'Confirm Delete'}</h3>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        Cancel
                    </button>
                    <button className={styles.confirmBtn} onClick={onConfirm}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;

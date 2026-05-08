import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;

import styles from './StatCard.module.css';

const StatCard = ({ icon, label, value, accent }) => {
    return (
        <div className={styles.card} style={accent ? { borderColor: accent } : {}}>
            <div className={styles.iconWrap}>
                <img src={icon} alt={label} className={styles.icon} />
            </div>
            <div className={styles.info}>
                <span className={styles.value}>{value}</span>
                <span className={styles.label}>{label}</span>
            </div>
        </div>
    );
};

export default StatCard;

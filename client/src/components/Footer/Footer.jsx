import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p className={styles.text}>
                &copy; {new Date().getFullYear()} PharmaLink — Pharmacy Management System
            </p>
        </footer>
    );
};

export default Footer;

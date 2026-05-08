import { useState } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <Header />
            <div className={styles.body}>
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className={styles.main}>
                    <button
                        className={styles.menuBtn}
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰
                    </button>
                    <div className={styles.content}>
                        {children}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import styles from './Login.module.css';
import logo from '../../assets/logo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Please enter username and password');
            return;
        }

        setLoading(true);
        try {
            const res = await API.post('/api/auth/login', { username, password });
            login(res.data.token, res.data.admin);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setGuestLoading(true);
        try {
            const res = await API.post('/api/auth/guest-login');
            login(res.data.token, res.data.admin);
            toast.success('Welcome, Guest!');
            navigate('/dashboard');
        } catch (error) {
            const msg = error.response?.data?.message || 'Guest login failed';
            toast.error(msg);
        } finally {
            setGuestLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.formSide}>
                <div className={styles.formContainer}>
                    <div className={styles.brand}>
                        <img src={logo} alt="PharmaLink" className={styles.logo} />
                        <p className={styles.subtitle}>Pharmacy Management System</p>
                    </div>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label className={styles.label}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className={styles.input}
                                autoComplete="username"
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.passwordWrap}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className={styles.input}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading || guestLoading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className={styles.divider}>or</div>

                        <button
                            type="button"
                            className={styles.guestBtn}
                            onClick={handleGuestLogin}
                            disabled={guestLoading || loading}
                        >
                            {guestLoading ? 'Logging in as Guest...' : 'Continue as Guest'}
                        </button>
                    </form>
                </div>
            </div>

            <div className={styles.imageSide}>
                <div className={styles.imageOverlay} />
            </div>
        </div>
    );
};

export default Login;

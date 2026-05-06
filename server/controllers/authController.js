import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

// A. REGISTRATION — POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const [existing] = await pool.query(
            'SELECT admin_id FROM Admins WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const [result] = await pool.query(
            'INSERT INTO Admins (username, password_hash) VALUES (?, ?)',
            [username, hashedPassword]
        );

        res.status(201).json({
            message: 'Admin registered successfully',
            adminId: result.insertId,
        });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ message: 'Failed to register admin', error: error.message });
    }
};

// B. LOGIN — POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const [rows] = await pool.query(
            'SELECT * FROM Admins WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const admin = rows[0];

        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            {
                adminId: admin.admin_id,
                username: admin.username,
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            admin: {
                adminId: admin.admin_id,
                username: admin.username,
            },
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Failed to login', error: error.message });
    }
};

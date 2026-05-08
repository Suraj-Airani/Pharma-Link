import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 4000,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: true,  // TiDB Cloud requires SSL
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test the connection on startup
const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ Database connected successfully — ${process.env.DB_DATABASE}`);
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
};

export { pool, connectDB };

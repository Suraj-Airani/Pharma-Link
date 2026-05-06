import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import vendorRoutes from './routes/vendorRoutes.js'
import medicineRoutes from './routes/medicineRoutes.js'
import salesRoutes from './routes/salesRoutes.js'
import authRoutes from './routes/authRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send("API is working"))

// Routes
app.use('/api/vendors', vendorRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await connectDB();
});
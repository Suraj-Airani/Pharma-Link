import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'

// Load .env from the project root (one level above /server)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send("API is working"))

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await connectDB();
});
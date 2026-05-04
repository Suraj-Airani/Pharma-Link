import express from 'express'
import cors from 'cors'
import env from "dotenv"

const app = express();
env.config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send("API is working"))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
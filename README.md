# 📦 PharmaLink — Pharmacy Management System

A secure, full-stack pharmacy management platform built with React and Node.js, powered by TiDB Cloud.

## 🚀 Features
- **Authentication** — JWT login with Bcrypt password hashing
- **Inventory** — CRUD for medicines with stock status tracking
- **Vendors** — Supplier directory with contact management
- **Billing (POS)** — Cart-based checkout with automatic stock deduction
- **PDF Invoices** — Auto-generated branded invoices on every sale
- **Dashboard** — Real-time alerts for low stock & expiring medicines

## 🛠️ Tech Stack
- **Frontend:** React, Vite, CSS Modules, Axios, jsPDF
- **Backend:** Node.js, Express, JWT, Bcrypt
- **Database:** TiDB Cloud (MySQL-compatible)
- **Deployment:** Vercel

## ⚙️ Setup
```bash
# Clone
git clone https://github.com/Suraj-Airani/Pharma-Link.git

# Backend
cd server && npm install && npm run server

# Frontend (new terminal)
cd client && npm install && npm run dev
```

Create a `.env` file in the root with your database credentials, JWT secret, and `VITE_BACKEND_URL`.

## 🔌 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET/POST/PUT/DELETE | `/api/medicines` | Medicine CRUD |
| GET/POST/PUT/DELETE | `/api/vendors` | Vendor CRUD |
| GET/POST | `/api/sales` | Sales & billing |

## 👨‍💻 Developer
**Suraj S Airani** — SDE Intern | Final Year ECE Student
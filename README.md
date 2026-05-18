# 📦 PharmaLink — Pharmacy Management System

A secure, full-stack pharmacy management platform built with React and Node.js, powered by TiDB Cloud.

## 🚀 Features
- **Authentication** — JWT login with Bcrypt password hashing
- **Inventory** — CRUD for medicines with stock status tracking
- **Vendors** — Supplier directory with contact management
- **Billing (POS)** — Cart-based checkout with automatic stock deduction
- **PDF Invoices** — Auto-generated branded invoices on every sale
- **Dashboard** — Real-time alerts for low stock & expiring medicines
- **Guest Admin Mode (Demo)** — Explore the app with a "soft reset" guard. Modifying admin data returns simulated success without touching the database!
- **Data Cleanup** — Admins can securely clean all guest-generated test data in a single click.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, CSS Modules, Axios, jsPDF
- **Backend:** Node.js, Express
- **Database:** TiDB Cloud (MySQL-compatible)
- **Deployment:** Vercel

## Live Demo : https://pharma-link-xi.vercel.app/

## ⚙️ Setup
```bash
# Clone
git clone https://github.com/Suraj-Airani/Pharma-Link.git

# Backend
cd server && npm install && npm run server

# Frontend (new terminal)
cd client && npm install && npm run dev
```

## 👨‍💻 Developer
**Suraj S Airani** — SDE Intern at Tap Academy| Final Year ECE Student

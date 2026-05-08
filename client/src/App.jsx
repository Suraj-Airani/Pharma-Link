import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Inventory from './pages/Inventory/Inventory';
import Vendors from './pages/Vendors/Vendors';
import Billing from './pages/Billing/Billing';

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#03346E',
                            color: '#E2E2B6',
                            border: '1px solid rgba(110, 172, 218, 0.2)',
                            fontSize: '0.875rem',
                        },
                    }}
                />
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Layout><Dashboard /></Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/inventory" element={
                        <ProtectedRoute>
                            <Layout><Inventory /></Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/vendors" element={
                        <ProtectedRoute>
                            <Layout><Vendors /></Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/billing" element={
                        <ProtectedRoute>
                            <Layout><Billing /></Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;

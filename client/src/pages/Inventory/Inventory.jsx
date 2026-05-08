import { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable/DataTable';
import Modal from '../../components/Modal/Modal';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import styles from './Inventory.module.css';
import addIcon from '../../assets/light-icons/add.png';

const emptyForm = {
    name: '',
    category: '',
    price: '',
    stock_quantity: '',
    expiry_date: '',
    vendor_id: '',
};

const Inventory = () => {
    const [medicines, setMedicines] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [medsRes, vendorsRes] = await Promise.all([
                API.get('/api/medicines'),
                API.get('/api/vendors'),
            ]);
            setMedicines(medsRes.data);
            setVendors(vendorsRes.data);
        } catch (error) {
            toast.error('Failed to load inventory');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (qty, expiryDate) => {
        if (expiryDate && new Date(expiryDate) < new Date()) return 'Expired';
        if (qty === 0) return 'Out of Stock';
        if (qty < 100) return 'Low Stock';
        return 'In Stock';
    };

    const columns = [
        { key: 'name', label: 'Medicine Name' },
        { key: 'category', label: 'Category' },
        {
            key: 'price',
            label: 'Price (₹)',
            render: (val) => `₹${parseFloat(val).toFixed(2)}`,
        },
        {
            key: 'stock_quantity',
            label: 'Stock',
        },
        {
            key: 'expiry_date',
            label: 'Expiry Date',
            render: (val) => val ? new Date(val).toLocaleDateString() : '—',
        },
        {
            key: 'vendor_name',
            label: 'Vendor',
            render: (val) => val || '—',
        },
        {
            key: 'status',
            label: 'Status',
            render: (val, row) => (
                <StatusBadge status={getStockStatus(row.stock_quantity, row.expiry_date)} />
            ),
        },
    ];

    const openAddModal = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEditModal = (medicine) => {
        setEditing(medicine);
        setForm({
            name: medicine.name,
            category: medicine.category,
            price: medicine.price,
            stock_quantity: medicine.stock_quantity,
            expiry_date: medicine.expiry_date
                ? new Date(medicine.expiry_date).toISOString().split('T')[0]
                : '',
            vendor_id: medicine.vendor_id || '',
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.category || !form.price || !form.stock_quantity || !form.expiry_date) {
            toast.error('Please fill all required fields');
            return;
        }

        setSubmitting(true);

        const payload = {
            name: form.name,
            category: form.category,
            price: parseFloat(form.price),
            stock_quantity: parseInt(form.stock_quantity),
            expiry_date: form.expiry_date,
            vendor_id: form.vendor_id ? parseInt(form.vendor_id) : null,
        };

        try {
            if (editing) {
                await API.put(`/api/medicines/${editing.medicine_id}`, payload);
                toast.success('Medicine updated successfully');
            } else {
                await API.post('/api/medicines', payload);
                toast.success('Medicine added successfully');
            }
            closeModal();
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || 'Operation failed';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (medicine) => {
        setDeleteTarget(medicine);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            await API.delete(`/api/medicines/${deleteTarget.medicine_id}`);
            toast.success('Medicine deleted');
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || 'Delete failed';
            toast.error(msg);
        } finally {
            setDeleteTarget(null);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading inventory...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Inventory</h1>
                    <p className={styles.subtitle}>{medicines.length} medicines in stock</p>
                </div>
                <button className={styles.addBtn} onClick={openAddModal}>
                    <img src={addIcon} alt="Add" className={styles.addIcon} />
                    Add Medicine
                </button>
            </div>

            <DataTable
                columns={columns}
                data={medicines}
                onEdit={openEditModal}
                onDelete={handleDelete}
                searchPlaceholder="Search medicines by name, category..."
            />

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit Medicine' : 'Add Medicine'}
            >
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>Medicine Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Paracetamol 500mg"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Category *</label>
                        <input
                            type="text"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            placeholder="e.g. Tablets, Syrup, Capsules"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>Price (₹) *</label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Stock Quantity *</label>
                            <input
                                type="number"
                                name="stock_quantity"
                                value={form.stock_quantity}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>Expiry Date *</label>
                            <input
                                type="date"
                                name="expiry_date"
                                value={form.expiry_date}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Vendor</label>
                            <select
                                name="vendor_id"
                                value={form.vendor_id}
                                onChange={handleChange}
                                className={styles.input}
                            >
                                <option value="">— No Vendor —</option>
                                {vendors.map((v) => (
                                    <option key={v.vendor_id} value={v.vendor_id}>
                                        {v.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={submitting}
                        >
                            {submitting ? 'Saving...' : editing ? 'Update' : 'Add Medicine'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete Medicine"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default Inventory;

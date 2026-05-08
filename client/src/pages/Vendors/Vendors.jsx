import { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable/DataTable';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import styles from './Vendors.module.css';
import addIcon from '../../assets/light-icons/add.png';

const emptyForm = {
    name: '',
    contact_person: '',
    phone: '',
    email: '',
};

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await API.get('/api/vendors');
            setVendors(res.data);
        } catch (error) {
            toast.error('Failed to load vendors');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { key: 'name', label: 'Company Name' },
        {
            key: 'contact_person',
            label: 'Contact Person',
            render: (val) => val || '—',
        },
        {
            key: 'phone',
            label: 'Phone',
            render: (val) => val || '—',
        },
        {
            key: 'email',
            label: 'Email',
            render: (val) => val || '—',
        },
    ];

    const openAddModal = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEditModal = (vendor) => {
        setEditing(vendor);
        setForm({
            name: vendor.name,
            contact_person: vendor.contact_person || '',
            phone: vendor.phone || '',
            email: vendor.email || '',
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

        if (!form.name) {
            toast.error('Vendor name is required');
            return;
        }

        setSubmitting(true);

        const payload = {
            name: form.name,
            contact_person: form.contact_person || null,
            phone: form.phone || null,
            email: form.email || null,
        };

        try {
            if (editing) {
                await API.put(`/api/vendors/${editing.vendor_id}`, payload);
                toast.success('Vendor updated successfully');
            } else {
                await API.post('/api/vendors', payload);
                toast.success('Vendor added successfully');
            }
            closeModal();
            fetchVendors();
        } catch (error) {
            const msg = error.response?.data?.message || 'Operation failed';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (vendor) => {
        setDeleteTarget(vendor);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            await API.delete(`/api/vendors/${deleteTarget.vendor_id}`);
            toast.success('Vendor deleted');
            fetchVendors();
        } catch (error) {
            const msg = error.response?.data?.message || 'Delete failed';
            toast.error(msg);
        } finally {
            setDeleteTarget(null);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading vendors...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Vendors</h1>
                    <p className={styles.subtitle}>{vendors.length} suppliers registered</p>
                </div>
                <button className={styles.addBtn} onClick={openAddModal}>
                    <img src={addIcon} alt="Add" className={styles.addIcon} />
                    Add Vendor
                </button>
            </div>

            <DataTable
                columns={columns}
                data={vendors}
                onEdit={openEditModal}
                onDelete={handleDelete}
                searchPlaceholder="Search vendors by name, contact..."
            />

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit Vendor' : 'Add Vendor'}
            >
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>Company Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Sun Pharma, Cipla Ltd"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Contact Person</label>
                        <input
                            type="text"
                            name="contact_person"
                            value={form.contact_person}
                            onChange={handleChange}
                            placeholder="e.g. Rajesh Kumar"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="e.g. +91 98765 43210"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="e.g. vendor@company.com"
                                className={styles.input}
                            />
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
                            {submitting ? 'Saving...' : editing ? 'Update' : 'Add Vendor'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete Vendor"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default Vendors;

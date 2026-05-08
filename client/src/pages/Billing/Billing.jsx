import { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import styles from './Billing.module.css';
import searchIcon from '../../assets/light-icons/search.png';
import cartIcon from '../../assets/light-icons/cart.png';
import downloadIcon from '../../assets/light-icons/download.png';

const Billing = () => {
    const [medicines, setMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);
    const [lastSale, setLastSale] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [medsRes, salesRes] = await Promise.all([
                API.get('/api/medicines'),
                API.get('/api/sales'),
            ]);
            setMedicines(medsRes.data);
            setRecentSales(salesRes.data.slice(0, 10));
        } catch (error) {
            console.error('Failed to load billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMedicines = searchTerm.length >= 2
        ? medicines.filter(
            (m) =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const addToCart = (medicine) => {
        const existing = cart.find((item) => item.medicine_id === medicine.medicine_id);

        if (existing) {
            if (existing.quantity >= medicine.stock_quantity) {
                toast.error(`Only ${medicine.stock_quantity} units available for "${medicine.name}"`);
                return;
            }
            setCart(
                cart.map((item) =>
                    item.medicine_id === medicine.medicine_id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            if (medicine.stock_quantity <= 0) {
                toast.error(`"${medicine.name}" is out of stock`);
                return;
            }
            setCart([
                ...cart,
                {
                    medicine_id: medicine.medicine_id,
                    name: medicine.name,
                    price: parseFloat(medicine.price),
                    quantity: 1,
                    stock_quantity: medicine.stock_quantity,
                },
            ]);
        }

        setSearchTerm('');
    };

    const updateQuantity = (medicineId, newQty) => {
        if (newQty < 1) {
            removeFromCart(medicineId);
            return;
        }

        const item = cart.find((i) => i.medicine_id === medicineId);
        if (newQty > item.stock_quantity) {
            toast.error(`Only ${item.stock_quantity} units available`);
            return;
        }

        setCart(
            cart.map((i) =>
                i.medicine_id === medicineId ? { ...i, quantity: newQty } : i
            )
        );
    };

    const removeFromCart = (medicineId) => {
        setCart(cart.filter((i) => i.medicine_id !== medicineId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        setCheckingOut(true);

        const payload = {
            sale_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            items: cart.map((item) => ({
                medicine_id: item.medicine_id,
                quantity: item.quantity,
            })),
        };

        try {
            const res = await API.post('/api/sales', payload);
            toast.success('Sale recorded successfully!');

            // Store sale data for PDF
            const saleInfo = {
                saleId: res.data.saleId,
                date: new Date().toLocaleDateString(),
                items: cart.map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    total: item.price * item.quantity,
                })),
                totalAmount: totalAmount,
            };

            setLastSale(saleInfo);

            // Generate PDF invoice
            try {
                generateInvoicePDF(saleInfo);
            } catch (pdfError) {
                console.error('PDF generation failed:', pdfError);
                toast.error('Sale saved but PDF failed — use Download button');
            }

            setCart([]);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || 'Checkout failed';
            toast.error(msg);
        } finally {
            setCheckingOut(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading billing...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Billing</h1>
                <p className={styles.subtitle}>Point of Sale</p>
            </div>

            <div className={styles.billingLayout}>
                {/* Left Side — Search & Cart */}
                <div className={styles.cartSection}>
                    {/* Medicine Search */}
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchBar}>
                            <img src={searchIcon} alt="Search" className={styles.searchIcon} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search medicine to add..."
                                className={styles.searchInput}
                            />
                        </div>

                        {filteredMedicines.length > 0 && (
                            <div className={styles.dropdown}>
                                {filteredMedicines.map((med) => (
                                    <div
                                        key={med.medicine_id}
                                        className={styles.dropdownItem}
                                        onClick={() => addToCart(med)}
                                    >
                                        <div className={styles.dropdownInfo}>
                                            <span className={styles.dropdownName}>{med.name}</span>
                                            <span className={styles.dropdownMeta}>
                                                {med.category} · Stock: {med.stock_quantity}
                                            </span>
                                        </div>
                                        <span className={styles.dropdownPrice}>
                                            ₹{parseFloat(med.price).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Table */}
                    <div className={styles.cartTableWrap}>
                        <div className={styles.cartHeader}>
                            <img src={cartIcon} alt="Cart" className={styles.cartHeaderIcon} />
                            <span>Cart ({cart.length} items)</span>
                        </div>

                        {cart.length === 0 ? (
                            <div className={styles.emptyCart}>
                                Search and add medicines to begin billing
                            </div>
                        ) : (
                            <table className={styles.cartTable}>
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th>Subtotal</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item) => (
                                        <tr key={item.medicine_id}>
                                            <td className={styles.cartMedName}>{item.name}</td>
                                            <td>₹{item.price.toFixed(2)}</td>
                                            <td>
                                                <div className={styles.qtyControl}>
                                                    <button
                                                        className={styles.qtyBtn}
                                                        onClick={() => updateQuantity(item.medicine_id, item.quantity - 1)}
                                                    >
                                                        −
                                                    </button>
                                                    <span className={styles.qtyValue}>{item.quantity}</span>
                                                    <button
                                                        className={styles.qtyBtn}
                                                        onClick={() => updateQuantity(item.medicine_id, item.quantity + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className={styles.subtotal}>
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </td>
                                            <td>
                                                <button
                                                    className={styles.removeBtn}
                                                    onClick={() => removeFromCart(item.medicine_id)}
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Checkout Footer */}
                    {cart.length > 0 && (
                        <div className={styles.checkoutBar}>
                            <div className={styles.totalSection}>
                                <span className={styles.totalLabel}>Total Amount</span>
                                <span className={styles.totalValue}>₹{totalAmount.toFixed(2)}</span>
                            </div>
                            <button
                                className={styles.checkoutBtn}
                                onClick={handleCheckout}
                                disabled={checkingOut}
                            >
                                <img src={downloadIcon} alt="" className={styles.checkoutIcon} />
                                {checkingOut ? 'Processing...' : 'Checkout & Generate Invoice'}
                            </button>
                        </div>
                    )}

                    {/* Last Sale — Download Invoice Again */}
                    {lastSale && cart.length === 0 && (
                        <div className={styles.lastSaleBar}>
                            <div className={styles.lastSaleInfo}>
                                <span className={styles.lastSaleLabel}>✅ Last Sale — Invoice #{lastSale.saleId}</span>
                                <span className={styles.lastSaleAmount}>₹{lastSale.totalAmount.toFixed(2)}</span>
                            </div>
                            <button
                                className={styles.downloadBtn}
                                onClick={() => generateInvoicePDF(lastSale)}
                            >
                                <img src={downloadIcon} alt="" className={styles.downloadBtnIcon} />
                                Download Invoice PDF
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side — Recent Sales */}
                <div className={styles.salesSection}>
                    <h2 className={styles.salesTitle}>Recent Sales</h2>
                    {recentSales.length === 0 ? (
                        <div className={styles.emptySales}>No sales recorded yet</div>
                    ) : (
                        <div className={styles.salesList}>
                            {recentSales.map((sale) => (
                                <div key={sale.sale_id} className={styles.saleCard}>
                                    <div className={styles.saleInfo}>
                                        <span className={styles.saleId}>#{sale.sale_id}</span>
                                        <span className={styles.saleDate}>
                                            {new Date(sale.sale_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={styles.saleAmount}>
                                        ₹{parseFloat(sale.total_amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Billing;

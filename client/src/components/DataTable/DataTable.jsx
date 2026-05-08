import { useState } from 'react';
import styles from './DataTable.module.css';
import searchIcon from '../../assets/light-icons/search.png';

const DataTable = ({ columns, data, onEdit, onDelete, searchPlaceholder = 'Search...' }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter((row) =>
        columns.some((col) => {
            const val = row[col.key];
            return val && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
    );

    return (
        <div className={styles.container}>
            <div className={styles.searchBar}>
                <img src={searchIcon} alt="Search" className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className={styles.th}>{col.label}</th>
                            ))}
                            {(onEdit || onDelete) && <th className={styles.th}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className={styles.empty}>
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((row, idx) => (
                                <tr key={row.id || idx} className={styles.row}>
                                    {columns.map((col) => (
                                        <td key={col.key} className={styles.td}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td className={styles.td}>
                                            <div className={styles.actions}>
                                                {onEdit && (
                                                    <button className={styles.editBtn} onClick={() => onEdit(row)}>
                                                        Edit
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button className={styles.deleteBtn} onClick={() => onDelete(row)}>
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;

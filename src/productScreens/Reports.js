import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";
import { Calendar, Download, Filter, X } from 'lucide-react';

const ReportsManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    customerName: true,
    customerPhone: true,
    services: true,
    products: true,
    subtotal: true,
    gst: true,
    total: true,
    paymentMethod: true
  });
  
  // States for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State for checkbox filters with headers
  const [checkedFilters, setCheckedFilters] = useState({
    customerName: new Set(),
    customerPhone: new Set(),
    services: new Set(),
    products: new Set(),
    paymentMethod: new Set(),
  });

  // State for selected column headers
  const [selectedHeaders, setSelectedHeaders] = useState({
    customerName: false,
    customerPhone: false,
    services: false,
    products: false,
    paymentMethod: false,
  });

  // State for unique values in each column
  const [uniqueValues, setUniqueValues] = useState({
    customerName: new Set(),
    customerPhone: new Set(),
    services: new Set(),
    products: new Set(),
    paymentMethod: new Set(),
  });

  const [filterData, setFilterData] = useState({
    startDate: '',
    endDate: '',
    customerName: '',
    customerPhone: '',
    services: '',
    products: '',
    paymentMethod: '',
    minSubtotal: '',
    maxSubtotal: '',
    minGst: '',
    maxGst: '',
    minTotal: '',
    maxTotal: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Column definitions
  const columns = [
    { key: 'date', label: 'Date', filterable: true, type: 'date' },
    { key: 'customerName', label: 'Customer Name', filterable: true, type: 'checkbox' },
    { key: 'customerPhone', label: 'Customer Phone', filterable: true, type: 'checkbox' },
    { key: 'services', label: 'Services', filterable: true, type: 'checkbox' },
    { key: 'products', label: 'Products', filterable: true, type: 'checkbox' },
    { key: 'subtotal', label: 'Subtotal', filterable: true, type: 'number' },
    { key: 'gst', label: 'GST', filterable: true, type: 'number' },
    { key: 'total', label: 'Total', filterable: true, type: 'number' },
    { key: 'paymentMethod', label: 'Payment Method', filterable: true, type: 'checkbox' }
  ];

  useEffect(() => {
    fetchData();
  }, [currentPage, filterData, itemsPerPage]);

  useEffect(() => {
    if (transactions.length > 0) {
      updateUniqueValues();
    }
  }, [transactions]);

  const updateUniqueValues = () => {
    const newUniqueValues = {
      customerName: new Set(transactions.map(t => t.customer.name)),
      customerPhone: new Set(transactions.map(t => t.customer.phoneNumber)),
      services: new Set(transactions.flatMap(t => t.services.map(s => s.name))),
      products: new Set(transactions.flatMap(t => t.products.map(p => p.name))),
      paymentMethod: new Set(transactions.map(t => t.payment.method))
    };
    setUniqueValues(newUniqueValues);
  };

  const handleHeaderCheckboxChange = (column) => {
    setSelectedHeaders(prev => {
      const newHeaders = { ...prev, [column]: !prev[column] };
      
      // If header is unchecked, clear all its values
      if (!newHeaders[column]) {
        setCheckedFilters(prev => ({
          ...prev,
          [column]: new Set()
        }));
        setFilterData(prev => ({
          ...prev,
          [column]: ''
        }));
      }
      
      return newHeaders;
    });
  };

  const handleCheckboxFilterChange = (column, value) => {
    // Only allow selection if header is checked
    if (!selectedHeaders[column]) return;

    setCheckedFilters(prev => {
      const newSet = new Set(prev[column]);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return { ...prev, [column]: newSet };
    });
    
    // Update filterData based on checked values
    setFilterData(prev => ({
      ...prev,
      [column]: Array.from(checkedFilters[column]).join(',')
    }));
    setCurrentPage(1);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const transactionParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: filterData.sortBy,
        sortOrder: filterData.sortOrder,
        ...Object.entries(filterData).reduce((acc, [key, value]) => {
          if (value && key !== 'sortBy' && key !== 'sortOrder') {
            acc[key] = value;
          }
          return acc;
        }, {})
      });

      const transactionsResponse = await fetch(`http://localhost:5001/api/reports/transactions?${transactionParams}`);
      if (transactionsResponse.ok) {
        const data = await transactionsResponse.json();
        setTransactions(data.transactions);
        setTotalPages(Math.ceil(data.pagination.total / itemsPerPage));
        setTotalItems(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setFilterData(prev => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearAllFilters = () => {
    setFilterData({
      startDate: '',
      endDate: '',
      customerName: '',
      customerPhone: '',
      services: '',
      products: '',
      paymentMethod: '',
      minSubtotal: '',
      maxSubtotal: '',
      minGst: '',
      maxGst: '',
      minTotal: '',
      maxTotal: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCheckedFilters({
      customerName: new Set(),
      customerPhone: new Set(),
      services: new Set(),
      products: new Set(),
      paymentMethod: new Set(),
    });
    setSelectedHeaders({
      customerName: false,
      customerPhone: false,
      services: false,
      products: false,
      paymentMethod: false,
    });
    setCurrentPage(1);
  };

  // Filter transactions based on selected headers and values
  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      for (const column in selectedHeaders) {
        if (selectedHeaders[column] && checkedFilters[column].size > 0) {
          let columnValue;
          switch (column) {
            case 'customerName':
              columnValue = transaction.customer.name;
              break;
            case 'customerPhone':
              columnValue = transaction.customer.phoneNumber;
              break;
            case 'services':
              columnValue = transaction.services.map(s => s.name);
              return columnValue.some(v => checkedFilters[column].has(v));
            case 'products':
              columnValue = transaction.products.map(p => p.name);
              return columnValue.some(v => checkedFilters[column].has(v));
            case 'paymentMethod':
              columnValue = transaction.payment.method;
              break;
            default:
              columnValue = '';
          }
          if (!checkedFilters[column].has(columnValue)) {
            return false;
          }
        }
      }
      return true;
    });
  };

  const renderFilterDropdown = () => (
    <div className="position-absolute bg-white shadow-lg p-3 rounded" 
         style={{ zIndex: 1000, minWidth: '300px', maxHeight: '500px', overflowY: 'auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Filters</h6>
        <button className="btn btn-sm btn-link text-danger" onClick={() => setShowFilterDropdown(false)}>
          <X size={18} />
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="mb-3">
        <h6 className="mb-2">Date Range</h6>
        <div className="row g-2">
          <div className="col-6">
            <input
              type="date"
              className="form-control form-control-sm"
              name="startDate"
              value={filterData.startDate}
              onChange={handleFilterChange}
              placeholder="Start Date"
            />
          </div>
          <div className="col-6">
            <input
              type="date"
              className="form-control form-control-sm"
              name="endDate"
              value={filterData.endDate}
              onChange={handleFilterChange}
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Checkbox Filters with Headers */}
      {columns.filter(col => col.type === 'checkbox').map(column => (
        <div key={column.key} className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <input
              type="checkbox"
              className="form-check-input me-2"
              checked={selectedHeaders[column.key]}
              onChange={() => handleHeaderCheckboxChange(column.key)}
            />
            <h6 className="mb-0">{column.label}</h6>
          </div>
          <div className="d-flex flex-column gap-1" 
               style={{ 
                 maxHeight: '150px', 
                 overflowY: 'auto',
                 opacity: selectedHeaders[column.key] ? 1 : 0.5,
                 pointerEvents: selectedHeaders[column.key] ? 'auto' : 'none'
               }}>
            {Array.from(uniqueValues[column.key] || []).map(value => (
              <div key={value} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`${column.key}-${value}`}
                  checked={checkedFilters[column.key].has(value)}
                  onChange={() => handleCheckboxFilterChange(column.key, value)}
                />
                <label className="form-check-label" htmlFor={`${column.key}-${value}`}>
                  {value}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Number Range Filters */}
      {columns.filter(col => col.type === 'number').map(column => (
        <div key={column.key} className="mb-3">
          <h6 className="mb-2">{column.label}</h6>
          <div className="row g-2">
            <div className="col-6">
              <input
                type="number"
                className="form-control form-control-sm"
                name={`min${column.key.charAt(0).toUpperCase() + column.key.slice(1)}`}
                value={filterData[`min${column.key.charAt(0).toUpperCase() + column.key.slice(1)}`]}
                onChange={handleFilterChange}
                placeholder="Min"
              />
            </div>
            <div className="col-6">
              <input
                type="number"
                className="form-control form-control-sm"
                name={`max${column.key.charAt(0).toUpperCase() + column.key.slice(1)}`}
                value={filterData[`max${column.key.charAt(0).toUpperCase() + column.key.slice(1)}`]}
                onChange={handleFilterChange}
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isSidebarOpen} isSidebar="Reports" />
      <div id="page-content-wrapper">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
            <h1 className="mb-0">Reports</h1>
            <div className="d-flex gap-2 position-relative">
              {/* Column Visibility Button */}
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowColumnFilter(!showColumnFilter)}
              >
                <Filter size={18} className="me-2" />
                Column Visibility
              </button>

              {/* Filter Button */}
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter size={18} className="me-2" />
                Filters
              </button>

              {/* Clear Filters Button */}
              <button
                className="btn btn-outline-secondary"
                style={{color: "white"}}
                onClick={clearAllFilters}
              >
                <X size={18} className="me-2" />
                Clear Filters
              </button>

              {showColumnFilter && (
                <div className="position-absolute bg-white shadow-lg p-3 rounded" 
                     style={{ top: '100%', right: 0, zIndex: 1000, minWidth: '200px' }}>
                  <h6 className="mb-3">Show/Hide Columns</h6>
                  {columns.map(column => (
                    <div key={column.key} className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`column-${column.key}`}
                        checked={visibleColumns[column.key]}
                        onChange={() => setVisibleColumns(prev => ({
                          ...prev,
                          [column.key]: !prev[column.key]
                        }))}
                      />
                      <label className="form-check-label" htmlFor={`column-${column.key}`}>
                        {column.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {showFilterDropdown && renderFilterDropdown() }
            </div>
          </div>

          <div className="bg-secondary p-4">
            {/* Transactions Table */}
            <div className="table-responsive">
              {getFilteredTransactions().length > 0 ? (
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      {columns.map(column => (
                        visibleColumns[column.key] && (
                          <th key={column.key}>
                            <div 
                              onClick={() => handleSort(column.key)} 
                              style={{ cursor: 'pointer' }}
                              className="mb-2"
                            >
                              {column.label} {filterData.sortBy === column.key && (filterData.sortOrder === 'asc' ? '↑' : '↓')}
                            </div>
                          </th>
                        )
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTransactions().map(transaction => (
                      <tr key={transaction.id}>
                        {visibleColumns.date && (
                          <td>{formatDate(transaction.date)}</td>
                        )}
                        {visibleColumns.customerName && (
                          <td>{transaction.customer.name}</td>
                        )}
                        {visibleColumns.customerPhone && (
                          <td>{transaction.customer.phoneNumber}</td>
                        )}
                        {visibleColumns.services && (
                          <td>
                            {transaction.services.map((service, i) => (
                              <div key={i}>
                                {service.name} ({formatCurrency(service.finalPrice)})
                                {service.discount > 0 && (
                                  <span className="text-warning"> (-{formatCurrency(service.discount)})</span>
                                )}
                              </div>
                            ))}
                          </td>
                        )}
                        {visibleColumns.products && (
                          <td>
                            {transaction.products.map((product, i) => (
                              <div key={i}>
                                {product.name} x{product.quantity} ({formatCurrency(product.finalPrice)})
                                {product.discount > 0 && (
                                  <span className="text-warning"> (-{formatCurrency(product.discount)})</span>
                                )}
                              </div>
                            ))}
                          </td>
                        )}
                        {visibleColumns.subtotal && (
                          <td>{formatCurrency(transaction.payment.subtotal)}</td>
                        )}
                        {visibleColumns.gst && (
                          <td>{formatCurrency(transaction.payment.gst)}</td>
                        )}
                        {visibleColumns.total && (
                          <td>{formatCurrency(transaction.payment.total)}</td>
                        )}
                        {visibleColumns.paymentMethod && (
                          <td>{transaction.payment.method}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="alert alert-info text-center">
                  No transactions found for the selected filters
                </div>
              )}
            </div>

            {/* Pagination */}
            {getFilteredTransactions().length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="d-flex align-items-center">
                  <span className="me-2">Show</span>
                  <select
                    className="form-select form-select-sm"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{ width: 'auto' }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="ms-2">entries</span>
                </div>
                <div>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      const showPage = pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

                      if (!showPage && pageNumber === currentPage - 2) {
                        return <li key={pageNumber} className="page-item disabled"><span className="page-link">...</span></li>;
                      }

                      if (!showPage && pageNumber === currentPage + 2) {
                        return <li key={pageNumber} className="page-item disabled"><span className="page-link">...</span></li>;
                      }

                      if (!showPage) return null;

                      return (
                        <li
                          key={pageNumber}
                          className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      );
                    })}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper function to format date
const formatDate = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default ReportsManagement;


import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";
import { Calendar, Download } from 'lucide-react';

const ReportsManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // States for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [filterData, setFilterData] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, filterData, itemsPerPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch summary
      let summaryParams = new URLSearchParams();
      if (filterData.startDate) summaryParams.append('startDate', filterData.startDate);
      if (filterData.endDate) summaryParams.append('endDate', filterData.endDate);
      
      const summaryResponse = await fetch(`http://localhost:5001/api/reports/summary?${summaryParams}`);
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
      }

      // Fetch transactions
      const transactionParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: filterData.sortBy,
        sortOrder: filterData.sortOrder,
        ...(filterData.startDate && { startDate: filterData.startDate }),
        ...(filterData.endDate && { endDate: filterData.endDate }),
        ...(filterData.paymentMethod && { paymentMethod: filterData.paymentMethod }),
        ...(filterData.minAmount && { minAmount: filterData.minAmount }),
        ...(filterData.maxAmount && { maxAmount: filterData.maxAmount })
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

  const handleRowsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const generateReport = async (period) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/reports/generate/${period}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to generate report');

      alert('Report generated successfully');
      fetchData();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isSidebarOpen} isSidebar="Reports" />
      <div id="page-content-wrapper">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="container-fluid">
          <h1 className="mt-4">Reports</h1>
          <div className="bg-secondary p-4">
            {/* Filter Section */}
            <div className="row mb-4 g-3">
              <div className="col-md-3">
                <div className="form-floating">
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    name="startDate"
                    value={filterData.startDate}
                    onChange={handleFilterChange}
                  />
                  <label>Start Date</label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-floating">
                  <input
                    type="date"
                    className="form-control"
                    id="endDate"
                    name="endDate"
                    value={filterData.endDate}
                    onChange={handleFilterChange}
                  />
                  <label>End Date</label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="paymentMethod"
                    name="paymentMethod"
                    value={filterData.paymentMethod}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Methods</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                  <label>Payment Method</label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="btn-group w-100">
                  <button className="btn btn-primary" onClick={() => generateReport('daily')}>
                    Daily
                  </button>
                  <button className="btn btn-primary" onClick={() => generateReport('weekly')}>
                    Weekly
                  </button>
                  <button className="btn btn-primary" onClick={() => generateReport('monthly')}>
                    Monthly
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="row mb-4 g-3">
              <div className="col-md-3">
                <div className="form-floating">
                  <input
                    type="number"
                    className="form-control"
                    id="minAmount"
                    name="minAmount"
                    value={filterData.minAmount}
                    onChange={handleFilterChange}
                    placeholder="Min Amount"
                  />
                  <label>Min Amount</label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-floating">
                  <input
                    type="number"
                    className="form-control"
                    id="maxAmount"
                    name="maxAmount"
                    value={filterData.maxAmount}
                    onChange={handleFilterChange}
                    placeholder="Max Amount"
                  />
                  <label>Max Amount</label>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            {/* {summary ? (
              <div className="row mb-4 g-3">
                <div className="col-md-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Revenue</h6>
                      <p className="card-text">
                        <div>Services: ₹{summary.services.revenue}</div>
                        <div>Products: ₹{summary.products.revenue}</div>
                        <div className="fw-bold">Total: ₹{summary.totalRevenue}</div>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Transactions</h6>
                      <p className="card-text">
                        <div>Total: {summary.transactions.total}</div>
                        <div>Average: ₹{summary.transactions.average}</div>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Services & Products</h6>
                      <p className="card-text">
                        <div>Services: {summary.services.count}</div>
                        <div>Products: {summary.products.count}</div>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Payments</h6>
                      <p className="card-text">
                        <div>Cash: ₹{summary.payments.cash}</div>
                        <div>Card: ₹{summary.payments.card}</div>
                        <div>UPI: ₹{summary.payments.upi}</div>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-info text-center mb-4">
                No summary data available for the selected filters
              </div>
            )} */}

            {/* Transactions Table */}
            <div className="table-responsive">
              {transactions.length > 0 ? (
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                        Date {filterData.sortBy === 'createdAt' && (filterData.sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Customer</th>
                      <th>Services</th>
                      <th>Products</th>
                      <th onClick={() => handleSort('payment.total')} style={{ cursor: 'pointer' }}>
                        Amount {filterData.sortBy === 'payment.total' && (filterData.sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Payment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td>{new Date(transaction.date).toLocaleString()}</td>
                        <td>
                          <div>{transaction.customer.name}</div>
                          <small>{transaction.customer.phoneNumber}</small>
                        </td>
                        <td>
                          {transaction.services.map((service, i) => (
                            <div key={i}>
                              {service.name} (₹{service.finalPrice})
                              {service.discount > 0 && <span className="text-warning"> (-₹{service.discount})</span>}
                            </div>
                          ))}
                        </td>
                        <td>
                          {transaction.products.map((product, i) => (
                            <div key={i}>
                              {product.name} x{product.quantity} (₹{product.finalPrice})
                              {product.discount > 0 && <span className="text-warning"> (-₹{product.discount})</span>}
                            </div>
                          ))}
                        </td>
                        <td>
                          <div>Subtotal: ₹{transaction.payment.subtotal}</div>
                          <div>GST: ₹{transaction.payment.gst}</div>
                          {transaction.payment.discount > 0 && (
                            <div>Discount: ₹{transaction.payment.discount}</div>
                          )}
                          <div className="fw-bold">Total: ₹{transaction.payment.total}</div>
                        </td>
                        <td>{transaction.payment.method}</td>
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
            {transactions.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="d-flex align-items-center">
                  <span className="me-2">Show</span>
                  <select
                    className="form-select form-select-sm"
                    value={itemsPerPage}
                    onChange={handleRowsPerPageChange}
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

    {/* Export Actions */}
    {/* <div className="position-fixed bottom-4 end-4" style={{ zIndex: 1000 }}>
      <div className="btn-group">
        <button 
          className="btn btn-primary"
          onClick={() => generateReport('excel')}
          disabled={loading || transactions.length === 0}
        >
          <Download className="me-2" size={18} />
          Export Excel
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => generateReport('pdf')}
          disabled={loading || transactions.length === 0}
        >
          <Download className="me-2" size={18} />
          Export PDF
        </button>
      </div>
    </div> */}
  </div>
);
};

export default ReportsManagement;
                      
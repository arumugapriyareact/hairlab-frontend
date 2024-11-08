import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";

const ReportsManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // States for pagination, search, and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching reports...');
      const response = await fetch('http://localhost:5001/api/reports');
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error response body:', errorBody);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
      const data = await response.json();
      console.log('Reports fetched successfully:', data);
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort data
  const filteredReports = reports.length>0 ?
  reports.filter(report => {
    const searchFields = [
      report.phoneNumber,
      report.customerName,
      report.services.map(s => s.name).join(' '),
      report.paymentMethod,
      new Date(report.date).toLocaleString()
    ].join(' ').toLowerCase();

    return searchFields.includes(searchTerm.toLowerCase());
  }):[];

  // Sort filtered data
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle numeric values
    if (['subtotal', 'gst', 'grandTotal', 'cashback', 'finalTotal', 'amountPaid'].includes(sortConfig.key)) {
      aValue = Number(aValue);
      bValue = Number(bValue);
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle date
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc' 
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    }

    // Handle string values
    aValue = aValue?.toString() || '';
    bValue = bValue?.toString() || '';
    
    return sortConfig.direction === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Get paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key 
        ? prevConfig.direction === 'asc' ? 'desc' : 'asc'
        : 'asc'
    }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isSidebarOpen} isSidebar={"Reports"}/>
      <div id="page-content-wrapper">
        <Header toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <h1 className="mt-4">Reports</h1>
          <div className="bg-secondary p-4">
            {/* Search Section */}
            <div className="row mb-4">
              <div className="col-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Table Section */}
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('phoneNumber')} style={{ cursor: 'pointer' }}>
                      Phone Number {sortConfig.key === 'phoneNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('customerName')} style={{ cursor: 'pointer' }}>
                      Customer Name {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Services</th>
                    <th onClick={() => handleSort('subtotal')} style={{ cursor: 'pointer' }}>
                      Subtotal {sortConfig.key === 'subtotal' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('gst')} style={{ cursor: 'pointer' }}>
                      GST {sortConfig.key === 'gst' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('grandTotal')} style={{ cursor: 'pointer' }}>
                      Grand Total {sortConfig.key === 'grandTotal' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('cashback')} style={{ cursor: 'pointer' }}>
                      Cashback {sortConfig.key === 'cashback' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('finalTotal')} style={{ cursor: 'pointer' }}>
                      Final Total {sortConfig.key === 'finalTotal' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('paymentMethod')} style={{ cursor: 'pointer' }}>
                      Payment Method {sortConfig.key === 'paymentMethod' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('amountPaid')} style={{ cursor: 'pointer' }}>
                      Amount Paid {sortConfig.key === 'amountPaid' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="text-center">No reports found</td>
                    </tr>
                  ) : (
                    currentItems.map((report, index) => (
                      <tr key={index}>
                        <td>{report.phoneNumber}</td>
                        <td>{report.customerName}</td>
                        <td>{report.services.map(s => s.name).join(', ')}</td>
                        <td className="text-end">₹{report.subtotal.toFixed(2)}</td>
                        <td className="text-end">₹{report.gst.toFixed(2)}</td>
                        <td className="text-end">₹{report.grandTotal.toFixed(2)}</td>
                        <td className="text-end">₹{report.cashback.toFixed(2)}</td>
                        <td className="text-end">₹{report.finalTotal.toFixed(2)}</td>
                        <td>{report.paymentMethod}</td>
                        <td className="text-end">₹{report.amountPaid.toFixed(2)}</td>
                        <td>{new Date(report.date).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Section */}
            {currentItems.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedReports.length)} of {sortedReports.length} entries
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

export default ReportsManagement;
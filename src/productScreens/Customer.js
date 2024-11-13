import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";

const CustomerManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('add-customer');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    address: '',
    birthdate: '',
    gender: '',
    notes: ''
  });

  // Updated States for pagination, search, and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Changed to state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    gender: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeTab === 'list-customers') {
      fetchCustomers();
    }
  }, [activeTab]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('Failed to fetch customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort data
  const filteredCustomers = customers.filter(customer => {
    const searchFields = [
      customer.firstName,
      customer.lastName,
      customer.phoneNumber,
      customer.email,
      customer.gender,
      customer.address
    ].join(' ').toLowerCase();

    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return customer[key]?.toString().toLowerCase().includes(value.toLowerCase());
    });

    return matchesSearch && matchesFilters;
  });

  // Sort filtered data
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';

    if (sortConfig.direction === 'asc') {
      return aValue.localeCompare(bValue);
    }
    return bValue.localeCompare(aValue);
  });

  // Get paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);

  // Add handleRowsPerPageChange function
  const handleRowsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key
        ? prevConfig.direction === 'asc' ? 'desc' : 'asc'
        : 'asc'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const url = formData._id
        ? `http://localhost:5001/api/customers/${formData._id}`
        : 'http://localhost:5001/api/customers';

      const response = await fetch(url, {
        method: formData._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save customer');
      }

      alert(`Customer ${formData._id ? 'updated' : 'created'} successfully!`);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        address: '',
        birthdate: '',
        gender: '',
        notes: ''
      });
      setActiveTab('list-customers');
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert(error.message || 'Failed to save the customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setActiveTab('add-customer');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/customers/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete customer');
        alert('Customer deleted successfully.');
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete the customer. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isSidebarOpen} isSidebar={"Customer"} />
      <div id="page-content-wrapper">
        <Header toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <h1 className="mt-4">Customer Management</h1>

          <ul className="nav nav-tabs" id="customerTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'add-customer' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-customer')}
              >
                {formData._id ? 'Edit Customer' : 'Add Customer'}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'list-customers' ? 'active' : ''}`}
                onClick={() => setActiveTab('list-customers')}
              >
                Customers List
              </button>
            </li>
          </ul>

          <div className="tab-content mt-3" id="customerTabsContent">
            {/* Add/Edit Customer Form */}
            <div className={`tab-pane fade ${activeTab === 'add-customer' ? 'show active' : ''}`}>
              <div className="row">
                <div className="col-lg-8">
                  <div className="bg-secondary p-4">
                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="text"
                              className={`form-control bg-transparent ${errors.firstName ? 'is-invalid' : ''}`}
                              id="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="First Name"
                            />
                            <label htmlFor="firstName">First Name</label>
                            {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="text"
                              className={`form-control bg-transparent ${errors.lastName ? 'is-invalid' : ''}`}
                              id="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              placeholder="Last Name"
                            />
                            <label htmlFor="lastName">Last Name</label>
                            {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="tel"
                              className={`form-control bg-transparent ${errors.phoneNumber ? 'is-invalid' : ''}`}
                              id="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              placeholder="Phone Number"
                            />
                            <label htmlFor="phoneNumber">Phone Number</label>
                            {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="email"
                              className={`form-control bg-transparent ${errors.email ? 'is-invalid' : ''}`}
                              id="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Email"
                            />
                            <label htmlFor="email">Email (Optional)</label>
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="form-floating">
                            <textarea
                              className="form-control bg-transparent"
                              id="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Address"
                              style={{ height: '100px' }}
                            ></textarea>
                            <label htmlFor="address">Address (Optional)</label>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="date"
                              className="form-control bg-transparent"
                              id="birthdate"
                              value={formData.birthdate}
                              onChange={handleInputChange}
                              placeholder="Birthdate"
                            />
                            <label htmlFor="birthdate">Birthdate (Optional)</label>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <select
                              className="form-select bg-transparent"
                              id="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                            <label htmlFor="gender">Gender (Optional)</label>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="form-floating">
                            <textarea
                              className="form-control bg-transparent"
                              id="notes"
                              value={formData.notes}
                              onChange={handleInputChange}
                              placeholder="Notes"
                              style={{ height: '100px' }}
                            ></textarea>
                            <label htmlFor="notes">Additional Notes (Optional)</label>
                          </div>
                        </div>

                        <div className="col-12">
                          <button
                            className="btn btn-primary w-100 py-3"
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : (formData._id ? 'Update Customer' : 'Create Customer')}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer List */}
            <div className={`tab-pane fade ${activeTab === 'list-customers' ? 'show active' : ''}`}>
              <div className="bg-secondary p-4">
                {/* Search Section */}
                <div className="row mb-4">
                  <div className="col-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search customers..."
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
                        <th onClick={() => handleSort('firstName')} style={{ cursor: 'pointer' }}>
                          First Name {sortConfig.key === 'firstName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('lastName')} style={{ cursor: 'pointer' }}>
                          Last Name {sortConfig.key === 'lastName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('phoneNumber')} style={{ cursor: 'pointer' }}>
                          Phone Number {sortConfig.key === 'phoneNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                          Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('gender')} style={{ cursor: 'pointer' }}>
                        Gender {sortConfig.key === 'gender' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center">No customers found</td>
                        </tr>
                      ) : (
                        currentItems.map(customer => (
                          <tr key={customer._id}>
                            <td>{customer.firstName}</td>
                            <td>{customer.lastName}</td>
                            <td>{customer.phoneNumber}</td>
                            <td>{customer.email}</td>
                            <td>{customer.gender}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => handleEdit(customer)}
                              >
                                <i className="fas fa-edit"></i> Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(customer._id)}
                              >
                                <i className="fas fa-trash"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Updated Pagination Section with Show Entries */}
                {currentItems.length > 0 && (
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
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedCustomers.length)} of {sortedCustomers.length} entries
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
      </div>
    </div>
  );
};

export default CustomerManagement;
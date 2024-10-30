import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";

const StaffManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('add-staff');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    role: '',
    hireDate: '',
    salary: '',
    availability: true,
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const roles = [
    "Hair Stylist",
    "Barber",
    "Colorist",
    "Nail Technician",
    "Esthetician",
    "Massage Therapist",
    "Makeup Artist",
    "Receptionist",
    "Salon Manager",
    "Other"
  ];

  useEffect(() => {
    if (activeTab === 'list-staff') {
      fetchStaff();
    }
  }, [activeTab]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/staff');
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      alert('Failed to fetch staff. Please try again.');
    } finally {
      setLoading(false);
    }
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
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.hireDate) newErrors.hireDate = 'Hire date is required';
    if (!formData.salary) {
      newErrors.salary = 'Salary is required';
    } else if (isNaN(formData.salary) || parseFloat(formData.salary) <= 0) {
      newErrors.salary = 'Please enter a valid salary amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const url = formData._id
        ? `http://localhost:5001/api/staff/${formData._id}`
        : 'http://localhost:5001/api/staff';

      const response = await fetch(url, {
        method: formData._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save staff member');
      }

      alert(`Staff member ${formData._id ? 'updated' : 'created'} successfully!`);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        role: '',
        hireDate: '',
        salary: '',
        availability: true,
        notes: ''
      });
      setActiveTab('list-staff');
      fetchStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert(error.message || 'Failed to save the staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(member => {
    const searchFields = [
      member.firstName,
      member.lastName,
      member.phoneNumber,
      member.email,
      member.role,
      member.salary.toString()
    ].join(' ').toLowerCase();

    return searchFields.includes(searchTerm.toLowerCase());
  });

  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === 'salary') {
      aValue = Number(aValue);
      bValue = Number(bValue);
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (sortConfig.key === 'hireDate') {
      return sortConfig.direction === 'asc'
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    }

    aValue = aValue?.toString() || '';
    bValue = bValue?.toString() || '';
    
    return sortConfig.direction === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedStaff.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key
        ? prevConfig.direction === 'asc' ? 'desc' : 'asc'
        : 'asc'
    }));
  };

  const handleEdit = (member) => {
    setFormData({
      ...member,
      hireDate: new Date(member.hireDate).toISOString().split('T')[0]
    });
    setActiveTab('add-staff');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/staff/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete staff member');
        alert('Staff member deleted successfully.');
        fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Failed to delete the staff member. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAvailabilityChange = async (staffId, availability) => {
    try {
      const response = await fetch(`http://localhost:5001/api/staff/${staffId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability })
      });

      if (!response.ok) throw new Error('Failed to update availability');
      fetchStaff();
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isSidebarOpen} isSidebar={"Staff"} />
      <div id="page-content-wrapper">
        <Header toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <h1 className="mt-4">Staff Management</h1>

          <ul className="nav nav-tabs" id="staffTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'add-staff' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-staff')}
              >
                {formData._id ? 'Edit Staff' : 'Add Staff'}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'list-staff' ? 'active' : ''}`}
                onClick={() => setActiveTab('list-staff')}
              >
                Staff List
              </button>
            </li>
          </ul>

          <div className="tab-content mt-3" id="staffTabsContent">
            <div className={`tab-pane fade ${activeTab === 'add-staff' ? 'show active' : ''}`}>
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
                            <label htmlFor="email">Email</label>
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="form-floating">
                            <select
                              className={`form-select bg-transparent ${errors.role ? 'is-invalid' : ''}`}
                              id="role"
                              value={formData.role}
                              onChange={handleInputChange}
                            >
                              <option value="">Select a role</option>
                              {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                            <label htmlFor="role">Role</label>
                            {errors.role && <div className="invalid-feedback">{errors.role}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="date"
                              className={`form-control bg-transparent ${errors.hireDate ? 'is-invalid' : ''}`}
                              id="hireDate"
                              value={formData.hireDate}
                              onChange={handleInputChange}
                              placeholder="Hire Date"
                            />
                            <label htmlFor="hireDate">Hire Date</label>
                            {errors.hireDate && <div className="invalid-feedback">{errors.hireDate}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="number"
                              className={`form-control bg-transparent ${errors.salary ? 'is-invalid' : ''}`}
                              id="salary"
                              value={formData.salary}
                              onChange={handleInputChange}
                              placeholder="Salary"
                            />
                            <label htmlFor="salary">Salary</label>
                            {errors.salary && <div className="invalid-feedback">{errors.salary}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="availability"
                              checked={formData.availability}
                              onChange={handleInputChange}
                            />
                            <label className="form-check-label text-white" htmlFor="availability">
                              Available
                            </label>
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
                            {loading ? 'Saving...' : (formData._id ? 'Update Staff' : 'Create Staff')}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className={`tab-pane fade ${activeTab === 'list-staff' ? 'show active' : ''}`}>
              <div className="bg-secondary p-4">
                {/* Search Section */}
                <div className="row mb-4">
                  <div className="col-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search staff..."
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
                        <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                          Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('hireDate')} style={{ cursor: 'pointer' }}>
                          Hire Date {sortConfig.key === 'hireDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('salary')} style={{ cursor: 'pointer' }}>
                          Salary {sortConfig.key === 'salary' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Available</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="text-center">No staff members found</td>
                        </tr>
                      ) : (
                        currentItems.map(member => (
                          <tr key={member._id}>
                            <td>{member.firstName}</td>
                            <td>{member.lastName}</td>
                            <td>{member.phoneNumber}</td>
                            <td>{member.email}</td>
                            <td>{member.role}</td>
                            <td>{new Date(member.hireDate).toLocaleDateString()}</td>
                            <td>₹{member.salary.toFixed(2)}</td>
                            <td>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={member.availability}
                                  onChange={(e) => handleAvailabilityChange(member._id, e.target.checked)}
                                />
                              </div>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => handleEdit(member)}
                              >
                                <i className="fas fa-edit"></i> Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(member._id)}
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

                {/* Pagination Section */}
                {currentItems.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedStaff.length)} of {sortedStaff.length} entries
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

export default StaffManagement;
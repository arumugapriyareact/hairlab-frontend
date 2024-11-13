import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";

const UserManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('add-user');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'admin',
    branch: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeTab === 'list-users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData._id && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!formData._id && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
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
        ? `http://localhost:5001/api/users/${formData._id}`
        : 'http://localhost:5001/api/users';
      
      const userData = { ...formData };
      if (formData._id && !userData.password) {
        delete userData.password;
      }

      const response = await fetch(url, {
        method: formData._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save user');
      }

      alert(`User ${formData._id ? 'updated' : 'created'} successfully!`);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'admin',
        branch: ''
      });
      setActiveTab('list-users');
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.message || 'Failed to save the user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchFields = [
      user.firstName,
      user.lastName,
      user.email,
      user.role,
      user.branch,
      `${user.firstName} ${user.lastName}`
    ].join(' ').toLowerCase();

    return searchFields.includes(searchTerm.toLowerCase());
  });

  // Sort filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === 'fullName') {
      aValue = `${a.firstName} ${a.lastName}`;
      bValue = `${b.firstName} ${b.lastName}`;
    }

    return sortConfig.direction === 'asc'
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString());
  });

  // Get paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const handleRowsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key
        ? prevConfig.direction === 'asc' ? 'desc' : 'asc'
        : 'asc'
    }));
  };

  const handleEdit = (user) => {
    setFormData({
      ...user,
      password: '',
      _id: user._id
    });
    setActiveTab('add-user');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/users/${id}`, { 
          method: 'DELETE' 
        });
        if (!response.ok) throw new Error('Failed to delete user');
        alert('User deleted successfully.');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete the user. Please try again.');
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
      <Sidebar isOpen={isSidebarOpen} isSidebar={"Users"} />
      <div id="page-content-wrapper">
        <Header toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <h1 className="mt-4">User Management</h1>

          <ul className="nav nav-tabs" id="userTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'add-user' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-user')}
              >
                {formData._id ? 'Edit User' : 'Add User'}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'list-users' ? 'active' : ''}`}
                onClick={() => setActiveTab('list-users')}
              >
                Users List
              </button>
            </li>
          </ul>

          <div className="tab-content mt-3" id="userTabsContent">
            {/* Add/Edit User Form */}
            <div className={`tab-pane fade ${activeTab === 'add-user' ? 'show active' : ''}`}>
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

                        <div className="col-12">
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

                        <div className="col-12">
                          <div className="form-floating">
                            <input
                              type="password"
                              className={`form-control bg-transparent ${errors.password ? 'is-invalid' : ''}`}
                              id="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Password"
                            />
                            <label htmlFor="password">
                              {formData._id ? 'Password (Leave blank to keep current)' : 'Password'}
                            </label>
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <select
                              className="form-select bg-transparent"
                              id="role"
                              value={formData.role}
                              onChange={handleInputChange}
                            >
                              <option value="admin">Admin</option>
                              <option value="superadmin">Super Admin</option>
                            </select>
                            <label htmlFor="role">Role</label>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="text"
                              className={`form-control bg-transparent ${errors.branch ? 'is-invalid' : ''}`}
                              id="branch"
                              value={formData.branch}
                              onChange={handleInputChange}
                              placeholder="Branch"
                            />
                            <label htmlFor="branch">Branch</label>
                            {errors.branch && <div className="invalid-feedback">{errors.branch}</div>}
                          </div>
                        </div>

                        <div className="col-12">
                          <button 
                            className="btn btn-primary w-100 py-3" 
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : (formData._id ? 'Update User' : 'Create User')}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className={`tab-pane fade ${activeTab === 'list-users' ? 'show active' : ''}`}>
              <div className="bg-secondary p-4">
                {/* Search Section */}
                <div className="row mb-4">
                  <div className="col-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search users..."
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
                        <th onClick={() => handleSort('fullName')} style={{ cursor: 'pointer' }}>
                          Name {sortConfig.key === 'fullName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                          Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                          Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('branch')} style={{ cursor: 'pointer' }}>
                          Branch {sortConfig.key === 'branch' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center">No users found</td>
                        </tr>
                      ) : (
                        currentItems.map(user => (
                          <tr key={user._id}>
                            <td>{`${user.firstName} ${user.lastName}`}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.branch}</td>
                            <td>
                              <button 
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => handleEdit(user)}
                                >
                                <i className="fas fa-edit"></i> Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(user._id)}
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

                {/* Pagination Section with Show Entries */}
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
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedUsers.length)} of {sortedUsers.length} entries
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

export default UserManagement;
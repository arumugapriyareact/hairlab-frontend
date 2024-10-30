import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";

const ServiceManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('add-service');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    price: '',
    duration: '',
    description: ''
  });

  // New states for pagination, search, and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeTab === 'list-services') {
      fetchServices();
    }
  }, [activeTab]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      alert('Failed to fetch services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort data
  const filteredServices = services.filter(service => {
    const searchFields = [
      service.serviceName,
      service.price.toString(),
      service.duration.toString(),
      service.description
    ].join(' ').toLowerCase();

    return searchFields.includes(searchTerm.toLowerCase());
  });

  // Sort filtered data
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle numeric values
    if (sortConfig.key === 'price' || sortConfig.key === 'duration') {
      aValue = Number(aValue);
      bValue = Number(bValue);
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
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
  const currentItems = sortedServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedServices.length / itemsPerPage);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.serviceName.trim()) newErrors.serviceName = 'Service name is required';
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(formData.duration) || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Please enter a valid duration';
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
        ? `http://localhost:5001/api/services/${formData._id}`
        : 'http://localhost:5001/api/services';
      
      const response = await fetch(url, {
        method: formData._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save service');
      }

      alert(`Service ${formData._id ? 'updated' : 'created'} successfully!`);
      setFormData({
        serviceName: '',
        price: '',
        duration: '',
        description: ''
      });
      setActiveTab('list-services');
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      alert(error.message || 'Failed to save the service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setFormData(service);
    setActiveTab('add-service');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/services/${id}`, { 
          method: 'DELETE' 
        });
        if (!response.ok) throw new Error('Failed to delete service');
        alert('Service deleted successfully.');
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete the service. Please try again.');
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
      <Sidebar isOpen={isSidebarOpen} isSidebar={"Service"} />
      <div id="page-content-wrapper">
        <Header toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <h1 className="mt-4">Service Management</h1>

          <ul className="nav nav-tabs" id="serviceTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'add-service' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-service')}
              >
                {formData._id ? 'Edit Service' : 'Add Service'}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'list-services' ? 'active' : ''}`}
                onClick={() => setActiveTab('list-services')}
              >
                Services List
              </button>
            </li>
          </ul>

          <div className="tab-content mt-3" id="serviceTabsContent">
            {/* Add/Edit Service Form */}
            <div className={`tab-pane fade ${activeTab === 'add-service' ? 'show active' : ''}`}>
              <div className="row">
                <div className="col-lg-8">
                  <div className="bg-secondary p-4">
                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-12">
                          <div className="form-floating">
                            <input
                              type="text"
                              className={`form-control bg-transparent ${errors.serviceName ? 'is-invalid' : ''}`}
                              id="serviceName"
                              value={formData.serviceName}
                              onChange={handleInputChange}
                              placeholder="Service Name"
                            />
                            <label htmlFor="serviceName">Service Name</label>
                            {errors.serviceName && <div className="invalid-feedback">{errors.serviceName}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="number"
                              className={`form-control bg-transparent ${errors.price ? 'is-invalid' : ''}`}
                              id="price"
                              value={formData.price}
                              onChange={handleInputChange}
                              placeholder="Price"
                              step="0.01"
                            />
                            <label htmlFor="price">Price</label>
                            {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="number"
                              className={`form-control bg-transparent ${errors.duration ? 'is-invalid' : ''}`}
                              id="duration"
                              value={formData.duration}
                              onChange={handleInputChange}
                              placeholder="Duration (minutes)"
                            />
                            <label htmlFor="duration">Duration (minutes)</label>
                            {errors.duration && <div className="invalid-feedback">{errors.duration}</div>}
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="form-floating">
                            <textarea
                              className="form-control bg-transparent"
                              id="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              placeholder="Description"
                              style={{ height: '100px' }}
                            ></textarea>
                            <label htmlFor="description">Description (Optional)</label>
                          </div>
                        </div>

                        <div className="col-12">
                          <button 
                            className="btn btn-primary w-100 py-3" 
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : (formData._id ? 'Update Service' : 'Create Service')}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Service List */}
            <div className={`tab-pane fade ${activeTab === 'list-services' ? 'show active' : ''}`}>
              <div className="bg-secondary p-4">
                {/* Search Section */}
                <div className="row mb-4">
                  <div className="col-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search services..."
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
                        <th onClick={() => handleSort('serviceName')} style={{ cursor: 'pointer' }}>
                          Service Name {sortConfig.key === 'serviceName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                          Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('duration')} style={{ cursor: 'pointer' }}>
                          Duration {sortConfig.key === 'duration' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                          Description {sortConfig.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center">No services found</td>
                        </tr>
                      ) : (
                        currentItems.map(service => (
                          <tr key={service._id}>
                            <td>{service.serviceName}</td>
                            <td>₹{service.price.toFixed(2)}</td>
                            <td>{service.duration} minutes</td>
                            <td>{service.description}</td>
                            <td>
                              <button 
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => handleEdit(service)}
                              >
                                <i className="fas fa-edit"></i> Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(service._id)}
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
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedServices.length)} of {sortedServices.length} entries
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
  
  export default ServiceManagement;
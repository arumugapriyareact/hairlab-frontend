import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";

const ProductManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('add-product');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    stock: '',
    description: ''
  });

  // States for pagination, search, and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeTab === 'list-products') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort data
  const filteredProducts = products.filter(product => {
    const searchFields = [
      product.productName,
      product.price.toString(),
      product.stock.toString(),
      product.description
    ].join(' ').toLowerCase();

    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Sort filtered data
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle numeric values
    if (sortConfig.key === 'price' || sortConfig.key === 'stock') {
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
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleRowsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    if (!formData.stock) {
      newErrors.stock = 'Stock is required';
    } else if (isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Please enter a valid stock quantity';
    }
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
        ? `http://localhost:5001/api/products/${formData._id}`
        : 'http://localhost:5001/api/products';
      
      const response = await fetch(url, {
        method: formData._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      alert(`Product ${formData._id ? 'updated' : 'created'} successfully!`);
      setFormData({
        productName: '',
        price: '',
        stock: '',
        description: ''
      });
      setActiveTab('list-products');
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save the product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      ...product,
      _id: product._id
    });
    setActiveTab('add-product');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/products/${id}`, { 
          method: 'DELETE' 
        });
        if (!response.ok) throw new Error('Failed to delete product');
        alert('Product deleted successfully.');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete the product. Please try again.');
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
      <Sidebar isOpen={isSidebarOpen} isSidebar={"Product"} />
      <div id="page-content-wrapper">
        <Header toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <h1 className="mt-4">Product Management</h1>

          <ul className="nav nav-tabs" id="productTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'add-product' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-product')}
              >
                {formData._id ? 'Edit Product' : 'Add Product'}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'list-products' ? 'active' : ''}`}
                onClick={() => setActiveTab('list-products')}
              >
                Products List
              </button>
            </li>
          </ul>

          <div className="tab-content mt-3" id="productTabsContent">
            {/* Add/Edit Product Form */}
            <div className={`tab-pane fade ${activeTab === 'add-product' ? 'show active' : ''}`}>
              <div className="row">
                <div className="col-lg-8">
                  <div className="bg-secondary p-4">
                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-12">
                          <div className="form-floating">
                            <input
                              type="text"
                              className={`form-control bg-transparent ${errors.productName ? 'is-invalid' : ''}`}
                              id="productName"
                              value={formData.productName}
                              onChange={handleInputChange}
                              placeholder="Product Name"
                            />
                            <label htmlFor="productName">Product Name</label>
                            {errors.productName && <div className="invalid-feedback">{errors.productName}</div>}
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
                              className={`form-control bg-transparent ${errors.stock ? 'is-invalid' : ''}`}
                              id="stock"
                              value={formData.stock}
                              onChange={handleInputChange}
                              placeholder="Stock"
                            />
                            <label htmlFor="stock">Stock</label>
                            {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
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
                            {loading ? 'Saving...' : (formData._id ? 'Update Product' : 'Create Product')}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className={`tab-pane fade ${activeTab === 'list-products' ? 'show active' : ''}`}>
              <div className="bg-secondary p-4">
                {/* Search Section */}
                <div className="row mb-4">
                  <div className="col-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search products..."
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
                        <th onClick={() => handleSort('productName')} style={{ cursor: 'pointer' }}>
                          Product Name {sortConfig.key === 'productName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                          Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('stock')} style={{ cursor: 'pointer' }}>
                          Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
                          <td colSpan="5" className="text-center">No products found</td>
                        </tr>
                      ) : (
                        currentItems.map(product => (
                          <tr key={product._id}>
                            <td>{product.productName}</td>
                            <td>₹{product.price.toFixed(2)}</td>
                            <td>{product.stock}</td>
                            <td>{product.description}</td>
                            <td>
                              <button 
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => handleEdit(product)}
                              >
                                <i className="fas fa-edit"></i> Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(product._id)}
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
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length} entries
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

export default ProductManagement;
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";

const BillingManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [staffMembers, setStaffMembers] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form data for collecting inputs
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    serviceId: '',
    serviceStaffId: '',
    serviceDiscount: '',
    productId: '',
    productQuantity: 1,
    productDiscount: '',
    tip: '',
    gstPercentage: '18',
    cashback: '',
    paymentMethod: '',
    amountPaid: ''
  });

  // Selected items arrays
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Bill calculations
  const [billing, setBilling] = useState({
    subtotal: 0,
    gst: 0,
    grandTotal: 0,
    cashback: 0,
    finalTotal: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    calculateBill();
  }, [selectedServices, selectedProducts, formData.gstPercentage]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStaffMembers(),
        fetchServices(),
        fetchProducts()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/staff');
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      setStaffMembers(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch staff members');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setAvailableServices(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch services');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setAvailableProducts(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch products');
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id === 'phoneNumber' && value.length === 10) {
      fetchCustomerDetails(value);
    }
  };

  const fetchCustomerDetails = async (phoneNumber) => {
    try {
      const response = await fetch(`http://localhost:5001/api/customers/phone/${phoneNumber}`);
      if (response.ok) {
        const customer = await response.json();
        setFormData(prev => ({
          ...prev,
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          email: customer.email || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  };

  const addService = () => {
    const service = availableServices.find(s => s._id === formData.serviceId);
    const staff = staffMembers.find(s => s._id === formData.serviceStaffId);

    if (!service || !staff) {
      alert('Please select both service and staff member');
      return;
    }

    const discount = parseFloat(formData.serviceDiscount) || 0;
    if (discount > service.price) {
      alert('Discount cannot be greater than service price');
      return;
    }

    const finalPrice = service.price - discount;

    const newService = {
      name: service.serviceName,
      price: service.price,
      staffName: `${staff.firstName} ${staff.lastName}`,
      finalPrice: Number(finalPrice.toFixed(2)),
      discount: Number(discount.toFixed(2))
    };

    setSelectedServices(prev => [...prev, newService]);
    setFormData(prev => ({
      ...prev,
      serviceId: '',
      serviceStaffId: '',
      serviceDiscount: ''
    }));
  };

  const addProduct = () => {
    const product = availableProducts.find(p => p._id === formData.productId);

    if (!product) {
      alert('Please select a product');
      return;
    }

    const quantity = parseInt(formData.productQuantity) || 1;
    const discountPercentage = parseFloat(formData.productDiscount) || 0;

    if (discountPercentage > 100) {
      alert('Discount percentage cannot exceed 100%');
      return;
    }

    const discount = (product.price * discountPercentage / 100);
    const finalPrice = (product.price - discount) * quantity;

    const newProduct = {
      name: product.productName,
      price: product.price,
      quantity: quantity,
      discount: Number(discount.toFixed(2)),
      discountPercentage: Number(discountPercentage)
    };

    setSelectedProducts(prev => [...prev, newProduct]);
    setFormData(prev => ({
      ...prev,
      productId: '',
      productQuantity: 1,
      productDiscount: ''
    }));
  };

  const removeService = (index) => {
    setSelectedServices(prev => prev.filter((_, i) => i !== index));
  };

  const removeProduct = (index) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const calculateBill = () => {
    const serviceSubtotal = selectedServices.reduce((sum, service) =>
      sum + service.finalPrice, 0);

    const productSubtotal = selectedProducts.reduce((sum, product) =>
      sum + ((product.price - product.discount) * product.quantity), 0);

    const subtotal = serviceSubtotal + productSubtotal;
    const gst = (subtotal * parseFloat(formData.gstPercentage)) / 100;
    const grandTotal = subtotal + gst;

    setBilling({
      subtotal: Number(subtotal.toFixed(2)),
      gst: Number(gst.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      cashback: formData.cashback ? Number(formData.cashback) : 0,
      finalTotal: Number((grandTotal - (formData.cashback || 0)).toFixed(2))
    });
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      alert('Please fill in customer details');
      return false;
    }

    if (selectedServices.length === 0) {
      alert('Please add at least one service');
      return false;
    }

    if (!formData.paymentMethod || !formData.amountPaid) {
      alert('Please complete payment details');
      return false;
    }

    if (parseFloat(formData.amountPaid) < billing.finalTotal) {
      alert('Amount paid cannot be less than final total');
      return false;
    }

    return true;
  };

  const generateBill = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const billData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        services: selectedServices,
        products: selectedProducts,
        subtotal: billing.subtotal,
        gst: billing.gst,
        grandTotal: billing.grandTotal,
        cashback: parseFloat(formData.cashback) || 0,
        finalTotal: billing.finalTotal,
        paymentMethod: formData.paymentMethod,
        amountPaid: parseFloat(formData.amountPaid)
      };

      const response = await fetch('http://localhost:5001/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData)
      });

      if (!response.ok) throw new Error('Failed to generate bill');

      alert('Bill generated successfully!');
      clearForm();
      window.location.href = '/reports';
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      serviceId: '',
      serviceStaffId: '',
      serviceDiscount: '',
      productId: '',
      productQuantity: 1,
      productDiscount: '',
      tip: '',
      gstPercentage: '18',
      cashback: '',
      paymentMethod: '',
      amountPaid: ''
    });
    setSelectedServices([]);
    setSelectedProducts([]);
    setBilling({
      subtotal: 0,
      gst: 0,
      grandTotal: 0,
      cashback: 0,
      finalTotal: 0
    });
  };

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isSidebarOpen} isSidebar="Billing" />
      <div id="page-content-wrapper">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="container-fluid">
          <h1 className="mt-4">Billing</h1>

          <div className="bg-secondary p-4">
            <div className="row g-4">
              {/* Customer Details */}
              <div className="col-12">
                <div className="card bg-transparent border">
                  <div className="card-header">
                    <h5 className="card-title text-white mb-0">Customer Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="tel"
                            className="form-control bg-transparent"
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="Phone Number"
                          />
                          <label>Phone Number</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control bg-transparent"
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="First Name"
                          />
                          <label>First Name</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control bg-transparent"
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Last Name"
                          />
                          <label>Last Name</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="email"
                            className="form-control bg-transparent"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                          />
                          <label>Email</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="col-md-6">
                <div className="card bg-transparent border h-100">
                  <div className="card-header">
                    <h5 className="card-title text-white mb-0">Add Services</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="form-floating">
                          <select
                            className="form-select bg-transparent"
                            id="serviceId"
                            value={formData.serviceId}
                            onChange={handleInputChange}
                          >
                            <option value="">Select a service</option>
                            {availableServices.map(service => (
                              <option key={service._id} value={service._id}>
                                {service.serviceName} - ₹{service.price}
                              </option>
                            ))}
                          </select>
                          <label>Service</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <select
                            className="form-select bg-transparent"
                            id="serviceStaffId"
                            value={formData.serviceStaffId}
                            onChange={handleInputChange}
                          >
                            <option value="">Select staff</option>
                            {staffMembers.map(staff => (
                              <option key={staff._id} value={staff._id}>
                                {staff.firstName} {staff.lastName}
                              </option>
                            ))}
                          </select>
                          <label>Staff Member</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="number"
                            className="form-control bg-transparent"
                            id="serviceDiscount"
                            value={formData.serviceDiscount}
                            onChange={handleInputChange}
                            placeholder="Discount"
                          />
                          <label>Discount (₹)</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <button
                          className="btn btn-primary w-100 py-3"
                          onClick={addService}
                        >
                          Add Service
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="col-md-6">
                <div className="card bg-transparent border h-100">
                  <div className="card-header">
                    <h5 className="card-title text-white mb-0">Add Products</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="form-floating">
                          <select
                            className="form-select bg-transparent"
                            id="productId"
                            value={formData.productId}
                            onChange={handleInputChange}
                          >
                            <option value="">Select a product</option>
                            {availableProducts.map(product => (
                              <option key={product._id} value={product._id}>
                                {product.productName} - ₹{product.price}
                              </option>
                            ))}
                          </select>
                          <label>Product</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="number"
                            className="form-control bg-transparent"
                            id="productQuantity"
                            value={formData.productQuantity}
                            onChange={handleInputChange}
                            min="1"
                            placeholder="Quantity"
                          />
                          <label>Quantity</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="number"
                            className="form-control bg-transparent"
                            id="productDiscount"
                            value={formData.productDiscount}
                            onChange={handleInputChange}
                            placeholder="Discount %"
                          />
                          <label>Discount (%)</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <button
                          className="btn btn-primary w-100 py-3"
                          onClick={addProduct}
                        >
                          Add Product
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Items */}
              <div className="col-12">
                <div className="card bg-transparent border">
                  <div className="card-header">
                    <h5 className="card-title text-white mb-0">Selected Items</h5>
                  </div>
                  <div className="card-body">
                    <h6 className="text-white mb-3">Services</h6>
                    <div className="list-group mb-4">
                      {selectedServices.map((service, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-white border-light">
                          <div>
                            {service.name} (Staff: {service.staffName})
                            <br />
                            <small>Original Price: ₹{service.price}</small>
                          </div>
                          <div>
                            ₹{service.finalPrice}
                            {service.discount > 0 &&
                              <span className="ms-2 text-warning">
                                (-₹{service.discount})
                              </span>
                            }
                            <button
                              className="btn btn-danger btn-sm ms-3"
                              onClick={() => removeService(index)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h6 className="text-white mb-3">Products</h6>
                    <div className="list-group">
                      {selectedProducts.map((product, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-white border-light">
                          <div>
                            {product.name} (x{product.quantity})
                            <br />
                            <small>
                              Price: ₹{product.price} each
                              {product.discountPercentage > 0 &&
                                ` (-${product.discountPercentage}%)`
                              }
                            </small>
                          </div>
                          <div>
                            ₹{(product.price * product.quantity) - (product.discount * product.quantity)}
                            <button
                              className="btn btn-danger btn-sm ms-3"
                              onClick={() => removeProduct(index)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* GST and Bill Details */}
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="number"
                    className="form-control bg-transparent"
                    id="gstPercentage"
                    value={formData.gstPercentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    placeholder="GST %"
                  />
                  <label>GST Percentage (%)</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="number"
                    className="form-control bg-transparent"
                    id="cashback"
                    value={formData.cashback}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Cashback"
                  />
                  <label>Cashback (₹)</label>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="col-md-12">
                <div className="card bg-transparent border">
                  <div className="card-header">
                    <h5 className="card-title text-white mb-0">Bill Summary</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white">Subtotal:</span>
                      <span className="text-white">₹{billing.subtotal}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white">GST ({formData.gstPercentage}%):</span>
                      <span className="text-white">₹{billing.gst}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white">Grand Total:</span>
                      <span className="text-white">₹{billing.grandTotal}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white">Cashback:</span>
                      <span className="text-white">₹{billing.cashback}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white fw-bold">Final Total:</span>
                      <span className="text-white fw-bold">₹{billing.finalTotal}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="col-md-12">
                <div className="card bg-transparent border">
                  <div className="card-header">
                    <h5 className="card-title text-white mb-0">Payment Details</h5>
                  </div>
                  <div className="card-body">
                    <div className="form-floating mb-3">
                      <select
                        className="form-select bg-transparent"
                        id="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                      >
                        <option value="">Select payment method</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                      </select>
                      <label>Payment Method</label>
                    </div>
                    <div className="form-floating mb-3">
                      <input
                        type="number"
                        className="form-control bg-transparent"
                        id="amountPaid"
                        value={formData.amountPaid}
                        onChange={handleInputChange}
                        placeholder="Amount Paid"
                      />
                      <label>Amount Paid (₹)</label>
                    </div>
                    <button
                      className="btn btn-primary w-100 py-3"
                      onClick={generateBill}
                      disabled={loading}
                    >
                      {loading ? 'Generating Bill...' : 'Generate Bill'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1050
            }}
          >
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingManagement;
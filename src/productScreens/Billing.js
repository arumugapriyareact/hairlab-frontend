import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";

const BillingManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const [billing, setBilling] = useState({
        subtotal: 0,
        gst: 0,
        tip: 0,
        grandTotal: 0,
        finalTotal: 0
    });

    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Add useEffect for initial data fetching
    useEffect(() => {
        fetchStaffMembers();
        fetchServices();
        fetchProducts();
    }, []);

    // Add useEffect for bill calculations
    useEffect(() => {
        updateBill();
    }, [selectedServices, selectedProducts, formData.tip, formData.gstPercentage, formData.cashback]);

    const fetchStaffMembers = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/staff');
            if (!response.ok) throw new Error('Failed to fetch staff members');
            const data = await response.json();
            setStaffMembers(data);
        } catch (error) {
            console.error('Error fetching staff:', error);
            alert('Failed to fetch staff members. Please try again.');
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/services');
            if (!response.ok) throw new Error('Failed to fetch services');
            const data = await response.json();
            setAvailableServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
            alert('Failed to fetch services. Please try again.');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setAvailableProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Failed to fetch products. Please try again.');
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
                    email: customer.email || '',
                    phoneNumber: customer.phoneNumber || phoneNumber
                }));
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
            alert('Failed to fetch customer details. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));

        if (id === 'phoneNumber' && value.length === 10) {
            fetchCustomerDetails(value);
        }
    };

    const addService = () => {
        const selectedService = availableServices.find(s => s._id === formData.serviceId);
        const selectedStaff = staffMembers.find(s => s._id === formData.serviceStaffId);

        if (selectedService && selectedStaff) {
            const discount = parseFloat(formData.serviceDiscount) || 0;
            const finalPrice = Math.max(selectedService.price - discount, 0);

            setSelectedServices(prev => [
                ...prev,
                {
                    name: selectedService.serviceName,
                    price: selectedService.price,
                    staffName: `${selectedStaff.firstName} ${selectedStaff.lastName}`,
                    discount: Number(discount.toFixed(2)),
                    finalPrice: Number(finalPrice.toFixed(2))
                }
            ]);

            setFormData(prev => ({
                ...prev,
                serviceId: '',
                serviceStaffId: '',
                serviceDiscount: ''
            }));
        }
    };

    const addProduct = () => {
        const selectedProduct = availableProducts.find(p => p._id === formData.productId);

        if (selectedProduct) {
            const quantity = parseInt(formData.productQuantity) || 1;
            const discountPercentage = parseFloat(formData.productDiscount) || 0;
            const basePrice = selectedProduct.price * quantity;
            const discount = (basePrice * discountPercentage) / 100;
            const finalPrice = Math.max(basePrice - discount, 0);

            setSelectedProducts(prev => [
                ...prev,
                {
                    name: selectedProduct.productName,
                    price: selectedProduct.price,
                    quantity,
                    discountPercentage,
                    discount: Number(discount.toFixed(2)),
                    finalPrice: Number(finalPrice.toFixed(2))
                }
            ]);

            setFormData(prev => ({
                ...prev,
                productId: '',
                productQuantity: 1,
                productDiscount: ''
            }));
        }
    };

    const removeService = (index) => {
        setSelectedServices(prev => prev.filter((_, i) => i !== index));
    };

    const removeProduct = (index) => {
        setSelectedProducts(prev => prev.filter((_, i) => i !== index));
    };

    const updateBill = () => {
        // Calculate service subtotal
        const serviceSubtotal = selectedServices.reduce((total, service) => {
            return total + (service.finalPrice || 0);
        }, 0);

        // Calculate product subtotal
        const productSubtotal = selectedProducts.reduce((total, product) => {
            return total + (product.finalPrice || 0);
        }, 0);

        const subtotal = serviceSubtotal + productSubtotal;

        // Calculate tip
        const tipAmount = parseFloat(formData.tip) || 0;

        // Calculate GST
        const gstPercentage = parseFloat(formData.gstPercentage) || 0;
        const gst = (subtotal * gstPercentage) / 100;

        // Calculate totals
        const grandTotal = subtotal + gst + tipAmount;
        const cashback = parseFloat(formData.cashback) || 0;
        const finalTotal = Math.max(grandTotal - cashback, 0);

        // Update billing state
        setBilling({
            subtotal: Number(subtotal.toFixed(2)),
            gst: Number(gst.toFixed(2)),
            tip: Number(tipAmount.toFixed(2)),
            grandTotal: Number(grandTotal.toFixed(2)),
            finalTotal: Number(finalTotal.toFixed(2))
        });
    };

    const generateBill = async () => {
        if (!formData.email || !formData.phoneNumber ||
            (selectedServices.length === 0 && selectedProducts.length === 0) ||
            !formData.paymentMethod || !formData.amountPaid) {
            alert('Please fill in all required details and add at least one service or product.');
            return;
        }

        if (parseFloat(formData.amountPaid) < billing.finalTotal) {
            alert('The amount paid is less than the final total amount.');
            return;
        }

        setLoading(true);
        try {
            const billData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                services: selectedServices,
                products: selectedProducts,
                subtotal: billing.subtotal,
                gst: billing.gst,
                gstPercentage: parseFloat(formData.gstPercentage),
                tip: billing.tip,
                grandTotal: billing.grandTotal,
                cashback: parseFloat(formData.cashback) || 0,
                finalTotal: billing.finalTotal,
                paymentMethod: formData.paymentMethod,
                amountPaid: parseFloat(formData.amountPaid)
            };

            const response = await fetch('http://localhost:5001/api/billing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(billData),
            });

            if (!response.ok) throw new Error('Failed to save bill');

            alert('Bill generated and saved successfully!');
            clearForm();
            window.location.href = 'reports';
        } catch (error) {
            console.error('Error saving bill:', error);
            alert('Failed to save the bill. Please try again.');
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
            tip: 0,
            grandTotal: 0,
            finalTotal: 0
        });
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isSidebarOpen} isSidebar={"Billing"} />
      <div id="page-content-wrapper">
        <Header toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <h1 className="mt-4">Billing</h1>

          <div className="bg-secondary p-4">
            <div className="row g-4">
              {/* Customer Details Card */}
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
                          <label htmlFor="phoneNumber">Phone Number</label>
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
                          <label htmlFor="firstName">First Name</label>
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
                          <label htmlFor="lastName">Last Name</label>
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
                          <label htmlFor="email">Email</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Card */}
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
                          <label htmlFor="serviceId">Service</label>
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
                            <option value="">Select staff member</option>
                            {staffMembers.map(staff => (
                              <option key={staff._id} value={staff._id}>
                                {staff.firstName} {staff.lastName}
                              </option>
                            ))}
                          </select>
                          <label htmlFor="serviceStaffId">Staff Member</label>
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
                            placeholder="Discount (₹)"
                          />
                          <label htmlFor="serviceDiscount">Discount (₹)</label>
                        </div>

                      </div>
                      <div className="col-12">
                        <button
                          className="btn btn-primary w-100 py-3"
                          type="button"
                          onClick={addService}
                        >
                          Add Service
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Card */}
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
                          <label htmlFor="productId">Product</label>
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
                          />
                          <label htmlFor="productQuantity">Quantity</label>
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
                            placeholder="Discount (%)"
                          />
                          <label htmlFor="productDiscount">Discount (%)</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <button
                          className="btn btn-primary w-100 py-3"
                          type="button"
                          onClick={addProduct}
                        >
                          Add Product
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Items Lists */}
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
                          <div>{service.name} (Staff: {service.staffName})</div>
                          <div>
                            ₹{service.finalPrice.toFixed(2)}
                            {service.discount > 0 && ` (Discount: ₹${service.discount.toFixed(2)})`}
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
                          <div>{product.name} (x{product.quantity})</div>
                          <div>
                            ₹{product.finalPrice.toFixed(2)}
                            {product.discountPercentage > 0 && ` (Discount: ${product.discountPercentage}%)`}
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

              {/* GST and Tip Inputs */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="number"
                    className="form-control bg-transparent"
                    id="gstPercentage"
                    value={formData.gstPercentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    placeholder="GST Percentage"
                  />
                  <label htmlFor="gstPercentage">GST Percentage (%)</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="number"
                    className="form-control bg-transparent"
                    id="tip"
                    value={formData.tip}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Tip Amount"
                  />
                  <label htmlFor="tip">Tip Amount (₹)</label>
                </div>
              </div>

              {/* Bill Details */}
              <div className="col-md-12">
                <div className="card bg-transparent border h-100">
                  <div className="card-header">
                    <h5 className="card-title text-white mb-0">Bill Details</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-white">Subtotal:</span>
                      <span className="text-white">₹{billing.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-white">GST ({formData.gstPercentage}%):</span>
                      <span className="text-white">₹{billing.gst.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-white">Tip:</span>
                      <span className="text-white">₹{billing.tip.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-white">Grand Total:</span>
                      <span className="text-white">₹{billing.grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-white">Final Total:</span>
                      <span className="text-white">₹{billing.finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="col-md-12">
                <div className="card bg-transparent border h-100">
                  <div className="card-header">
                    <h5 className="card-title text-white mb-0">Payment Details</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="form-floating">
                          <input
                            type="number"
                            className="form-control bg-transparent"
                            id="cashback"
                            value={formData.cashback}
                            onChange={handleInputChange}
                            placeholder="Cashback"
                          />
                          <label htmlFor="cashback">Cashback (₹)</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <select
                            className="form-select bg-transparent"
                            id="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleInputChange}
                          >
                            <option value="">Select payment method</option>
                            <option value="cash">Cash</option>
                            <option value="upi">UPI</option>
                            <option value="wallet">Wallet</option>
                            <option value="card">Card</option>
                          </select>
                          <label htmlFor="paymentMethod">Payment Method</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="number"
                            className="form-control bg-transparent"
                            id="amountPaid"
                            value={formData.amountPaid}
                            onChange={handleInputChange}
                            placeholder="Amount Paid"
                          />
                          <label htmlFor="amountPaid">Amount Paid (₹)</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <button
                          className="btn btn-primary w-100 py-3"
                          type="button"
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

export default BillingManagement;
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, AreaChart, Area, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState('last30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    metrics: {},
    charts: {}
  });

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    initializeDefaultDates();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAndProcessBillingData();
    }
  }, [startDate, endDate]);

  const initializeDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setDateRange('last30days');
  };

  const setDateRangeValues = (range) => {
    const today = new Date();
    let start, end;

    switch (range) {
      case 'today':
        start = end = new Date();
        break;
      case 'yesterday':
        start = end = new Date(today.setDate(today.getDate() - 1));
        break;
      case 'last7days':
        end = new Date();
        start = new Date(new Date().setDate(end.getDate() - 6));
        break;
      case 'last30days':
        end = new Date();
        start = new Date(new Date().setDate(end.getDate() - 29));
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (dateRange !== 'custom') {
      setDateRangeValues(dateRange);
    }
  }, [dateRange]);

  const processBillingData = (billings) => {
    const uniqueCustomers = new Set(billings.map(bill => bill.phoneNumber));
    
    // Calculate metrics
    const metrics = {
      totalSales: billings.reduce((sum, bill) => sum + bill.paymentDetails.finalTotal, 0),
      totalCustomers: uniqueCustomers.size,
      totalServiceCost: billings.reduce((sum, bill) => 
        sum + bill.services.reduce((acc, service) => acc + service.finalPrice, 0), 0),
      totalVisits: billings.length
    };

    // Process charts data
    const employeeSales = {};
    const serviceStats = {};
    const productStats = {};
    const customerStats = {};
    const dailySales = {};
    const dailyExpenses = {};
    const customerGrowth = {};

    billings.forEach(bill => {
      const date = new Date(bill.createdAt).toLocaleDateString();
      dailySales[date] = (dailySales[date] || 0) + bill.paymentDetails.finalTotal;
      dailyExpenses[date] = (dailyExpenses[date] || 0) + 
        bill.services.reduce((sum, service) => sum + service.finalPrice, 0);
      
      // Track customer growth
      customerGrowth[date] = (customerGrowth[date] || new Set()).add(bill.phoneNumber);

      bill.services.forEach(service => {
        employeeSales[service.staffName] = (employeeSales[service.staffName] || 0) + service.finalPrice;
        serviceStats[service.name] = (serviceStats[service.name] || 0) + service.finalPrice;
      });

      bill.products.forEach(product => {
        productStats[product.name] = (productStats[product.name] || 0) + 
          (product.price * product.quantity);
      });

      customerStats[bill.phoneNumber] = {
        name: bill.customerName || 'Anonymous',
        value: (customerStats[bill.phoneNumber]?.value || 0) + bill.paymentDetails.finalTotal,
        visits: (customerStats[bill.phoneNumber]?.visits || 0) + 1
      };
    });

    const charts = {
      salesVsExpenses: Object.keys(dailySales).map(date => ({
        name: date,
        sales: dailySales[date],
        expenses: dailyExpenses[date]
      })),
      customerGrowth: Object.entries(customerGrowth).map(([date, customers]) => ({
        name: date,
        customers: customers.size
      })),
      employeeSales: Object.entries(employeeSales)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
      serviceDistribution: Object.entries(serviceStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
      topProducts: Object.entries(productStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
        // .slice(0, 5),
      topCustomers: Object.entries(customerStats)
        .map(([_, stats]) => stats)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    };

    return { metrics, charts };
  };

  const fetchAndProcessBillingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/billing/list?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch billing data');
      
      const data = await response.json();
      setDashboardData(processBillingData(data.billings));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    const selectedRange = e.target.value;
    setDateRange(selectedRange);
    
    if (selectedRange !== 'custom') {
      setDateRangeValues(selectedRange);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number || 0);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isSidebarOpen} isSidebar="Dashboard" />
      <div id="page-content-wrapper">
        <Header toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <h1 className="mt-4">Dashboard</h1>

          <div className="bg-secondary p-4 position-relative">
            {error && (
              <div className="alert alert-danger mb-4" role="alert">
                {error}
              </div>
            )}

            <div className="d-flex justify-content-end mb-4">
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  style={{ width: '200px' }}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
                {dateRange === 'custom' && (
                  <>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-3">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title text-white mb-0">Total Sales</h5>
                    </div>
                    <p className="card-text h3 mt-3 mb-0 text-white">
                      {formatCurrency(dashboardData.metrics.totalSales)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title text-white mb-0">Total Customers</h5>
                    </div>
                    <p className="card-text h3 mt-3 mb-0 text-white">
                      {formatNumber(dashboardData.metrics.totalCustomers)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title text-white mb-0">Total Service Cost</h5>
                    </div>
                    <p className="card-text h3 mt-3 mb-0 text-white">
                      {formatCurrency(dashboardData.metrics.totalServiceCost)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title text-white mb-0">Total Visits</h5>
                    </div>
                    <p className="card-text h3 mt-3 mb-0 text-white">
                      {formatNumber(dashboardData.metrics.totalVisits)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Sales vs Expenses</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData.charts.salesVsExpenses}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#fff" />
                          <YAxis stroke="#fff" />
                          <Tooltip contentStyle={{ backgroundColor: '#343a40', border: 'none' }} />
                          <Legend />
                          <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
                          <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Customer Growth</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboardData.charts.customerGrowth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#fff" />
                          <YAxis stroke="#fff" />
                          <Tooltip contentStyle={{ backgroundColor: '#343a40', border: 'none' }} />
                          <Area type="monotone" dataKey="customers" fill="#8884d8" stroke="#8884d8" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-4">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Top 5 Products</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.charts.topProducts}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => entry.name}
                          >
                            {dashboardData.charts.topProducts?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fontSize={10} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#343a40', border: 'none' }} />
                          {/* <Legend /> */}
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
             </div>
             </div>
              <div className="col-md-4">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Top 5 Services</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.charts.serviceDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => entry.name}
                          >
                            {dashboardData.charts.serviceDistribution?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fontSize={10} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#343a40', border: 'none' }}
                            formatter={(value) => formatCurrency(value)}
                          />
                          {/* <Legend 
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                          /> */}
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Top 5 Customers</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.charts.topCustomers}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => entry.name}
                          >
                            {dashboardData.charts.topCustomers?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fontSize={10}/>
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#343a40', border: 'none' }}
                            formatter={(value, name, props) => [
                              formatCurrency(value),
                              `${props.payload.name} (${props.payload.visits || 0} visits)`
                            ]}
                          />
                          {/* <Legend 
                            formatter={(value, entry) => 
                              `${entry.payload.name} (${entry.payload.visits || 0} visits)`
                            }
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                          /> */}
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {loading && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    </div>
  );
};

export default Dashboard;
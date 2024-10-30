import React, { useState, useEffect } from 'react';
import { IndianRupee } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState('last30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize with default structure and values
  const defaultDashboardData = {
    metrics: {
      totalSales: 0,
      totalCustomers: 0,
      totalServiceCost: 0,
      totalVisits: 0
    },
    charts: {
      salesVsExpenses: [],
      customerGrowth: [],
      employeeSales: [],
      serviceDistribution: [],
      topProducts: [],
      topCustomers: []
    }
  };

  const [dashboardData, setDashboardData] = useState(defaultDashboardData);

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    initializeDefaultDates();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchDashboardData();
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

  const fetchDashboardData = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:5001/api/dashboard?startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      
      // Ensure the data structure is correct
      const formattedData = {
        metrics: {
          totalSales: data.totalSales || 0,
          totalCustomers: data.newCustomers || 0,
          totalServiceCost: data.serviceCost || 0,
          totalVisits: data.employeeServices || 0
        },
        charts: {
          salesVsExpenses: data.charts?.salesVsExpenses || [],
          customerGrowth: data.charts?.customerGrowth || [],
          employeeSales: data.charts?.employeeSales || [],
          serviceDistribution: data.charts?.serviceDistribution || [],
          topProducts: data.charts?.topProducts || [],
          topCustomers: data.charts?.topCustomers || []
        }
      };
      
      setDashboardData(formattedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
      setDashboardData(defaultDashboardData);
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

  const handleApplyFilter = () => {
    if (dateRange === 'custom' && (!startDate || !endDate)) {
      setError('Please select both start and end dates');
      return;
    }
    fetchDashboardData();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format numbers with commas
  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number || 0);
  };

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isSidebarOpen} isSidebar={"Dashboard"} />
      <div id="page-content-wrapper">
        <Header toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <h1 className="mt-4">Dashboard</h1>

          <div className="bg-secondary p-4 position-relative">
            {/* Error Display */}
            {error && (
              <div className="alert alert-danger mb-4" role="alert">
                {error}
              </div>
            )}

            {/* Date Range Filter */}
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
                <button
                  className="btn btn-primary"
                  onClick={handleApplyFilter}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="row g-4 mb-4">
              <div className="col-md-3">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title text-white mb-0">Total Sales</h5>
                    </div>
                    <p className="card-text h3 mt-3 mb-0 text-white">
                      {formatCurrency(dashboardData?.metrics?.totalSales)}
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
                      {formatNumber(dashboardData?.metrics?.totalCustomers)}
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
                      {formatCurrency(dashboardData?.metrics?.totalServiceCost)}
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
                      {formatNumber(dashboardData?.metrics?.totalVisits)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Sales vs Expenses</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData?.charts?.salesVsExpenses || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#fff" />
                          <YAxis stroke="#fff" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#343a40', border: 'none' }}
                            formatter={(value) => [formatCurrency(value)]}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            name="Sales"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="expenses" 
                            stroke="#82ca9d" 
                            strokeWidth={2}
                            name="Expenses"
                          />
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
                        <AreaChart data={dashboardData?.charts?.customerGrowth || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#fff" />
                          <YAxis stroke="#fff" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#343a40', border: 'none' }}
                            formatter={(value) => [formatNumber(value), "Customers"]}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="customers" 
                            fill="#8884d8" 
                            stroke="#8884d8"
                            name="Customers"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee and Service Charts */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Employee - Wise Sales</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData?.charts?.employeeSales || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#fff" />
                          <YAxis stroke="#fff" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#343a40', border: 'none' }}
                            formatter={(value) => [formatCurrency(value), "Revenue"]}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Service Distribution</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData?.charts?.serviceDistribution || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#fff" />
                          <YAxis stroke="#fff" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#343a40', border: 'none' }}
                            formatter={(value) => [`${value} services`, "Count"]}
                          />
                          <Legend />
                          <Bar dataKey="count" fill="#82ca9d" name="Services" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top 5 Charts */}
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card bg-transparent border h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Top 5 Products</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData?.charts?.topProducts || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => entry.name}
                          >
                            {(dashboardData?.charts?.topProducts || []).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={colors[index % colors.length]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#343a40', border: 'none' }}
                            formatter={(value) => [formatCurrency(value), "Revenue"]}
                          />
                          <Legend 
                            formatter={(value) => value}
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                          />
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
                            data={dashboardData?.charts?.serviceDistribution || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={(entry) => entry.name}
                          >
                            {(dashboardData?.charts?.serviceDistribution || []).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={colors[index % colors.length]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#343a40', border: 'none' }}
                            formatter={(value, name, props) => [
                              `${value} services`,
                              props.payload.name
                            ]}
                          />
                          <Legend 
                            formatter={(value) => value}
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                          />
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
                            data={dashboardData?.charts?.topCustomers || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => entry.name}
                          >
                            {(dashboardData?.charts?.topCustomers || []).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={colors[index % colors.length]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#343a40', border: 'none' }}
                            formatter={(value, name, props) => [
                              formatCurrency(value),
                              `${props.payload.name} (${props.payload.visits || 0} visits)`
                            ]}
                          />
                          <Legend 
                            formatter={(value, entry) => 
                              `${entry.payload.name} (${entry.payload.visits || 0} visits)`
                            }
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            {dashboardData?.performance && (
              <div className="mt-4">
                <div className="card bg-transparent border">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-3">Performance Metrics</h5>
                    <p className="text-white mb-0">
                      Total Documents Processed: {formatNumber(dashboardData.performance.totalDocumentsProcessed)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
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
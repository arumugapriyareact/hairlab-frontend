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

  // Define a consistent color palette for all charts
  const chartColors = {
    primary: '#2196F3',    // Bright Blue
    secondary: '#FFC107',  // Amber/Yellow
    accent1: '#4CAF50',    // Green
    accent2: '#9C27B0',    // Purple
    accent3: '#FF5722',    // Deep Orange
    
    // Main gradient array for pie charts and varied colors
    gradient: [
      '#2196F3',  // Bright Blue
      '#FFC107',  // Amber
      '#4CAF50',  // Green
      '#9C27B0',  // Purple
      '#FF5722'   // Deep Orange
    ],
  
    // Area chart gradient - Blue theme
    areaGradient: [
      { offset: '0%', color: '#2196F3', opacity: 0.8 },
      { offset: '50%', color: '#64B5F6', opacity: 0.5 },
      { offset: '100%', color: '#90CAF9', opacity: 0.2 }
    ],
  
    // Bar chart gradient - Yellow to Orange theme
    barGradient: [
      { offset: '0%', color: '#FFC107', opacity: 1 },    // Amber
      { offset: '50%', color: '#FFB300', opacity: 0.9 }, // Amber Darken
      { offset: '100%', color: '#FF9800', opacity: 0.8 } // Orange
    ],
  
    // Alternative color schemes for different chart types
    schemes: {
      // For multi-line charts
      lines: ['#2196F3', '#FFC107', '#4CAF50', '#9C27B0', '#FF5722'],
      
      // For area charts
      areas: ['#90CAF9', '#FFE082', '#A5D6A7', '#CE93D8', '#FFAB91'],
      
      // For bar charts
      bars: ['#1976D2', '#FFA000', '#388E3C', '#7B1FA2', '#E64A19'],
      
      // For pie charts with lighter shades
      pie: ['#64B5F6', '#FFD54F', '#81C784', '#BA68C8', '#FF8A65']
    }
  };

  // Chart configuration for dark theme
  const chartConfig = {
    style: {
      background: '#fff',
      color:"red !important",
      border: '1px solid #333'
    },
    cartesianGrid: {
      strokeDasharray: '3 3',
      stroke: '#333'
    },
    axis: {
      stroke: '#666',
      style: {
        fontSize: '12px',
        fill: '#fff'
      }
    },
    tooltip: {
      contentStyle: {
        backgroundColor: '#000',
        border: '1px solid #333',
        color: '#fff'
      }
    }
  };
  
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
    <div className="d-flex" id="wrapper" style={{ backgroundColor: '#000000' }}>
      <Sidebar isOpen={isSidebarOpen} isSidebar="Dashboard" />
      <div id="page-content-wrapper" style={{ backgroundColor: '#000000' }}>
        <Header toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <h1 className="mt-4 text-white">Dashboard</h1>

          <div className="bg-dark p-4 position-relative">
            {error && (
              <div className="alert alert-danger mb-4" role="alert">
                {error}
              </div>
            )}

            {/* Date Range Selector */}
            <div className="d-flex justify-content-end mb-4">
              <div className="d-flex gap-2">
                <select
                  className="form-select bg-black text-white border-danger"
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
                      className="form-control bg-black text-white border-danger"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="form-control bg-black text-white border-danger"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Metric Cards */}
            <div className="row g-4 mb-4">
              <div className="col-md-3">
                <div className="card bg-black border-danger h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-0">Total Sales</h5>
                    <p className="card-text h3 mt-3 mb-0 text-danger">
                      {formatCurrency(dashboardData.metrics?.totalSales)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-black border-danger h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-0">Total Customers</h5>
                    <p className="card-text h3 mt-3 mb-0 text-danger">
                      {formatNumber(dashboardData.metrics?.totalCustomers)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-black border-danger h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-0">Total Service Cost</h5>
                    <p className="card-text h3 mt-3 mb-0 text-danger">
                      {formatCurrency(dashboardData.metrics?.totalServiceCost)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-black border-danger h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-0">Total Visits</h5>
                    <p className="card-text h3 mt-3 mb-0 text-danger">
                      {formatNumber(dashboardData.metrics?.totalVisits)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Charts */}
            <div className="row g-4 mb-4">
              {/* Sales vs Expenses Chart */}
              <div className="col-md-6">
                <div className="card bg-black border-danger h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Sales vs Expenses</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData.charts?.salesVsExpenses}>
                          <CartesianGrid {...chartConfig.cartesianGrid} />
                          <XAxis {...chartConfig.axis} dataKey="name" />
                          <YAxis {...chartConfig.axis} />
                          <Tooltip {...chartConfig.tooltip} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="sales" 
                            stroke={chartColors.primary} 
                            strokeWidth={2} 
                            dot={{ fill: chartColors.primary }}
                            activeDot={{ fill: chartColors.primary, stroke: chartColors.accent2, strokeWidth: 2, r: 6 }}
                            name="Sales" 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="expenses" 
                            stroke={chartColors.secondary} 
                            strokeWidth={2} 
                            dot={{ fill: chartColors.secondary }}
                            activeDot={{ fill: chartColors.secondary, stroke: chartColors.accent3, strokeWidth: 2, r: 6 }}
                            name="Expenses" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Growth Chart */}
              <div className="col-md-6">
                <div className="card bg-black border-danger h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Customer Growth</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboardData.charts?.customerGrowth}>
                          <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                              {chartColors.areaGradient.map((stop, index) => (
                                <stop 
                                  key={index}
                                  offset={stop.offset} 
                                  stopColor={stop.color} 
                                  stopOpacity={stop.opacity}
                                />
                              ))}
                            </linearGradient>
                          </defs>
                          <CartesianGrid {...chartConfig.cartesianGrid} />
                          <XAxis {...chartConfig.axis} dataKey="name" />
                          <YAxis {...chartConfig.axis} />
                          <Tooltip {...chartConfig.tooltip} />
                          <Area 
                            type="monotone" 
                            dataKey="customers" 
                            stroke={chartColors.primary}
                            fill="url(#areaGradient)"
                            name="Customers"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Charts */}
            <div className="row g-4 mb-4">
              {/* Employee Sales Chart */}
              <div className="col-md-6">
                <div className="card bg-black border-danger h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Employee - Wise Sales</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.charts?.employeeSales}>
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              {chartColors.barGradient.map((stop, index) => (
                                <stop 
                                  key={index}
                                  offset={stop.offset} 
                                  stopColor={stop.color} 
                                  stopOpacity={stop.opacity}
                                />
                              ))}
                            </linearGradient>
                          </defs>
                          <CartesianGrid {...chartConfig.cartesianGrid} />
                          <XAxis {...chartConfig.axis} dataKey="name" />
                          <YAxis {...chartConfig.axis} />
                          <Tooltip {...chartConfig.tooltip} />
                          <Bar 
                            dataKey="revenue" 
                            fill="url(#barGradient)"
                            name="Revenue"
                            radius={[5, 5, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Distribution Chart */}
              <div className="col-md-6">
                <div className="card bg-black border-danger h-100">
                  <div className="card-body">
                  <h5 className="card-title text-white mb-4">Service Distribution</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.charts?.serviceDistribution}>
                          <CartesianGrid {...chartConfig.cartesianGrid} />
                          <XAxis {...chartConfig.axis} dataKey="name" />
                          <YAxis {...chartConfig.axis} />
                          <Tooltip {...chartConfig.tooltip} />
                          <Bar 
                            dataKey="value" 
                            name="Services"
                            radius={[5, 5, 0, 0]}
                          >
                            {dashboardData.charts?.serviceDistribution?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={chartColors.gradient[index % chartColors.gradient.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Charts Row */}
            <div className="row g-4">
              {/* Top Products Chart */}
              <div className="col-md-4">
                <div className="card bg-black border-danger h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Top 5 Products</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.charts?.topProducts}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => entry.name}
                          >
                            {dashboardData.charts?.topProducts?.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={chartColors.gradient[index % chartColors.gradient.length]}
                                stroke="#000000"
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            {...chartConfig.tooltip}
                            formatter={(value) => formatCurrency(value)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Services Chart */}
              <div className="col-md-4">
                <div className="card bg-black border-danger h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Top 5 Services</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.charts?.serviceDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => entry.name}
                          >
                            {dashboardData.charts?.serviceDistribution?.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={chartColors.gradient[index % chartColors.gradient.length]}
                                stroke="#000000"
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            {...chartConfig.tooltip}
                            formatter={(value) => formatCurrency(value)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Customers Chart */}
              <div className="col-md-4">
                <div className="card bg-black border-danger h-100">
                  <div className="card-body">
                    <h5 className="card-title text-white mb-4">Top 5 Customers</h5>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.charts?.topCustomers}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => entry.name}
                          >
                            {dashboardData.charts?.topCustomers?.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={chartColors.gradient[index % chartColors.gradient.length]}
                                stroke="#000000"
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            {...chartConfig.tooltip}
                            formatter={(value, name, props) => [
                              formatCurrency(value),
                              `${props.payload.name} (${props.payload.visits || 0} visits)`
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  zIndex: 1000
                }}
              >
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        #wrapper {
          min-height: 100vh;
          background-color: #000000;
        }

        .form-select, .form-control {
          background-color: #000000 !important;
          border-color: #dc3545 !important;
          color: #ffffff !important;
        }

        .form-select option {
          background-color: #000000;
          color: #ffffff;
        }

        .form-select:focus, .form-control:focus {
          box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
        }

        .card {
          transition: transform 0.2s, box-shadow 0.2s;
          background: #000000 !important;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(220, 53, 69, 0.2);
        }

        .bg-dark {
          background-color: #121212 !important;
        }

        .border-danger {
          border-color: #dc3545 !important;
        }

        .text-danger {
          color: #dc3545 !important;
        }

        // Chart Styles
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke: #333;
        }

        .recharts-text {
          fill: #fff;
        }

        .recharts-legend-item-text {
          color: #ffffff !important;
        }

        .recharts-tooltip-wrapper {
    outline: none !important;
  }

  .recharts-default-tooltip {
    background-color: #000 !important;
    border: 2px solid #red !important;
    border-radius: 5px !important;
  }

  .recharts-tooltip-item {
    padding: 4px 0 !important;
    color: #000 !important;
    font-size: 14px !important;
  }

  .recharts-tooltip-item-name {
    color: #2196F3 !important;
    font-weight: bold !important;
  }

  .recharts-tooltip-item-value {
    color: #000 !important;
    font-weight: 500 !important;
  }

  .recharts-tooltip-label {
    color: #2196F3 !important;
    font-weight: bold !important;
    margin-bottom: 5px !important;
    font-size: 16px !important;
  }

        .recharts-active-dot {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        // Custom Scrollbar
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #000000;
        }

        ::-webkit-scrollbar-thumb {
          background: #dc3545;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #bb2d3b;
        }

        // Responsive Styles
        @media (max-width: 768px) {
          .row {
            margin-right: 0;
            margin-left: 0;
          }

          .col-md-3, .col-md-4, .col-md-6 {
            padding-right: 8px;
            padding-left: 8px;
          }

          .card {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

// Process billing data function
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
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    topCustomers: Object.entries(customerStats)
      .map(([_, stats]) => stats)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  };

  return { metrics, charts };
};

export default Dashboard;
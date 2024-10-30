import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";

const ReportsManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      console.log('Fetching reports...');
      const response = await fetch('http://localhost:5001/api/reports');
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error response body:', errorBody);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
      const data = await response.json();
      console.log('Reports fetched successfully:', data);
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Failed to fetch reports. Please try again.');
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const ReportsList = () => (
    <div className="bg-secondary p-5">
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Phone Number</th>
              <th>Customer Name</th>
              <th>Services</th>
              <th>Subtotal</th>
              <th>GST</th>
              <th>Grand Total</th>
              <th>Cashback</th>
              <th>Referral Bonus</th>
              <th>Final Total</th>
              <th>Payment Method</th>
              <th>Amount Paid</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr key={index}>
                 <td>{report.phoneNumber}</td>
                <td>{report.customerName}</td>
                <td>{report.services.map(s => s.name).join(', ')}</td>
                <td className="text-end">₹{report.subtotal.toFixed(2)}</td>
                <td className="text-end">₹{report.gst.toFixed(2)}</td>
                <td className="text-end">₹{report.grandTotal.toFixed(2)}</td>
                <td className="text-end">₹{report.cashback.toFixed(2)}</td>
                <td className="text-end">₹{report.referralBonus.toFixed(2)}</td>
                <td className="text-end">₹{report.finalTotal.toFixed(2)}</td>
                <td>{report.paymentMethod}</td>
                <td className="text-end">₹{report.amountPaid.toFixed(2)}</td>
                <td>{new Date(report.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isSidebarOpen} isSidebar={"Reports"}/>
      <div id="page-content-wrapper">
        <Header toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <h1 className="mt-4">Reports</h1>
          <div className="row mt-3">
            <div className="col-12">
              <ReportsList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;
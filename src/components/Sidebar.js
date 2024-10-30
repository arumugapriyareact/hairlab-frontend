import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen,isSidebar }) => {
  const userDetails= JSON.parse(localStorage.getItem('user'));
  console.log(userDetails)
  return (
    <div className={`bg-secondary border-right ${isOpen ? '' : 'd-none'}`} id="sidebar-wrapper">
    <div className="sidebar-heading text-primary">
      <i className="fa fa-cut me-2"></i>HairLab
    </div>
    <div className="list-group list-group-flush">
      {
        userDetails.role=="admin"?
        <>
         <a href="/appointment" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Appointments"?"active":''}`}>Appointments</a>
        <a href="/billing" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Billing"?"active":''}`}>Billing</a>
        <a href="/addServices" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Services"?"active":''}`}>Services</a>
        <a href="/products" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Products"?"active":''}`}>Products</a>
        <a href="/reports"className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Reports"?"active":''}`}>Reports</a>
        <a href="/customer" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Customer"?"active":''}`}>Customer</a>
        </>
        :
        <>
         <a href="/dashboard" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Dashboard"?"active":''}`}>Dashboard</a>
        <a href="/appointment" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Appointments"?"active":''}`}>Appointments</a>
        <a href="/billing" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Billing"?"active":''}`}>Billing</a>
        <a href="/addServices" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Services"?"active":''}`}>Services</a>
        <a href="/products" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Products"?"active":''}`}>Products</a>
        <a href="/staff" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Staff"?"active":''}`}>Staff</a>
        <a href="/reports"className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Reports"?"active":''}`}>Reports</a>
        <a href="/customer" className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Customer"?"active":''}`}>Customer</a>
        <a href="/users"className={`list-group-item list-group-item-action bg-secondary text-light ${isSidebar=="Users"?"active":''}`}>Users</a></>
      }
    
    </div>
  </div>
  );
};

export default Sidebar;
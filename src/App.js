import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home.js';
import About from './pages/About';
import Services from './pages/Services.js';
import Pricing from './pages/Pricing.js';
import Team from './pages/Team.js';
import WorkingHours from './pages/WorkingHours.js';
import Testimonials from './pages/Testimonials.js';
import Footer from './components/Footer.js';
import LinkServices from "./links/Services.js";
import Contact from './links/Contact.js';
import Login from './links/Login.js';
import Dashboard from './productScreens/Dashboard.js';
import CustomerManagement from './productScreens/Customer.js';
import StaffManagement from './productScreens/Staff.js';
import ServiceManagement from './productScreens/Services.js';
import AppointmentManagement from './productScreens/Appointments.js';
import ProductManagement from './productScreens/Products.js';
import BillingManagement from './productScreens/Billing.js';
import ReportsManagement from './productScreens/Reports.js';
import UserManagement from './productScreens/UserManagement.js';
import ImageManagement from './pages/ImageManagement.js';
import BackToTop from './components/BackToTop.js';
import ForgotPassword from './pages/ForgotPassword.js';

const AppContent = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/customer' || location.pathname === '/staff' || location.pathname === '/addServices'
  || location.pathname === '/appointment'  || location.pathname === '/products' || location.pathname === '/billing'  || 
  location.pathname === '/reports'  || location.pathname === '/users'  || location.pathname === '/imagemanagement';
  
  return (
    <div style={{minHeight: "100vh", display: "flex", flexDirection: "column"}}>
      {!isDashboard && <Navbar />}
      <Routes>
        <Route path="/" element={
          <>
            <Home />
            <About />
            <Services />
            <Pricing />
            <Team />
            <WorkingHours />
            <Testimonials />
          </>
        } />
        <Route path="/services" element={<LinkServices />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customer" element={<CustomerManagement />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/addServices" element={<ServiceManagement />} />
        <Route path="/appointment" element={<AppointmentManagement />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/billing" element={<BillingManagement />} />
        <Route path="/reports" element={<ReportsManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/imagemanagement" element={<ImageManagement/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
      </Routes>
      {!isDashboard && <Footer /> && <BackToTop/>}

    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
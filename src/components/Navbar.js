import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-secondary navbar-dark sticky-top py-lg-0 px-lg-5 wow fadeIn" data-wow-delay="0.1s">
      <NavLink to="/" className="navbar-brand ms-4 ms-lg-0">
        <h1 className="mb-0 text-primary text-uppercase">
          <i className="fa fa-cut me-3" />
          HairLab
        </h1>
      </NavLink>
      <button
        type="button"
        className="navbar-toggler me-4"
        data-bs-toggle="collapse"
        data-bs-target="#navbarCollapse"
      >
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarCollapse">
        <div className="navbar-nav ms-auto p-4 p-lg-0">
          <NavLink to="/" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/services" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`}>
            Services
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`}>
            Contact
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`}>
            Login
          </NavLink>
        </div>
      </div>
    </nav>  
  );
};

export default Navbar;
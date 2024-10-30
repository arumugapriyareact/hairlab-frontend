import React from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({toggleSidebar}) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
};
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-secondary border-bottom">
    <button className="btn btn-primary" onClick={toggleSidebar}>
      <Menu size={24} />
    </button>
    <div className="navbar-nav ms-auto">
      <button className="nav-item btn btn-link nav-link" onClick={() => handleLogout()}>
        Logout
      </button>
    </div>
  </nav>
  )
}

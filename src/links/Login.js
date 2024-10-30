import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Token management functions
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage
      if (data.token) {
        setToken(data.token);
      } else {
        throw new Error('No token received from server');
      }

      // Store user data in localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Store remember me preference if checked
      const rememberMe = document.getElementById('rememberMe').checked;
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Clear any existing error
      setError('');

      // Redirect based on user role
      if (data.user.role === 'superadmin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      // Clear token and user data in case of error
      setToken(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  // Auto-logout function
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    navigate('/login');
  };

  return (
    <>
      {/* Page Header Start */}
      <div className="container-fluid page-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container text-center py-5">
          <h1 className="display-3 text-white text-uppercase mb-3 animated slideInDown">Login</h1>
        </div>
      </div>
      {/* Page Header End */}

      {/* Login Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-0 login-screen justify-content-center">
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
              <div className="bg-secondary p-5">
                <h1 className="text-uppercase mb-4">Welcome Back!</h1>

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="form-floating">
                        <input
                          type="email"
                          className="form-control bg-transparent"
                          id="email"
                          name="email"
                          placeholder="Your Email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="email">Email Address</label>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-floating">
                        <input
                          type="password"
                          className="form-control bg-transparent"
                          id="password"
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="password">Password</label>
                      </div>
                    </div>

                    <div className="col-12 d-flex justify-content-between align-items-center mb-2">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="rememberMe"
                          name="rememberMe"
                          defaultChecked={localStorage.getItem('rememberMe') === 'true'}
                        />
                        <label className="form-check-label" htmlFor="rememberMe">
                          Remember me
                        </label>
                      </div>
                      <a href="/forgot-password" className="text-primary">
                        Forgot Password?
                      </a>
                    </div>

                    <div className="col-12">
                      <button 
                        className="btn btn-primary w-100 py-3" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <span>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Logging in...
                          </span>
                        ) : (
                          'Login'
                        )}
                      </button>
                    </div>
                  </div>
                </form>

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
        </div>
      </div>
      {/* Login End */}
    </>
  );
}
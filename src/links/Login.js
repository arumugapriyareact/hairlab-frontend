import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Token management
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Input validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear specific error when user types
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

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

      // Handle token
      if (data.token) {
        setToken(data.token);
      } else {
        throw new Error('No token received from server');
      }

      // Store user data
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Handle remember me
      const rememberMe = document.getElementById('rememberMe').checked;
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      // Clear existing error
      setError('');

      // Navigate based on role
      navigate('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
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
      {/* Page Header */}
      <div className="container-fluid page-header py-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container text-center">
          <h1 className="display-3 text-white text-uppercase mb-3 animated slideInDown">Login</h1>
        </div>
      </div>

      {/* Login Form */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-0 justify-content-center">
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
              <div className="bg-secondary p-5">
                <h2 className="text-uppercase mb-4">Welcome Back!</h2>

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
                    {/* Email Field */}
                    <div className="col-12">
                      <div className="form-floating">
                        <input
                          type="email"
                          className={`form-control bg-transparent ${validationErrors.email ? 'is-invalid' : ''}`}
                          id="email"
                          name="email"
                          placeholder="Your Email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        <label htmlFor="email">Email Address</label>
                        {validationErrors.email && (
                          <div className="invalid-feedback">
                            {validationErrors.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="col-12">
                      <div className="form-floating position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control bg-transparent ${validationErrors.password ? 'is-invalid' : ''}`}
                          id="password"
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <label htmlFor="password">Password</label>
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ zIndex: 5 }}
                        >
                          {showPassword ? 
                            <EyeOff size={20} className="text-white-50" /> : 
                            <Eye size={20} className="text-white-50" />
                          }
                        </button>
                        {validationErrors.password && (
                          <div className="invalid-feedback">
                            {validationErrors.password}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="col-12 d-flex justify-content-between align-items-center">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="rememberMe"
                          defaultChecked={localStorage.getItem('rememberMe') === 'true'}
                        />
                        <label className="form-check-label text-white-50" htmlFor="rememberMe">
                          Remember me
                        </label>
                      </div>
                      <Link 
                        to="/forgot-password" 
                        className="text-primary text-decoration-none hover-underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    {/* Submit Button */}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .form-control {
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        .form-control:focus {
          border-color: #EB1616;
          box-shadow: 0 0 0 0.25rem rgba(235, 22, 22, 0.25);
          color: white;
        }

        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .form-control.is-invalid {
          border-color: #dc3545;
          padding-right: calc(1.5em + 0.75rem);
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right calc(0.375em + 0.1875rem) center;
          background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
        }

        .form-check-input:checked {
          background-color: #EB1616;
          border-color: #EB1616;
        }

        .form-check-input:focus {
          border-color: #EB1616;
          box-shadow: 0 0 0 0.25rem rgba(235, 22, 22, 0.25);
        }

        .btn-primary {
          background-color: #EB1616;
          border-color: #EB1616;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #d41414;
          border-color: #d41414;
        }

        .btn-primary:disabled {
          background-color: #EB1616;
          border-color: #EB1616;
          opacity: 0.65;
        }

        .text-primary {
          color: #EB1616 !important;
        }

        .hover-underline:hover {
          text-decoration: underline !important;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .bg-secondary {
          border-radius: 5px;
        }

        .form-floating > label {
          color: rgba(255, 255, 255, 0.75);
        }

        .form-floating > .form-control:focus ~ label,
        .form-floating > .form-control:not(:placeholder-shown) ~ label {
          color: rgba(255, 255, 255, 0.9);
          transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
        }

        .alert {
          border-radius: 0;
        }

        .btn-link {
          border: none;
          padding: 0;
          background: none;
        }

        .btn-link:focus {
          box-shadow: none;
        }

        .invalid-feedback {
          font-size: 0.875em;
          color: #dc3545;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .wow {
          animation: fadeIn 1s;
        }
      `}</style>
    </>
  );
}
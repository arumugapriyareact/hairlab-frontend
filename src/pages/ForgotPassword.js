import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process request');
      }

      setSuccess('Password reset link has been sent to your email address.');
      
      // Automatically redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Page Header Start */}
      <div className="container-fluid page-header py-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container text-center">
          <h1 className="display-3 text-white text-uppercase mb-3 animated slideInDown">
            Forgot Password
          </h1>
        </div>
      </div>
      {/* Page Header End */}

      {/* Forgot Password Start */}
      <div className="container-xxl">
        <div className="container">
          <div className="row g-0 justify-content-center">
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
              <div className="bg-secondary p-5">
                <h2 className="text-uppercase mb-4">Reset Your Password</h2>
                <p className="text-white-50 mb-4">
                  Enter your email address below and we'll send you instructions to reset your password.
                </p>

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

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {success}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setSuccess('')}
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
                          placeholder="Your Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <label htmlFor="email">Email Address</label>
                      </div>
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
                            Sending...
                          </span>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                    </div>

                    <div className="col-12 text-center mt-4">
                      <button 
                        type="button"
                        className="btn btn-link text-primary"
                        onClick={() => navigate('/login')}
                      >
                        Back to Login
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
      {/* Forgot Password End */}

      <style jsx>{`
        .form-floating > .form-control {
          height: calc(3.5rem + 2px);
        }

        .form-floating > .form-control:focus,
        .form-floating > .form-control:not(:placeholder-shown) {
          padding-top: 1.625rem;
          padding-bottom: 0.625rem;
        }

        .form-floating > .form-control:-webkit-autofill {
          padding-top: 1.625rem;
          padding-bottom: 0.625rem;
        }

        .form-floating > .form-control:focus ~ label,
        .form-floating > .form-control:not(:placeholder-shown) ~ label {
          opacity: 0.65;
          transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
        }

        .form-floating > label {
          color: rgba(255, 255, 255, 0.75);
        }

        .btn-link {
          text-decoration: none;
        }

        .btn-link:hover {
          text-decoration: underline;
        }

        .alert {
          margin-bottom: 2rem;
        }

        .bg-secondary {
          border-radius: 0.5rem;
        }

        .wow {
          visibility: visible !important;
        }
      `}</style>
    </>
  );
}
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'; // BAGO: Idinagdag ang FiEye at FiEyeOff
import rentixLogo from '../../assets/RentixLogo.jpg';
import rentixName from '../../assets/RentixName.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // BAGO: State para sa password toggle
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      if (user?.role === 'admin') {
        navigate('/admin/dashboard'); 
      } else {
        navigate('/tenant/dashboard');
      }
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      <header className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom w-100">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <img src={rentixLogo} alt="Logo" style={{ width: '32px' }} />
          <img src={rentixName} alt="Name" style={{ height: '20px' }} />
        </Link>
        
        <div className="d-flex align-items-center gap-4" style={{ fontSize: '14px' }}>
          <Link to="/browse" className="text-decoration-none text-dark fw-semibold d-none d-sm-block">Browse</Link>
          <Link to="/contact" className="text-decoration-none text-muted d-none d-sm-block">Contact Us</Link>
          <Link 
            to="/signup" 
            className="btn btn-outline-secondary rounded-pill px-4"
            style={{ fontSize: '14px', fontWeight: '500' }}
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="flex-grow-1 d-flex align-items-center justify-content-center w-100 py-5">
        <div className="card bg-white border-0 p-4 p-md-5 shadow-sm" style={{ width: '100%', maxWidth: '450px', borderRadius: '12px' }}>
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-2">Welcome Back</h3>
            <p className="text-muted small">Sign in to manage your properties</p>
          </div>

          {error && <div className="alert alert-danger py-2 text-center" style={{ fontSize: '13px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="fw-bold d-block mb-1" style={{ fontSize: '12px' }}>Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><FiMail /></span>
                <input 
                  type="email" className="form-control border-start-0 ps-0 shadow-none py-2" 
                  placeholder="name@gmail.com" style={{ fontSize: '14px' }}
                  value={email} onChange={(e) => setEmail(e.target.value)} required 
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="fw-bold d-block mb-1" style={{ fontSize: '12px' }}>Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><FiLock /></span>
                <input 
                  type={showPassword ? "text" : "password"} // BAGO: Dynamic type
                  className="form-control border-start-0 border-end-0 ps-0 shadow-none py-2" 
                  placeholder="••••••••" style={{ fontSize: '14px' }}
                  value={password} onChange={(e) => setPassword(e.target.value)} required 
                />
                {/* BAGO: Clickable Eye Icon */}
                <span 
                  className="input-group-text bg-white border-start-0 text-muted" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <div className="text-end mb-4">
              <Link to="/forgot-password" className="text-decoration-none small fw-semibold" style={{ color: '#0ea5e9', fontSize: '12px' }}>
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn w-100 py-2 text-white fw-bold border-0" 
              style={{ backgroundColor: '#0ea5e9', borderRadius: '6px' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="text-center mt-4" style={{ fontSize: '13px' }}>
            <span className="text-muted">Don't have an account? </span>
            <Link to="/signup" className="text-decoration-none fw-bold" style={{ color: '#0ea5e9' }}>Sign Up</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
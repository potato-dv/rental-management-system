import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'; // BAGO: Idinagdag ang FiEye at FiEyeOff
import rentixLogo from '../../assets/RentixLogo.jpg'; 
import rentixName from '../../assets/RentixName.jpg'; 

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // BAGO: States para sa password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const isValidPassword = (password) => {
    const re = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
    return re.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({}); 
    let hasError = false;
    let newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required.";
      hasError = true;
    }

    if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address.";
      hasError = true;
    }

    if (contactNumber.length < 11) {
        newErrors.contactNumber = "Contact number must be at least 11 digits.";
        hasError = true;
    }

    if (!isValidPassword(password)) {
      newErrors.password = "Password must be at least 8 characters, with 1 uppercase letter and 1 number.";
      hasError = true;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      return; 
    }

    setLoading(true);
    try {
      await registerUser(name, email, contactNumber, password); 
      navigate('/tenant/dashboard'); 
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err.response?.data?.message || "Registration failed. Please try again.";
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
            to="/login" 
            className="btn btn-outline-secondary rounded-pill px-4"
            style={{ fontSize: '14px', fontWeight: '500' }}
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-grow-1 d-flex align-items-center justify-content-center w-100 py-5">
        <div className="card bg-white border-0 p-4 p-md-5 shadow-sm" style={{ width: '100%', maxWidth: '450px', borderRadius: '12px' }}>
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-2">Create Account</h3>
            <p className="text-muted small">Join Rentix to simplify your rental experience</p>
          </div>

          {error && <div className="alert alert-danger py-2 text-center" style={{ fontSize: '13px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="fw-bold d-block mb-1" style={{ fontSize: '12px' }}>Full Name</label>
              <div className="input-group">
                <span className={`input-group-text bg-white border-end-0 ${fieldErrors.name ? 'border-danger text-danger' : 'text-muted'}`}><FiUser /></span>
                <input 
                  type="text" 
                  className={`form-control border-start-0 ps-0 shadow-none py-2 ${fieldErrors.name ? 'is-invalid border-danger' : ''}`}
                  placeholder="e.g. John Doe" style={{ fontSize: '14px' }}
                  value={name} onChange={(e) => setName(e.target.value)} required 
                />
              </div>
              {fieldErrors.name && <div className="text-danger mt-1" style={{ fontSize: '11px' }}>{fieldErrors.name}</div>}
            </div>

            <div className="mb-3">
              <label className="fw-bold d-block mb-1" style={{ fontSize: '12px' }}>Email Address</label>
              <div className="input-group">
                <span className={`input-group-text bg-white border-end-0 ${fieldErrors.email ? 'border-danger text-danger' : 'text-muted'}`}><FiMail /></span>
                <input 
                  type="email" 
                  className={`form-control border-start-0 ps-0 shadow-none py-2 ${fieldErrors.email ? 'is-invalid border-danger' : ''}`}
                  placeholder="name@gmail.com" style={{ fontSize: '14px' }}
                  value={email} onChange={(e) => setEmail(e.target.value)} required 
                />
              </div>
              {fieldErrors.email && <div className="text-danger mt-1" style={{ fontSize: '11px' }}>{fieldErrors.email}</div>}
            </div>

            <div className="mb-3">
              <label className="fw-bold d-block mb-1" style={{ fontSize: '12px' }}>Contact Number</label>
              <div className="input-group">
                <span className={`input-group-text bg-white border-end-0 ${fieldErrors.contactNumber ? 'border-danger text-danger' : 'text-muted'}`}><FiPhone /></span>
                <input 
                  type="tel" 
                  className={`form-control border-start-0 ps-0 shadow-none py-2 ${fieldErrors.contactNumber ? 'is-invalid border-danger' : ''}`}
                  placeholder="09123456789" style={{ fontSize: '14px' }}
                  value={contactNumber} 
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, ''); 
                    if (onlyNums.length <= 11) setContactNumber(onlyNums);
                  }} 
                  required 
                />
              </div>
              {fieldErrors.contactNumber && <div className="text-danger mt-1" style={{ fontSize: '11px' }}>{fieldErrors.contactNumber}</div>}
            </div>

            {/* PASSWORD */}
            <div className="mb-3">
              <label className="fw-bold d-block mb-1" style={{ fontSize: '12px' }}>Password</label>
              <div className="input-group">
                <span className={`input-group-text bg-white border-end-0 ${fieldErrors.password ? 'border-danger text-danger' : 'text-muted'}`}><FiLock /></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={`form-control border-start-0 border-end-0 ps-0 shadow-none py-2 ${fieldErrors.password ? 'is-invalid border-danger' : ''}`}
                  placeholder="••••••••" style={{ fontSize: '14px' }}
                  value={password} onChange={(e) => setPassword(e.target.value)} required 
                />
                <span 
                  className={`input-group-text bg-white border-start-0 ${fieldErrors.password ? 'border-danger text-danger' : 'text-muted'}`} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
              {fieldErrors.password && <div className="text-danger mt-1" style={{ fontSize: '11px' }}>{fieldErrors.password}</div>}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="mb-4">
              <label className="fw-bold d-block mb-1" style={{ fontSize: '12px' }}>Confirm Password</label>
              <div className="input-group">
                <span className={`input-group-text bg-white border-end-0 ${fieldErrors.confirmPassword ? 'border-danger text-danger' : 'text-muted'}`}><FiLock /></span>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className={`form-control border-start-0 border-end-0 ps-0 shadow-none py-2 ${fieldErrors.confirmPassword ? 'is-invalid border-danger' : ''}`}
                  placeholder="••••••••" style={{ fontSize: '14px' }}
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
                />
                <span 
                  className={`input-group-text bg-white border-start-0 ${fieldErrors.confirmPassword ? 'border-danger text-danger' : 'text-muted'}`} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
               {fieldErrors.confirmPassword && <div className="text-danger mt-1" style={{ fontSize: '11px' }}>{fieldErrors.confirmPassword}</div>}
            </div>

            <button 
              type="submit" 
              className="btn w-100 py-2 text-white fw-bold border-0" 
              style={{ backgroundColor: '#0ea5e9', borderRadius: '6px' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center mt-4" style={{ fontSize: '13px' }}>
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="text-decoration-none fw-bold" style={{ color: '#0ea5e9' }}>Log In</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
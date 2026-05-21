import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import rentixLogo from './../../assets/RentixLogo.jpg';
import rentixName from './../../assets/RentixName.jpg';
import { useAuth } from '../../context/AuthContext'; // 1. IN-IMPORT NATIN ANG AUTH CONTEXT

export default function TenantLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // 2. KINUHA NATIN ANG USER DATA AT LOGOUT FUNCTION

  // Helper 
  const isActive = (path) => location.pathname === path;

  // Custom Logout Handler
  const handleLogout = () => {
    logout(); // Buburahin nito ang token at user state
    navigate('/login'); // Iba-bounce ka pabalik sa login page
  };

  return (
    <div className="d-flex min-vh-100 bg-light" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* SIDEBAR (Modern White Styling) */}
      <div 
        className="d-flex flex-column bg-white border-end" 
        style={{ width: '260px', zIndex: 100 }}
      >
        {/* App name and logo */}
        <div className="p-4 d-flex align-items-center gap-2 border-bottom">
          <img
            src={rentixLogo}
            alt="Rentix Logo"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <img
            src={rentixName}
            alt="Rentix Name"
            style={{ height: '20px', objectFit: 'contain' }}
          />
        </div>

        {/* Navigation Links */}
        <div className="d-flex flex-column gap-2 p-3 flex-grow-1">
          <Link 
            to="/tenant/dashboard" 
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-semibold transition-all ${isActive('/tenant/dashboard') ? 'bg-info bg-opacity-10 text-info' : 'text-muted hover-bg-light'}`} 
            style={{ fontSize: '14px', color: isActive('/tenant/dashboard') ? '#0ea5e9' : 'inherit' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            Dashboard
          </Link>

          <Link 
            to="/tenant/lease" 
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-semibold transition-all ${isActive('/tenant/lease') ? 'bg-info bg-opacity-10 text-info' : 'text-muted hover-bg-light'}`} 
            style={{ fontSize: '14px', color: isActive('/tenant/lease') ? '#0ea5e9' : 'inherit' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Lease Info
          </Link>

          <Link 
            to="/tenant/payments" 
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-semibold transition-all ${isActive('/tenant/payments') ? 'bg-info bg-opacity-10 text-info' : 'text-muted hover-bg-light'}`} 
            style={{ fontSize: '14px', color: isActive('/tenant/payments') ? '#0ea5e9' : 'inherit' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Payments
          </Link>

          <Link 
            to="/tenant/maintenance" 
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-semibold transition-all ${isActive('/tenant/maintenance') ? 'bg-info bg-opacity-10 text-info' : 'text-muted hover-bg-light'}`} 
            style={{ fontSize: '14px', color: isActive('/tenant/maintenance') ? '#0ea5e9' : 'inherit' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            Maintenance
          </Link>

          <Link 
            to="/tenant/help" 
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-semibold transition-all ${isActive('/tenant/help') ? 'bg-info bg-opacity-10 text-info' : 'text-muted hover-bg-light'}`} 
            style={{ fontSize: '14px', color: isActive('/tenant/help') ? '#0ea5e9' : 'inherit' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Help & Reports
          </Link>
        </div>
      </div>

      {/* MAIN CONTENTS */}
      <div className="flex-grow-1 d-flex flex-column">

        {/* TOPBAR (Modern styling with shadow) */}
        <header className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom shadow-sm position-sticky top-0" style={{ zIndex: 50 }}>
          <div className="fw-bold text-dark" style={{ fontSize: '18px' }}>
            {location.pathname.includes('dashboard') ? 'Dashboard' : 
             location.pathname.includes('lease') ? 'Lease Information' : 
             location.pathname.includes('payments') ? 'Payments' : 
             location.pathname.includes('maintenance') ? 'Maintenance' : 
             location.pathname.includes('help') ? 'Help & Reports' : 'Tenant Portal'}
          </div>

          <div className="d-flex align-items-center gap-4" style={{ fontSize: '14px' }}>
            <Link to="/browse" className="text-decoration-none fw-semibold text-muted">
              Browse Units
            </Link>

            <div className="d-flex align-items-center gap-3 border-start ps-3">
              <div className="d-flex align-items-center gap-2">
                
                {/* 3. DYNAMIC AVATAR INITIAL */}
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm text-uppercase"
                  style={{ width: '35px', height: '35px', fontSize: '14px', backgroundColor: '#0ea5e9' }}>
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                
                <div className="d-flex flex-column">
                  {/* 4. DYNAMIC NAME & ROLE */}
                  <span className="fw-bold text-dark text-truncate" style={{ fontSize: '13px', lineHeight: '1', maxWidth: '120px' }}>
                    {user?.name || 'User'}
                  </span>
                  <span className="text-muted text-capitalize" style={{ fontSize: '11px' }}>
                    {user?.role || 'Tenant'}
                  </span>
                </div>
              </div>

              {/* 5. FUNCTIONAL LOGOUT BUTTON */}
              <button 
                onClick={handleLogout} 
                className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold ms-2 d-flex align-items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 p-md-5 flex-grow-1 overflow-auto bg-light">
          <Outlet />
        </main>

      </div>
    </div>
    
  );
}
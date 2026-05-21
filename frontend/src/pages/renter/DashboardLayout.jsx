import { Link, Outlet, useLocation } from 'react-router-dom';

export default function DashboardLayout() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex flex-column min-vh-100 bg-light" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* TOP HEADER */}
      <header className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom position-sticky top-0" style={{ zIndex: 1000 }}>
        <div className="d-flex align-items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18"></path><path d="M9 8h1"></path><path d="M9 12h1"></path><path d="M9 16h1"></path><path d="M14 8h1"></path><path d="M14 12h1"></path><path d="M14 16h1"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
          </svg>
          <h1 className="h5 fw-bold text-dark m-0">RentFlow</h1>
        </div>
        
        <div className="d-flex align-items-center gap-4">
          <Link to="/" className="text-muted text-decoration-none fw-semibold" style={{ fontSize: '14px' }}>Browse</Link>
          <Link to="/renter/dashboard" className="text-decoration-none fw-bold" style={{ fontSize: '14px', color: '#0ea5e9' }}>Dashboard</Link>
          <span className="text-muted fw-semibold" style={{ fontSize: '14px', cursor: 'pointer' }}>Contact Us</span>
          
          <div className="d-flex align-items-center gap-3 ms-3 border-start ps-3">
            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', color: '#0ea5e9' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <Link to="/login" className="text-muted text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: '13px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WITH SIDEBAR */}
      <div className="d-flex flex-grow-1 container-fluid p-0">
        
        {/* SIDEBAR */}
        <aside className="bg-white border-end py-4 px-3" style={{ width: '250px', minHeight: 'calc(100vh - 70px)' }}>
          <nav className="d-flex flex-column gap-2">
            
            <Link to="/renter/dashboard" className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${isActive('/renter/dashboard') ? 'bg-info bg-opacity-10 text-info fw-bold' : 'text-muted'}`} style={{ fontSize: '14px', color: isActive('/renter/dashboard') ? '#0ea5e9' : 'inherit' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
              Overview
            </Link>

            <Link to="/renter/lease" className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${isActive('/renter/lease') ? 'bg-info bg-opacity-10 text-info fw-bold' : 'text-muted'}`} style={{ fontSize: '14px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Lease Info
            </Link>

            <Link to="/renter/payments" className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${isActive('/renter/payments') ? 'bg-info bg-opacity-10 text-info fw-bold' : 'text-muted'}`} style={{ fontSize: '14px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              Payments
            </Link>

            <Link to="/renter/maintenance" className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none text-muted" style={{ fontSize: '14px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              Maintenance
            </Link>

          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-grow-1 p-4 p-md-5">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
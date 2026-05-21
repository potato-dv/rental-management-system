import React from 'react';
import { Link } from 'react-router-dom';
import rentixLogo from '../../assets/RentixLogo.jpg';
import rentixName from '../../assets/RentixName.jpg';

export default function LandingPage() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-white m-0 p-0" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. HEADER  */}
      <header className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom w-100 bg-white" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        
        <div className="d-flex align-items-center gap-2">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <img
              src={rentixLogo}
              alt="Rentix Logo"
              style={{ width: '30px', height: '30px', objectFit: 'contain' }}
            />
            <img
              src={rentixName}
              alt="Rentix Name"
              style={{ height: '18px', objectFit: 'contain' }}
            />
          </Link>
        </div>
        
        <div className="d-flex align-items-center gap-4 text-muted" style={{ fontSize: '14px' }}>
          <Link to="/browse" className="text-decoration-none text-muted fw-semibold hover-primary">Browse</Link>
          <span style={{ cursor: 'pointer' }} className="fw-semibold hover-primary">Contact Us</span>
          <Link to="/login" className="btn btn-outline-secondary px-4 py-1 rounded-pill fw-semibold" style={{ fontSize: '13px' }}>
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-grow-1">
        
        {/* 2. HERO SECTION */}
        <section className="container py-5 mt-4">
          <div className="row align-items-center justify-content-between">
            {/* Left Content */}
            <div className="col-lg-5 mb-5 mb-lg-0">
              <h1 className="fw-bolder text-dark mb-3" style={{ fontSize: '3.5rem', lineHeight: '1.1', letterSpacing: '-1px' }}>
                Rent Made Easy  <br />
                with <br />
                <span style={{ color: '#0ea5e9' }}>Rentix</span>
              </h1>
              <p className="text-muted mb-4" style={{ fontSize: '1.1rem', maxWidth: '400px', lineHeight: '1.6' }}>
                Streamline your property operations with an all-in-one platform built for modern landlords and property managers.
              </p>
              <Link 
                to="/signup" 
                className="btn text-white px-4 py-2 rounded-pill shadow-sm fw-bold" 
                style={{ backgroundColor: '#0ea5e9', fontSize: '15px' }}
              >
                Get Started
              </Link>
            </div>
            
            {/* Right Content / Image Placeholder */}
            <div className="col-lg-6 text-center">
              <div 
                className="rounded-4 d-flex align-items-center justify-content-center shadow-sm w-100" 
                style={{ height: '400px', backgroundColor: '#f0f9ff', border: '2px dashed #bae6fd' }}
              >
                <div className="text-center" style={{ color: '#0ea5e9' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  <p className="fw-semibold m-0">System Dashboard Preview Here</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURES SECTION */}
        <section className="py-5" style={{ backgroundColor: '#fcfcfc', borderTop: '1px solid #f1f1f1' }}>
          <div className="container py-4">
            <h3 className="text-center fw-bold text-dark mb-5" style={{ fontSize: '28px' }}>Everything You Need</h3>
            
            <div className="row g-4">
              {/* Feature 1 */}
              <div className="col-md-4">
                <div className="card h-100 border-0 p-4 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="rounded d-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px', backgroundColor: '#e0f2fe', color: '#0ea5e9' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                  </div>
                  <h5 className="fw-bold text-dark" style={{ fontSize: '16px' }}>Property Tracking</h5>
                  <p className="text-muted m-0" style={{ fontSize: '13px', lineHeight: '1.6' }}>Manage all your rental units, leases, and tenants from a single dashboard.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="col-md-4">
                <div className="card h-100 border-0 p-4 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="rounded d-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px', backgroundColor: '#e0f2fe', color: '#0ea5e9' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                  </div>
                  <h5 className="fw-bold text-dark" style={{ fontSize: '16px' }}>Financial Insights</h5>
                  <p className="text-muted m-0" style={{ fontSize: '13px', lineHeight: '1.6' }}>Track rent payments, expenses, and generate detailed financial reports.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="col-md-4">
                <div className="card h-100 border-0 p-4 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="rounded d-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px', backgroundColor: '#e0f2fe', color: '#0ea5e9' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>
                  <h5 className="fw-bold text-dark" style={{ fontSize: '16px' }}>Secure & Reliable</h5>
                  <p className="text-muted m-0" style={{ fontSize: '13px', lineHeight: '1.6' }}>Enterprise-grade security to keep your data and transactions safe.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 4. FOOTER */}
      <footer className="w-100 bg-white" style={{ borderTop: '1px solid #eaeaea' }}>
        <div className="container py-5">
          <div className="row justify-content-between">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <div className="d-flex align-items-center gap-2 mb-3">
                <img
                  src={rentixLogo}
                  alt="Rentix Logo"
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                />
                <img
                  src={rentixName}
                  alt="Rentix Name"
                  style={{ height: '15px', objectFit: 'contain' }}
                />
              </div>
              <p className="text-muted" style={{ fontSize: '12px', maxWidth: '250px' }}>
                Modern rental property management for landlords and tenants.
              </p>
            </div>

            {/* Links Columns */}
            <div className="col-lg-7 d-flex justify-content-lg-end gap-5">
              <div>
                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '13px' }}>Product</h6>
                <ul className="list-unstyled text-muted" style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><a href="#" className="text-decoration-none text-muted">Features</a></li>
                  <li><a href="#" className="text-decoration-none text-muted">Pricing</a></li>
                  <li><a href="#" className="text-decoration-none text-muted">Integrations</a></li>
                </ul>
              </div>
            
              <div>
                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '13px' }}>Contact</h6>
                <ul className="list-unstyled text-muted" style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>RentalMan@gmail.com</li>
                  <li>09123456789</li>
                  <li>Manila, Philippines.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-5 pt-4 border-top text-muted" style={{ fontSize: '11px' }}>
            © 2026. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
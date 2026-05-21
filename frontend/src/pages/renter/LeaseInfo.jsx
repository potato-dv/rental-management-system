import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiFileText, FiCalendar, FiHome, FiDollarSign, FiClock, FiDownload } from 'react-icons/fi';

export default function LeaseInfo() {
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaseInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        // Note: Paki-check sa backend team niyo kung ano ang exact endpoint para kunin ang lease ng tenant.
        // Ginamit ko muna ang '/api/leases/my-lease' as standard assumption.
       const res = await axios.get('http://localhost:8000/api/leases/my/lease', {
  headers: { Authorization: `Bearer ${token}` }
});
        
        // Assumption: Ang response format ay { success: true, lease: { ... } }
        setLease(res.data.lease);
      } catch (err) {
        console.error("Error fetching lease:", err);
        setError("You don't have an active lease contract yet, or it is still pending approval.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaseInfo();
  }, []);

  if (loading) {
    return <div className="p-5 text-center text-muted min-vh-100 d-flex align-items-center justify-content-center">Loading lease information...</div>;
  }

  return (
    <div className="p-4 bg-light min-vh-100" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Lease Information</h2>
        <p className="text-muted small">View your active rental contract details and terms.</p>
      </div>

      {!lease ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <FiFileText size={50} className="text-muted mb-3 opacity-50" />
            <h5 className="fw-bold text-muted">No Active Lease Found</h5>
            <p className="text-muted small mb-0">{error}</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          
          {/* LEFT COLUMN: STATUS & QUICK DETAILS */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
                  <FiFileText size={28} />
                </div>
                <h5 className="fw-bold mb-1">Contract Status</h5>
                <span className={`badge rounded-pill px-4 py-2 mt-2 ${lease.status === 'active' ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {lease.status ? lease.status.toUpperCase() : 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-4 text-muted">Quick Summary</h6>
                
                <div className="d-flex align-items-start gap-3 mb-4">
                  <div className="bg-light p-2 rounded text-muted"><FiHome size={20} /></div>
                  <div>
                    <small className="text-muted d-block fw-semibold">Unit Assigned</small>
                    <strong className="d-block">Unit {lease.unitId?.unitNumber || 'N/A'}</strong>
                    <small className="text-muted">{lease.unitId?.type ? lease.unitId.type.replace('-', ' ') : ''}</small>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 mb-4">
                  <div className="bg-light p-2 rounded text-muted"><FiDollarSign size={20} /></div>
                  <div>
                    <small className="text-muted d-block fw-semibold">Monthly Rent</small>
                    <strong className="d-block text-primary">₱{lease.rentAmount?.toLocaleString() || lease.unitId?.price?.toLocaleString() || '0'}</strong>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="bg-light p-2 rounded text-muted"><FiClock size={20} /></div>
                  <div>
                    <small className="text-muted d-block fw-semibold">Payment Due</small>
                    <strong className="d-block">Every {lease.paymentDueDay || '1st'} of the month</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FULL CONTRACT DETAILS */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                  <h5 className="fw-bold mb-0">Lease Agreement Details</h5>
                  <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 fw-semibold">
                    <FiDownload /> Download PDF
                  </button>
                </div>

                <div className="row g-4 mb-5">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                        <FiCalendar /> <small className="fw-semibold">Start Date</small>
                      </div>
                      <h6 className="fw-bold mb-0">
                        {lease.startDate ? new Date(lease.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Pending'}
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                        <FiCalendar /> <small className="fw-semibold">End Date</small>
                      </div>
                      <h6 className="fw-bold mb-0">
                        {lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Pending'}
                      </h6>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Terms and Conditions</h6>
                <div className="bg-secondary bg-opacity-10 p-4 rounded-3 text-muted small" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <p className="mb-2"><strong>1. Rent Payment:</strong> Rent is due on the specified day of each month. Late payments may incur additional fees as stated in the final contract.</p>
                  <p className="mb-2"><strong>2. Maintenance:</strong> The tenant is responsible for reporting any damages or necessary repairs immediately through the Maintenance portal.</p>
                  <p className="mb-2"><strong>3. Subleasing:</strong> Subleasing the unit to another party is strictly prohibited without written consent from the management.</p>
                  <p className="mb-0"><strong>4. Termination:</strong> Early termination of this lease agreement requires a 30-day prior written notice and may be subject to penalty fees.</p>
                  {/* Pwedeng i-replace ng {lease.terms} kung may dynamic terms field kayo sa DB */}
                </div>

              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
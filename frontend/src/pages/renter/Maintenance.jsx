import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiTool, FiCheckCircle, FiInfo } from 'react-icons/fi';

export default function Maintenance() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States 
  const [unitId, setUnitId] = useState(''); // Ito ay magiging auto-filled!
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low'); 
  
  // States for feedback
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch Initial Data (Lease details AND Maintenance Requests)
  const fetchInitialData = async () => {
    // === BAGO: SMART CHECK PARA SA MGA APPLICANTS ===
    // Kung hindi pa "tenant" ang user, huwag na natin ipilit i-fetch ang data
    // para hindi lumabas yung 403 Error sa console!
    if (user?.role !== 'tenant') {
      setLoading(false);
      return; 
    }

    try {
      const token = localStorage.getItem('token');
      
      // A. Kunin muna ang Lease para makuha ang Unit ID
      try {
        const leaseRes = await axios.get('http://localhost:8000/api/leases/my/lease', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Pag nakuha ang lease, i-save ang ID ng unit sa state
        if (leaseRes.data.lease && leaseRes.data.lease.unitId) {
          const fetchedUnitId = leaseRes.data.lease.unitId._id || leaseRes.data.lease.unitId;
          setUnitId(fetchedUnitId);
        }
      } catch (leaseErr) {
        console.error("No active lease found or error fetching lease.", leaseErr);
      }

      // B. Kunin ang Maintenance Requests
      const reqRes = await axios.get('http://localhost:8000/api/maintenance/my/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(reqRes.data.requests || []);
      
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  // Computations for Summary Cards 
  const openCount = requests.filter(r => r.status === 'open').length;
  const inProgressCount = requests.filter(r => r.status === 'in-progress').length;
  const resolvedCount = requests.filter(r => r.status === 'resolved').length;

  // 2. Handle Submit Request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      
      if (!unitId) {
          setErrorMsg("You must have an active lease to submit a request.");
          setSubmitLoading(false);
          return;
      }

      await axios.post('http://localhost:8000/api/maintenance', 
        { unitId, title, description, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg("Maintenance request submitted successfully.");
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('low');
      
      // Refresh the table silently
      const reqRes = await axios.get('http://localhost:8000/api/maintenance/my/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(reqRes.data.requests || []);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved': return <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1">RESOLVED</span>;
      case 'in-progress': return <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1">IN PROGRESS</span>;
      default: return <span className="badge bg-warning-subtle text-warning rounded-pill px-3 py-1">OPEN</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return <span className="text-danger fw-bold small">High</span>;
      case 'medium': return <span className="text-warning fw-bold small">Medium</span>;
      default: return <span className="text-success fw-bold small">Low</span>;
    }
  };

  if (!user || loading) return <div className="p-5 text-center text-muted min-vh-100">Loading maintenance details...</div>;

  // === BAGO: CONDITIONAL RENDERING PARA SA APPLICANTS ===
  if (user?.role !== 'tenant') {
    return (
      <div className="p-4 bg-light min-vh-100" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Maintenance Requests</h2>
          <p className="text-muted small">Report issues in your unit and track repair progress.</p>
        </div>

        <div className="row mt-4">
          <div className="col-md-8 mx-auto">
            <div className="card border-0 shadow-sm p-5 text-center">
              <h3 className="fw-bold text-secondary mb-3">No Active Lease</h3>
              <p className="text-muted fs-5 mb-0">
                Maintenance requests are only available for official tenants with an active lease. Please wait for your application to be approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ========================================================

  return (
    <div className="p-4 bg-light min-vh-100" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Maintenance Requests</h2>
        <p className="text-muted small">Report issues in your unit and track repair progress.</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <small className="text-muted d-block mb-2">Open Requests</small>
            <h3 className="fw-bold mb-0 text-warning">{openCount}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <small className="text-muted d-block mb-2">In Progress</small>
            <h3 className="fw-bold mb-0 text-primary">{inProgressCount}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <small className="text-muted d-block mb-2">Resolved Issues</small>
            <h3 className="fw-bold mb-0 text-success">{resolvedCount}</h3>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* SUBMIT NEW REQUEST FORM */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2"><FiTool className="text-primary"/> New Request</h5>
              
              {successMsg && <div className="alert alert-success py-2 text-center small"><FiCheckCircle className="me-2"/>{successMsg}</div>}
              {errorMsg && <div className="alert alert-danger py-2 text-center small">{errorMsg}</div>}
              
              {!loading && !unitId && (
                <div className="alert alert-warning py-2 small d-flex gap-2 mb-3">
                  <FiInfo size={18} />
                  <span>You need an active lease to report an issue.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="small fw-semibold mb-2">Issue Title <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="e.g. Leaking Faucet" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={!unitId} />
                </div>

                <div className="mb-3">
                  <label className="small fw-semibold mb-2">Priority <span className="text-danger">*</span></label>
                  <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)} required disabled={!unitId}>
                    <option value="low">Low (Minor repairs)</option>
                    <option value="medium">Medium (Annoyance but livable)</option>
                    <option value="high">High (Emergency / Safety Hazard)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="small fw-semibold mb-2">Description <span className="text-danger">*</span></label>
                  <textarea className="form-control" rows="4" placeholder="Describe the issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} required disabled={!unitId}></textarea>
                </div>
                
                <button type="submit" className={`btn btn-primary w-100 fw-bold py-2 ${!unitId ? 'disabled bg-secondary' : ''}`} style={{ backgroundColor: unitId ? '#0ea5e9' : '', border: 'none' }} disabled={submitLoading || !unitId}>
                  {submitLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* REQUEST HISTORY TABLE */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Request History</h5>
              
              {loading ? (
                <div className="text-center text-muted py-5">Loading requests...</div>
              ) : requests.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="text-muted small">
                      <tr>
                        <th className="border-0">DATE</th>
                        <th className="border-0">TITLE</th>
                        <th className="border-0">PRIORITY</th>
                        <th className="border-0 text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((req) => (
                        <tr key={req._id}>
                          <td className="py-3 text-muted small">{new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td className="py-3 fw-bold">{req.title}</td>
                          <td className="py-3">{getPriorityBadge(req.priority)}</td>
                          <td className="py-3 text-center">{getStatusBadge(req.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 bg-light rounded-3">
                  <p className="text-muted mb-0">You haven't submitted any maintenance requests yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
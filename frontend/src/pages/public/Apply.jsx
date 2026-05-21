import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Apply() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const [unit, setUnit] = useState(null);
  const [moveInDate, setMoveInDate] = useState(''); 
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/units/${id}`);
       
        setUnit(res.data.unit || res.data.units?.find(u => u._id === id)); 
      } catch (err) {
        setError("Failed to load unit details. It might have been removed.");
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form Validation for fe
    if (!user) return setError("You must be logged in to apply.");
    if (!moveInDate) return setError("Please select your target move-in date.");

    setSubmitLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      await axios.post('http://localhost:8000/api/applications', 
        { unitId: id, moveInDate, message },
        { headers: { Authorization: `Bearer ${token}` } } 
      );
      
      setSuccess(true);
      setTimeout(() => navigate('/tenant/dashboard'), 3000); 
    } catch (err) {
      // User Feedback
      setError(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="p-5 text-center mt-5">Loading application details...</div>;

  return (
    <div className="bg-light min-vh-100 py-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        
        <Link to="/browse" className="text-decoration-none text-muted mb-4 d-inline-block fw-semibold">&larr; Back to Browse</Link>

        <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '12px' }}>
          <h3 className="fw-bold mb-4">Rental Application</h3>

          {/* error msg "You already have a pending application" */}
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {success && <div className="alert alert-success py-2">Application submitted successfully! Redirecting to dashboard...</div>}

          {/* Unit Summary */}
          {unit && (
            <div className="bg-light p-3 rounded-3 mb-4 border border-info border-opacity-25">
              <h6 className="fw-bold mb-1">Unit {unit.unitNumber}</h6>
              <p className="text-muted small mb-0">{unit.type} • ₱{unit.price?.toLocaleString()} / month</p>
            </div>
          )}

          {!user ? (
            <div className="text-center py-4">
              <p className="text-muted mb-4">You need an account to apply for a rental unit.</p>
              <div className="d-flex gap-2 justify-content-center">
                <Link to="/login" className="btn btn-outline-primary px-4 rounded-pill fw-semibold">Log In</Link>
                <Link to="/signup" className="btn btn-primary px-4 rounded-pill fw-semibold" style={{ backgroundColor: '#0ea5e9', border: 'none' }}>Sign Up</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="fw-bold small mb-2">Applicant Information</label>
                <input type="text" className="form-control bg-light" value={`${user.name} (${user.email})`} disabled />
                <small className="text-muted" style={{ fontSize: '11px' }}>This information will be sent to the admin.</small>
              </div>

              {/* new field for be */}
              <div className="mb-3">
                <label className="fw-bold small mb-2">Target Move-in Date <span className="text-danger">*</span></label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} 
                  required
                />
              </div>

              <div className="mb-4">
                <label className="fw-bold small mb-2">Message to Landlord (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  placeholder="Tell the landlord a bit about yourself or ask a question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn w-100 text-white fw-bold py-2" 
                style={{ backgroundColor: '#0ea5e9', borderRadius: '6px' }}
                disabled={submitLoading || success}
              >
                {submitLoading ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
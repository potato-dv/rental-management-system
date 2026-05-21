import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiMapPin, FiMaximize, FiHome, FiCheckCircle } from 'react-icons/fi';
// Import yung Rentix Header icons kung gusto mong consistent yung header dito
import rentixLogo from '../../assets/RentixLogo.jpg'; 
import rentixName from '../../assets/RentixName.jpg'; 

export default function UnitDetails() {
  const { id } = useParams(); // Kukunin natin yung Unit ID sa URL
  const navigate = useNavigate();
  const { user } = useAuth(); // Kukunin natin yung user kung nakalogin

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Application Form States (Dito na natin ilalagay yung logic mula sa Apply.jsx kanina)
  const [message, setMessage] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. Fetch Unit Details
  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/units/${id}`);
        setUnit(res.data.unit);
      } catch (err) {
        console.error("Error fetching unit details:", err);
        setError('Failed to load unit details. It might have been removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [id]);

  // 2. Submit Application Logic (Pinagsama na natin dito)
  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      // Kung hindi nakalogin, dalhin muna sa login page
      return navigate('/login', { state: { from: `/units/${id}` } }); 
    }

    setSubmitLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      // MATCHED SA BACKEND: pinapasa na natin ang unitId at message
      await axios.post('http://localhost:8000/api/applications', 
        { unitId: id, message },
        { headers: { Authorization: `Bearer ${token}` } } 
      );
      
      setSuccess(true);
      setMessage(''); // I-clear ang message field
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="p-5 text-center mt-5">Loading unit details...</div>;
  if (error && !unit) return <div className="p-5 text-center mt-5 alert alert-danger mx-auto" style={{maxWidth: '500px'}}>{error}</div>;
  if (!unit) return <div className="p-5 text-center mt-5">Unit not found.</div>;

  // Placeholder images para sa carousel kung walang images sa backend
  const unitImages = unit.images && unit.images.length > 0 ? unit.images : [
    'https://via.placeholder.com/800x500.png?text=Unit+Image+1',
    'https://via.placeholder.com/800x500.png?text=Unit+Image+2',
    'https://via.placeholder.com/800x500.png?text=Unit+Image+3'
  ];

  return (
    <div className="bg-light min-vh-100 pb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER / NAVBAR (Kaparehas ng nasa Browse/Landing) */}
      <header className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom w-100">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <img src={rentixLogo} alt="Logo" style={{ width: '32px' }} />
          <img src={rentixName} alt="Name" style={{ height: '20px' }} />
        </Link>
        <div className="d-flex align-items-center gap-4" style={{ fontSize: '14px' }}>
          <Link to="/browse" className="text-decoration-none text-dark fw-semibold d-none d-sm-block">Browse</Link>
          <Link to="/contact" className="text-decoration-none text-muted d-none d-sm-block">Contact Us</Link>
          <Link to="/login" className="btn btn-outline-secondary rounded-pill px-4" style={{ fontSize: '14px', fontWeight: '500' }}>Sign In</Link>
        </div>
      </header>

      <div className="container py-5">
        <Link to="/browse" className="text-decoration-none text-muted mb-4 d-inline-block FW-semibold">&larr; Back to Browse</Link>

        <div className="row g-4">
          
          {/* LEFT SIDE: CAROUSEL EFFECTS (Maliit na Tab feel) */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
              <div id="unitCarousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-indicators">
                  {unitImages.map((_, index) => (
                    <button type="button" data-bs-target="#unitCarousel" data-bs-slide-to={index} className={index === 0 ? 'active' : ''} key={index}></button>
                  ))};
                </div>
                <div className="carousel-inner" style={{ height: '400px' }}>
                  {unitImages.map((imgUrl, index) => (
                    <div className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`} key={index}>
                      <img src={imgUrl} className="d-block w-100 h-100" style={{ objectFit: 'cover' }} alt={`Unit ${unit.unitNumber} - ${index + 1}`} />
                    </div>
                  ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#unitCarousel" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#unitCarousel" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: DETAILS & APPLICATION FORM */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h2 className="fw-bold mb-0">Unit {unit.unitNumber}</h2>
                <span className={`badge rounded-pill px-3 py-2 ${unit.status === 'Available' ? 'bg-success' : 'bg-danger'}`}>
                  {unit.status || 'Available'}
                </span>
              </div>

              <h2 className="fw-bolder text-primary mb-4" style={{ color: '#0ea5e9' }}>
                ₱{unit.price?.toLocaleString()}<span className="text-muted fw-normal" style={{ fontSize: '16px' }}> / month</span>
              </h2>

              <p className="text-muted mb-4">{unit.description || 'A beautiful and spacious unit perfect for comfortable living in Quezon City.'}</p>

              <div className="row g-3 mb-5 text-muted">
                <div className="col-6 col-md-4 d-flex align-items-center gap-2"><FiMaximize size={20} className="text-primary"/> <strong>{unit.sqm || '0'} sqm</strong></div>
                <div className="col-6 col-md-4 d-flex align-items-center gap-2"><FiHome size={20} className="text-primary"/> <strong>{unit.type || 'Studio'}</strong></div>
                <div className="col-6 col-md-4 d-flex align-items-center gap-2"><FiMapPin size={20} className="text-primary"/> <strong>Floor {unit.floor || '1'}</strong></div>
              </div>

              {/* DITO PAPASOK YUNG RENTAL APPLICATION NA GINAWA NATIN */}
              <div className="border-top pt-4 mt-auto">
                <h5 className="fw-bold mb-3">Apply for this Unit</h5>
                
                {success ? (
                  <div className="alert alert-success text-center py-4 rounded-3">
                    <FiCheckCircle size={40} className="mb-2"/><br/>
                    <strong>Application Submitted!</strong><br/>
                    Check your <Link to="/tenant/dashboard" className="fw-bold text-decoration-none">dashboard</Link> to view status.
                  </div>
                ) : (
                  <form onSubmit={handleApply}>
                    <div className="mb-3">
                      <label className="fw-bold small mb-2 text-muted">Message to Landlord (Optional)</label>
                      <textarea 
                        className="form-control form-control-sm" 
                        rows="3" 
                        placeholder="Introduce yourself or ask a question..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{fontSize: '13px'}}
                      ></textarea>
                    </div>
                    
                    {error && <div className="alert alert-danger py-2 text-center" style={{fontSize: '12px'}}>{error}</div>}

                    <button 
                      type="submit" 
                      className={`btn w-100 fw-bold rounded-3 py-2 ${unit.status === 'Available' ? 'btn-primary' : 'btn-secondary disabled'}`}
                      style={{ backgroundColor: unit.status === 'Available' ? '#0ea5e9' : '', border: 'none' }}
                      disabled={submitLoading || unit.status !== 'Available'}
                    >
                      {submitLoading ? 'Submitting Application...' : 'Apply Now'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
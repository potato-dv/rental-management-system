import React, { useState } from 'react';

// Sample data for images (Palitan ito ng URLs mo mamaya)
const sampleImages = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'
];

export default function PropertyDetailsModal({ property, onClose }) {
  // State for image carousel
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Function to navigate image carousel
  const nextImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex + 1) % sampleImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex - 1 + sampleImages.length) % sampleImages.length);
  };

  // Kung walang property data, huwag i-render ang modal
  if (!property) return null;

  return (
    // min-vh-100 at bg-dark bg-opacity-75 para sa modal overlay
    <div 
      className="d-flex align-items-center justify-content-center min-vh-100 bg-dark bg-opacity-75 m-0 p-0" 
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}
    >
      
      {/* 1. MODAL CARD (centered, rounded, with shadow) */}
      <div 
        className="card bg-white border-0 shadow-lg" 
        style={{ width: '100%', maxWidth: '900px', borderRadius: '16px', overflow: 'hidden', maxHeight: '90vh' }}
      >
        
        {/* Close Button Icon */}
        <button 
          onClick={onClose} 
          className="btn btn-link text-muted" 
          style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="row g-0">
          
          {/* 2. LEFT SIDE: IMAGE CAROUSEL */}
          <div className="col-md-7 position-relative">
            <div 
              className="d-flex align-items-center justify-content-center bg-light" 
              style={{ height: '100%', maxHeight: '500px', backgroundColor: '#f1f1f1' }}
            >
              {/* Main Image */}
              <img 
                src={sampleImages[activeImageIndex]} 
                alt={`Unit ${activeImageIndex + 1}`} 
                className="img-fluid" 
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />

              {/* Carousel Controls */}
              <button onClick={prevImage} className="btn btn-light rounded-pill p-2 position-absolute start-0 ms-3 shadow-sm border" style={{ top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button onClick={nextImage} className="btn btn-light rounded-pill p-2 position-absolute end-0 me-3 shadow-sm border" style={{ top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
              
              {/* Carousel Indicators (based on reference dots) */}
              <div className="d-flex justify-content-center gap-1 position-absolute bottom-0 w-100 mb-3">
                {sampleImages.map((_, index) => (
                  <div 
                    key={index} 
                    className={`rounded-circle ${index === activeImageIndex ? 'bg-primary' : 'bg-secondary'}`} 
                    style={{ width: '8px', height: '8px', opacity: index === activeImageIndex ? 1 : 0.4 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 3. RIGHT SIDE: PROPERTY DETAILS */}
          <div className="col-md-5">
            <div className="card-body p-4 p-md-5 d-flex flex-column" style={{ height: '100%', maxHeight: '500px', overflowY: 'auto' }}>
              
              {/* Header Info */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                 <h4 className="fw-bolder text-dark m-0" style={{ fontSize: '20px' }}>{property.name}</h4>
                 <span className="badge bg-success bg-opacity-25 text-success rounded-pill px-3 py-1" style={{ fontSize: '11px', fontWeight: '600' }}>{property.status}</span>
              </div>
              
              <p className="text-muted mb-4 d-flex align-items-center gap-1" style={{ fontSize: '13px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {property.location}
              </p>

              {/* Type and Size Details (Same layout and colors) */}
              <div className="row g-2 mb-4">
                  <div className="col-4">
                      <div className="p-3 text-center" style={{ backgroundColor: '#fcfcfc', border: '1px solid #f1f1f1', borderRadius: '8px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5" className="mb-1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                          <p className="text-muted m-0" style={{ fontSize: '10px' }}>Type</p>
                          <p className="fw-bold text-dark m-0" style={{ fontSize: '13px' }}>{property.type}</p>
                      </div>
                  </div>
                  <div className="col-4">
                      <div className="p-3 text-center" style={{ backgroundColor: '#fcfcfc', border: '1px solid #f1f1f1', borderRadius: '8px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5" className="mb-1"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
                          <p className="text-muted m-0" style={{ fontSize: '10px' }}>Size</p>
                          <p className="fw-bold text-dark m-0" style={{ fontSize: '13px' }}>{property.size}</p>
                      </div>
                  </div>
              </div>

              {/* Description Section */}
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '14px' }}>Description</h6>
              <p className="text-muted mb-4" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                {property.description}
              </p>

              {/* Amenities Section (with icons from picture) */}
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '14px' }}>Amenities</h6>
              <div className="d-flex flex-wrap gap-2 mb-4 text-muted" style={{ fontSize: '12px' }}>
                <span className="badge bg-light text-muted px-3 py-2 rounded-pill d-flex align-items-center gap-1 border">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  Wi-Fi
                </span>
                <span className="badge bg-light text-muted px-3 py-2 rounded-pill d-flex align-items-center gap-1 border">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20M12 12l8-8M4 20l8-8M20 12l-8 8M12 12l-8-8"></path></svg>
                  Air Conditioning
                </span>
                <span className="badge bg-light text-muted px-3 py-2 rounded-pill d-flex align-items-center gap-1 border">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  Parking
                </span>
              </div>

              {/* Bottom Section (Same price and button style) */}
              <div className="d-flex justify-content-between align-items-center border-top pt-4 mt-auto">
                 <h4 className="fw-bolder mb-0" style={{ color: '#0ea5e9' }}>{property.price}<span className="text-muted fw-normal" style={{ fontSize: '12px' }}>/month</span></h4>
                 <button className="btn text-white px-4 py-2 rounded-pill shadow-sm fw-bold" style={{ backgroundColor: '#0ea5e9', fontSize: '14px' }}>
                    Apply for Rental
                 </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
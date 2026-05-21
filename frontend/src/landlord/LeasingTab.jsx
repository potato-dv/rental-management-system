import React from 'react';

export default function LeasingTab({ leasesData, setLeaseFormData, setShowLeaseModal }) {
  return (
    <section className="section-box card border-0 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
        <h5 className="fw-bold mb-0">Active Leases</h5>
        <button className="btn btn-primary btn-sm" onClick={() => { 
          setLeaseFormData({ applicationId: "", tenantId: "", unitId: "", unitDisplay: "", rent: 0, startDate: "", endDate: "" }); 
          setShowLeaseModal(true); 
        }}>Add New Lease</button>
      </div>
      <table className="table table-hover align-middle">
        <thead><tr><th>Tenant</th><th>Unit</th><th>Start Date</th><th>End Date</th><th>Status</th></tr></thead>
        <tbody>
          {Array.isArray(leasesData) && leasesData.length > 0 ? leasesData.map((lease) => {
            const tenantName = lease.tenantId?.name || lease.tenant?.name || 'N/A';
            const unitName = lease.unitId?.unitNumber || lease.unit?.name || 'N/A';
            const startDate = lease.startDate ? new Date(lease.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
            const endDate = lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
            return (
              <tr key={lease._id || lease.id}>
                <td className="fw-medium">{tenantName}</td><td className="fw-bold">{unitName}</td><td>{startDate}</td><td>{endDate}</td>
                <td><span className="badge rounded-pill px-3 py-1 bg-success-subtle text-success">{lease.status?.toUpperCase() || 'ACTIVE'}</span></td>
              </tr>
            );
          }) : <tr><td colSpan="5" className="text-center py-4">No active leases</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
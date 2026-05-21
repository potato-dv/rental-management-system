import React from 'react';

export default function TenantsTab({ tenantsData, leasesData, handleDeleteTenantClick }) {
  return (
    <section className="section-box card border-0 shadow-sm">
      <div className="tools-row d-flex gap-2 flex-wrap mb-3">
        <button className="btn btn-primary">Add Tenant</button>
      </div>
      <table className="table table-hover align-middle">
        <thead><tr><th>Name</th><th>Assigned Unit</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {Array.isArray(tenantsData) && tenantsData.length > 0 ? tenantsData.map((tenant) => {
            const tenantLease = leasesData.find(lease => {
              const leaseTenantId = lease.tenantId?._id || lease.tenantId?.id || lease.tenantId;
              const currentTenantId = tenant._id || tenant.id;
              return String(leaseTenantId) === String(currentTenantId) && (!lease.status || lease.status.toLowerCase() === 'active');
            });
            const tenantUnitName = tenantLease ? (tenantLease.unitId?.unitNumber || tenantLease.unitId?.name || 'Assigned') : 'No Active Lease';

            return (
              <tr key={tenant._id || tenant.id}>
                <td className="fw-medium">{tenant.name || tenant.fullName || 'N/A'}</td>
                <td className="fw-bold text-primary">{tenantUnitName}</td>
                <td>{tenant.phone || tenant.contactNumber || 'N/A'}</td>
                <td>
                  <span className={`badge rounded-pill px-3 py-1 ${tenantLease ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                     {tenantLease ? 'ACTIVE' : 'NO LEASE'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-danger fw-bold" onClick={() => handleDeleteTenantClick(tenant._id || tenant.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            );
          }) : <tr><td colSpan="5" className="text-center">No tenants found</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
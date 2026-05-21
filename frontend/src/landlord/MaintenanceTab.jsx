import React from 'react';

export default function MaintenanceTab({ maintenanceData, handleOpenMaintenance, handleDeleteMaintenanceClick }) {
  return (
    <section className="section-box card border-0 shadow-sm">
      <table className="table table-hover align-middle">
        <thead>
          <tr><th>Request Title</th><th>Unit</th><th>Priority</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {Array.isArray(maintenanceData) && maintenanceData.length > 0 ? maintenanceData.map((item) => (
            <tr key={item._id || item.id}>
              <td className="fw-medium">{item.title || item.request || 'N/A'}</td>
              <td className="fw-bold text-primary">{item.unitId?.unitNumber || item.unitId?.name || 'N/A'}</td>
              <td>
                <span className={`badge rounded-pill px-3 py-1 ${
                  item.priority === 'high' ? 'bg-danger-subtle text-danger' : 
                  item.priority === 'medium' ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'
                }`}>
                  {item.priority ? item.priority.toUpperCase() : 'LOW'}
                </span>
              </td>
              <td>
                <span className={`badge rounded-pill px-3 py-1 ${
                  item.status === 'resolved' ? 'bg-success-subtle text-success' : 
                  item.status === 'in-progress' ? 'bg-primary-subtle text-primary' : 
                  'bg-warning-subtle text-warning'
                }`}>
                  {item.status ? item.status.toUpperCase() : 'OPEN'}
                </span>
              </td>
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={() => handleOpenMaintenance(item)}>Update</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteMaintenanceClick(item._id || item.id)}>Delete</button>
              </td>
            </tr>
          )) : <tr><td colSpan="5" className="text-center py-4 text-muted">No maintenance requests</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
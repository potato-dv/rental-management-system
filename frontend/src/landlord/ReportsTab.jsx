import React from 'react';

export default function ReportsTab({ reportsData, handleOpenReport, handleDeleteReportClick }) {
  return (
    <section className="section-box card border-0 shadow-sm">
      <h2>Tenant Reports</h2>
      <table className="table table-hover align-middle">
        <thead>
          <tr><th>Tenant</th><th>Title</th><th>Category</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {Array.isArray(reportsData) && reportsData.length > 0 ? reportsData.map((report) => (
            <tr key={report._id || report.id}>
              <td className="fw-bold">{report.tenantId?.name || report.tenant?.name || 'N/A'}</td>
              <td className="fw-medium">{report.title || 'N/A'}</td>
              <td>{report.category || 'N/A'}</td>
              <td>
                 <span className={`badge rounded-pill px-3 py-1 ${
                   report.status === 'resolved' ? 'bg-success-subtle text-success' : 
                   report.status === 'reviewed' ? 'bg-info-subtle text-info' : 
                   'bg-warning-subtle text-warning'
                 }`}>
                   {report.status ? report.status.toUpperCase() : 'PENDING'}
                 </span>
              </td>
              <td>
                 <button className="btn btn-sm btn-primary me-2" onClick={() => handleOpenReport(report)}>Update</button>
                 <button className="btn btn-sm btn-danger" onClick={() => handleDeleteReportClick(report._id || report.id)}>Delete</button>
              </td>
            </tr>
          )) : <tr><td colSpan="5" className="text-center py-4">No reports filed</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
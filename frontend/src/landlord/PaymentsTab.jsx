import React from 'react';

export default function PaymentsTab({ 
  paymentsData, leasesData, paymentFilter, setPaymentFilter, handleVerifyPayment 
}) {
  return (
    <section className="section-box card border-0 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
        <h5 className="fw-bold mb-0">Payment Records</h5>
        <select 
          className="form-select form-select-sm" 
          style={{ width: 'auto', minWidth: '200px' }} 
          value={paymentFilter} 
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="pending">Show Pending / Unpaid</option>
          <option value="verified">Show Verified (History)</option>
          <option value="all">Show All Payments</option>
        </select>
      </div>
      <table className="table table-hover align-middle mt-3">
        <thead><tr><th>Tenant</th><th>Unit</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Actions</th></tr></thead>
        <tbody>
          {(() => {
            const filteredPayments = Array.isArray(paymentsData) ? paymentsData.filter(p => {
              const stat = p.status?.toLowerCase() || 'unpaid';
              if (paymentFilter === 'all') return true;
              if (paymentFilter === 'pending') return stat === 'pending' || stat === 'unpaid' || stat === 'overdue';
              if (paymentFilter === 'verified') return stat === 'verified';
              return true;
            }) : [];

            if (filteredPayments.length > 0) {
              return filteredPayments.map((payment) => {
                const tenantName = payment.tenantId?.name || payment.tenantId?.fullName || payment.tenant?.name || 'N/A';
                
                const relatedLease = leasesData.find(lease => 
                  String(lease._id || lease.id) === String(payment.leaseId?._id || payment.leaseId)
                );
                
                const unitName = relatedLease?.unitId?.unitNumber || relatedLease?.unitId?.name || 
                                 payment.leaseId?.unitId?.unitNumber || payment.unitId?.unitNumber || 'N/A';

                const dueDate = payment.dueDate || payment.date ? new Date(payment.dueDate || payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                
                return (
                  <tr key={payment._id || payment.id}>
                    <td className="fw-medium">{tenantName}</td>
                    <td className="fw-bold text-primary">{unitName}</td>
                    <td>₱{payment.amount?.toLocaleString() || 0}</td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-1 ${
                        payment.status === 'verified' ? 'bg-success-subtle text-success' : 
                        payment.status === 'pending' ? 'bg-warning-subtle text-warning' : 
                        'bg-danger-subtle text-danger'
                      }`}>
                        {payment.status ? payment.status.toUpperCase() : 'UNPAID'}
                      </span>
                    </td>
                    <td>{dueDate}</td>
                    <td>
                      {payment.status?.toLowerCase() === 'pending' ? 
                        <button className="btn btn-sm btn-success fw-bold" onClick={() => handleVerifyPayment(payment._id || payment.id)}>Verify</button> 
                        : <span className="text-muted small">No action</span>
                      }
                    </td>
                  </tr>
                );
              });
            } else {
              return <tr><td colSpan="6" className="text-center py-4 text-muted">No payment records found for this filter.</td></tr>;
            }
          })()}
        </tbody>
      </table>
    </section>
  );
}
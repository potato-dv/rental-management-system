import React from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function PaymentsTab({
  paymentsData,
  leasesData,
  paymentFilter,
  setPaymentFilter,
  handleVerifyPayment,
}) {
  const normalizeStatus = (statusValue) => {
    const rawStatus = statusValue?.toLowerCase();
    if (rawStatus === "paid") return "verified";
    if (rawStatus === "unpaid") return "pending";
    return rawStatus || "pending";
  };

  return (
    <section className="section-box card border-0 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
        <h5 className="fw-bold mb-0">Payment Records</h5>
        <select
          className="form-select form-select-sm"
          style={{ width: "auto", minWidth: "200px" }}
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="pending">Show Pending / Unpaid</option>
          <option value="verified">Show Verified / Paid</option>
          <option value="all">Show All Payments</option>
        </select>
      </div>
      <table className="table table-hover align-middle mt-3">
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Unit</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Reference #</th>
            <th>Proof</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const filteredPayments = Array.isArray(paymentsData)
              ? paymentsData.filter((p) => {
                  const normalizedStatus = normalizeStatus(p.status);
                  if (paymentFilter === "all") return true;
                  if (paymentFilter === "pending")
                    return (
                      normalizedStatus === "pending" ||
                      normalizedStatus === "overdue"
                    );
                  if (paymentFilter === "verified")
                    return normalizedStatus === "verified";
                  return true;
                })
              : [];

            if (filteredPayments.length > 0) {
              return filteredPayments.map((payment) => {
                const tenantName =
                  payment.tenantId?.name ||
                  payment.tenantId?.fullName ||
                  payment.tenant?.name ||
                  "N/A";

                const relatedLease = leasesData.find(
                  (lease) =>
                    String(lease._id || lease.id) ===
                    String(payment.leaseId?._id || payment.leaseId),
                );

                const unitName =
                  relatedLease?.unitId?.unitNumber ||
                  relatedLease?.unitId?.name ||
                  payment.leaseId?.unitId?.unitNumber ||
                  payment.unitId?.unitNumber ||
                  "N/A";

                const dueDate =
                  payment.dueDate || payment.date
                    ? new Date(
                        payment.dueDate || payment.date,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A";
                const normalizedStatus = normalizeStatus(payment.status);
                const isVerifiedStatus = normalizedStatus === "verified";
                const displayStatus = normalizedStatus;
                const proofValue =
                  typeof payment.proofOfPayment === "string"
                    ? payment.proofOfPayment.trim()
                    : "";
                const proofPath = proofValue
                  ? proofValue.replace(/\\/g, "/")
                  : "";
                const proofUrl = proofPath
                  ? /^https?:\/\//i.test(proofPath)
                    ? proofPath
                    : `${API_URL}/${proofPath.replace(/^\/+/, "")}`
                  : "";
                const canVerify =
                  (normalizedStatus === "pending" ||
                    normalizedStatus === "overdue") &&
                  Boolean(payment.proofOfPayment) &&
                  payment.recordedBy === "tenant";

                return (
                  <tr key={payment._id || payment.id}>
                    <td className="fw-medium">{tenantName}</td>
                    <td className="fw-bold text-primary">{unitName}</td>
                    <td>₱{payment.amount?.toLocaleString() || 0}</td>
                    <td>{payment.paymentMethod?.toUpperCase() || "N/A"}</td>
                    <td>{payment.referenceNumber || "N/A"}</td>
                    <td>
                      {proofUrl ? (
                        <a
                          href={proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="link-primary"
                        >
                          View Proof
                        </a>
                      ) : (
                        <span className="text-muted small">No proof</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill px-3 py-1 ${
                          isVerifiedStatus
                            ? "bg-success-subtle text-success"
                            : displayStatus === "pending"
                              ? "bg-warning-subtle text-warning"
                              : "bg-danger-subtle text-danger"
                        }`}
                      >
                        {displayStatus.toUpperCase()}
                      </span>
                    </td>
                    <td>{dueDate}</td>
                    <td>
                      {canVerify ? (
                        <button
                          className="btn btn-sm btn-success fw-bold"
                          onClick={() =>
                            handleVerifyPayment(payment._id || payment.id)
                          }
                        >
                          Verify
                        </button>
                      ) : (
                        <span className="text-muted small">No action</span>
                      )}
                    </td>
                  </tr>
                );
              });
            } else {
              return (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    No payment records found for this filter.
                  </td>
                </tr>
              );
            }
          })()}
        </tbody>
      </table>
    </section>
  );
}

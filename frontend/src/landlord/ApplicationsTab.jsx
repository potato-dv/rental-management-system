import React from "react";

export default function ApplicationsTab({
  applicationsData,
  leasesData,
  selectedApplication,
  setSelectedApplication,
  handleApproveApplication,
  handleDenyApplication,
}) {
  return (
    <section className="section-box card border-0 shadow-sm">
      <table className="table table-hover align-middle mb-4">
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Unit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const visibleApps = Array.isArray(applicationsData)
              ? applicationsData.filter((app) => {
                  const status = app.status?.toLowerCase() || "pending";
                  if (status === "pending") return true;
                  if (status === "approved") {
                    const tObj = app.tenantId || app.tenant || app.user;
                    const tId = tObj
                      ? String(
                          typeof tObj === "object" ? tObj._id || tObj.id : tObj,
                        )
                      : "";
                    const hasActiveLease = leasesData.some((lease) => {
                      const leaseTenantObj = lease.tenantId || lease.tenant;
                      const leaseTId = leaseTenantObj
                        ? String(
                            typeof leaseTenantObj === "object"
                              ? leaseTenantObj._id || leaseTenantObj.id
                              : leaseTenantObj,
                          )
                        : "";
                      return (
                        leaseTId === tId &&
                        (!lease.status ||
                          lease.status.toLowerCase() === "active")
                      );
                    });
                    return !hasActiveLease;
                  }
                  return false;
                })
              : [];

            if (visibleApps.length > 0) {
              return visibleApps.map((app) => {
                const applicantName =
                  app.tenantId?.name ||
                  app.tenantId?.fullName ||
                  app.tenant?.name ||
                  app.name ||
                  "N/A";
                const unitName =
                  app.unitId?.unitNumber ||
                  app.unitId?.name ||
                  app.unit?.name ||
                  "N/A";
                const isApproved = app.status?.toLowerCase() === "approved";

                return (
                  <tr
                    key={app._id || app.id}
                    onClick={() => setSelectedApplication(app)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="fw-medium">{applicantName}</td>
                    <td className="fw-bold">{unitName}</td>
                    <td>
                      {isApproved ? (
                        <span className="badge rounded-pill px-3 py-1 bg-info-subtle text-info">
                          Waiting for Lease
                        </span>
                      ) : (
                        <span className="badge rounded-pill px-3 py-1 bg-warning-subtle text-warning">
                          Pending
                        </span>
                      )}
                    </td>
                    <td>
                      {!isApproved && (
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveApplication(app._id || app.id);
                          }}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDenyApplication(app._id || app.id);
                        }}
                      >
                        {isApproved ? "Remove/Deny" : "Deny"}
                      </button>
                    </td>
                  </tr>
                );
              });
            } else {
              return (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    No pending or waiting applications
                  </td>
                </tr>
              );
            }
          })()}
        </tbody>
      </table>

      {selectedApplication &&
        selectedApplication.status?.toLowerCase() !== "denied" && (
          <div className="details-box card shadow-sm mt-4 p-4 border-0 bg-light">
            <h5 className="fw-bold mb-3">More Information</h5>
            <p className="mb-1">
              <strong>Name:</strong>{" "}
              {selectedApplication.tenantId?.name ||
                selectedApplication.name ||
                "N/A"}
            </p>
            <p className="mb-1">
              <strong>Applied Unit:</strong>{" "}
              {selectedApplication.unitId?.unitNumber || "N/A"}
            </p>
            <p className="mb-1">
              <strong>Move-in Date:</strong>{" "}
              {selectedApplication.moveInDate
                ? new Date(selectedApplication.moveInDate).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="mb-1">
              <strong>Move-out Date:</strong>{" "}
              {selectedApplication.moveOutDate
                ? new Date(selectedApplication.moveOutDate).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="mb-1">
              <strong>Message:</strong>{" "}
              {selectedApplication.message || "No message provided."}
            </p>
          </div>
        )}
    </section>
  );
}

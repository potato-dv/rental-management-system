import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function TenantDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Subukang kunin ang Tenant Data (I-catch natin ang error kung hindi pa siya tenant para walang red text sa console)
        try {
          const tenantRes = await axios.get(
            `${API_URL}/api/dashboard/tenant`,
            config,
          );
          setData(tenantRes.data.dashboard);
        } catch (tenantErr) {
          console.log("User is not a tenant yet or no active lease.");
        }

        // 2. Kunin ang mga Applications ng User para sa Tracker
        try {
          const appRes = await axios.get(
            `${API_URL}/api/applications/my/applications`,
            config,
          );
          // Depende sa backend format niyo, kunin ang array ng applications
          const apps =
            appRes.data.applications || appRes.data.data || appRes.data || [];
          setMyApplications(Array.isArray(apps) ? apps : []);
        } catch (appErr) {
          console.error("Error fetching applications:", appErr);
        }
      } catch (err) {
        console.error("Critical error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return <div className="p-5 text-center">Loading your account info...</div>;

  // I-check kung may active lease siya
  const hasActiveLease = data?.lease?.unitId;

  // Kunin ang pinakabagong application niya kung meron
  const latestApp = myApplications.length > 0 ? myApplications[0] : null;

  return (
    <div className="p-4 bg-light min-vh-100">
      <div className="mb-4">
        <h2 className="fw-bold">Welcome back, {user?.name || "User"}!</h2>
        <p className="text-muted">
          {hasActiveLease
            ? "Here is the summary of your rental account."
            : "Here is the status of your account."}
        </p>
      </div>

      {hasActiveLease ? (
        /* =========================================
           UI 1: REGULAR TENANT DASHBOARD (MAY LEASE)
           ========================================= */
        <>
          <div className="row g-3">
            {/* 1. RENT STATUS CARD */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-3 h-100">
                <small className="text-muted d-block mb-1">Rent Status</small>
                <h4
                  className={`fw-bold ${data?.payments?.overdue > 0 ? "text-danger" : "text-success"}`}
                >
                  {data?.payments?.overdue > 0 ? "Overdue" : "Up to date"}
                </h4>
                <small
                  className={
                    data?.payments?.overdue > 0 ? "text-danger" : "text-success"
                  }
                >
                  {data?.payments?.overdue > 0
                    ? `You have ${data.payments.overdue} overdue payment(s)`
                    : "Paid for current month"}
                </small>
              </div>
            </div>

            {/* 2. ASSIGNED UNIT CARD */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-3 h-100">
                <small className="text-muted d-block mb-1">Assigned Unit</small>
                <h4 className="fw-bold">
                  {data?.lease?.unitId?.unitNumber || "No Active Lease"}
                </h4>
                <small className="text-muted">
                  {data?.lease?.unitId?.type || "N/A"} - Floor{" "}
                  {data?.lease?.unitId?.floor || "0"}
                </small>
              </div>
            </div>

            {/* 3. TOTAL PAID CARD */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-3 h-100">
                <small className="text-muted d-block mb-1">
                  Total Amount Paid
                </small>
                <h4 className="fw-bold text-primary">
                  ₱{data?.payments?.totalPaid?.toLocaleString() || "0.00"}
                </h4>
                <small className="text-muted">Total verified payments</small>
              </div>
            </div>
          </div>

          {/* 4. RECENT ACTIVITY TABLE */}
          <div className="mt-5 card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-4">Recent Payment Activity</h5>
            <div className="table-responsive">
              <table className="table table-hover border-top">
                <thead className="text-muted" style={{ fontSize: "13px" }}>
                  <tr>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.payments?.recent?.length > 0 ? (
                    data.payments.recent.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </td>
                        <td>₱{payment.amount.toLocaleString()}</td>
                        <td>
                          <span
                            className={`badge rounded-pill ${
                              payment.status === "verified"
                                ? "bg-success-subtle text-success"
                                : payment.status === "overdue"
                                  ? "bg-danger-subtle text-danger"
                                  : "bg-warning-subtle text-warning"
                            }`}
                          >
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted">
                        No payment history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : latestApp ? (
        /* =========================================
           UI 2: APPLICATION TRACKER (WALANG LEASE PERO MAY APPLICATION)
           ========================================= */
        <div className="row mt-4">
          <div className="col-md-8 mx-auto">
            <div
              className={`card border-0 shadow p-5 text-center border-top border-4 ${
                latestApp.status === "approved"
                  ? "border-success"
                  : latestApp.status === "denied" ||
                      latestApp.status === "rejected"
                    ? "border-danger"
                    : "border-warning"
              }`}
            >
              <h5 className="text-muted mb-3">
                Application for Unit:{" "}
                <span className="fw-bold text-dark">
                  {latestApp.unitId?.unitNumber ||
                    latestApp.unitId?.name ||
                    "Selected Unit"}
                </span>
              </h5>

              {latestApp.status === "approved" && (
                <>
                  <h2 className="fw-bold text-success mb-3">
                    Application Approved! 🎉
                  </h2>
                  <p className="text-muted fs-5 mb-0">
                    Congratulations! Your application has been approved by the
                    landlord. Please wait while we process and activate your
                    official lease contract. You will be able to view your
                    payments and unit details here soon.
                  </p>
                </>
              )}

              {(latestApp.status === "denied" ||
                latestApp.status === "rejected") && (
                <>
                  <h2 className="fw-bold text-danger mb-3">
                    Application Denied
                  </h2>
                  <p className="text-muted fs-5 mb-0">
                    We're sorry, but your application for this unit was not
                    approved. You may browse other available units and try
                    submitting a new application.
                  </p>
                </>
              )}

              {(!latestApp.status || latestApp.status === "pending") && (
                <>
                  <h2 className="fw-bold text-warning mb-3">
                    Pending Review ⏳
                  </h2>
                  <p className="text-muted fs-5 mb-0">
                    Your application is currently being reviewed by the
                    landlord. Please check back later for updates.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* =========================================
           UI 3: NO RECORD AT ALL (BAGONG USER)
           ========================================= */
        <div className="row mt-4">
          <div className="col-md-8 mx-auto">
            <div className="card border-0 shadow-sm p-5 text-center">
              <h3 className="fw-bold text-secondary mb-3">
                No Active Applications
              </h3>
              <p className="text-muted fs-5 mb-0">
                You don't have any active leases or pending applications right
                now. Browse our available units to start your journey!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

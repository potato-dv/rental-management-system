import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Siguraduhing tama ang path nito

const API_URL = import.meta.env.VITE_API_URL;

export default function Overview() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kukunin natin yung applications galing sa backend
  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/api/applications/my/applications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setApplications(res.data.applications);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyApplications();
  }, [user]);

  return (
    <div
      className="container-fluid p-0"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* 1. MY APPLICATIONS (DYNAMIC - Nakakonekta sa Backend) */}
      <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        My Applications
      </h5>

      <div className="card border p-0 rounded-4 shadow-sm overflow-hidden mb-5">
        <div className="table-responsive">
          <table
            className="table table-hover mb-0"
            style={{ fontSize: "14px" }}
          >
            <thead className="bg-light text-muted">
              <tr>
                <th className="fw-medium px-4 py-3 border-0">Unit</th>
                <th className="fw-medium px-4 py-3 border-0">Move-in Date</th>
                <th className="fw-medium px-4 py-3 border-0">Move-out Date</th>
                <th className="fw-medium px-4 py-3 border-0">Date Applied</th>
                <th className="fw-medium px-4 py-3 border-0">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    You have no pending applications.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id}>
                    <td className="px-4 py-3 border-bottom-0 border-top">
                      <span className="fw-bold">
                        Unit {app.unitId?.unitNumber}
                      </span>{" "}
                      <br />
                      <span className="text-muted" style={{ fontSize: "12px" }}>
                        ₱{app.unitId?.price?.toLocaleString()} / mo
                      </span>
                    </td>
                    <td className="px-4 py-3 border-bottom-0 border-top">
                      {app.moveInDate
                        ? new Date(app.moveInDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 border-bottom-0 border-top">
                      {app.moveOutDate
                        ? new Date(app.moveOutDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 border-bottom-0 border-top">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 border-bottom-0 border-top">
                      <span
                        className={`badge rounded-pill px-3 py-2 ${
                          app.status === "approved"
                            ? "bg-success bg-opacity-25 text-success"
                            : app.status === "denied"
                              ? "bg-danger bg-opacity-25 text-danger"
                              : "bg-warning bg-opacity-25 text-warning"
                        }`}
                      >
                        {app.status?.charAt(0).toUpperCase() +
                          app.status?.slice(1) || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. LEASE INFORMATION CARD (STATIC muna para sa next task natin) */}
      <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
        >
          <path d="M3 21h18"></path>
          <path d="M9 8h1"></path>
          <path d="M9 12h1"></path>
          <path d="M9 16h1"></path>
          <path d="M14 8h1"></path>
          <path d="M14 12h1"></path>
          <path d="M14 16h1"></path>
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
        </svg>
        Lease Information
      </h5>
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-5">
        <div className="row g-4">
          <div className="col-md-6">
            <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
              Assigned Unit
            </p>
            <p className="fw-bold text-dark mb-0" style={{ fontSize: "16px" }}>
              Room 203
            </p>
          </div>
          <div className="col-md-6">
            <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
              Monthly Rent
            </p>
            <p className="fw-bold text-dark mb-0" style={{ fontSize: "18px" }}>
              ₱5,000/month
            </p>
          </div>
          <div className="col-md-6">
            <p
              className="text-muted mb-1 d-flex align-items-center gap-1"
              style={{ fontSize: "12px" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Lease Period
            </p>
            <p
              className="text-dark fw-medium mb-0"
              style={{ fontSize: "14px" }}
            >
              Jan 2025 — Dec 2025
            </p>
          </div>
          <div className="col-md-6">
            <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
              Status
            </p>
            <span
              className="badge bg-success bg-opacity-25 text-success rounded-pill px-3 py-2"
              style={{ fontSize: "12px", fontWeight: "600" }}
            >
              Active
            </span>
          </div>
        </div>
      </div>

      {/* 3. PAYMENTS SECTION (STATIC muna) */}
      <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
        Payments
      </h5>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border p-4 rounded-4 shadow-sm h-100">
            <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
              Total Paid
            </p>
            <h3 className="fw-bolder text-dark mb-0">₱25,000</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border p-4 rounded-4 shadow-sm h-100">
            <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
              Remaining Balance
            </p>
            <h3 className="fw-bolder text-dark mb-0">₱35,000</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-center">
            <p className="text-muted mb-2" style={{ fontSize: "13px" }}>
              Payment Status
            </p>
            <div>
              <span
                className="badge bg-warning bg-opacity-25 text-warning rounded-pill px-3 py-2"
                style={{ fontSize: "13px", fontWeight: "600" }}
              >
                Partially Paid
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

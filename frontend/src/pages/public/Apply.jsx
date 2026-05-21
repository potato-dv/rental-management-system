import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const ALLOWED_UNIT_TYPES = ["studio", "one-bedroom", "two-bedroom"];

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unit, setUnit] = useState(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [moveOutDate, setMoveOutDate] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/units/${id}`);

        const fetchedUnit =
          res.data.unit || res.data.units?.find((u) => u._id === id);
        if (
          fetchedUnit &&
          !ALLOWED_UNIT_TYPES.includes((fetchedUnit.type || "").toLowerCase())
        ) {
          setUnit(null);
          setError("This unit type is no longer available.");
          return;
        }
        setUnit(fetchedUnit);
      } catch (err) {
        setError("Failed to load unit details. It might have been removed.");
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form Validation for fe
    if (!user) return setError("You must be logged in to apply.");
    if (!moveInDate) return setError("Please select your target move-in date.");
    if (!moveOutDate)
      return setError("Please select your target move-out date.");
    if (!isMoveOutDateValid(moveInDate, moveOutDate)) {
      return setError(
        "Move-out date must be at least 1 month after the move-in date.",
      );
    }

    setSubmitLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/applications`,
        { unitId: id, moveInDate, moveOutDate, message },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccess(true);
      setTimeout(() => navigate("/tenant/dashboard"), 3000);
    } catch (err) {
      // User Feedback
      setError(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const getMinMoveOutDate = (startDate) => {
    if (!startDate) return "";
    const minDate = new Date(startDate);
    if (Number.isNaN(minDate.getTime())) return "";
    minDate.setMonth(minDate.getMonth() + 1);
    return minDate.toISOString().split("T")[0];
  };

  const isMoveOutDateValid = (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return false;
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end <= start) return false;
    const minEnd = new Date(start);
    minEnd.setMonth(minEnd.getMonth() + 1);
    return end >= minEnd;
  };

  if (loading)
    return (
      <div className="p-5 text-center mt-5">Loading application details...</div>
    );

  return (
    <div
      className="bg-light min-vh-100 py-5"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="container" style={{ maxWidth: "600px" }}>
        <Link
          to="/browse"
          className="text-decoration-none text-muted mb-4 d-inline-block fw-semibold"
        >
          &larr; Back to Browse
        </Link>

        <div
          className="card border-0 shadow-sm p-4 p-md-5"
          style={{ borderRadius: "12px" }}
        >
          <h3 className="fw-bold mb-4">Rental Application</h3>

          {/* error msg "You already have a pending application" */}
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {success && (
            <div className="alert alert-success py-2">
              Application submitted successfully! Redirecting to dashboard...
            </div>
          )}

          {/* Unit Summary */}
          {unit && (
            <div className="bg-light p-3 rounded-3 mb-4 border border-info border-opacity-25">
              <h6 className="fw-bold mb-1">Unit {unit.unitNumber}</h6>
              <p className="text-muted small mb-0">
                {unit.type} • ₱{unit.price?.toLocaleString()} / month
              </p>
            </div>
          )}

          {!user ? (
            <div className="text-center py-4">
              <p className="text-muted mb-4">
                You need an account to apply for a rental unit.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <Link
                  to="/login"
                  className="btn btn-outline-primary px-4 rounded-pill fw-semibold"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary px-4 rounded-pill fw-semibold"
                  style={{ backgroundColor: "#0ea5e9", border: "none" }}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="fw-bold small mb-2">
                  Applicant Information
                </label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={`${user.name} (${user.email})`}
                  disabled
                />
                <small className="text-muted" style={{ fontSize: "11px" }}>
                  This information will be sent to the admin.
                </small>
              </div>

              {/* new field for be */}
              <div className="mb-3">
                <label className="fw-bold small mb-2">
                  Target Move-in Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={moveInDate}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setMoveInDate(nextValue);
                    if (
                      moveOutDate &&
                      !isMoveOutDateValid(nextValue, moveOutDate)
                    ) {
                      setMoveOutDate("");
                    }
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="fw-bold small mb-2">
                  Target Move-out Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={moveOutDate}
                  onChange={(e) => setMoveOutDate(e.target.value)}
                  min={getMinMoveOutDate(moveInDate)}
                  disabled={!moveInDate}
                  required
                />
                <small className="text-muted" style={{ fontSize: "11px" }}>
                  Minimum rental period is 1 month.
                </small>
              </div>

              <div className="mb-4">
                <label className="fw-bold small mb-2">
                  Message to Landlord (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Tell the landlord a bit about yourself or ask a question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn w-100 text-white fw-bold py-2"
                style={{ backgroundColor: "#0ea5e9", borderRadius: "6px" }}
                disabled={submitLoading || success}
              >
                {submitLoading
                  ? "Submitting Application..."
                  : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

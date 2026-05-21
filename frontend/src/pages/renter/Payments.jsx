import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FiUpload, FiCheckCircle } from "react-icons/fi";

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States for Upload
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [refNumber, setRefNumber] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Fetch Tenant's Payments
  const fetchPayments = async () => {
    if (user?.role !== "tenant") {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:8000/api/payments/my/payments",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setErrorMsg("Failed to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const normalizeStatus = (payment) => {
    const rawStatus = payment?.status?.toLowerCase();
    if (rawStatus === "paid") return "verified";
    if (rawStatus === "unpaid") return "pending";
    return rawStatus || "pending";
  };

  // 2. Computations for Dashboard Cards
  const totalPaid = payments
    .filter((p) => normalizeStatus(p) === "verified")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const remainingBalance = payments
    .filter((p) => normalizeStatus(p) !== "verified")
    .reduce((sum, p) => sum + (p.remainingBalance || p.amount || 0), 0);

  const hasOverdue = payments.some((p) => normalizeStatus(p) === "overdue");

  const unpaidBills = payments.filter((p) => normalizeStatus(p) !== "verified");

  // 3. Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      const maxSize = 5 * 1024 * 1024;
      if (!allowedTypes.includes(file.type) || file.size > maxSize) {
        setErrorMsg(
          "Only JPG, PNG, WEBP, or PDF files up to 5MB are accepted.",
        );
        setSuccessMsg("");
        setFileName("");
        setProofFile(null);
        setFileBase64("");
        e.target.value = "";
        return;
      }
      setFileName(file.name);
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. Submit Payment Record
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPaymentId) return setErrorMsg("Please select a bill to pay.");
    if (!proofFile) return setErrorMsg("Please upload a proof of payment.");

    setSubmitLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("paymentMethod", paymentMethod);
      formData.append("referenceNumber", refNumber);
      formData.append("proofOfPayment", proofFile);

      await axios.post(
        `http://localhost:8000/api/payments/${selectedPaymentId}/record`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccessMsg(
        "Payment submitted successfully! Waiting for admin verification.",
      );

      setPaymentMethod("");
      setRefNumber("");
      setFileBase64("");
      setFileName("");
      setProofFile(null);
      setSelectedPaymentId("");

      fetchPayments();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit payment.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!user || loading)
    return (
      <div className="p-5 text-center text-muted min-vh-100">
        Loading payment details...
      </div>
    );

  if (user?.role !== "tenant") {
    return (
      <div
        className="p-4 bg-light min-vh-100"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Payments</h2>
          <p className="text-muted small">
            View your payment history and submit new payment receipts.
          </p>
        </div>

        <div className="row mt-4">
          <div className="col-md-8 mx-auto">
            <div className="card border-0 shadow-sm p-5 text-center">
              <h3 className="fw-bold text-secondary mb-3">No Active Lease</h3>
              <p className="text-muted fs-5 mb-0">
                Payments will be available once your application is approved and
                an official lease is created by the landlord.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 bg-light min-vh-100"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Payments</h2>
        <p className="text-muted small">
          View your payment history and submit new payment receipts.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <small className="text-muted d-block mb-2">Total Paid</small>
            <h3 className="fw-bold mb-0 text-success">
              ₱{totalPaid.toLocaleString()}
            </h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <small className="text-muted d-block mb-2">Remaining Balance</small>
            <h3 className="fw-bold mb-0 text-danger">
              ₱{remainingBalance.toLocaleString()}
            </h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <small className="text-muted d-block mb-2">Account Status</small>
            <span
              className={`badge rounded-pill px-3 py-2 ${hasOverdue ? "bg-danger-subtle text-danger" : remainingBalance > 0 ? "bg-warning-subtle text-warning" : "bg-success-subtle text-success"}`}
              style={{ width: "fit-content" }}
            >
              {hasOverdue
                ? "Overdue"
                : remainingBalance > 0
                  ? "Has Pending Balance"
                  : "Fully Paid"}
            </span>
          </div>
        </div>
      </div>

      {/* PAYMENT HISTORY TABLE */}
      <div className="card border-0 shadow-sm mb-5">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-4">Payment History</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="text-muted small">
                <tr>
                  <th className="border-0">DUE DATE</th>
                  <th className="border-0">AMOUNT</th>
                  <th className="border-0">PAYMENT METHOD</th>
                  <th className="border-0">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="py-3 fw-medium">
                        {new Date(payment.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 fw-bold">
                        ₱{payment.amount.toLocaleString()}
                      </td>
                      <td className="py-3 text-muted small">
                        {payment.paymentMethod || "N/A"}
                      </td>
                      <td>
                        {(() => {
                          const status = normalizeStatus(payment);
                          return (
                            <span
                              className={`badge rounded-pill px-3 py-1 ${
                                status === "verified"
                                  ? "bg-success-subtle text-success"
                                  : status === "pending"
                                    ? "bg-warning-subtle text-warning"
                                    : "bg-danger-subtle text-danger"
                              }`}
                            >
                              {status.toUpperCase()}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-4 text-muted small"
                    >
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* UPLOAD RECEIPT FORM */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-1">Upload Receipt</h5>
          <p className="text-muted small mb-4">
            Select a pending bill and submit your proof of payment for
            verification.
          </p>

          {successMsg && (
            <div className="alert alert-success py-2 text-center">
              <FiCheckCircle className="me-2" />
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="alert alert-danger py-2 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              {/* SELECT BILL */}
              <div className="col-12">
                <label className="small fw-semibold mb-2">
                  Select Bill to Pay <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={selectedPaymentId}
                  onChange={(e) => setSelectedPaymentId(e.target.value)}
                  required
                >
                  <option value="">-- Select an unpaid bill --</option>
                  {unpaidBills.map((bill) => (
                    <option key={bill._id} value={bill._id}>
                      Due: {new Date(bill.dueDate).toLocaleDateString()} - ₱
                      {bill.amount.toLocaleString()}
                    </option>
                  ))}
                </select>
                {unpaidBills.length === 0 && (
                  <small className="text-success mt-1 d-block">
                    You have no pending bills to pay right now.
                  </small>
                )}
              </div>

              {/* PAYMENT METHOD */}
              <div className="col-md-6">
                <label className="small fw-semibold mb-2">
                  Payment Method <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                  disabled={unpaidBills.length === 0}
                >
                  <option value="">Select Method</option>
                  <option value="gcash">GCash</option>
                  <option value="maya">Maya</option>
                  <option value="bank transfer">Bank Transfer</option>
                </select>
              </div>

              {/* REFERENCE NUMBER */}
              <div className="col-md-6">
                <label className="small fw-semibold mb-2">
                  Reference Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 10029348123"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  required
                  disabled={unpaidBills.length === 0}
                />
              </div>
            </div>

            {/* BAGO: FILE UPLOAD WITH IMAGE PREVIEW */}
            <div className="mb-4">
              <label className="small fw-semibold mb-2">
                Proof of Payment <span className="text-danger">*</span>
              </label>
              <div
                className={`border rounded-3 p-4 text-center bg-light ${unpaidBills.length === 0 ? "opacity-50" : ""}`}
                style={{
                  borderStyle: "dashed !important",
                  cursor: unpaidBills.length === 0 ? "not-allowed" : "pointer",
                }}
                onClick={() =>
                  unpaidBills.length > 0 &&
                  document.getElementById("fileInput").click()
                }
              >
                <input
                  type="file"
                  id="fileInput"
                  className="d-none"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  disabled={unpaidBills.length === 0}
                />

                {fileBase64 ? (
                  // KUNG MAY NA-SELECT NA FILE: Magpakita ng preview!
                  <div>
                    {/* Check natin kung image yung in-upload para ma-preview, kung PDF, icon lang */}
                    {fileBase64.startsWith("data:image") ? (
                      <img
                        src={fileBase64}
                        alt="Receipt Preview"
                        style={{
                          maxHeight: "180px",
                          maxWidth: "100%",
                          objectFit: "contain",
                          borderRadius: "8px",
                          marginBottom: "12px",
                        }}
                      />
                    ) : (
                      <div className="mb-2">
                        <FiCheckCircle size={40} color="#10b981" />
                      </div>
                    )}
                    <p className="fw-semibold mb-1 small text-success">
                      Selected: {fileName}
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                      Click anywhere in this box to change file
                    </p>
                  </div>
                ) : (
                  // KUNG WALA PANG NA-SELECT: Ipakita yung default upload icon
                  <div>
                    <div className="mb-2">
                      <FiUpload size={32} color="#0ea5e9" />
                    </div>
                    <p className="fw-semibold mb-1 small">
                      Click to upload screenshot
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                      JPG, PNG, WEBP or PDF (max. 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-primary px-5 py-2 fw-bold"
                style={{
                  backgroundColor: "#0ea5e9",
                  border: "none",
                  borderRadius: "8px",
                }}
                disabled={submitLoading || unpaidBills.length === 0}
              >
                {submitLoading ? "Submitting..." : "Submit Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiMapPin,
  FiHome,
  FiSearch,
  FiFilter,
  FiX,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import rentixLogo from "../../assets/RentixLogo.jpg";
import rentixName from "../../assets/RentixName.jpg";
import studioImage from "../../assets/images/studio.jpg";
import oneBedroomImage from "../../assets/images/1bedroom.jpg";
import twoBedroomImage from "../../assets/images/2bedroom.jpg";

const ALLOWED_UNIT_TYPES = ["studio", "one-bedroom", "two-bedroom"];

export default function Browse() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal States
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [moveOutDate, setMoveOutDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  // === BAGONG STATE PARA SA IMAGE CAROUSEL ===
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const typeImageMap = {
    studio: studioImage,
    "one-bedroom": oneBedroomImage,
    "1-bedroom": oneBedroomImage,
    "one bedroom": oneBedroomImage,
    "two-bedroom": twoBedroomImage,
    "2-bedroom": twoBedroomImage,
    "two bedroom": twoBedroomImage,
  };

  const getUnitImages = (unit) => {
    if (!unit) return [];
    if (Array.isArray(unit.images) && unit.images.length > 0) {
      return unit.images;
    }
    const typeKey = (unit.type || "").toLowerCase();
    const fallbackImage = typeImageMap[typeKey];
    return fallbackImage ? [fallbackImage] : [];
  };

  const formatType = (typeStr) => {
    if (!typeStr) return "Unknown Type";
    return typeStr
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const normalizeSearchText = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

  const getTypeKeywords = (type) => {
    const typeKey = (type || "").toLowerCase();
    if (typeKey === "one-bedroom") {
      return [
        "one bedroom",
        "one-bedroom",
        "1 bedroom",
        "1-bedroom",
        "1bedroom",
        "onebedroom",
      ];
    }
    if (typeKey === "two-bedroom") {
      return [
        "two bedroom",
        "two-bedroom",
        "2 bedroom",
        "2-bedroom",
        "2bedroom",
        "twobedroom",
      ];
    }
    if (typeKey === "studio") {
      return ["studio", "studio unit", "studio apartment"];
    }
    return [];
  };

  const getUnitIdentifierKeywords = (unit) => {
    const identifiers = [unit?.unitNumber, unit?.name]
      .filter(Boolean)
      .map((value) => String(value).trim())
      .filter((value) => value !== "");
    const keywords = new Set();
    identifiers.forEach((value) => {
      keywords.add(value);
      keywords.add(`unit ${value}`);
      keywords.add(`unit${value}`);
      const withoutUnitPrefix = value.replace(/^unit\s+/i, "").trim();
      if (withoutUnitPrefix) keywords.add(withoutUnitPrefix);
    });
    return Array.from(keywords);
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/units");
        const fetchedUnits = res.data.units || [];
        const allowedUnits = fetchedUnits.filter((unit) =>
          ALLOWED_UNIT_TYPES.includes((unit.type || "").toLowerCase()),
        );
        setUnits(allowedUnits);
        setFilteredUnits(allowedUnits);
      } catch (err) {
        setError("Failed to load rental units.");
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    let result = units;
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedSearchCompact = normalizeSearchText(searchTerm);
    const normalizedSearchNoUnit = normalizedSearch.replace(/^unit\s+/i, "").trim();
    const normalizedSearchCompactNoUnit = normalizeSearchText(normalizedSearchNoUnit);

    if (normalizedSearch) {
      result = result.filter((unit) => {
        const searchableValues = [
          unit.unitNumber,
          unit.name,
          ...getUnitIdentifierKeywords(unit),
          unit.description,
          unit.type,
          formatType(unit.type),
          ...getTypeKeywords(unit.type),
          unit.floor,
          unit.status,
          unit.property,
          unit.price,
          unit.rent,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        return searchableValues.some((value) => {
          if (value.includes(normalizedSearch)) return true;
          if (normalizedSearchNoUnit && value.includes(normalizedSearchNoUnit)) {
            return true;
          }
          const normalizedValueCompact = normalizeSearchText(value);
          if (
            normalizedSearchCompact &&
            normalizedValueCompact.includes(normalizedSearchCompact)
          ) {
            return true;
          }
          return (
            normalizedSearchCompactNoUnit &&
            normalizedValueCompact.includes(normalizedSearchCompactNoUnit)
          );
        });
      });
    }
    if (typeFilter !== "All") {
      result = result.filter((unit) => unit.type === typeFilter);
    }
    if (statusFilter !== "All") {
      result = result.filter((unit) => unit.status === statusFilter);
    }

    setFilteredUnits(result);
  }, [searchTerm, typeFilter, statusFilter, units]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!moveInDate) return setApplyError("Please select a move-in date.");
    if (!moveOutDate) return setApplyError("Please select a move-out date.");
    if (!isMoveOutDateValid(moveInDate, moveOutDate)) {
      return setApplyError(
        "Move-out date must be at least 1 month after the move-in date.",
      );
    }

    setSubmitLoading(true);
    setApplyError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/api/applications",
        { unitId: selectedUnit._id, moveInDate, moveOutDate, message },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setApplySuccess(true);
    } catch (err) {
      setApplyError(
        err.response?.data?.message || "Failed to submit application.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedUnit(null);
    setApplySuccess(false);
    setApplyError("");
    setMessage("");
    setMoveInDate("");
    setMoveOutDate("");
    setCurrentImageIndex(0); // I-reset ang image index kapag sinara ang modal
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
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return false;
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end <= start) return false;
    const minEnd = new Date(start);
    minEnd.setMonth(minEnd.getMonth() + 1);
    return end >= minEnd;
  };

  const selectedUnitImages = getUnitImages(selectedUnit);

  if (loading)
    return (
      <div className="p-5 text-center min-vh-100 d-flex align-items-center justify-content-center">
        Loading units...
      </div>
    );

  return (
    <div
      className="bg-light min-vh-100 pb-5 position-relative"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* HEADER */}
      <header className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom w-100 position-sticky top-0 z-3">
        <Link
          to="/"
          className="d-flex align-items-center gap-2 text-decoration-none"
        >
          <img src={rentixLogo} alt="Logo" style={{ width: "32px" }} />
          <img src={rentixName} alt="Name" style={{ height: "20px" }} />
        </Link>
        <div
          className="d-flex align-items-center gap-4"
          style={{ fontSize: "14px" }}
        >
          <Link
            to="/browse"
            className="text-decoration-none fw-bold"
            style={{ color: "#0ea5e9" }}
          >
            Browse
          </Link>
          <Link
            to="/contact"
            className="text-decoration-none text-dark fw-semibold d-none d-sm-block"
          >
            Contact Us
          </Link>
          {!user ? (
            <Link
              to="/login"
              className="btn btn-outline-secondary rounded-pill px-4"
              style={{ fontSize: "14px", fontWeight: "500" }}
            >
              Sign In
            </Link>
          ) : (
            // DITO YUNG NA-UPDATE NA LINK ROUTE
            <Link
              to="/tenant/dashboard"
              className="btn btn-primary rounded-pill px-4 text-white"
              style={{
                backgroundColor: "#0ea5e9",
                border: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="bg-white border-bottom py-5 mb-4 text-center px-3">
        <h1 className="fw-bold mb-3" style={{ color: "#0f172a" }}>
          Discover Your Next Home
        </h1>
        <p className="text-muted mx-auto" style={{ maxWidth: "600px" }}>
          Browse our collection of premium rental units.
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="container">
        {/* FILTERS */}
        <div
          className="card border-0 shadow-sm mb-4 p-3"
          style={{ borderRadius: "12px" }}
        >
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <FiSearch />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0 shadow-none py-2"
                  placeholder="Search unit number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <FiFilter />
                </span>
                <select
                  className="form-select border-start-0 shadow-none py-2"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="studio">Studio</option>
                  <option value="one-bedroom">One Bedroom</option>
                  <option value="two-bedroom">Two Bedroom</option>
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <FiFilter />
                </span>
                <select
                  className="form-select border-start-0 shadow-none py-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* UNIT CARDS */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredUnits.length > 0 ? (
            filteredUnits.map((unit) => {
              const unitImages = getUnitImages(unit);
              const displayImage = unitImages[0] || null;

              return (
                <div key={unit._id} className="col">
                  <div
                    className="card h-100 border-0 shadow-sm"
                    style={{ borderRadius: "12px", overflow: "hidden" }}
                  >
                    <div
                      className="bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center position-relative"
                      style={{ height: "200px" }}
                    >
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={`Unit ${unit.unitNumber}`}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <FiHome size={40} className="text-muted opacity-50" />
                      )}
                      <span
                        className={`position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-2 ${unit.status === "available" ? "bg-success" : "bg-danger"}`}
                      >
                        {unit.status
                          ? unit.status.charAt(0).toUpperCase() +
                            unit.status.slice(1)
                          : "Available"}
                      </span>
                    </div>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold mb-0">Unit {unit.unitNumber}</h5>
                        <h5
                          className="fw-bold mb-0"
                          style={{ color: "#0ea5e9" }}
                        >
                          ₱{unit.price?.toLocaleString()}
                          <small className="text-muted fw-normal">/mo</small>
                        </h5>
                      </div>

                      <p className="text-muted small mb-3 text-truncate">
                        {unit.description || "A beautiful and spacious unit."}
                      </p>

                      <div className="d-flex gap-4 text-muted small mb-4 mt-2">
                        <div className="d-flex align-items-center gap-2">
                          <FiHome /> {formatType(unit.type)}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <FiMapPin /> Flr {unit.floor || "1"}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUnit(unit);
                          setCurrentImageIndex(0); // Siguraduhing sa unang picture mag-i-start
                        }}
                        className="btn w-100 fw-bold rounded-3 btn-outline-primary"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center py-5 text-muted">
              <h4>No units match your search.</h4>
            </div>
          )}
        </div>
      </div>

      {/* --- POP-UP MODAL --- */}
      {selectedUnit && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center z-3"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="bg-white rounded-4 shadow-lg position-relative"
            style={{
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <button
              onClick={closeModal}
              className="btn btn-light position-absolute top-0 end-0 m-3 rounded-circle shadow-sm"
              style={{ zIndex: 10 }}
            >
              <FiX size={20} />
            </button>

            {/* === IMAGE CAROUSEL SECTION === */}
            <div
              className="bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center position-relative"
              style={{ height: "250px" }}
            >
              {selectedUnitImages.length > 0 ? (
                <>
                  <img
                    src={selectedUnitImages[currentImageIndex]}
                    alt={`Unit ${selectedUnit.unitNumber}`}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />

                  {/* Ipakita lang ang buttons at dots kung higit sa isa ang picture */}
                  {selectedUnitImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === 0
                              ? selectedUnitImages.length - 1
                              : prev - 1,
                          )
                        }
                        className="btn btn-light position-absolute start-0 ms-3 rounded-circle shadow-sm d-flex align-items-center justify-content-center p-2"
                        style={{ zIndex: 5, opacity: 0.8 }}
                      >
                        <FiChevronLeft size={24} />
                      </button>

                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === selectedUnitImages.length - 1
                              ? 0
                              : prev + 1,
                          )
                        }
                        className="btn btn-light position-absolute end-0 me-3 rounded-circle shadow-sm d-flex align-items-center justify-content-center p-2"
                        style={{ zIndex: 5, opacity: 0.8 }}
                      >
                        <FiChevronRight size={24} />
                      </button>

                      {/* Navigation Dots sa ibaba ng image */}
                      <div className="position-absolute bottom-0 mb-3 d-flex gap-2">
                        {selectedUnitImages.map((_, idx) => (
                          <div
                            key={idx}
                            className={`rounded-circle ${idx === currentImageIndex ? "bg-white" : "bg-light bg-opacity-50"}`}
                            style={{
                              width: "8px",
                              height: "8px",
                              cursor: "pointer",
                              transition: "all 0.3s",
                            }}
                            onClick={() => setCurrentImageIndex(idx)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <FiHome size={60} className="text-muted opacity-50" />
              )}
            </div>

            {/* Details Area */}
            <div className="p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h2 className="fw-bold mb-1">
                    Unit {selectedUnit.unitNumber}
                  </h2>
                  <h4 className="fw-bold mb-0" style={{ color: "#0ea5e9" }}>
                    ₱{selectedUnit.price?.toLocaleString()}
                    <small
                      className="text-muted fw-normal"
                      style={{ fontSize: "16px" }}
                    >
                      /month
                    </small>
                  </h4>
                </div>
                <span
                  className={`badge rounded-pill px-4 py-2 ${selectedUnit.status === "available" ? "bg-success" : "bg-danger"}`}
                >
                  {selectedUnit.status
                    ? selectedUnit.status.charAt(0).toUpperCase() +
                      selectedUnit.status.slice(1)
                    : "Available"}
                </span>
              </div>

              {/* Full Description */}
              <p className="text-muted mb-4">{selectedUnit.description}</p>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="bg-light p-3 rounded-3 text-center border">
                    <FiHome className="text-muted mb-1" size={20} />
                    <br />
                    <strong className="small">
                      {formatType(selectedUnit.type)}
                    </strong>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-light p-3 rounded-3 text-center border">
                    <FiMapPin className="text-muted mb-1" size={20} />
                    <br />
                    <strong className="small">
                      Floor {selectedUnit.floor}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="border-top pt-4 mt-2">
                {!user ? (
                  <div className="d-flex justify-content-end">
                    <button
                      onClick={() => navigate("/login")}
                      className={`btn fw-bold px-5 py-2 rounded-3 text-white ${selectedUnit.status !== "available" ? "disabled bg-secondary" : ""}`}
                      style={{
                        backgroundColor:
                          selectedUnit.status === "available" ? "#0ea5e9" : "",
                      }}
                    >
                      Apply
                    </button>
                  </div>
                ) : applySuccess ? (
                  <div className="alert alert-success text-center py-3 rounded-3 mb-0">
                    <FiCheckCircle size={30} className="mb-2" />
                    <br />
                    <strong>Application Submitted!</strong> View status in your
                    dashboard.
                  </div>
                ) : (
                  <form
                    onSubmit={handleApply}
                    className="bg-light p-4 rounded-4 border"
                  >
                    <h6 className="fw-bold mb-3">Complete your Application</h6>
                    {applyError && (
                      <div
                        className="alert alert-danger py-2"
                        style={{ fontSize: "13px" }}
                      >
                        {applyError}
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="fw-bold small mb-2">
                        Target Move-in Date{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={moveInDate}
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          setMoveInDate(nextValue);
                          const minEnd = getMinMoveOutDate(nextValue);
                          if (
                            minEnd &&
                            (!moveOutDate ||
                              !isMoveOutDateValid(nextValue, moveOutDate))
                          ) {
                            setMoveOutDate(minEnd);
                          }
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="fw-bold small mb-2">
                        Target Move-out Date{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={moveOutDate}
                        onChange={(e) => setMoveOutDate(e.target.value)}
                        min={getMinMoveOutDate(moveInDate)}
                        required
                        disabled={!moveInDate}
                      />
                      <small className="text-muted">
                        Minimum rental period is 1 month.
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="fw-bold small mb-2 text-muted">
                        Message to Landlord (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="d-flex justify-content-end mt-2">
                      <button
                        type="submit"
                        className={`btn fw-bold px-5 py-2 rounded-3 text-white ${selectedUnit.status !== "available" ? "disabled bg-secondary" : ""}`}
                        style={{
                          backgroundColor:
                            selectedUnit.status === "available"
                              ? "#0ea5e9"
                              : "",
                        }}
                        disabled={
                          submitLoading || selectedUnit.status !== "available"
                        }
                      >
                        {submitLoading ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";

export default function DashboardTab({ stats, revenueData, paymentsData }) {
  return (
    <section className="section-box card border-0 shadow-sm">
      <h2>Rental Statistics</h2>
      <div className="dashboard-grid">
        <div className="summary-card card shadow-sm">
          <p>Active Tenants</p>
          <h3>{stats.activeTenants}</h3>
        </div>
        <div className="summary-card card shadow-sm">
          <p>Units Total</p>
          <h3>{stats.unitsTotal}</h3>
        </div>
        <div className="summary-card card shadow-sm">
          <p>Occupied Units</p>
          <h3>{stats.occupiedUnits}</h3>
        </div>
        <div className="summary-card card shadow-sm">
          <p>Maintenance Request</p>
          <h3>{stats.maintenanceRequests}</h3>
        </div>
      </div>
      <div className="graph-stack">
        <div className="graph-card card shadow-sm">
          <div className="graph-title-row">
            <h3>Total Revenue</h3>
            <div className="graph-total">
              <p>Total Revenue</p>
              <h3>₱{stats.totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
          <div className="bar-chart">
            {Array.isArray(revenueData) &&
              revenueData.map((item) => (
                <div className="bar-item" key={item.month}>
                  <span>{item.amount}</span>
                  <div className="bar-bg">
                    <div
                      className="bar-fill"
                      style={{ height: item.height }}
                    ></div>
                  </div>
                  <p>{item.month}</p>
                </div>
              ))}
          </div>
        </div>
        <div className="graph-card card shadow-sm">
          <h3>Rents Collected This Month</h3>
          <div className="pie-layout">
            <div className="pie-chart"></div>
            <div className="pie-info">
              <p>Total Tenants: {stats.activeTenants}</p>
              <p>
                <span className="color-box rent-color"></span>Rent Collected: ₱
                {stats.totalRevenue.toLocaleString()}
              </p>
              <p>
                <span className="color-box late-color"></span>Late/Unpaid:{" "}
                {Array.isArray(paymentsData)
                  ? paymentsData.filter((p) => {
                      const normalizedStatus =
                        p.status?.toLowerCase() === "unpaid"
                          ? "pending"
                          : p.status?.toLowerCase();
                      return (
                        normalizedStatus === "pending" ||
                        normalizedStatus === "overdue"
                      );
                    }).length
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

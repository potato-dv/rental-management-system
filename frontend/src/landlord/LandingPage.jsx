import { useState, useEffect } from "react";
import axios from "axios";
import {
  ClipboardList, CreditCard, FileText, HelpCircle, Home, LayoutDashboard,
  LogOut, Settings, Users, Wrench, CheckCircle, XCircle      
} from "lucide-react";
import rentixLogo from "../assets/RentixLogo.jpg";
import rentixName from "../assets/RentixName.jpg";
import "./landlord.css";

import DashboardTab from "./DashboardTab";
import UnitsTab from "./UnitsTab";
import PaymentsTab from "./PaymentsTab";
import TenantsTab from "./TenantsTab";
import ApplicationsTab from "./ApplicationsTab";
import MaintenanceTab from "./MaintenanceTab";
import LeasingTab from "./LeasingTab";
import ReportsTab from "./ReportsTab";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Units", icon: Home },
  { name: "Payments", icon: CreditCard },
  { name: "Tenants", icon: Users },
  { name: "Applications", icon: ClipboardList },
  { name: "Maintenance", icon: Wrench },
  { name: "Leasing", icon: FileText },
  { name: "Help/Supports", icon: HelpCircle },
];

export const LandingPage = () => {
  const [page, setPage] = useState("Dashboard");
  
  // DYNAMIC STATES
  const [stats, setStats] = useState({ activeTenants: 0, unitsTotal: 0, occupiedUnits: 0, maintenanceRequests: 0, totalRevenue: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [unitsData, setUnitsData] = useState([]);
  const [tenantsData, setTenantsData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [applicationsData, setApplicationsData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [leasesData, setLeasesData] = useState([]);
  const [reportsData, setReportsData] = useState([]); 
  
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("pending");

  // === MODAL STATES ===
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState(null); 
  const [unitFormData, setUnitFormData] = useState({ name: "", property: "Rentix Property", rent: "", status: "available", type: "studio", images: "", floor: "", description: "" });
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [leaseFormData, setLeaseFormData] = useState({ applicationId: "", tenantId: "", unitId: "", unitDisplay: "", rent: 0, startDate: "", endDate: "" });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  
  const [showDeleteTenantModal, setShowDeleteTenantModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [maintenanceStatus, setMaintenanceStatus] = useState('');
  
  // BAGO: States para sa Custom Delete ng Maintenance
  const [showDeleteMaintenanceModal, setShowDeleteMaintenanceModal] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportStatus, setReportStatus] = useState('');
  
  // BAGO: States para sa Custom Delete ng Reports
  const [showDeleteReportModal, setShowDeleteReportModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => { setNotification({ show: true, message, type }); };

  const extractArray = (responseData) => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData; 
    if (responseData.data && Array.isArray(responseData.data)) return responseData.data; 
    if (typeof responseData === 'object') {
      const arrayKey = Object.keys(responseData).find(key => Array.isArray(responseData[key]));
      if (arrayKey) return responseData[arrayKey];
    }
    return []; 
  };

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [ unitsRes, tenantsRes, maintenanceRes, paymentsRes, applicationsRes, leasesRes, reportsRes ] = await Promise.all([
          axios.get('http://localhost:8000/api/units', config).catch(() => ({ data: [] })),
          axios.get('http://localhost:8000/api/tenants', config).catch(() => ({ data: [] })),
          axios.get('http://localhost:8000/api/maintenance', config).catch(() => ({ data: [] })),
          axios.get('http://localhost:8000/api/payments', config).catch(() => ({ data: [] })),
          axios.get('http://localhost:8000/api/applications', config).catch(() => ({ data: [] })),
          axios.get('http://localhost:8000/api/leases', config).catch(() => ({ data: [] })),
          axios.get('http://localhost:8000/api/reports', config).catch(() => ({ data: [] }))
        ]);

        const fetchedUnits = extractArray(unitsRes.data);
        const fetchedTenants = extractArray(tenantsRes.data);
        const fetchedMaintenance = extractArray(maintenanceRes.data);
        const fetchedPayments = extractArray(paymentsRes.data);
        const fetchedApplications = extractArray(applicationsRes.data);
        const fetchedLeases = extractArray(leasesRes.data);
        const fetchedReports = extractArray(reportsRes.data);

        setUnitsData(fetchedUnits);
        setTenantsData(fetchedTenants);
        setMaintenanceData(fetchedMaintenance);
        setPaymentsData(fetchedPayments);
        setApplicationsData(fetchedApplications);
        setLeasesData(fetchedLeases);
        setReportsData(fetchedReports);

        if (fetchedApplications.length > 0) setSelectedApplication(fetchedApplications[0]);

        const totalUnitsCount = fetchedUnits.length;
        const occupiedCount = fetchedUnits.filter(u => u.status?.toLowerCase() === 'occupied').length;
        const activeTenantsCount = fetchedTenants.length; 
        const pendingMaintenanceCount = fetchedMaintenance.filter(m => m.status?.toLowerCase() !== 'fixed').length;
        const totalRev = fetchedPayments.filter(p => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'verified').reduce((sum, p) => sum + Number(p.amount || 0), 0);

        setStats({ activeTenants: activeTenantsCount, unitsTotal: totalUnitsCount, occupiedUnits: occupiedCount, maintenanceRequests: pendingMaintenanceCount, totalRevenue: totalRev });

        const monthlyRev = fetchedPayments.reduce((acc, curr) => {
          if (curr.status?.toLowerCase() === 'paid' || curr.status?.toLowerCase() === 'verified') {
             const dateVal = curr.date || curr.createdAt || new Date();
             const month = new Date(dateVal).toLocaleString('default', { month: 'short' });
             acc[month] = (acc[month] || 0) + Number(curr.amount || 0);
          }
          return acc;
        }, {});

        const chartData = Object.keys(monthlyRev).map(month => ({ month: month, amount: `₱${monthlyRev[month].toLocaleString()}`, height: '60%' }));
        setRevenueData(chartData.length > 0 ? chartData : [{ month: "No Data", amount: "₱0", height: "10%" }]);
      } catch (error) { console.error("Error fetching data:", error); }
    };
    fetchAllDashboardData();
  }, []);

  const filteredUnits = unitsData.filter((unit) => {
    const unitName = (unit.name || unit.unitNumber || "").toLowerCase();
    return unitName.includes(searchQuery.toLowerCase());
  });

  // === HANDLER FUNCTIONS ===
  const handleOpenAddUnit = () => { setEditingUnitId(null); setUnitFormData({ name: "", property: "Rentix Property", rent: "", status: "available", type: "studio", images: "", floor: "", description: "" }); setShowUnitModal(true); };
  const handleOpenEditUnit = (unit) => { setEditingUnitId(unit._id || unit.id); setUnitFormData({ name: unit.name || unit.unitNumber || "", property: unit.property || "Rentix Property", rent: unit.rent || unit.price || "", status: unit.status || "available", type: unit.type || "studio", images: unit.images && unit.images.length > 0 ? unit.images.join(', ') : "", floor: unit.floor || "", description: unit.description || "" }); setShowUnitModal(true); };
  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { name: unitFormData.name, unitNumber: unitFormData.name, property: unitFormData.property, rent: Number(unitFormData.rent), price: Number(unitFormData.rent), status: unitFormData.status, type: unitFormData.type, floor: unitFormData.floor, description: unitFormData.description, images: unitFormData.images ? unitFormData.images.split(',').map(url => url.trim()).filter(url => url !== "") : [] };
      if (editingUnitId) {
        const res = await axios.put(`http://localhost:8000/api/units/${editingUnitId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setUnitsData(prev => prev.map(u => (u._id || u.id) === editingUnitId ? (res.data.data || res.data) : u));
        showNotification("Unit details updated successfully!", "success");
      } else {
        const res = await axios.post(`http://localhost:8000/api/units`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setUnitsData(prev => [...prev, (res.data.data || res.data)]);
        setStats(prev => ({ ...prev, unitsTotal: prev.unitsTotal + 1 })); 
        showNotification("New unit created successfully!", "success");
      }
      setShowUnitModal(false); 
    } catch (error) { showNotification("Something went wrong.", "error"); }
  };

  const handleDeleteClick = (id) => { setUnitToDelete(id); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    if (!unitToDelete) return;
    try {
      await axios.delete(`http://localhost:8000/api/units/${unitToDelete}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setUnitsData(prev => prev.filter(u => (u._id || u.id) !== unitToDelete));
      setStats(prev => ({ ...prev, unitsTotal: prev.unitsTotal - 1 })); 
      setShowDeleteModal(false); setUnitToDelete(null);
      showNotification("Unit has been deleted.", "success");
    } catch (error) { setShowDeleteModal(false); showNotification("Error deleting unit.", "error"); }
  };

  const handleDeleteTenantClick = (id) => { setTenantToDelete(id); setShowDeleteTenantModal(true); };
  const confirmDeleteTenant = async () => {
    if (!tenantToDelete) return;
    try {
      await axios.delete(`http://localhost:8000/api/tenants/${tenantToDelete}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setTenantsData(prev => prev.filter(t => (t._id || t.id) !== tenantToDelete));
      setStats(prev => ({ ...prev, activeTenants: prev.activeTenants - 1 }));
      setShowDeleteTenantModal(false); setTenantToDelete(null);
      showNotification("Tenant successfully removed.", "success");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) { setShowDeleteTenantModal(false); showNotification("Failed to remove tenant.", "error"); }
  };

  // MAINTENANCE
  const handleOpenMaintenance = (item) => { setSelectedMaintenance(item); setMaintenanceStatus(item.status || 'open'); setShowMaintenanceModal(true); };
  const handleUpdateMaintenance = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/maintenance/${selectedMaintenance._id || selectedMaintenance.id}/status`, { status: maintenanceStatus }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMaintenanceData(prev => prev.map(m => (m._id || m.id) === (selectedMaintenance._id || selectedMaintenance.id) ? { ...m, status: maintenanceStatus } : m));
      setShowMaintenanceModal(false); showNotification("Maintenance status updated successfully!", "success");
    } catch (error) { showNotification("Failed to update maintenance status.", "error"); }
  };
  
  // BAGO: MAINTENANCE DELETE LOGIC
  const handleDeleteMaintenanceClick = (id) => { setMaintenanceToDelete(id); setShowDeleteMaintenanceModal(true); };
  const confirmDeleteMaintenance = async () => {
    if (!maintenanceToDelete) return;
    try {
      await axios.delete(`http://localhost:8000/api/maintenance/${maintenanceToDelete}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMaintenanceData(prev => prev.filter(m => (m._id || m.id) !== maintenanceToDelete)); 
      showNotification("Maintenance request deleted.", "success");
      setShowDeleteMaintenanceModal(false); setMaintenanceToDelete(null);
    } catch (error) { showNotification("Failed to delete request.", "error"); setShowDeleteMaintenanceModal(false); }
  };

  // REPORTS
  const handleOpenReport = (item) => { setSelectedReport(item); setReportStatus(item.status || 'pending'); setShowReportModal(true); };
  const handleUpdateReport = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/reports/${selectedReport._id || selectedReport.id}/status`, { status: reportStatus }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setReportsData(prev => prev.map(r => (r._id || r.id) === (selectedReport._id || selectedReport.id) ? { ...r, status: reportStatus } : r));
      setShowReportModal(false); showNotification("Report status updated successfully!", "success");
    } catch (error) { showNotification("Failed to update report status.", "error"); }
  };

  // BAGO: REPORTS DELETE LOGIC
  const handleDeleteReportClick = (id) => { setReportToDelete(id); setShowDeleteReportModal(true); };
  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;
    try {
      await axios.delete(`http://localhost:8000/api/reports/${reportToDelete}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setReportsData(prev => prev.filter(r => (r._id || r.id) !== reportToDelete)); 
      showNotification("Report deleted.", "success");
      setShowDeleteReportModal(false); setReportToDelete(null);
    } catch (error) { showNotification("Failed to delete report.", "error"); setShowDeleteReportModal(false); }
  };

  const handleApproveApplication = async (appId) => {
    try {
      await axios.put(`http://localhost:8000/api/applications/${appId}/status`, { status: 'approved' }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setApplicationsData(prev => prev.map(app => (app._id || app.id) === appId ? { ...app, status: 'approved' } : app)); showNotification("Application approved successfully!", "success");
    } catch (error) { showNotification(error.response?.data?.message || "Failed to approve application.", "error"); }
  };
  const handleDenyApplication = async (appId) => {
    try {
      await axios.put(`http://localhost:8000/api/applications/${appId}/status`, { status: 'denied' }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setApplicationsData(prev => prev.map(app => (app._id || app.id) === appId ? { ...app, status: 'denied' } : app)); showNotification("Application denied and removed from list.", "success");
    } catch (error) { showNotification(error.response?.data?.message || "Failed to deny application.", "error"); }
  };
  const handleVerifyPayment = async (paymentId) => {
    try {
      await axios.put(`http://localhost:8000/api/payments/${paymentId}/verify`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setPaymentsData(prev => prev.map(p => (p._id || p.id) === paymentId ? { ...p, status: 'verified' } : p)); showNotification("Payment verified successfully!", "success");
    } catch (error) { showNotification(error.response?.data?.message || "Failed to verify payment.", "error"); }
  };

  const handleApplicantChange = (e) => {
    const appId = e.target.value;
    if (!appId) { setLeaseFormData({ applicationId: "", tenantId: "", unitId: "", unitDisplay: "", rent: 0, startDate: "", endDate: "" }); return; }
    const selectedApp = applicationsData.find(app => (app._id || app.id) === appId);
    if (selectedApp) {
      const tObj = selectedApp.tenantId || selectedApp.tenant || selectedApp.user; const uObj = selectedApp.unitId || selectedApp.unit;
      const tId = (typeof tObj === 'object' && tObj !== null) ? (tObj._id || tObj.id) : tObj; const uId = (typeof uObj === 'object' && uObj !== null) ? (uObj._id || uObj.id) : uObj;
      const monthlyRent = uObj?.rent || uObj?.price || 0; const uName = uObj?.unitNumber || uObj?.name || 'Assigned Unit';
      let formattedDate = ""; if (selectedApp.moveInDate) { try { formattedDate = new Date(selectedApp.moveInDate).toISOString().split('T')[0]; } catch (err) { } }
      setLeaseFormData({ ...leaseFormData, applicationId: appId, tenantId: tId || "", unitId: uId || "", unitDisplay: uName, rent: monthlyRent, startDate: formattedDate, endDate: "" });
    }
  };

  const handleLeaseSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { tenantId: leaseFormData.tenantId, unitId: leaseFormData.unitId, monthlyRent: Number(leaseFormData.rent), startDate: leaseFormData.startDate, endDate: leaseFormData.endDate };
      const res = await axios.post(`http://localhost:8000/api/leases`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const newLease = res.data.data || res.data.lease || res.data;
      setLeasesData(prev => [...prev, newLease]); setShowLeaseModal(false);
      setLeaseFormData({ applicationId: "", tenantId: "", unitId: "", unitDisplay: "", rent: 0, startDate: "", endDate: "" }); showNotification("Lease created!", "success"); setTimeout(() => window.location.reload(), 1500);
    } catch (error) { showNotification(error.response?.data?.message || "Failed to create lease.", "error"); }
  };

  return (
    <div className="admin-page d-flex min-vh-100">
      <aside className="sidebar d-flex flex-column justify-content-between text-white">
        <div>
          <div className="brand-box d-flex align-items-center gap-2"><img src={rentixLogo} alt="Rentix logo" /><img className="rentix-name" src={rentixName} alt="Rentix" /></div>
          <p className="panel-name">Landlord Panel</p>
          <nav className="nav flex-column gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (<button className={page === item.name ? "menu-button btn active-menu" : "menu-button btn"} key={item.name} onClick={() => setPage(item.name)}><Icon size={18} /><span>{item.name}</span></button>);
            })}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button className={page === "Settings" ? "menu-button btn active-menu" : "menu-button btn"} onClick={() => setPage("Settings")}><Settings size={18} /><span>Settings</span></button>
          <button className="menu-button btn logout-menu" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}><LogOut size={18} /><span>Logout</span></button>
        </div>
      </aside>

      <main className="main-content flex-grow-1 position-relative">
        <header className="topbar d-flex align-items-center justify-content-between">
          <div></div>
          <div className="topbar-user d-flex align-items-center gap-2"><div className="avatar">A</div><p className="landlord-name">Alex Landlord</p></div>
        </header>

        <section className="page-title-card card border-0 shadow-sm">
          <h1>{page}</h1>
          <p>Rentix landlord rental management system</p>
        </section>

        {page === "Dashboard" && <DashboardTab stats={stats} revenueData={revenueData} paymentsData={paymentsData} />}
        {page === "Units" && <UnitsTab filteredUnits={filteredUnits} searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleOpenAddUnit={handleOpenAddUnit} handleOpenEditUnit={handleOpenEditUnit} handleDeleteClick={handleDeleteClick} />}
        {page === "Payments" && <PaymentsTab paymentsData={paymentsData} leasesData={leasesData} paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter} handleVerifyPayment={handleVerifyPayment} />}
        {page === "Tenants" && <TenantsTab tenantsData={tenantsData} leasesData={leasesData} handleDeleteTenantClick={handleDeleteTenantClick} />}
        {page === "Applications" && <ApplicationsTab applicationsData={applicationsData} leasesData={leasesData} selectedApplication={selectedApplication} setSelectedApplication={setSelectedApplication} handleApproveApplication={handleApproveApplication} handleDenyApplication={handleDenyApplication} />}
        
        {/* BAGO: Ipinasa natin ang handleDeleteMaintenanceClick */}
        {page === "Maintenance" && <MaintenanceTab maintenanceData={maintenanceData} handleOpenMaintenance={handleOpenMaintenance} handleDeleteMaintenanceClick={handleDeleteMaintenanceClick} />}
        
        {page === "Leasing" && <LeasingTab leasesData={leasesData} setLeaseFormData={setLeaseFormData} setShowLeaseModal={setShowLeaseModal} />}
        
        {/* BAGO: Ipinasa natin ang handleDeleteReportClick */}
        {page === "Help/Supports" && <ReportsTab reportsData={reportsData} handleOpenReport={handleOpenReport} handleDeleteReportClick={handleDeleteReportClick} />}


        {/* MODALS */}
        {showUnitModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card p-4 shadow-lg" style={{ width: '450px', backgroundColor: 'white', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 className="mb-4">{editingUnitId ? 'Edit Unit Details' : 'Add New Unit'}</h3>
              <form onSubmit={handleUnitSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3"><label className="fw-bold">Unit Name / No.</label><input type="text" className="form-control" required value={unitFormData.name} onChange={e => setUnitFormData({...unitFormData, name: e.target.value})} /></div>
                  <div className="col-md-6 mb-3"><label className="fw-bold">Floor</label><input type="text" className="form-control" value={unitFormData.floor} onChange={e => setUnitFormData({...unitFormData, floor: e.target.value})} /></div>
                </div>
                <div className="mb-3"><label className="fw-bold">Rent Price (₱)</label><input type="number" className="form-control" required value={unitFormData.rent} onChange={e => setUnitFormData({...unitFormData, rent: e.target.value})} /></div>
                <div className="mb-4"><label className="fw-bold">Status</label><select className="form-select" value={unitFormData.status} onChange={e => setUnitFormData({...unitFormData, status: e.target.value})}><option value="available">Available</option><option value="occupied">Occupied</option></select></div>
                <div className="d-flex justify-content-end gap-2 border-top pt-3"><button type="button" className="btn btn-secondary px-4" onClick={() => setShowUnitModal(false)}>Cancel</button><button type="submit" className="btn btn-primary px-4">Save</button></div>
              </form>
            </div>
          </div>
        )}

        {showLeaseModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card p-4 shadow-lg" style={{ width: '450px', backgroundColor: 'white', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 className="mb-4 fw-bold">Create New Lease</h3>
              <form onSubmit={handleLeaseSubmit}>
                <div className="mb-3">
                  <label className="fw-bold small mb-1">Select Approved Applicant <span className="text-danger">*</span></label>
                  <select className="form-select" required value={leaseFormData.applicationId} onChange={handleApplicantChange}>
                    <option value="">-- Choose from Approved --</option>
                    {applicationsData.filter(app => {
                      const isApproved = app.status?.toLowerCase() === 'approved';
                      const tObj = app.tenantId || app.tenant || app.user; const tId = tObj ? String((typeof tObj === 'object') ? (tObj._id || tObj.id) : tObj) : "";
                      const hasActiveLease = leasesData.some(lease => { const leaseTenantObj = lease.tenantId || lease.tenant; const leaseTId = leaseTenantObj ? String((typeof leaseTenantObj === 'object') ? (leaseTenantObj._id || leaseTenantObj.id) : leaseTenantObj) : ""; return leaseTId === tId && (!lease.status || lease.status.toLowerCase() === 'active'); });
                      return isApproved && !hasActiveLease;
                    }).map(app => ( <option key={app._id || app.id} value={app._id || app.id}>{app.tenantId?.name || app.tenantId?.fullName || app.name || 'Unnamed Applicant'}</option> ))}
                  </select>
                </div>
                <div className="mb-3"><label className="fw-bold small mb-1">Assigned Unit & Rent</label><input type="text" className="form-control bg-light" disabled value={leaseFormData.applicationId ? `${leaseFormData.unitDisplay} - ₱${leaseFormData.rent.toLocaleString()}` : "Select applicant first"} /></div>
                <div className="row mb-4">
                  <div className="col-6"><label className="fw-bold small mb-1">Start Date</label><input type="date" className="form-control" required value={leaseFormData.startDate} onChange={e => setLeaseFormData({...leaseFormData, startDate: e.target.value})} /></div>
                  <div className="col-6"><label className="fw-bold small mb-1">End Date</label><input type="date" className="form-control" required value={leaseFormData.endDate} onChange={e => setLeaseFormData({...leaseFormData, endDate: e.target.value})} /></div>
                </div>
                <div className="d-flex justify-content-end gap-2 border-top pt-3"><button type="button" className="btn btn-secondary px-4" onClick={() => setShowLeaseModal(false)}>Cancel</button><button type="submit" className="btn btn-primary px-4 fw-bold" disabled={!leaseFormData.applicationId}>Create Lease</button></div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card p-4 shadow-lg text-center" style={{ width: '400px', backgroundColor: 'white', borderRadius: '12px' }}>
              <h4 className="text-danger mb-3">Confirm Deletion</h4>
              <p>Are you sure you want to delete this unit? This action cannot be undone.</p>
              <div className="d-flex justify-content-center gap-3 mt-4"><button className="btn btn-secondary px-4" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="btn btn-danger px-4" onClick={confirmDelete}>Yes, Delete</button></div>
            </div>
          </div>
        )}

        {showDeleteTenantModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card p-4 shadow-lg text-center" style={{ width: '420px', backgroundColor: 'white', borderRadius: '12px' }}>
              <div className="text-danger mb-3"><XCircle size={50} className="mx-auto" /></div>
              <h4 className="text-danger fw-bold mb-3">Remove Tenant</h4><p className="text-muted">Are you sure you want to remove this tenant? This will also delete their active lease and pending payments.</p>
              <div className="d-flex justify-content-center gap-3 mt-4"><button className="btn btn-secondary px-4" onClick={() => setShowDeleteTenantModal(false)}>Cancel</button><button className="btn btn-danger px-4 fw-bold" onClick={confirmDeleteTenant}>Yes, Remove</button></div>
            </div>
          </div>
        )}

        {/* BAGO: MAINTENANCE DELETE MODAL */}
        {showDeleteMaintenanceModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card p-4 shadow-lg text-center" style={{ width: '400px', backgroundColor: 'white', borderRadius: '12px' }}>
              <div className="text-danger mb-3"><XCircle size={50} className="mx-auto" /></div>
              <h4 className="text-danger mb-3">Confirm Deletion</h4>
              <p>Are you sure you want to delete this maintenance request? This action cannot be undone.</p>
              <div className="d-flex justify-content-center gap-3 mt-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowDeleteMaintenanceModal(false)}>Cancel</button>
                <button className="btn btn-danger px-4" onClick={confirmDeleteMaintenance}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* BAGO: REPORT DELETE MODAL */}
        {showDeleteReportModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card p-4 shadow-lg text-center" style={{ width: '400px', backgroundColor: 'white', borderRadius: '12px' }}>
              <div className="text-danger mb-3"><XCircle size={50} className="mx-auto" /></div>
              <h4 className="text-danger mb-3">Confirm Deletion</h4>
              <p>Are you sure you want to delete this report? This action cannot be undone.</p>
              <div className="d-flex justify-content-center gap-3 mt-4">
                <button className="btn btn-secondary px-4" onClick={() => setShowDeleteReportModal(false)}>Cancel</button>
                <button className="btn btn-danger px-4" onClick={confirmDeleteReport}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}

        {showMaintenanceModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card p-4 shadow-lg" style={{ width: '400px', backgroundColor: 'white', borderRadius: '12px' }}>
              <h4 className="mb-1 fw-bold">Update Request</h4><p className="text-muted small mb-4">Change the status of this maintenance request.</p>
              <form onSubmit={handleUpdateMaintenance}>
                <div className="mb-3"><label className="fw-bold small mb-1">Issue / Title</label><input type="text" className="form-control bg-light" disabled value={selectedMaintenance?.title || selectedMaintenance?.request || ''} /></div>
                <div className="mb-4"><label className="fw-bold small mb-1">Status <span className="text-danger">*</span></label><select className="form-select" required value={maintenanceStatus} onChange={(e) => setMaintenanceStatus(e.target.value)}><option value="open">Open (Pending)</option><option value="in-progress">In Progress (Currently fixing)</option><option value="resolved">Resolved (Done)</option></select></div>
                <div className="d-flex justify-content-end gap-2 border-top pt-3"><button type="button" className="btn btn-secondary px-4" onClick={() => setShowMaintenanceModal(false)}>Cancel</button><button type="submit" className="btn btn-primary px-4 fw-bold">Save Changes</button></div>
              </form>
            </div>
          </div>
        )}

        {showReportModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card p-4 shadow-lg" style={{ width: '400px', backgroundColor: 'white', borderRadius: '12px' }}>
              <h4 className="mb-1 fw-bold">Update Report</h4><p className="text-muted small mb-4">Change the status of this tenant report.</p>
              <form onSubmit={handleUpdateReport}>
                <div className="mb-3"><label className="fw-bold small mb-1">Title</label><input type="text" className="form-control bg-light" disabled value={selectedReport?.title || ''} /></div>
                <div className="mb-3"><label className="fw-bold small mb-1">Category</label><input type="text" className="form-control bg-light" disabled value={selectedReport?.category || ''} /></div>
                <div className="mb-4"><label className="fw-bold small mb-1">Status <span className="text-danger">*</span></label><select className="form-select" required value={reportStatus} onChange={(e) => setReportStatus(e.target.value)}><option value="pending">Pending</option><option value="reviewed">Reviewed</option><option value="resolved">Resolved</option></select></div>
                <div className="d-flex justify-content-end gap-2 border-top pt-3"><button type="button" className="btn btn-secondary px-4" onClick={() => setShowReportModal(false)}>Cancel</button><button type="submit" className="btn btn-primary px-4 fw-bold">Save Changes</button></div>
              </form>
            </div>
          </div>
        )}

        {/* CUSTOM NOTIFICATION */}
        {notification.show && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card p-4 shadow-lg text-center" style={{ width: '350px', backgroundColor: 'white', borderRadius: '12px' }}>
              <div className={`mb-3 ${notification.type === 'success' ? 'text-success' : 'text-danger'}`}>{notification.type === 'success' ? <CheckCircle size={50} /> : <XCircle size={50} />}</div>
              <h4 className="mb-2 fw-bold">{notification.type === 'success' ? 'Success!' : 'Error'}</h4>
              <p className="text-muted">{notification.message}</p>
              <button className={`btn mt-3 px-4 ${notification.type === 'success' ? 'btn-success' : 'btn-danger'}`} onClick={() => setNotification({ ...notification, show: false })}>OK</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
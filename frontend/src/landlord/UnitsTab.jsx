import React from 'react';

export default function UnitsTab({ 
  filteredUnits, searchQuery, setSearchQuery, 
  handleOpenAddUnit, handleOpenEditUnit, handleDeleteClick 
}) {
  return (
    <section className="section-box card border-0 shadow-sm">
      <div className="tools-row d-flex gap-2 flex-wrap mb-3">
        <input className="form-control" placeholder="Search units" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <button className="btn btn-primary" onClick={handleOpenAddUnit}>Add Unit</button>
      </div>
      <table className="table table-hover align-middle">
        <thead><tr><th>Unit</th><th>Property</th><th>Floor</th><th>Rent</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {filteredUnits.length > 0 ? filteredUnits.map((unit) => (
            <tr key={unit._id || unit.id}>
              <td>{unit.name || unit.unitNumber || 'N/A'}</td><td>{unit.property || 'Rentix Property'}</td><td>{unit.floor || 'N/A'}</td>
              <td>₱{unit.rent || unit.price || 0}</td><td>{unit.status || 'N/A'}</td>
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={() => handleOpenEditUnit(unit)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(unit._id || unit.id)}>Delete</button>
              </td>
            </tr>
          )) : <tr><td colSpan="6" className="text-center">No units found</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
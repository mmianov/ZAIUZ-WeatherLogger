import React, { useEffect, useState } from "react";
import api from "../api/api";
import MeasurementsPanel from "./MeasurementsPanel";
import ChangePassword from "./ChangePassword";

export default function AdminPanel() {
  const [series, setSeries] = useState([]);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const [min, setMin] = useState(-30);
  const [max, setMax] = useState(50);

  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const [manageSeries, setManageSeries] = useState(null);

  const [editSeries, setEditSeries] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#000000");
  const [editMin, setEditMin] = useState(0);
  const [editMax, setEditMax] = useState(0);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      const res = await api.get("/series");
      setSeries(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load series");
    }
  };

  const addSeries = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    try {
      await api.post("/series", {
        name,
        color,
        min_value: parseFloat(min),
        max_value: parseFloat(max),
      });

      setName("");
      setColor("#000000");
      setMin(-30);
      setMax(50);

      await loadSeries();
    } catch (err) {
      console.error(err);
      alert("Failed to add series");
    }
  };

  const deleteSeries = async (id, seriesName) => {
    if (!window.confirm(`Delete series "${seriesName}"?`)) return;

    try {
      await api.delete(`/series/${id}`);
      await loadSeries();
      if (manageSeries?.id === id) setManageSeries(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete series");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const importCSV = async () => {
    if (!file) return alert("Select a CSV file");

    setImporting(true);

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

      if (lines.length < 2) throw new Error("CSV must have at least two lines.");

      const header = lines[0].split(",").map((p) => p.trim());
      if (header.length < 4) throw new Error("Header must be: name,color,min,max");

      const [sName, sColor, sMin, sMax] = header;

      await api.post("/series", {
        name: sName,
        color: sColor,
        min_value: Number(sMin),
        max_value: Number(sMax),
      });

      const res = await api.get("/series");
      const created = res.data.find(
        (s) =>
          s.name === sName &&
          s.color.toLowerCase() === sColor.toLowerCase()
      );

      if (!created) throw new Error("Created series not found.");

      for (const ln of lines.slice(1)) {
        const [tsRaw, valRaw] = ln.split(",").map((p) => p.trim());
        if (!tsRaw || !valRaw) continue;
        const parsed = Number(valRaw);
        if (isNaN(parsed)) continue;

        await api.post("/measurements", {
          series_id: created.id,
          timestamp: tsRaw,
          value: parsed,
        });
      }

      alert("CSV imported successfully");
      setFile(null);
      await loadSeries();
    } catch (err) {
      console.error(err);
      alert("Import failed: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  // Series edit
  const openEditModal = (s) => {
    setEditSeries(s);
    setEditName(s.name);
    setEditColor(s.color);
    setEditMin(s.min_value);
    setEditMax(s.max_value);
  };

  const saveEdit = async () => {
    try {
      await api.put(`/series/${editSeries.id}`, {
        name: editName,
        color: editColor,
        min_value: Number(editMin),
        max_value: Number(editMax),
      });

      setEditSeries(null);
      await loadSeries();
    } catch (err) {
      console.error(err);
      alert("Failed to update series");
    }
  };

  return (
    <div className="bg-secondary p-3 rounded mt-4">
      <h4 className="mb-3">Admin Panel</h4>

      <div className="mb-4">
        <h5>Add new series</h5>
        <div className="d-flex gap-2 mt-2">
          <input
            placeholder="Name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="color"
            className="form-control form-control-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />

          <input
            type="number"
            className="form-control"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="Min"
          />

          <input
            type="number"
            className="form-control"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Max"
          />

          <button className="btn btn-light" onClick={addSeries}>
            Add
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h5>Import series from CSV</h5>
        <input
          type="file"
          accept=".csv,text/csv"
          className="form-control form-control-sm mb-2"
          onChange={handleFileChange}
        />

        <button
          className="btn btn-sm btn-primary"
          onClick={importCSV}
          disabled={importing || !file}
        >
          {importing ? "Importing…" : "Import CSV"}
        </button>

        <small className="text-muted ms-2">
          Format: name,color,min,max + timestamp,value rows
        </small>
      </div>

      <h5>Series</h5>
      <div className="table-responsive">
        <table className="table table-dark table-striped align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Color</th>
              <th>Min</th>
              <th>Max</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            {series.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>

                <td>
                  <span style={{ color: s.color, fontWeight: "bold" }}>●</span>{" "}
                  {s.color}
                </td>

                <td>{Number(s.min_value)}</td>
                <td>{Number(s.max_value)}</td>

                <td className="text-end">
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => openEditModal(s)}
                  >
                    ✏ Edit
                  </button>

                  <button
                    className="btn btn-sm btn-outline-light me-2"
                    onClick={() => setManageSeries(s)}
                  >
                    ⚙ Manage
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteSeries(s.id, s.name)}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {manageSeries && (
        <MeasurementsPanel
          series={manageSeries}
          onClose={() => {
            setManageSeries(null);
            loadSeries();
          }}
        />
      )}

      {/* Edit Modal */}
      {editSeries && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header">
                <h5 className="modal-title">Edit series – {editSeries.name}</h5>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditSeries(null)}>✖</button>
              </div>

              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>

                <div className="mb-2">
                  <label className="form-label">Color</label>
                  <input type="color" className="form-control form-control-color" value={editColor} onChange={(e) => setEditColor(e.target.value)} />
                </div>

                <div className="mb-2">
                  <label className="form-label">Min</label>
                  <input type="number" className="form-control" value={editMin} onChange={(e) => setEditMin(e.target.value)} />
                </div>

                <div className="mb-2">
                  <label className="form-label">Max</label>
                  <input type="number" className="form-control" value={editMax} onChange={(e) => setEditMax(e.target.value)} />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditSeries(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEdit}>Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ChangePassword />
    </div>
  );
}

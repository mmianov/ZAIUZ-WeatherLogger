import React, { useEffect, useState } from "react";
import api from "../api/api";


export default function MeasurementsPanel({ series, onClose, onSelectMeasurement, highlightedMeasurement }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTimestamp, setNewTimestamp] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    loadMeasurements();
  }, [series]);

  const loadMeasurements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/measurements", { params: { series_id: series.id } });
      setItems(res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      console.error(err);
      alert("Failed to load measurements");
    } finally {
      setLoading(false);
    }
  };

  const addMeasurement = async (e) => {
    e.preventDefault();
    if (!newTimestamp || newValue === "") {
      alert("Provide timestamp and value");
      return;
    }
    try {
      await api.post("/measurements", {
        series_id: series.id,
        timestamp: newTimestamp,
        value: parseFloat(newValue),
      });
      setNewTimestamp("");
      setNewValue("");
      await loadMeasurements();
    } catch (err) {
      console.error(err);
      alert("Failed to add measurement: " + (err?.response?.data?.msg || ""));
    }
  };

  const updateMeasurement = async (id, patch) => {
    try {
      await api.put(`/measurements/${id}`, patch);
      await loadMeasurements();
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

  const deleteMeasurement = async (id) => {
    if (!window.confirm("Delete measurement?")) return;
    try {
      await api.delete(`/measurements/${id}`);
      await loadMeasurements();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  return (
    <div
      className="position-fixed top-0 end-0 h-100"
      style={{ width: "420px", maxWidth: "95vw", zIndex: 1055 }}
    >
      <div className="bg-dark text-light h-100 d-flex flex-column shadow-lg">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <div>
            <strong>Measurements — {series.name}</strong>
            <div className="small text-muted">Min: {series.min_value}  Max: {series.max_value}</div>
          </div>
          <div>
            <button className="btn btn-sm btn-outline-light me-2" onClick={onClose}>Close</button>
            <button className="btn btn-sm btn-light" onClick={loadMeasurements}>Refresh</button>
          </div>
        </div>

        <div className="p-3 overflow-auto" style={{ flex: 1 }}>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <>
              <form onSubmit={addMeasurement} className="mb-3">
                <div className="mb-2">
                  <label className="form-label small">Timestamp</label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-sm"
                    value={newTimestamp}
                    onChange={(e) => setNewTimestamp(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Value</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control form-control-sm"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </div>
                <div className="d-grid">
                  <button className="btn btn-sm btn-primary" type="submit">Add measurement</button>
                </div>
              </form>

              <div>
                <table className="table table-sm table-dark table-striped">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Value</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((m) => {
                      const isHighlighted = highlightedMeasurement && highlightedMeasurement.id === m.id;
                      return (
                        <MeasurementRow
                          key={m.id}
                          item={m}
                          onUpdate={updateMeasurement}
                          onDelete={() => deleteMeasurement(m.id)}
                          onSelect={() => onSelectMeasurement && onSelectMeasurement(m)}
                          highlighted={isHighlighted}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* Inline editable row component */
function MeasurementRow({ item, onUpdate, onDelete, onSelect, highlighted }) {
  const [editing, setEditing] = useState(false);
  const [ts, setTs] = useState(item.timestamp.slice(0, 16));
  const [val, setVal] = useState(item.value);

  return (
    <tr
      onClick={() => !editing && onSelect && onSelect()}
      style={{ cursor: onSelect ? "pointer" : "default" }}
      className={highlighted ? "table-primary" : ""}
    >
      <td style={{ minWidth: "160px" }}>
        {editing ? (
          <input type="datetime-local" className="form-control form-control-sm" value={ts}
            onChange={(e) => setTs(e.target.value)} />
        ) : (
          new Date(item.timestamp).toLocaleString()
        )}
      </td>
      <td style={{ width: "110px" }}>
        {editing ? (
          <input type="number" step="any" className="form-control form-control-sm" value={val}
            onChange={(e) => setVal(e.target.value)} />
        ) : (
          Number(item.value).toFixed(2)
        )}
      </td>
      <td className="text-end">
        {editing ? (
          <>
            <button className="btn btn-sm btn-success me-1" onClick={() => { onUpdate(item.id, { timestamp: ts, value: parseFloat(val) }); setEditing(false); }}>
              Save
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => { setEditing(false); setTs(item.timestamp.slice(0, 16)); setVal(item.value); }}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-sm btn-outline-light me-1" onClick={(e) => { e.stopPropagation(); setEditing(true); }}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}>Del</button>
          </>
        )}
      </td>
    </tr>
  );
}

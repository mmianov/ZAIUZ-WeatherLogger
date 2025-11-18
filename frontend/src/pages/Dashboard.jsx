import React, { useEffect, useState } from "react";
import api from "../api/api";
import ChartView from "../components/ChartView";
import TableView from "../components/TableView";
import MeasurementsPanel from "../components/MeasurementsPanel";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function Dashboard() {
  const [series, setSeries] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [measurementsPanelSeries, setMeasurementsPanelSeries] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [highlightedMeasurement, setHighlightedMeasurement] = useState(null);
  const role = localStorage.getItem("role");

  useEffect(() => {
    loadSeries();
  }, []);

  useEffect(() => {
    if (series.length && selectedSeries.length === 0) {
      setSelectedSeries(series.map((s) => s.id));
      loadData(series.map((s) => s.id), from, to);
    }
  }, [series]);

  const loadSeries = async () => {
    try {
      const res = await api.get("/series");
      setSeries(res.data);
    } catch (err) {
      console.error("Failed to load series", err);
      alert("Failed to load series");
    }
  };

  const loadData = async (ids = selectedSeries, fromDate = from, toDate = to) => {
    if (!ids || ids.length === 0) {
      setMeasurements([]);
      setHighlightedMeasurement(null);
      return;
    }

    try {
      const res = await api.get("/measurements", {
        params: {
          series_id: ids.join(","),
          from: fromDate || undefined,
          to: toDate || undefined,
        },
      });
      setMeasurements(res.data);
      if (highlightedMeasurement) {
        const found = res.data.find((m) => m.id === highlightedMeasurement.id);
        if (!found) setHighlightedMeasurement(null);
      }
    } catch (err) {
      console.error("Failed to load measurements", err);
      alert("Failed to load measurements");
    }
  };

  const handleSeriesCheckbox = (id, checked) => {
    setSelectedSeries((prev) => {
      const next = checked ? [...prev, id] : prev.filter((x) => x !== id);
      loadData(next, from, to);
      return next;
    });
  };

  const handleLoadClick = () => {
    loadData();
  };

  const openMeasurementsPanel = (s) => {
    setMeasurementsPanelSeries(s);
  };

  const closeMeasurementsPanel = () => {
    setMeasurementsPanelSeries(null);
    loadSeries();
    loadData();
  };

  const confirmDeleteSeries = (s) => {
    setDeleteTarget(s);
  };

  const doDeleteSeries = async (seriesObj) => {
    try {
      await api.delete(`/series/${seriesObj.id}`);
      setDeleteTarget(null);

      await loadSeries();
      await loadData();

      if (measurementsPanelSeries?.id === seriesObj.id) setMeasurementsPanelSeries(null);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete series");
    }
  };

  const handleSelectMeasurement = (measurement) => {
    if (measurement && highlightedMeasurement && measurement.id === highlightedMeasurement.id) {
      setHighlightedMeasurement(null);
    } else {
      setHighlightedMeasurement(measurement);
    }
  };

  return (
    <div className="px-3">
      <div className="bg-secondary rounded p-3 mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label fw-bold mb-0">Select series:</label>
          <div>
            <button
              className="btn btn-sm btn-outline-light me-2"
              onClick={() => {
                setSelectedSeries(series.map((s) => s.id));
                loadData(series.map((s) => s.id), from, to);
              }}
            >
              Select all
            </button>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => {
                setSelectedSeries([]);
                setMeasurements([]);
                setHighlightedMeasurement(null);
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="d-flex flex-wrap mb-2">
          {series.map((s) => (
            <div key={s.id} className="me-3 mb-2 d-flex align-items-center">
              <div className="form-check me-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`s${s.id}`}
                  checked={selectedSeries.includes(s.id)}
                  onChange={(e) => handleSeriesCheckbox(s.id, e.target.checked)}
                />
                <label className="form-check-label" htmlFor={`s${s.id}`}>
                  {s.name}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center mt-2">
          <input
            type="date"
            className="form-control"
            style={{ maxWidth: "180px" }}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            style={{ maxWidth: "180px" }}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleLoadClick}>
            Load
          </button>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <ChartView
            series={series.filter((s) => selectedSeries.includes(s.id))}
            measurements={measurements}
            highlightedMeasurement={highlightedMeasurement}
          />
        </div>
        <div className="col-12 col-lg-4">
          <TableView
            series={series}
            measurements={measurements}
            onSelectMeasurement={handleSelectMeasurement}
            highlightedMeasurement={highlightedMeasurement}
          />
        </div>
      </div>

      {measurementsPanelSeries && (
        <MeasurementsPanel
          series={measurementsPanelSeries}
          onClose={closeMeasurementsPanel}
          onSelectMeasurement={handleSelectMeasurement}
          highlightedMeasurement={highlightedMeasurement}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          title={`Delete series "${deleteTarget.name}"?`}
          message="Deleting a series will remove all its measurements. This action cannot be undone."
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => doDeleteSeries(deleteTarget)}
        />
      )}
    </div>
  );
}

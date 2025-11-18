import React, { useEffect } from "react";

function measurementsToCSV(seriesMap, measurements) {
  const header = ["timestamp", "series", "value"];
  const rows = measurements.map((m) => {
    const sname = seriesMap[m.series_id] || "";
    return [m.timestamp, sname, m.value];
  });
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  return csv;
}

export default function TableView({ series, measurements, onSelectMeasurement, highlightedMeasurement }) {
  const getSeriesName = (id) => series.find((s) => s.id === id)?.name || "";

  useEffect(() => {
    document.body.setAttribute(
      "data-print-date",
      new Date().toLocaleString()
    );
  }, [measurements]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const map = {};
    series.forEach((s) => (map[s.id] = s.name));
    const csv = measurementsToCSV(map, measurements);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `measurements_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="print-table"
      className="bg-secondary rounded p-3 w-100 overflow-auto table-container print-area"
    >
      <div className="d-flex justify-content-between align-items-center mb-2 no-print">
        <h5 className="mb-0">Data Table</h5>
        <div>
          <button
            className="btn btn-sm btn-outline-light me-2"
            onClick={handleDownloadCSV}
          >
            Download CSV
          </button>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-striped align-middle">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Series</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m) => {
              const isHighlighted = highlightedMeasurement && highlightedMeasurement.id === m.id;
              return (
                <tr
                  key={m.id}
                  onClick={() => onSelectMeasurement && onSelectMeasurement(m)}
                  style={{ cursor: onSelectMeasurement ? "pointer" : "default" }}
                  className={isHighlighted ? "table-primary" : ""}
                >
                  <td>
                    {new Date(m.timestamp).toLocaleString("en-GB", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>{getSeriesName(m.series_id)}</td>
                  <td>{Number(m.value).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

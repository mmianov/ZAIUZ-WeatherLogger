import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import "chartjs-adapter-date-fns";

export default function ChartView({ series, measurements, highlightedMeasurement }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      try {
        chart.update();
      } catch (_) {}
    }
  }, [highlightedMeasurement, measurements, series]);

  const noData = !series?.length || !measurements?.length;

  if (noData) {
    return (
      <div className="bg-secondary rounded p-3 mb-3 text-center print-area">
        <h5>No data to display yet</h5>
      </div>
    );
  }

  const datasets = series.map((s) => {
    const dataPoints = measurements
      .filter((m) => m.series_id === s.id)
      .map((m) => ({
        x: new Date(m.timestamp),
        y: m.value,
        id: m.id,
      }));

    const pointRadius = dataPoints.map((dp) =>
      highlightedMeasurement && dp.id === highlightedMeasurement.id ? 8 : 4
    );

    const pointBackgroundColor = dataPoints.map((dp) =>
      highlightedMeasurement && dp.id === highlightedMeasurement.id
        ? "#ff4d4f"
        : s.color || "#ffffff"
    );

    return {
      label: s.name,
      borderColor: s.color || "#ffffff",
      backgroundColor: s.color || "#ffffff",
      tension: 0.3,
      pointRadius,
      pointBackgroundColor,
      pointHoverRadius: 10,
      data: dataPoints,
    };
  });

  const data = { datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: { unit: "day", tooltipFormat: "yyyy-MM-dd HH:mm" },
        ticks: { color: "#fff" },
        title: { display: true, text: "Date" },
      },
      y: {
        ticks: { color: "#fff" },
        title: { display: true, text: "Value" },
      },
    },
    plugins: {
      legend: {
        labels: { color: "#fff" },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: true,
    },
  };

  return (
    <div className="bg-secondary rounded p-3 mb-3 w-100 overflow-auto chart-container print-area" style={{ minHeight: "400px" }}>
      <h5>Temperature over time</h5>

      <div style={{ position: "relative", height: "350px", width: "100%" }}>
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
}

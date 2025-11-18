import React from "react";

export default function DeleteConfirmModal({ title, message, onCancel, onConfirm }) {
  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
        <div className="modal-content bg-dark text-light">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>
              No
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              Yes, delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";

const ErrorAlert = ({ message, onClose }) => {
  return (
    <div
      style={{
        backgroundColor: "#ffebee",
        color: "#c62828",
        padding: "12px",
        borderRadius: "4px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#c62828",
          cursor: "pointer",
          fontSize: "20px",
          padding: "0 8px",
        }}
      >
        ×
      </button>
    </div>
  );
};

export default ErrorAlert;

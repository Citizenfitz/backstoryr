import React from "react";

const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay__content">
        <i className="fa fa-spinner fa-spin"></i>
        <span>Generating Backstory...</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;

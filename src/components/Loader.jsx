import React from "react";

export default function Loader() {
  return (
    <div className="me-2 d-flex justify-content-center align-items-center">
      <div
        className="spinner-border text-primary"
        role="status"
        style={{ width: "1rem", height: "1rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
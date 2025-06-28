"use client";

import React, { useState, useContext } from "react";
import { ModelContextInst } from "@/contexts/ModelContext";

export default function UpdateModel({ closeFun, color, title, children }) {
  const { showUpdateModal, isLoading, setIsLoading } =
    useContext(ModelContextInst);

  return (
    <div
      className={`modal justify-content-center align-items-center bg-black bg-opacity-75 fade ${
        showUpdateModal ? "show" : ""
      }`}
      style={{ display: showUpdateModal ? "flex" : "none" }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-lg col" role="document">
        <div className="modal-content">
          <div className={`modal-header ${color} text-dark`}>
            <h5 className="modal-title">
              <i className="bi bi-pencil-square me-2"></i>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeFun}
            ></button>
          </div>
          {children}
          {/* Modal Footer with buttons
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setUpdatedData({
                  department: "",
                  day: "",
                  doctor: "",
                  start_time: "",
                  end_time: "",
                }),
                  closeModal();
              }}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </button>
            <button
              type="button"
              className={`btn ${color} d-flex `}
              onClick={onUpdate}
            >
              {isLoading ? (
                <Loader />
              ) : (
                <i className="bi bi-check-circle me-2"></i>
              )}
              {buttonText}
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
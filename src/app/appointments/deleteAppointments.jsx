"use client";
import React, { useEffect, useContext } from "react";
import { ModelContextInst } from "@/contexts/ModelContext";
import axiosInstance from "@/helper/axiosSetup";
import Loader from "@/components/Loader";
export default function DeleteAppointment({ currentId }) {
  const { isLoading, setIsLoading, closeDeleteModal } =
    useContext(ModelContextInst);
  const onDelete = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.delete(`/appointments/${currentId}`);
      console.log("Appointment deleted successfully:", response.data);
    } catch (error) {
      setIsLoading(false);
      alert("Error deleting appointment:", error);
    } finally {
      setIsLoading(false);
      currentId = null;
      closeDeleteModal();
    }
  };
  return (
    <div className="card shadow-sm mb-4 m-4">
      <div className="card-body">
        <div className="row g-3 mb-4">
          <div className="sf-2 m-4">
            Are you sure you want to delete this appointments!
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className={"btn btn-danger d-flex ms-2"} onClick={onDelete}>
            {isLoading ? <Loader /> : <i className="bi bi-trash me-2"></i>}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";
import { createContext, useState } from "react";
export const ModelContextInst = createContext();

export const ModelProvider = ({ children }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openUpdateModal = () => {
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setIsLoading(false);
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setIsLoading(false);
  };

  return (
    <ModelContextInst.Provider
      value={{
        isLoading,
        showDeleteModal,
        setShowDeleteModal,
        setIsLoading,
        showUpdateModal,
        openUpdateModal,
        closeUpdateModal,
        closeDeleteModal,
        openDeleteModal,
      }}
    >
      {children}
    </ModelContextInst.Provider>
  );
};
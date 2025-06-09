// src/helper/PluginInit.js

"use client";
import { useEffect } from "react";
// Import axios setup for interceptors
import "../helper/axiosSetup"; // This will initialize axios interceptors globally

export default function PluginInit() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      require("bootstrap/dist/js/bootstrap.bundle.min.js");
      require("react-quill/dist/quill.snow.css");
      require("jsvectormap/dist/jsvectormap.css");
      require("react-toastify/dist/ReactToastify.css");
      require("react-modal-video/css/modal-video.min.css");
    }
  }, []);
  return <></>;
}

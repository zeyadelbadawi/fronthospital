"use client"
import { useState } from "react"
import AppSidebarUpdated from "./app-sidebar-updated"
import MainContentUpdated from "./main-content-updated"
import { isAuthenticated } from "../utils/auth-utils"

const AppMain = () => {
  const [activeContent, setActiveContent] = useState("dashboard")

  const handleContentChange = (content) => {
    setActiveContent(content)
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access the healthcare system.</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebarUpdated onContentChange={handleContentChange} />
      <MainContentUpdated activeContent={activeContent} />
    </div>
  )
}

export default AppMain

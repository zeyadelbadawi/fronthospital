// Utility functions for formatting dates and file sizes

export const formatDate = (dateString) => {
  if (!dateString) return "Unknown date"

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Invalid date"

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B"

  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

export const formatQuarter = (quarter, year) => {
  return `Q${quarter} ${year}`
}

export const getFileExtension = (filename) => {
  if (!filename) return ""
  return filename.split(".").pop().toLowerCase()
}

export const truncateText = (text, maxLength = 50) => {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

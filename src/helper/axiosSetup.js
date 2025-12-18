import axios from "axios"

// Helper function to get CSRF token from cookie
const getCsrfToken = () => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? match[1] : null
}

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Phase 1.2: Essential for sending HttpOnly cookies
})

// Add a request interceptor to include the Authorization token
axiosInstance.interceptors.request.use(
  (config) => {
    // Cookies will be sent automatically via withCredentials: true
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }

    if (["post", "put", "delete", "patch"].includes(config.method?.toLowerCase())) {
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle 401 errors (Expired token)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the error is a 401 (Unauthorized), handle token refresh
    if (error.response && error.response.status === 401) {
      try {
        const csrfToken = getCsrfToken()
        const headers = csrfToken ? { "X-CSRF-Token": csrfToken } : {}

        // Attempt to refresh the token
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/authentication/refresh`,
          {},
          {
            withCredentials: true, // Phase 1.2: Send refresh token cookie
            headers,
          },
        )

        // Get the new token from the response and store it
        const newToken = refreshResponse.data.token || refreshResponse.data.accessToken
        localStorage.setItem("token", newToken)

        // Retry the failed request with the new token
        error.config.headers["Authorization"] = `Bearer ${newToken}`
        return axios(error.config)
      } catch (refreshError) {
        // If refreshing the token fails, clear storage and redirect to appropriate page
        console.error("Token refresh failed:", refreshError)
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        if (typeof window !== "undefined") {
          const hostname = window.location.hostname
          const isStaffSubdomain = hostname.startsWith("stuff.")

          if (isStaffSubdomain) {
            window.location.href = "/sign-in"
          } else {
            window.location.href = "/clientportal"
          }
        }
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance

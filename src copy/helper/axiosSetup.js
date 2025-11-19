import axios from "axios"

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

// Add a request interceptor to include the Authorization token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    // Note: In production, consider using httpOnly cookies for better security
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
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
        // Attempt to refresh the token
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/authentication/refresh`,
          {},
          {
            withCredentials: true,
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

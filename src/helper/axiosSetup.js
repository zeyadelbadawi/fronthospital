import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,  // Ensure your API URL is correct
  withCredentials: true,  // Allow cookies (if you're using cookies for authentication)
});

// Add a request interceptor to include the Authorization token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookies
    const token = localStorage.getItem('token');  // Or use cookies if you're storing the token in cookies
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors (Expired token)
axiosInstance.interceptors.response.use(
  (response) => response,  // Return the response directly if it's valid
  async (error) => {
    // If the error is a 401 (Unauthorized), handle token refresh
    if (error.response && error.response.status === 401) {
      try {
        // Attempt to refresh the token
        const refreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/refresh`, {}, {
          withCredentials: true,  // Include cookies for refresh token
        });

        // Get the new token from the response and store it
        const newToken = refreshResponse.data.token;
        localStorage.setItem('token', newToken);

        // Retry the failed request with the new token
        error.config.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(error.config);
      } catch (refreshError) {
        // If refreshing the token fails, redirect to login
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/login';  // Or any other redirection for unauthorized users
      }
    }

    return Promise.reject(error);  // Return the original error if not 401
  }
);

export default axiosInstance;

import axios from 'axios';

// Base URL of the API
const API_URL = `${process.env.REACT_APP_API_URL}/auth`;

// Login function - loại bỏ tham số remember
export const login = async (username, password) => {
    try {
      console.log("Calling login API with username:", username);
      const response = await axios.post(
        `${API_URL}/login`,
        { username, password },
        { 
          withCredentials: true,
          timeout: 15000 // Thêm timeout 15 giây để tránh pending quá lâu
        }
      );
      
      console.log("Login API response:", response.status);
      return response.data;
    } catch (error) {
      console.error("Login API error:", error.message, error.response?.data);
      
      // Tạo thông báo lỗi chi tiết hơn
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Login failed. Please try again.';
                         
      throw { error: errorMessage };
    }
  };

// Registration function
export const register = async (name, email, username, password, confirmPassword) => {
  try {
    const response = await axios.post(
      `${API_URL}/register`,
      { name, email, username, password, confirm_password: confirmPassword },
      { 
        withCredentials: true,
        timeout: 15000 // Thêm timeout 15 giây
      }
    );
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.message, error.response?.data);
    const errorMessage = error.response?.data?.error || 
                       error.message || 
                       'Registration failed. Please try again.';
    throw { error: errorMessage };
  }
};

// Logout function
export const logout = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/logout`,
      {},
      { 
        withCredentials: true,
        timeout: 10000 // Thêm timeout 10 giây
      }
    );
    return response.data;
  } catch (error) {
    console.error("Logout error:", error.message);
    throw { error: error.response?.data?.error || 'Logout failed' };
  }
};

// Refresh token function
export const refreshToken = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/refresh`,
      {},
      { 
        withCredentials: true,
        timeout: 10000 // Thêm timeout 10 giây
      }
    );
    return response.data;
  } catch (error) {
    console.error("Token refresh error:", error.message);
    throw { error: error.response?.data?.error || 'Token refresh failed' };
  }
};

// Function to check authentication status
export const checkAuth = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`, { 
      withCredentials: true,
      timeout: 10000 // Thêm timeout 10 giây
    });
    return response.data; // Return user data or null from backend
  } catch (error) {
    if (error.response?.status === 401) {
      // Access token might be expired, try to refresh
      try {
        console.log("Auth check failed with 401, trying to refresh token...");
        await refreshToken();
        // Retry the /me request after refreshing the token
        const retryResponse = await axios.get(`${API_URL}/me`, { 
          withCredentials: true,
          timeout: 10000
        });
        return retryResponse.data;
      } catch (refreshError) {
        console.error("Token refresh failed during auth check:", refreshError.message);
        throw { error: refreshError.response?.data?.error || 'Authentication failed after token refresh' };
      }
    }
    console.error("Auth check error:", error.message);
    throw { error: error.response?.data?.error || 'Authentication check failed' };
  }
};

// Function to update user profile
export const updateUser = async (userData, imageFile) => {
  try {
    const data = new FormData();
    if (userData.name) data.append('name', userData.name);
    if (userData.email) data.append('email', userData.email);
    if (userData.username) data.append('username', userData.username);
    if (userData.password) data.append('password', userData.password);
    if (imageFile) data.append('image', imageFile);

    const response = await axios.put(`${API_URL}/update`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
      timeout: 30000 // Thêm timeout 30 giây cho upload ảnh
    });

    return response.data;
  } catch (error) {
    console.error("User update error:", error.message);
    throw { error: error.response?.data?.error || 'Update failed' };
  }
};

// Function to request password reset
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/forgot-password`,
      { email },
      { 
        withCredentials: true,
        timeout: 15000 // Thêm timeout 15 giây
      }
    );
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error.message);
    throw { error: error.response?.data?.error || 'Forgot password request failed' };
  }
};

// Function to verify reset code
export const verifyResetCode = async (email, code) => {
  try {
    const response = await axios.post(
      `${API_URL}/verify-reset-code`,
      { email, code },
      { 
        withCredentials: true,
        timeout: 10000 // Thêm timeout 10 giây
      }
    );
    return response.data;
  } catch (error) {
    console.error("Code verification error:", error.message);
    throw { error: error.response?.data?.error || 'Code verification failed' };
  }
};

// Function to reset password
export const resetPassword = async (user_id, code, newPassword, confirmPassword) => {
  try {
    const response = await axios.post(
      `${API_URL}/reset-password`,
      { 
        user_id, 
        code, 
        new_password: newPassword, 
        confirm_password: confirmPassword 
      },
      { 
        withCredentials: true,
        timeout: 15000 // Thêm timeout 15 giây
      }
    );
    return response.data;
  } catch (error) {
    console.error("Password reset error:", error.message);
    throw { error: error.response?.data?.error || 'Password reset failed' };
  }
};

// Function to verify old password
export const verifyOldPassword = async (username, oldPassword) => {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      { username, password: oldPassword },
      { 
        withCredentials: true,
        timeout: 10000 // Thêm timeout 10 giây
      }
    );
    return response.data; // Returns data (including user_id) if successful
    } catch (error) {
        console.error("Old password verification error:", error.message);
        // eslint-disable-next-line no-throw-literal
        throw { error: 'Old password is incorrect' };
    }
};
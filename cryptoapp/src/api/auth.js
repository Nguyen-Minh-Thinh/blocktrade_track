import axios from 'axios';

// Base URL of the API
const API_URL = 'http://localhost:5000/auth';

// Login function
export const login = async (username, password, remember = false) => {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { username, password, remember },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  };

// Registration function
export const register = async (name, email, username, password, confirmPassword) => {
  try {
    const response = await axios.post(
      `${API_URL}/register`,
      { name, email, username, password, confirm_password: confirmPassword },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

// Logout function
export const logout = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/logout`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Logout failed' };
  }
};

// Refresh token function
export const refreshToken = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/refresh`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Token refresh failed' };
  }
};

// Function to check authentication status
export const checkAuth = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`, { withCredentials: true });
    return response.data; // Return user data or null from backend
  } catch (error) {
    if (error.response?.status === 401) {
      // Access token might be expired, try to refresh
      try {
        await refreshToken();
        // Retry the /me request after refreshing the token
        const retryResponse = await axios.get(`${API_URL}/me`, { withCredentials: true });
        return retryResponse.data;
      } catch (refreshError) {
        throw refreshError.response?.data || { error: 'Authentication failed' };
      }
    }
    throw error.response?.data || { error: 'Authentication check failed' };
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
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Update failed' };
  }
};

// Function to request password reset
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/forgot-password`,
      { email },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Forgot password request failed' };
  }
};

// Function to verify reset code
export const verifyResetCode = async (email, code) => {
  try {
    const response = await axios.post(
      `${API_URL}/verify-reset-code`,
      { email, code },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Code verification failed' };
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
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Password reset failed' };
  }
};

// Function to verify old password
export const verifyOldPassword = async (username, oldPassword) => {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      { username, password: oldPassword },
      { withCredentials: true }
    );
    return response.data; // Returns data (including user_id) if successful
    } catch (error) {
        // eslint-disable-next-line no-throw-literal
        throw { error: 'Old password is incorrect' };
    }
};
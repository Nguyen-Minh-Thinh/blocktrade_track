import axios from 'axios';

// Base URL of the API
const API_URL = 'http://localhost:5000/auth';

// Login function
export const login = async (username, password) => {
    try {
        const response = await axios.post(
            `${API_URL}/login`,
            { username, password },
            { withCredentials: true } // Important to use session
        );

        // Save user_id in cookies with an expiration time of 1 day
        const expires = new Date();
        expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
        document.cookie = `user=${response.data.user_id}; path=/; expires=${expires.toUTCString()}; secure; SameSite=Lax`;

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
        await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });

        // Delete user cookie
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    } catch (error) {
        throw error.response?.data || { error: 'Logout failed' };
    }
};

// Function to check authentication status
export const checkAuth = async () => {
    // Helper function to get cookie value by name
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    try {
        // Check if 'user' cookie exists
        const userId = getCookie('user');
        if (!userId) {
            return null; // Returns null if there is no cookie
        }

        // If there is a cookie, call the API to get the user information
        const response = await axios.get(`${API_URL}/me`, { withCredentials: true });
        return response.data; // Return user data or null from backend
    } catch (error) {
        return null;
    }
};

// Function to update user profile
export const updateUser = async (userData, imageFile) => {
    try {
        const data = new FormData();
        data.append('user_id', userData.user_id);
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
        return response.data; // Nếu thành công, trả về dữ liệu (bao gồm user_id)
    } catch (error) {
        // eslint-disable-next-line no-throw-literal
        throw { error: 'Old password is incorrect' };
    }
};
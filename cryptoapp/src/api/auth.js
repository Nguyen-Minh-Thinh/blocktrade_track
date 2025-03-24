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

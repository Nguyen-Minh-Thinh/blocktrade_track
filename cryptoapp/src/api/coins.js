import axios from 'axios';

// Base URL of the API
const API_URL = `${process.env.REACT_APP_API_URL}/coins`;

// Function to fetch coin data
export const fetchCoins = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch coins' };
    }
};
import axios from 'axios';

// Base URL is handled by the proxy in package.json, so we can use relative URLs
const API_URL = 'http://localhost:5000/favorites/';

// Fetch the list of favorite coins for the authenticated user
export const getFavorites = async () => {
  try {
    const response = await axios.get(`${API_URL}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include JWT cookies
    });

    return response.data;
  } catch (error) {
    console.error('Error in getFavorites:', error);
    throw error.response?.data || { error: 'Failed to fetch favorites' };
  }
};

// Add a coin to the user's favorites
export const addFavorite = async (coinId) => {
  try {
    const response = await axios.post(
      `${API_URL}add`,
      { coin_id: coinId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include JWT cookies
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error in addFavorite:', error);
    throw error.response?.data || { error: 'Failed to add favorite' };
  }
};

// Remove a coin from the user's favorites
export const removeFavorite = async (coinId) => {
  try {
    const response = await axios.post(
      `${API_URL}remove`,
      { coin_id: coinId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include JWT cookies
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error in removeFavorite:', error);
    throw error.response?.data || { error: 'Failed to remove favorite' };
  }
};
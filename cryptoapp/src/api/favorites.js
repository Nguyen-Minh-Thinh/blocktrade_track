import axios from 'axios';

// Base URL is handled by the proxy in package.json, so we can use relative URLs
const API_URL = 'http://localhost:5000/favorites';

// Fetch the list of favorite coins for a user
export const getFavorites = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}?user_id=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include credentials if needed (e.g., for sessions)
    });

    return response.data;
  } catch (error) {
    console.error('Error in getFavorites:', error);
    throw error.response?.data || { error: 'Failed to fetch favorites' };
  }
};

// Remove a coin from the user's favorites
export const removeFavorite = async (userId, coinId) => {
  try {
    const response = await axios.post(
      `${API_URL}/remove`,
      { user_id: userId, coin_id: coinId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include credentials if needed
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error in removeFavorite:', error);
    throw error.response?.data || { error: 'Failed to remove favorite' };
  }
};
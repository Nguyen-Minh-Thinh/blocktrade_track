import axios from 'axios';

// Base URL of the API
const API_URL = `${process.env.REACT_APP_API_URL}/favorites/`;

// Fetch the list of favorite coins for the user by passing user_id from localStorage
export const getFavorites = async () => {
  try {
    // Get user_id from localStorage
    const userLogin = localStorage.getItem('userLogin');
    if (!userLogin) {
      throw new Error('User not logged in');
    }
    
    const userData = JSON.parse(userLogin);
    const user_id = userData.user_id;
    
    if (!user_id) {
      throw new Error('User ID not found in localStorage');
    }
    
    // Add user_id as a query parameter
    const response = await axios.get(`${API_URL}`, {
      params: { user_id },
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Keep for CORS support
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
    // Get user_id from localStorage
    const userLogin = localStorage.getItem('userLogin');
    if (!userLogin) {
      throw new Error('User not logged in');
    }
    
    const userData = JSON.parse(userLogin);
    const user_id = userData.user_id;
    
    if (!user_id) {
      throw new Error('User ID not found in localStorage');
    }
    
    const response = await axios.post(
      `${API_URL}add`,
      { 
        coin_id: coinId,
        user_id: user_id 
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Keep for CORS support
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
    // Get user_id from localStorage
    const userLogin = localStorage.getItem('userLogin');
    if (!userLogin) {
      throw new Error('User not logged in');
    }
    
    const userData = JSON.parse(userLogin);
    const user_id = userData.user_id;
    
    if (!user_id) {
      throw new Error('User ID not found in localStorage');
    }
    
    const response = await axios.post(
      `${API_URL}remove`,
      { 
        coin_id: coinId,
        user_id: user_id
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Keep for CORS support
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error in removeFavorite:', error);
    throw error.response?.data || { error: 'Failed to remove favorite' };
  }
};
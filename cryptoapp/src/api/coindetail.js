import axios from 'axios';

// Base URL of the API
const API_URL = `${process.env.REACT_APP_API_URL}/coindetail/`;

// Fetch detailed data for a specific coin by coin_id and symbol
export const getCoinDetail = async (coinId, symbol) => {
  try {
    const response = await axios.get(`${API_URL}${coinId}`, {
      params: { symbol }, // Pass symbol as a query parameter
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include JWT cookies
    });

    return response.data;
  } catch (error) {
    console.error('Error in getCoinDetail:', error);
    throw error.response?.data || { error: 'Failed to fetch coin details' };
  }
};
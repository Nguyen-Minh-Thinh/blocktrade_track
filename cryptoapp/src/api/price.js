import axios from 'axios';

// Base URL of the API
const API_URL = `${process.env.REACT_APP_API_URL}/portfolio`;

// Function to get current price from Binance
export const getCurrentPrice = async (symbol) => {
  try {
    // Trích xuất symbol cơ bản (loại bỏ USDT nếu có)
    const baseSymbol = symbol.replace('USDT', '');
    const response = await axios.get(`${API_URL}/price/${baseSymbol}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current price:', error);
    throw error.response?.data || { error: 'Failed to fetch price' };
  }
}; 
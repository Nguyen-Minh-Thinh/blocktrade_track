import axios from 'axios';

// Base URL of the API
const API_URL = `${process.env.REACT_APP_API_URL}/portfolio`;

/**
 * Thực hiện giao dịch mua coin
 * @param {string} coin_id - ID của coin
 * @param {number} amount - Số lượng coin muốn mua
 * @param {number} price - Giá mua
 * @returns {Promise} - Kết quả giao dịch
 */
export const buyCoin = async (coin_id, amount, price) => {
  try {
    const response = await axios.post(
      `${API_URL}/buy`,
      { coin_id, amount, price },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error buying coin:', error);
    throw error.response?.data || { error: 'Failed to complete purchase' };
  }
};

/**
 * Thực hiện giao dịch bán coin
 * @param {string} coin_id - ID của coin
 * @param {number} amount - Số lượng coin muốn bán
 * @param {number} price - Giá bán
 * @returns {Promise} - Kết quả giao dịch
 */
export const sellCoin = async (coin_id, amount, price) => {
  try {
    const response = await axios.post(
      `${API_URL}/sell`,
      { coin_id, amount, price },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error selling coin:', error);
    throw error.response?.data || { error: 'Failed to complete sale' };
  }
};

/**
 * Lấy thông tin portfolio của người dùng
 * @returns {Promise} - Thông tin portfolio
 */
export const getUserPortfolio = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-portfolio`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error.response?.data || { error: 'Failed to fetch portfolio' };
  }
};

/**
 * Lấy lịch sử giao dịch của người dùng
 * @returns {Promise} - Lịch sử giao dịch
 */
export const getTransactionHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/transactions`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error.response?.data || { error: 'Failed to fetch transaction history' };
  }
}; 
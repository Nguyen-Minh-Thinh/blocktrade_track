import axios from 'axios';

// Base URL of the API
const API_URL = 'http://localhost:5000/chatbot';
export const chatBot = async (message="") => {
    console.log(message);
    try {
      const response = await axios.post(
        `${API_URL}`,
        { question: message },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Chat error' };
    }
  };

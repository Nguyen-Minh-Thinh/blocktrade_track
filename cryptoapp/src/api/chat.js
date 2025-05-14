import axios from 'axios';

// Base URL of the API
const API_URL = `${process.env.REACT_APP_API_URL}/chatbot`;

// Configure axios instance with timeout and retry
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  withCredentials: false, // Remove withCredentials if not needed
});

// Axios retry logic
const setupAxiosRetry = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;
      if (!config || !config.retry) {
        return Promise.reject(error);
      }

      config.retry -= 1;
      const delay = 1000; // 1 second delay between retries
      await new Promise((resolve) => setTimeout(resolve, delay));
      return instance(config);
    }
  );
};

setupAxiosRetry(axiosInstance);

export const chatBot = async (message = "", userId = null) => {
  // Validate input
  if (!message || typeof message !== 'string' || message.trim() === "") {
    // eslint-disable-next-line no-throw-literal
    throw { error: "Vui lòng cung cấp câu hỏi hợp lệ." };
  }

  console.log(`Sending message: ${message}, userId: ${userId}`);

  try {
    const response = await axiosInstance.post(
      '/',
      {
        user_id: userId, // Match backend expected field
        message: message.trim(), // Match backend expected field
      },
      {
        retry: 2, // Retry up to 2 times on failure
      }
    );
    return response.data;
  } catch (error) {
    const errorResponse = error.response?.data || { error: 'Lỗi khi gọi chatbot.' };
    errorResponse.status = error.response?.status || 500;
    throw errorResponse;
  }
};
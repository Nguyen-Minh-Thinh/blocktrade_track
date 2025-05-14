import axios from 'axios';

// Base URL of the API
const API_URL = `${process.env.REACT_APP_API_URL}/news`;

// Function to get all news
export const getAllNews = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Lỗi kết nối đến API tin tức:', error);
    throw error.response?.data || { error: 'Failed to fetch news' };
  }
};

// Function to get news for a specific coin
export const getCoinNews = async (coinId) => {
  try {
    const response = await axios.get(`${API_URL}/coin/${coinId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi kết nối đến API tin tức cho coin ${coinId}:`, error);
    throw error.response?.data || { error: 'Failed to fetch coin news' };
  }
};

// Hàm hiển thị danh sách tin tức ra HTML
function renderNews(newsList) {
    const container = document.getElementById("news-container");
    container.innerHTML = ""; // Clear old content

    if (newsList.length === 0) {
        container.innerHTML = "<p>Không có tin tức nào.</p>";
        return;
    }

    newsList.forEach(news => {
        const newsItem = document.createElement("div");
        newsItem.className = "news-item";
        newsItem.innerHTML = `
            <h3><a href="${news.news_link}" target="_blank">${news.title}</a></h3>
            <p><strong>Nguồn:</strong> ${news.source_name} | <strong>Cập nhật:</strong> ${new Date(news.updated_at).toLocaleString()}</p>
            <p><strong>Coin:</strong> ${news.coin_name} (${news.coin_symbol})</p>
            <img src="${news.coin_image_url}" alt="${news.coin_name}" width="40">
            <hr>
        `;
        container.appendChild(newsItem);
    });
}

// Gọi hàm fetchAllNews() khi trang được load
document.addEventListener("DOMContentLoaded", () => {
    fetchAllNews();

    // Ví dụ thêm: fetchNewsByCoinId('btc') nếu cần lọc theo coin
    // fetchNewsByCoinId('btc');
});

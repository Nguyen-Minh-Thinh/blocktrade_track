// Địa chỉ server backend (chỉnh sửa nếu BE chạy ở cổng khác)
const BASE_URL = "http://localhost:5000/news";

// Hàm lấy tất cả tin tức
async function fetchAllNews() {
    try {
        const response = await fetch(`${BASE_URL}/all`);
        const data = await response.json();
        if (response.ok) {
            console.log("Tất cả tin tức:", data.news);
            renderNews(data.news);
        } else {
            console.error("Lỗi:", data.error);
        }
    } catch (error) {
        console.error("Lỗi kết nối đến API:", error);
    }
}

// Hàm lấy tin tức theo coin_id
async function fetchNewsByCoinId(coinId) {
    try {
        const response = await fetch(`${BASE_URL}/coin?coin_id=${coinId}`);
        const data = await response.json();
        if (response.ok) {
            console.log(`Tin tức của coin ${coinId}:`, data.news);
            renderNews(data.news);
        } else {
            console.error("Lỗi:", data.error);
        }
    } catch (error) {
        console.error("Lỗi kết nối đến API:", error);
    }
}

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

import React, { useState, useEffect } from "react";
import ButtonComponent from '../components/ButtonComponent';

const NewsCard = ({ title, news_link, updated_at, source_name, coin_name, coin_symbol, coin_image_url }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden min-h-[200px]">
    <a href={news_link} target="_blank" rel="noopener noreferrer" className="block h-full ">
      <div className="p-4 flex flex-col h-full justify-between">
        <div>
          <p className="text-blue-600 text-xs font-bold">{source_name} - {updated_at}</p>
          <h3 className="text-lg font-semibold mt-2 hover:underline line-clamp-2" title={title}>
            {title}
          </h3>
        </div>

        {/* Hiển thị thông tin về Coin */}
        <div className="mt-4 flex items-center">
          <img src={coin_image_url} alt={coin_name} className="w-8 h-8 mr-2" />
          <p className="text-sm font-bold">{coin_name} ({coin_symbol})</p>
        </div>
      </div>
    </a>
  </div>
);

const NewsPage = () => {
  const [selectedCoin, setSelectedCoin] = useState("");
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch("http://localhost:5000/news/all");
        const data = await response.json();
        if (response.ok) {
          setNewsData(data.news);
        } else {
          console.error("Lỗi API:", data.error);
        }
      } catch (error) {
        console.error("Lỗi kết nối đến API:", error);
      }
    }

    fetchNews();
  }, []);

  const filteredNews = selectedCoin
    ? newsData.filter(news => news.coin_symbol.slice(0, 4) === selectedCoin)
    : newsData;

  return (
    <div className="bg-custom-radial mx-auto p-6">
      <div className="mx-auto p-6 max-w-7xl">
        <h1 className="text-3xl font-bold mt-10 mb-4 text-white">Blocktrade.com Company News</h1>

        

        <div className="my-8">
          <hr className="border-t-2 border-gray-300" />
        </div>

        <div className="relative mt-6">
          <input
            type="text"
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value.slice(0, 4))}
            placeholder="Search"
            className="text-black font-bold text-sm p-1 border rounded-lg w-32"
          />
          <span className="text-white font-bold text-lg ml-2"> Company News</span>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mt-6">
          {filteredNews.map((news) => (
            <NewsCard key={news.news_id} {...news} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;

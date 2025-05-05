import React from 'react';
import { Link } from 'react-router-dom';
import CoinNewsCard from './CoinNewsCard';

const CoinNews = ({ newsData, coinId }) => {
  // Filter news related to this coin
  const filteredNews = newsData.filter(news => news.coin_id === coinId);
  
  if (filteredNews.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-800">
        <h2 className="text-lg font-bold text-white mb-4">Latest News</h2>
        <div className="text-center py-8 text-gray-500">
          No news available for this coin
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Latest News</h2>
        <Link to="/news" className="text-blue-500 text-sm hover:text-blue-400 transition-colors">
          View all
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.slice(0, 4).map((news) => (
          <CoinNewsCard key={news.news_id} newsItem={news} />
        ))}
      </div>
    </div>
  );
};

export default CoinNews; 
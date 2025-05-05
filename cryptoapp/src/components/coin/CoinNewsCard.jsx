import React from 'react';
import { Link } from 'react-router-dom';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch (error) {
    return dateString;
  }
};

const CoinNewsCard = ({ newsItem }) => {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 h-full transition-all duration-200 hover:border-gray-700 hover:shadow-lg">
      <Link to={newsItem.news_link} target="_blank" rel="noopener noreferrer" className="block h-full">
        <div className="p-5 flex flex-col h-full">
          <div className="mb-2">
            <span className="text-blue-500 text-xs font-medium">
              {newsItem.source_name} • {formatDate(newsItem.updated_at)}
            </span>
          </div>
          
          <h3 className="text-white text-lg font-medium mb-3 line-clamp-3">
            {newsItem.title}
          </h3>
          
          {newsItem.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {newsItem.description}
            </p>
          )}
          
          <div className="mt-auto flex justify-end items-center">
            <span className="text-gray-400 text-sm hover:text-blue-400 transition-colors">
              Read more →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CoinNewsCard; 
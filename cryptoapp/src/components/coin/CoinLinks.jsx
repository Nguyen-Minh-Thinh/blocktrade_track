import React from 'react';
import { FaGlobe, FaFileAlt, FaGithub, FaReddit, FaTwitter } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa';
import { IoIosArrowDown } from "react-icons/io";

const CoinLinks = ({ coinDetail }) => {
  // Add fallback values
  const ratingScore = coinDetail?.rating_score ?? 0;
  const explorers = coinDetail?.explorers || [];
  const twitter = coinDetail?.twitter || '';
  const homepage = coinDetail?.homepage || '#';
  
  return (
    <div className="bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-800">
      <h2 className="text-lg font-bold text-white mb-4">Links & Info</h2>
      
      <div className="space-y-4">
        {/* Website */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Website</span>
          <div className="flex space-x-2">
            <a 
              href={homepage} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full flex items-center space-x-1 text-gray-300 transition-colors"
            >
              <FaGlobe className="mr-1" /> <span>Website</span>
            </a>
            <button className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full flex items-center space-x-1 text-gray-300 transition-colors">
              <FaFileAlt className="mr-1" /> <span>Whitepaper</span>
            </button>
          </div>
        </div>
        
        {/* Socials */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Socials</span>
          <div className="flex space-x-3">
            {twitter ? (
              <a 
                href={`https://twitter.com/${twitter}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FaTwitter className="text-xl" />
              </a>
            ) : (
              <FaTwitter className="text-gray-600 text-xl" />
            )}
            
            <FaReddit className="text-red-500 text-xl hover:text-red-400 transition-colors cursor-pointer" />
            <FaGithub className="text-white text-xl hover:text-gray-300 transition-colors cursor-pointer" />
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Rating</span>
          <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-full">
            <span className="text-white">{ratingScore.toFixed(1)}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={`text-sm ${i < Math.round(ratingScore / 2) && ratingScore !== 0 ? 'text-yellow-400' : 'text-gray-600'}`} 
                />
              ))}
            </div>
            <IoIosArrowDown className="text-gray-400" />
          </div>
        </div>
        
        {/* Explorers */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Explorers</span>
          <div className="flex gap-2">
            {explorers.length > 0 ? (
              <a 
                href={explorers[0]} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-gray-300 transition-colors"
              >
                {explorers[0].includes('://') ? new URL(explorers[0]).hostname : explorers[0]}
              </a>
            ) : (
              <button className="bg-gray-800 px-3 py-1 rounded-full text-gray-500">
                N/A
              </button>
            )}
            
            {explorers.length > 1 && (
              <div className="bg-gray-800 p-1 rounded-full flex items-center text-gray-400">
                <IoIosArrowDown />
              </div>
            )}
          </div>
        </div>
        
        {/* Wallets */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Wallets</span>
          <div className="flex space-x-2">
            <div className="bg-gray-800 p-1 rounded-full">
              <img className="w-5 h-5 rounded-full" src="https://s3.coinmarketcap.com/static/img/as/2024-11-22T08:06:55.818Z_2024_11_18T10_38_53_883Z_m2kXHwEY_400x400.png" alt="Wallet 1" />
            </div>
            <div className="bg-gray-800 p-1 rounded-full">
              <img className="w-5 h-5 rounded-full" src="https://s3.coinmarketcap.com/static/img/as/2025-01-23T08:40:26.516Z_Trustwallet_logo.png" alt="Wallet 2" />
            </div>
            <div className="bg-gray-800 p-1 rounded-full">
              <img className="w-5 h-5 rounded-full" src="https://s2.coinmarketcap.com/static/img/wallets/128x128/9017.png" alt="Wallet 3" />
            </div>
            <div className="bg-gray-800 p-1 rounded-full flex items-center text-gray-400">
              <IoIosArrowDown />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinLinks; 
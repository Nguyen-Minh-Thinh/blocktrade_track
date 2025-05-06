import React from 'react';
import { TiStarOutline } from "react-icons/ti";
import { IoShareSocialSharp } from "react-icons/io5";
import { FaStar } from 'react-icons/fa';
import { Tooltip } from 'flowbite-react';

const CoinHeader = ({ 
  coinDetail, 
  isLoggedIn, 
  favorite, 
  handleToggleFavorite, 
  priceUsd, 
  setOpenSignIn 
}) => {
  // Format the display symbol by removing "USDT" for display purposes
  const displaySymbol = coinDetail?.symbol?.replace('USDT', '') || 'N/A';
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-gray-800 mb-4">
      <div className="flex items-center gap-3">
        <img 
          src={coinDetail?.image_url || "https://via.placeholder.com/40"} 
          className="w-10 h-10 rounded-full" 
          alt={coinDetail?.name || 'Coin'} 
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{coinDetail?.name || 'Unknown'}</h1>
            <span className="text-base font-medium text-gray-500">{displaySymbol}</span>
            {isLoggedIn ? (
              <div 
                onClick={handleToggleFavorite} 
                className="flex gap-1 items-center p-1 cursor-pointer hover:bg-gray-800 rounded-lg transition-colors ml-2"
              >
                {favorite ? (
                  <FaStar className="text-xl text-yellow-300" />
                ) : (
                  <TiStarOutline className="text-xl text-gray-500" />
                )}
              </div>
            ) : (
              <Tooltip content="Please log in to add to favorites" placement="bottom">
                <div 
                  onClick={() => setOpenSignIn(true)}
                  className="flex gap-1 items-center p-1 cursor-pointer hover:bg-gray-800 rounded-lg transition-colors ml-2"
                >
                  <TiStarOutline className="text-xl text-gray-500" />
                </div>
              </Tooltip>
            )}
            <div className="p-1 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
              <IoShareSocialSharp className="text-xl text-gray-500" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-bold text-white">${priceUsd.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
        <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
          Trading
        </button>
      </div>
    </div>
  );
};

export default CoinHeader; 
import React from 'react';
import { Tooltip } from 'flowbite-react';

const CoinStatistics = ({ coinDetail, priceUsd }) => {
  // Add fallback values for all numeric fields
  const marketCap = coinDetail?.market_cap ?? 0;
  const volume24h = coinDetail?.volume_24h ?? 0;
  const fdv = coinDetail?.fdv ?? 0;
  const totalSupply = coinDetail?.total_supply ?? 0;
  const maxSupply = coinDetail?.max_supply ?? 0;
  const circulatingSupply = coinDetail?.circulating_supply ?? 0;

  // Calculate Vol/Mkt Cap (24h) as a percentage
  const volMktCapRatio = marketCap > 0 ? (volume24h / marketCap * 100).toFixed(2) : 'N/A';
  
  // Format the display symbol by removing "USDT" for display purposes
  const displaySymbol = coinDetail?.symbol?.replace('USDT', '') || 'N/A';

  // Format numbers with commas
  const formatNumber = (num) => {
    if (num === 0 || !num) return '0';
    
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-800">
      <h2 className="text-lg font-bold text-white mb-4">Market Statistics</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="text-sm text-gray-400">Market Cap</div>
          <Tooltip content={`$${marketCap.toLocaleString()}`} placement="bottom">
            <div className="text-base font-medium text-white">{formatNumber(marketCap)}</div>
          </Tooltip>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-400">24h Trading Volume</div>
          <Tooltip content={`$${volume24h.toLocaleString()}`} placement="bottom">
            <div className="text-base font-medium text-white">{formatNumber(volume24h)}</div>
          </Tooltip>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-400">Fully Diluted Valuation</div>
          <Tooltip content={`$${fdv.toLocaleString()}`} placement="bottom">
            <div className="text-base font-medium text-white">{formatNumber(fdv)}</div>
          </Tooltip>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-400">Vol/Mkt Cap (24h)</div>
          <div className="text-base font-medium text-white">{volMktCapRatio}%</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-400">Circulating Supply</div>
          <Tooltip content={`${circulatingSupply.toLocaleString()} ${displaySymbol}`} placement="bottom">
            <div className="text-base font-medium text-white">
              {circulatingSupply.toLocaleString()} {displaySymbol}
            </div>
          </Tooltip>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-400">Total Supply</div>
          <Tooltip content={`${totalSupply.toLocaleString()} ${displaySymbol}`} placement="bottom">
            <div className="text-base font-medium text-white">
              {totalSupply.toLocaleString()} {displaySymbol}
            </div>
          </Tooltip>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-400">Max Supply</div>
          <Tooltip content={`${maxSupply.toLocaleString()} ${displaySymbol}`} placement="bottom">
            <div className="text-base font-medium text-white">
              {maxSupply.toLocaleString()} {displaySymbol}
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default CoinStatistics; 
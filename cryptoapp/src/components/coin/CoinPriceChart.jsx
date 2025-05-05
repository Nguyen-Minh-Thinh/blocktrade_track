import React, { useState } from 'react';
import CryptoChart from '../../components/CryptoChart';

const CoinPriceChart = ({ symbol, name }) => {
  const [timeFrame, setTimeFrame] = useState('1d'); // '1h', '1d', '7d', '30d', '90d', '1y', 'all'

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 mb-8 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <h2 className="text-lg font-bold text-white">{name} Price Chart</h2>
        
      </div>
      
      <div className="h-[400px] w-full">
        <CryptoChart 
          symbol={symbol} 
          timeFrame={timeFrame} 
          chartHeight={400}
        />
      </div>
    </div>
  );
};

export default CoinPriceChart; 
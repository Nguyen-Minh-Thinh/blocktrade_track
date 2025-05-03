import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import OneDayChart from './OneDayChart';
import HistoricalChart from './HistoricalChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
  zoomPlugin
);



const CryptoChart = ({ symbol }) => {
  const [filter, setFilter] = useState('1d');

  return (
    <div className="h-[450px] mt-8 relative">
      <div className="ml-4 px-2 py-1 w-fit z-10 relative">
        {['1d', '7d', '1m', 'All'].map(item => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`
              min-w-14 mr-2 px-2 py-1 text-sm text-white font-medium cursor-pointer border border-[#4B5563]
              ${filter === item ? 'bg-[#6B7280]' : 'bg-[#030712]'}
            `}
          >
            {item}
          </button>
        ))}
      </div>

      {filter === '1d' ? (
        <OneDayChart symbol={symbol} />
      ) : (
        <HistoricalChart symbol={symbol} filter={filter} />
      )}
    </div>
  );
};

export default CryptoChart;

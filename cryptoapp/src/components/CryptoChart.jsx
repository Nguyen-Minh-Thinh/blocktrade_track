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
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';

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

const CryptoChart = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const [filter, setFilter] = useState('All');
  const getTimeRange = (filter) => {
    const now = new Date("2018-05-01"); // ngày cuối cùng trong dữ liệu mẫu
    switch (filter) {
      case '1d':
        return [new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), now];
      case '1m':
        return [new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()), now];
      case '1y':
        return [new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), now];
      default:
        return [new Date("2017-05-01"), new Date("2018-05-01")];
    }
  };
  const [minDate, maxDate] = getTimeRange(filter);  
  useEffect(() => {
    fetch("https://canvasjs.com/data/gallery/react/btcusd2017-18.json")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(item => ({
          x: new Date(item.date),
          y: Number(item.close)
        }));
        setDataPoints(formatted);
      });
  }, []);

  const chartData = {
    datasets: [
      {
        label: '',
        data: dataPoints,
        fill: true,
        borderColor: '#00ffcc',
        borderWidth: 1,
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(0, 255, 204, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 255, 204, 0.2)');
          return gradient;
        },
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          tooltipFormat: 'MMM dd yyyy'
        },
        // min: new Date("2017-05-01").getTime(),  // giống navigator.slider.minimum
        // max: new Date("2018-05-01").getTime(),  // giống navigator.slider.maximum
        min: minDate.getTime(),
        max: maxDate.getTime(),
        ticks: {
          color: "#ccc"
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          callback: function(value) {
            const suffixes = ["", "K", "M", "B"];
            let order = Math.max(Math.floor(Math.log(Math.abs(value)) / Math.log(1000)), 0);
            order = Math.min(order, suffixes.length - 1);
            return (value / Math.pow(1000, order)).toFixed(1) + suffixes[order];
          },
          color: "#ccc",
        
        },
        grid: {
          display: true
        }
      }      
    },
    plugins: {
      legend: {
        display: false,
        labels: {
          color: "#ccc"
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x'
        },
        zoom: {
          wheel: {
            enabled: true
          },
          pinch: {
            enabled: true
          },
          mode: 'x'
        },
        limits: {
          x: {
            min: new Date("2017-01-01").getTime(), // thay bằng min thực tế
            max: new Date("2019-01-01").getTime(), // thay bằng max thực tế
          }
        }
      }
    }
  };

  return (
    <div className='h-[450px] mt-8 relative'>
      <div className=' ml-4 px-2 py-1 w-fit z-10 relative'>
        {['1d', '1m', '1y', 'All'].map(item => (
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
      <div className="absolute inset-x-0 bottom-0 top-[60px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
  
};

export default CryptoChart;

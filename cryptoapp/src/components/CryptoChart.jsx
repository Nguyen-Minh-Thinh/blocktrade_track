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

const CryptoChart = ({ symbol }) => {
  const [dataPoints, setDataPoints] = useState([]);
  const [filter, setFilter] = useState('1d');

  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());
  
  // Hàm tính khoảng thời gian
  const getTimeRange = (filter, data) => {
    const timestamps = data.map(item => item.x.getTime());
    const latest = new Date(Math.max(...timestamps));
    const earliest = new Date(Math.min(...timestamps));
  
    switch (filter) {
      case "1d":
        return [
          earliest,
          latest,
        ];
      case "7d":
        return [
          new Date(latest.getFullYear(), latest.getMonth() - 1, latest.getDate()),
          latest,
        ];
      case "1m":
        return [
          new Date(latest.getFullYear() - 1, latest.getMonth(), latest.getDate()),
          latest,
        ];
      case "All":
        return [
          new Date(latest.getFullYear() - 1, latest.getMonth(), latest.getDate()),
          latest,
        ];
      default:
        return [earliest, latest];
    }
  };

  // Hàm gọi API và xử lý dữ liệu
  const fetchData = () => {
    console.log(symbol);
    fetch(`http://localhost:5000/realtime_data?coin_symbol=${symbol}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setDataPoints([]);
          return;
        }
  
        const formatted = data.map(item => ({
          x: new Date(item.timestamp),
          y: Number(item.close)
        }));
  
        if (JSON.stringify(formatted) !== JSON.stringify(dataPoints)) {
          setDataPoints(formatted);
  
          // ✅ Cập nhật minDate và maxDate luôn tại đây
          const [min, max] = getTimeRange(filter, formatted);
          setMinDate(min);
          setMaxDate(max);
        }
      });
  };
  

  // Gọi API ngay lần đầu tiên khi component mount
  useEffect(() => {
    fetchData();  // Gọi hàm fetchData lần đầu tiên khi component mount

    const intervalId = setInterval(() => {
      fetchData();  // Cập nhật dữ liệu sau mỗi 2 phút
    }, 2 * 60 * 1000); // 2 phút (2 * 60 * 1000 ms)

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(intervalId);
  }, []);  // Chạy một lần khi component mount và sau đó chạy mỗi 2 phút

  
  

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
          unit: 'minute', // hoặc 'second' nếu muốn chi tiết hơn
          displayFormats: {
            minute: 'MMM dd yyyy HH:mm:ss',
            second: 'MMM dd yyyy HH:mm:ss'
          },
          tooltipFormat: 'MMM dd yyyy HH:mm:ss'
        },
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
            min: minDate.getTime(), // ✅ Sửa ở đây
            max: maxDate.getTime()  // ✅ Và đây nữa
          }
        }
      }
    }
  };


  return (
    <div className='h-[450px] mt-8 relative'>
      <div className='ml-4 px-2 py-1 w-fit z-10 relative'>
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
  
      <div className="absolute inset-x-0 bottom-0 top-[60px]">
        {dataPoints.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="text-white text-center mt-20">Đang tải dữ liệu...</div>
        )}
      </div>
    </div>
  );
  
  
};

export default CryptoChart;

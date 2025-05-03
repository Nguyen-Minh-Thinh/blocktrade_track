import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
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


const HistoricalChart = ({ symbol, filter }) => {
  const [dataPoints, setDataPoints] = useState([]);
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());

  const fetchData = () => {
    let endpoint = '';
    if (filter === '7d') endpoint = `http://localhost:5000/historical_data/seven_day?coin_symbol=${symbol}`;
    else if (filter === '1M') endpoint = `http://localhost:5000/historical_data/one_month?coin_symbol=${symbol}`;
    else endpoint = `http://localhost:5000/historical_data/all?coin_symbol=${symbol}`;

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        const historical = Object.values(data)[0];
        const parsedData = historical.map(item => ({
          x: new Date(item.updated_date),
          y: Number(item.price)
        }));

        if (JSON.stringify(parsedData) !== JSON.stringify(dataPoints)) {
          const timestamps = parsedData.map(p => p.x.getTime());
          setMinDate(new Date(Math.min(...timestamps)));
          setMaxDate(new Date(Math.max(...timestamps)));
          setDataPoints(parsedData);
        }
      });
  };

  useEffect(() => {
    fetchData();
  }, [symbol, filter]);

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
          unit: 'day',
          tooltipFormat: 'MMM dd yyyy',
        },
        min: minDate.getTime(),
        max: maxDate.getTime(),
        ticks: { color: "#ccc" },
        grid: { display: false }
      },
      y: {
        ticks: {
          callback: value => {
            const suffixes = ["", "K", "M", "B"];
            let order = Math.max(Math.floor(Math.log(Math.abs(value)) / Math.log(1000)), 0);
            order = Math.min(order, suffixes.length - 1);
            return (value / Math.pow(1000, order)).toFixed(1) + suffixes[order];
          },
          color: "#ccc",
        },
        grid: { display: true }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true, mode: 'index', intersect: false }
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 top-[60px]">
      {dataPoints.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="text-white text-center mt-20">Đang tải dữ liệu...</div>
      )}
    </div>
  );
};

export default HistoricalChart;

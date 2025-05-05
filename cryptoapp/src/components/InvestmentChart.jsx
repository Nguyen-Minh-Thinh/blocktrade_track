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
import 'chartjs-adapter-date-fns';
import dayjs from "dayjs";

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
);

const InvestmentChart = ({ transactionHistory, currentPrice }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    initialInvestment: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercent: 0
  });

  useEffect(() => {
    if (!transactionHistory || !currentPrice) {
      setLoading(true);
      return;
    }

    setLoading(true);
    
    try {
      // Xử lý khi không có giao dịch nào
      if (!transactionHistory.length) {
        setChartData([]);
        setStats({
          initialInvestment: 0,
          currentValue: 0,
          profitLoss: 0,
          profitLossPercent: 0
        });
        setLoading(false);
        return;
      }

      // Sắp xếp giao dịch theo thời gian (cũ đến mới)
      const sortedTransactions = [...transactionHistory].sort((a, b) => {
        const dateA = new Date(a.trans_date || a.date);
        const dateB = new Date(b.trans_date || b.date);
        return dateA - dateB;
      });

      // Tạo mảng điểm dữ liệu cho biểu đồ
      let dataPoints = [];
      let runningTotal = 0;
      let runningQuantity = 0;
      let initialInvestment = 0;
      let totalBought = 0;
      let totalSold = 0;
      
      // Lặp qua từng giao dịch để tính giá trị đầu tư theo thời gian
      sortedTransactions.forEach(transaction => {
        const transDate = dayjs(transaction.trans_date || transaction.date).format("YYYY-MM-DD");
        const amount = parseFloat(transaction.amount || 0);
        const price = parseFloat(transaction.price || 0);
        const value = amount * price;
        
        if (transaction.type === 'buy') {
          runningQuantity += amount;
          runningTotal += value;
          totalBought += value;
        } else if (transaction.type === 'sell') {
          runningQuantity -= amount;
          runningTotal -= value;
          totalSold += value;
        }
        
        dataPoints.push({
          x: new Date(transDate),
          y: runningTotal,
          quantity: runningQuantity,
          avgPrice: runningQuantity > 0 ? runningTotal / runningQuantity : 0,
          price: price,
          type: transaction.type,
          amount: amount,
          value: value
        });
      });
      
      // Tính giá trị hiện tại và lợi nhuận/lỗ
      const currentValue = runningQuantity * currentPrice;
      initialInvestment = totalBought - totalSold;
      const profitLoss = currentValue - initialInvestment;
      const profitLossPercent = initialInvestment > 0 
        ? (profitLoss / initialInvestment) * 100
        : 0;
      
      // Thêm điểm hiện tại vào biểu đồ nếu có giao dịch
      if (dataPoints.length > 0) {
        const lastPoint = dataPoints[dataPoints.length - 1];
        
        // Chỉ thêm điểm hiện tại nếu khác đáng kể với điểm cuối
        if (Math.abs(currentValue - lastPoint.y) > 0.01) {
          const now = new Date();
          
          // Nếu điểm cuối cùng cách đây quá xa (>1 ngày), thêm điểm hiện tại
          if (now - new Date(lastPoint.x) > 24 * 60 * 60 * 1000) {
            dataPoints.push({
              x: now,
              y: currentValue,
              quantity: lastPoint.quantity,
              avgPrice: lastPoint.avgPrice,
              price: currentPrice,
              isCurrent: true
            });
          } else {
            // Nếu gần đây, cập nhật lại giá trị của điểm cuối cùng
            dataPoints[dataPoints.length - 1] = {
              ...lastPoint,
              y: currentValue,
              price: currentPrice,
              isCurrent: true
            };
          }
        } else {
          // Đánh dấu điểm cuối là điểm hiện tại
          dataPoints[dataPoints.length - 1] = {
            ...dataPoints[dataPoints.length - 1],
            isCurrent: true
          };
        }
      }
      
      // Cập nhật thống kê
      setStats({
        initialInvestment,
        currentValue,
        profitLoss,
        profitLossPercent
      });
      
      setChartData(dataPoints);
    } catch (error) {
      console.error('Error processing transaction data for chart:', error);
    } finally {
      setLoading(false);
    }
  }, [transactionHistory, currentPrice]);

  const data = {
    datasets: [
      {
        label: 'Investment Value',
        data: chartData,
        fill: true,
        borderColor: stats.profitLoss >= 0 ? '#22c55e' : '#ef4444',
        borderWidth: 2,
        backgroundColor: (ctx) => {
          if (!ctx || !ctx.chart || !ctx.chart.ctx) {
            return stats.profitLoss >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
          }
          
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
          
          if (stats.profitLoss >= 0) {
            // Gradient xanh lá cho lợi nhuận
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
          } else {
            // Gradient đỏ cho lỗ
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
          }
          
          return gradient;
        },
        tension: 0.3,
        pointRadius: (ctx) => {
          // Hiển thị điểm lớn hơn ở đầu, cuối và các điểm quan trọng
          if (!ctx || !ctx.raw) return 0;
          
          if (ctx.raw.isCurrent) return 4;
          if (ctx.dataIndex === 0) return 3;
          if (ctx.dataIndex === chartData.length - 1) return 3;
          
          // Hiển thị các điểm mua/bán lớn
          if (ctx.raw.value && ctx.raw.value > 100) return 3;
          
          return 0;
        },
        pointBackgroundColor: (ctx) => {
          if (!ctx || !ctx.raw) return stats.profitLoss >= 0 ? '#22c55e' : '#ef4444';
          
          // Màu xanh cho mua, đỏ cho bán
          if (ctx.raw.type === 'buy') return '#22c55e';
          if (ctx.raw.type === 'sell') return '#ef4444';
          
          // Màu cho điểm hiện tại dựa trên lợi nhuận/lỗ
          return stats.profitLoss >= 0 ? '#22c55e' : '#ef4444';
        },
        pointBorderColor: '#fff',
        pointBorderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM dd yyyy'
        },
        ticks: { color: "#ccc" },
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)'
        }
      },
      y: {
        min: 0, // Bắt đầu từ 0 để dễ nhìn hơn
        ticks: {
          callback: value => {
            return '$' + value.toFixed(2);
          },
          color: "#ccc"
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)'
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(18, 24, 38, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6,
        callbacks: {
          title: tooltipItems => {
            return dayjs(tooltipItems[0].raw.x).format('MMM DD, YYYY');
          },
          label: tooltipItem => {
            const data = tooltipItem.raw;
            const lines = [];
            
            // Hiển thị thông tin về giao dịch
            if (data.type) {
              const actionText = data.type === 'buy' ? 'Bought' : 'Sold';
              lines.push(`${actionText} ${data.amount.toFixed(6)} at $${data.price.toFixed(2)}`);
              lines.push(`Transaction value: $${data.value.toFixed(2)}`);
              lines.push('');
            }
            
            // Thông tin về số dư và giá trung bình
            lines.push(`Portfolio Value: $${data.y.toFixed(2)}`);
            lines.push(`Quantity: ${data.quantity.toFixed(6)}`);
            
            if (data.avgPrice > 0) {
              lines.push(`Avg. Purchase Price: $${data.avgPrice.toFixed(2)}`);
            }
            
            // Thông tin về lãi/lỗ nếu là điểm hiện tại
            if (data.isCurrent) {
              lines.push('');
              lines.push(`Current Price: $${currentPrice.toFixed(2)}`);
              
              if (stats.initialInvestment > 0) {
                const profitLossPrefix = stats.profitLoss >= 0 ? '+' : '';
                const percentPrefix = stats.profitLossPercent >= 0 ? '+' : '';
                
                lines.push(`Initial Investment: $${stats.initialInvestment.toFixed(2)}`);
                lines.push(`Profit/Loss: ${profitLossPrefix}$${stats.profitLoss.toFixed(2)} (${percentPrefix}${stats.profitLossPercent.toFixed(2)}%)`);
              }
            }
            
            return lines;
          }
        }
      }
    }
  };

  // Nếu đang loading hoặc không có dữ liệu giao dịch
  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400">
        <p>Loading investment data...</p>
      </div>
    );
  }

  // Nếu không có dữ liệu giao dịch
  if (chartData.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-gray-400">
        <p>No investment data available</p>
        <p className="text-sm mt-2">Start investing to see your portfolio value over time</p>
      </div>
    );
  }

  return (
    <div className="h-48">
      <Line data={data} options={options} />
    </div>
  );
};

export default InvestmentChart; 
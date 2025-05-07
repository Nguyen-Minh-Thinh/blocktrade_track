import React, { useEffect, useState } from 'react';
import { FaCaretUp, FaCaretDown } from 'react-icons/fa';

const InvestmentStats = ({ transactionHistory, currentPrice }) => {
  const [stats, setStats] = useState({
    initialInvestment: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
    totalQuantity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionHistory || !currentPrice) {
      setLoading(true);
      return;
    }

    setLoading(true);
    
    try {
      // Nếu không có giao dịch nào
      if (!transactionHistory.length) {
        setStats({
          initialInvestment: 0,
          currentValue: 0,
          profitLoss: 0,
          profitLossPercent: 0,
          totalQuantity: 0
        });
        setLoading(false);
        return;
      }

      // Tính toán thống kê đầu tư
      let totalBought = 0;
      let totalSold = 0;
      let totalQuantityBought = 0;
      let totalQuantitySold = 0;
      
      // Lặp qua từng giao dịch để tính số liệu tổng
      transactionHistory.forEach(transaction => {
        const amount = parseFloat(transaction.amount || 0);
        const price = parseFloat(transaction.price || 0);
        const value = amount * price;
        
        if (transaction.type === 'buy') {
          totalBought += value;
          totalQuantityBought += amount;
        } else if (transaction.type === 'sell') {
          totalSold += value;
          totalQuantitySold += amount;
        }
      });
      
      // Tính toán các chỉ số đầu tư
      const totalQuantity = totalQuantityBought - totalQuantitySold;
      const initialInvestment = totalBought - totalSold;
      const currentValue = totalQuantity * currentPrice;
      const profitLoss = currentValue - initialInvestment;
      const profitLossPercent = initialInvestment > 0 
        ? (profitLoss / initialInvestment) * 100
        : 0;
      
      // Cập nhật trạng thái
      setStats({
        initialInvestment,
        currentValue,
        profitLoss,
        profitLossPercent,
        totalQuantity
      });
    } catch (error) {
      console.error('Error processing investment stats:', error);
    } finally {
      setLoading(false);
    }
  }, [transactionHistory, currentPrice]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-12 text-gray-400">
        <p>Calculating investment metrics...</p>
      </div>
    );
  }

  // Nếu không có dữ liệu đầu tư
  if (stats.totalQuantity === 0 || stats.initialInvestment === 0) {
    return (
      <div className="flex justify-center items-center h-12 text-gray-400">
        <p>No active investments found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
      <div className="bg-[#1f2937] rounded-lg p-2 text-center">
        <p className="text-gray-400 mb-1">Initial Investment</p>
        <p className="font-bold">${stats.initialInvestment.toFixed(2)}</p>
      </div>
      
      <div className="bg-[#1f2937] rounded-lg p-2 text-center">
        <p className="text-gray-400 mb-1">Current Value</p>
        <p className="font-bold">${stats.currentValue.toFixed(2)}</p>
      </div>
      
      <div className="bg-[#1f2937] rounded-lg p-2 text-center">
        <p className="text-gray-400 mb-1">Profit/Loss</p>
        <p className={`font-bold flex items-center justify-center ${stats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {stats.profitLoss >= 0 ? <FaCaretUp className="mr-1" /> : <FaCaretDown className="mr-1" />}
          ${Math.abs(stats.profitLoss).toFixed(2)}
        </p>
      </div>
      
      <div className="bg-[#1f2937] rounded-lg p-2 text-center">
        <p className="text-gray-400 mb-1">ROI</p>
        <p className={`font-bold ${stats.profitLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {stats.profitLossPercent >= 0 ? '+' : ''}
          {stats.profitLossPercent.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

export default InvestmentStats; 
import React, { useState } from 'react';
import { FaCaretUp, FaCaretDown } from 'react-icons/fa';
import { Spin, Empty, Badge } from 'antd';

const CoinTransactions = ({ 
  transactionHistory,
  ownedCoins, 
  loadingHistory, 
  coinDetail, 
  currentPrice 
}) => {
  const [transactionType, setTransactionType] = useState('all'); // 'all', 'buy', 'sell'
  
  // Format the display symbol by removing "USDT" for display purposes
  const displaySymbol = coinDetail?.symbol?.replace('USDT', '') || 'N/A';
  
  // Filter transactions by type if needed
  const filteredTransactions = transactionType === 'all' 
    ? transactionHistory 
    : transactionHistory.filter(t => t.type === transactionType);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // If it's already in a good format, return it
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        return dateString;
      }
      
      // Convert to proper date format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Format number with fixed decimals and commas
  const formatNumber = (num, decimals = 2) => {
    if (!num && num !== 0) return '0';
    return parseFloat(num).toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  return (
    <div className="bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-800 mb-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
        <h2 className="text-lg font-bold text-white mb-3 md:mb-0">{displaySymbol} Transaction History</h2>
        
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              transactionType === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            } transition-colors`}
            onClick={() => setTransactionType('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              transactionType === 'buy' 
                ? 'bg-green-700 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            } transition-colors`}
            onClick={() => setTransactionType('buy')}
          >
            Buy
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              transactionType === 'sell' 
                ? 'bg-red-700 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            } transition-colors`}
            onClick={() => setTransactionType('sell')}
          >
            Sell
          </button>
        </div>
      </div>
      
      {/* Holdings Summary */}
      {ownedCoins && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-gray-400 text-sm">Current Holdings</div>
              <div className="text-white font-medium">
                {formatNumber(ownedCoins.amount, 8)} {displaySymbol}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-gray-400 text-sm">Average Purchase Price</div>
              <div className="text-white font-medium">
                ${formatNumber(ownedCoins.purchase_price, 2)}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-gray-400 text-sm">Profit/Loss</div>
              {ownedCoins.purchase_price < currentPrice ? (
                <div className="text-green-500 font-medium flex items-center">
                  <FaCaretUp className="mr-1" />
                  ${formatNumber((currentPrice - ownedCoins.purchase_price) * ownedCoins.amount, 2)}
                  <span className="ml-1 text-xs">
                    ({formatNumber((currentPrice / ownedCoins.purchase_price - 1) * 100, 2)}%)
                  </span>
                </div>
              ) : ownedCoins.purchase_price > currentPrice ? (
                <div className="text-red-500 font-medium flex items-center">
                  <FaCaretDown className="mr-1" />
                  ${formatNumber((ownedCoins.purchase_price - currentPrice) * ownedCoins.amount, 2)}
                  <span className="ml-1 text-xs">
                    ({formatNumber((1 - currentPrice / ownedCoins.purchase_price) * 100, 2)}%)
                  </span>
                </div>
              ) : (
                <div className="text-gray-300 font-medium">
                  $0.00 <span className="ml-1 text-xs">(0.00%)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {loadingHistory ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-10">
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-gray-400">
                No transaction history found
              </span>
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-left">
                <th className="px-4 py-3 text-sm font-medium rounded-tl-lg">Type</th>
                <th className="px-4 py-3 text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-sm font-medium text-right">Price</th>
                <th className="px-4 py-3 text-sm font-medium text-right">Amount</th>
                <th className="px-4 py-3 text-sm font-medium text-right rounded-tr-lg">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredTransactions.map((transaction, index) => (
                <tr 
                  key={index}
                  className="hover:bg-gray-800 transition-colors text-white"
                >
                  <td className="px-4 py-4">
                    <Badge 
                      color={transaction.type === 'buy' ? 'green' : 'red'}
                      text={
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${transaction.type === 'buy' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}
                        `}>
                          {transaction.type === 'buy' ? 'BUY' : 'SELL'}
                        </span>
                      }
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {formatDate(transaction.trans_date || transaction.date)}
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    ${formatNumber(transaction.price, 2)}
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    {formatNumber(transaction.amount, 8)} {displaySymbol}
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    ${formatNumber(transaction.amount * transaction.price, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CoinTransactions; 
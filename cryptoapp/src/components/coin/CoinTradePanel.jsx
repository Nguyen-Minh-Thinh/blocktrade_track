import React, { useState, useEffect } from 'react';
import { IoMdWallet } from 'react-icons/io';
import { toast } from 'react-toastify';
import { buyCoin, sellCoin } from '../../api/transactions';

const CoinTradePanel = ({ 
  coinDetail, 
  isLoggedIn, 
  setOpenSignIn, 
  priceUsd,
  ownedCoins,
  user 
}) => {
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'
  const [quantity, setQuantity] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [activeField, setActiveField] = useState(null);
  const [loading, setLoading] = useState(false);

  // Format the display symbol by removing "USDT" for display purposes
  const displaySymbol = coinDetail?.symbol?.replace('USDT', '') || 'N/A';

  // Effect to calculate the derived value based on the active field
  useEffect(() => {
    if (priceUsd > 0) {
      if (quantity && activeField === 'quantity') {
        const calcOrderValue = (parseFloat(quantity) * priceUsd).toFixed(2);
        setOrderValue(calcOrderValue);
      } else if (orderValue && activeField === 'orderValue') {
        const calcQuantity = (parseFloat(orderValue) / priceUsd).toFixed(8);
        setQuantity(calcQuantity);
      }
    }
  }, [quantity, orderValue, priceUsd, activeField]);

  // Handle quantity input change
  const handleQuantityChange = (e) => {
    const newQuantity = e.target.value;
    setActiveField('quantity');
    setQuantity(newQuantity);
    
    if (newQuantity && !isNaN(newQuantity) && priceUsd > 0) {
      const calcOrderValue = (parseFloat(newQuantity) * priceUsd).toFixed(2);
      setOrderValue(calcOrderValue);
    } else {
      setOrderValue('');
    }
  };

  // Handle order value input change
  const handleOrderValueChange = (e) => {
    const newOrderValue = e.target.value;
    setActiveField('orderValue');
    setOrderValue(newOrderValue);
    
    if (newOrderValue && !isNaN(newOrderValue) && priceUsd > 0) {
      const calcQuantity = (parseFloat(newOrderValue) / priceUsd).toFixed(8);
      setQuantity(calcQuantity);
    } else {
      setQuantity('');
    }
  };

  // Function to handle points update and UI refresh
  const updatePointsAndRefreshUI = (newPoints) => {
    if (!newPoints && newPoints !== 0) {
      console.error("No points value provided for update");
      return;
    }
    
    // Get current user data
    const userData = localStorage.getItem('userLogin');
    if (!userData) {
      console.error("No user data found in localStorage");
      return;
    }
    
    try {
      // Parse and update points
      const userLogin = JSON.parse(userData);
      const oldPoints = userLogin.points;
      userLogin.points = newPoints;
      
      // Save back to localStorage
      localStorage.setItem('userLogin', JSON.stringify(userLogin));
      
      // Dispatch events to update UI
      window.dispatchEvent(new CustomEvent('userPointsUpdated'));
      window.dispatchEvent(new Event('userLoggedIn'));
      
    } catch (error) {
      console.error("Error updating points:", error);
    }
  };

  // Handle trade button click
  const handleTrade = async () => {
    if (!isLoggedIn) {
      setOpenSignIn(true);
      toast.info("Please log in to continue with the transaction", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
      return;
    }
    
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
      return;
    }
    
    // For selling, check if user has enough coins
    if (activeTab === 'sell') {
      if (!ownedCoins) {
        toast.error(`You don't own any ${displaySymbol} to sell`, {
          position: "top-right",
          autoClose: 3000,
          theme: "dark"
        });
        return;
      }
      
      if (ownedCoins.amount < parseFloat(quantity)) {
        toast.error(`You only own ${ownedCoins.amount.toFixed(6)} ${displaySymbol}, not enough to sell ${quantity} ${displaySymbol}`, {
          position: "top-right",
          autoClose: 3000,
          theme: "dark"
        });
        return;
      }
    }
    
    setLoading(true);
    
    // Show processing status
    const processingToast = toast.info("Processing transaction...", {
      position: "top-right",
      autoClose: 2000,
      theme: "dark"
    });
    
    try {
      let result;
      
      if (activeTab === 'buy') {
        // Handle Buy transaction
        result = await buyCoin(coinDetail.coin_id, parseFloat(quantity), priceUsd);
        
        // Update user points in localStorage
        if (result && result.remaining_points !== undefined) {
          updatePointsAndRefreshUI(result.remaining_points);
        }
        
        // Calculate the order value that was spent
        const orderValueSpent = parseFloat(quantity) * priceUsd;
        
        // Show success message
        toast.success(
          <div>
            <p>Successfully bought {quantity} {displaySymbol}</p>
            {result.remaining_points !== undefined && (
              <p className="text-sm text-gray-300 mt-1">
                Points: -{orderValueSpent.toFixed(2)} • Remaining: {result.remaining_points.toFixed(2)}
              </p>
            )}
          </div>, 
          {
            position: "top-right",
            autoClose: 5000,
            theme: "dark"
          }
        );
      } else {
        // Handle Sell transaction
        result = await sellCoin(coinDetail.coin_id, parseFloat(quantity), priceUsd);
        
        // Update user points in localStorage
        if (result && result.remaining_points !== undefined) {
          updatePointsAndRefreshUI(result.remaining_points);
        }
        
        // Calculate the order value that was earned
        const orderValueEarned = parseFloat(quantity) * priceUsd;
        
        // Show success message
        toast.success(
          <div>
            <p>Successfully sold {quantity} {displaySymbol}</p>
            {result.remaining_points !== undefined && (
              <p className="text-sm text-gray-300 mt-1">
                Points: +{orderValueEarned.toFixed(2)} • Current: {result.remaining_points.toFixed(2)}
              </p>
            )}
          </div>, 
          {
            position: "top-right",
            autoClose: 5000,
            theme: "dark"
          }
        );
      }
      
      // Dispatch transaction completed event
      window.dispatchEvent(new CustomEvent('transactionCompleted'));
      
      // Reset form
      setQuantity('');
      setOrderValue('');
      setActiveField(null);
      
    } catch (error) {
      console.error("Transaction error:", error);
      
      let errorMessage = "Transaction failed. Please try again later.";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (activeTab === 'sell' && error.message && error.message.includes("not enough")) {
        errorMessage = `Not enough ${displaySymbol} to sell. Please check your balance.`;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
    } finally {
      setLoading(false);
      toast.dismiss(processingToast);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-800">
      <h2 className="text-lg font-bold text-white mb-4">Trade {displaySymbol}</h2>
      
      {/* User balance info if logged in */}
      {isLoggedIn && (
        <div className="bg-gray-800 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <IoMdWallet className="text-blue-500 mr-2 text-xl" />
            <div className="text-sm text-gray-300">Your Balance:</div>
          </div>
          <div className="font-medium text-white">
            {user?.points ? user.points.toLocaleString() : 0} USDT
          </div>
        </div>
      )}
      
      {/* Holdings info if user owns this coin */}
      {isLoggedIn && ownedCoins && (
        <div className="bg-gray-800 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-300">Your {displaySymbol} Holdings:</div>
          <div className="font-medium text-white">
            {ownedCoins.amount.toFixed(6)} {displaySymbol}
          </div>
        </div>
      )}
      
      {/* Buy/Sell Tabs */}
      <div className="flex mb-4 bg-gray-800 rounded-full p-1">
        <button
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === 'buy' 
              ? 'bg-green-600 text-white' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('buy')}
        >
          Buy
        </button>
        <button
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === 'sell' 
              ? 'bg-red-600 text-white' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('sell')}
        >
          Sell
        </button>
      </div>
      
      {/* Price Display */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Price</label>
        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-3">
          <span className="text-white font-medium">${priceUsd.toLocaleString()}</span>
          <span className="text-gray-500 ml-2">USD</span>
        </div>
      </div>
      
      {/* Quantity Input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Quantity</label>
        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <input
            type="text"
            className="flex-1 bg-transparent p-3 text-white border-none outline-none"
            placeholder="0.00"
            value={quantity}
            onChange={handleQuantityChange}
            onFocus={() => setActiveField('quantity')}
          />
          <span className="text-gray-500 px-3">{displaySymbol}</span>
        </div>
      </div>
      
      {/* Order Value Input */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-1">Total</label>
        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <input
            type="text"
            className="flex-1 bg-transparent p-3 text-white border-none outline-none"
            placeholder="0.00"
            value={orderValue}
            onChange={handleOrderValueChange}
            onFocus={() => setActiveField('orderValue')}
          />
          <span className="text-gray-500 px-3">USDT</span>
        </div>
      </div>
      
      {/* Action Button */}
      <button
        className={`w-full py-3 rounded-lg font-medium text-white ${
          activeTab === 'buy'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'
        } transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
        onClick={handleTrade}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span>{activeTab === 'buy' ? `Buy ${displaySymbol}` : `Sell ${displaySymbol}`}</span>
        )}
      </button>
      
      {!isLoggedIn && (
        <p className="text-center text-gray-500 text-xs mt-2">
          Please log in to trade cryptocurrencies
        </p>
      )}
    </div>
  );
};

export default CoinTradePanel; 
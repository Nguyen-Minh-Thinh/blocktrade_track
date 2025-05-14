import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Spin } from 'antd';

// API
import { getCoinDetail } from '../api/coindetail';
import { getFavorites, addFavorite, removeFavorite } from '../api/favorites';
import { getCurrentPrice } from '../api/price';

// Components
import CoinHeader from '../components/coin/CoinHeader';
import CoinStatistics from '../components/coin/CoinStatistics';
import CoinLinks from '../components/coin/CoinLinks';
import CoinPriceChart from '../components/coin/CoinPriceChart';
import CoinTradePanel from '../components/coin/CoinTradePanel';
import CoinTransactions from '../components/coin/CoinTransactions';
import CoinNews from '../components/coin/CoinNews';
import SignIn from '../models/SignIn';
import SignUp from '../models/SignUp';
import InvestmentChart from '../components/InvestmentChart';
import InvestmentStats from '../components/InvestmentStats';
import { FaCaretUp, FaCaretDown } from 'react-icons/fa';
import { IoMdWallet } from 'react-icons/io';

const CoinDetailPage = () => {
  const location = useLocation();
  const coin_id = location?.state?.coin_id || null;
  const symbol = location?.state?.symbol || null;

  // State for coin data
  const [coinDetail, setCoinDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceLoading, setPriceLoading] = useState(true);
  
  // User-related state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [favorite, setFavorite] = useState(false);
  
  // Modal states
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  
  // Portfolio and transaction history states
  const [ownedCoins, setOwnedCoins] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Tab state for user portfolio view
  const [activeTab, setActiveTab] = useState('overview'); // overview, holdings, transactions
  
  // News state
  const [newsData, setNewsData] = useState([]);
  
  // Cache time tracking for API calls
  const [lastFetchTime, setLastFetchTime] = useState({
    portfolio: 0,
    history: 0
  });
  const FETCH_INTERVAL = 10000; // 10 seconds minimum between API calls

  // Add filteredTransactionType state near other transaction-related states
  const [filteredTransactionType, setFilteredTransactionType] = useState('all'); // 'all', 'buy', 'sell'

  // Function to swap between SignIn and SignUp modals
  const swapModals = () => {
    setOpenSignIn(openSignUp);
    setOpenSignUp(openSignIn);
  };

  // Handle successful login
  const handleSuccessfulLogin = useCallback(async (userData, shouldShowToast = true) => {
    setUser(userData);
    setIsLoggedIn(true);
    setOpenSignIn(false);
    setOpenSignUp(false);
    
    // Fetch favorites after login
    try {
      const favoritesData = await getFavorites();
      const isFavorite = favoritesData.favorites?.some(item => item.coin_id === coin_id);
      setFavorite(isFavorite || false);
    } catch (error) {
      console.error('Error fetching favorites after login:', error);
    }

    if (shouldShowToast) {
      toast.success('Login successful', {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
    }
  }, [coin_id]);

  // Load user portfolio and transaction data
  const loadUserData = useCallback(async (forceRefresh = false) => {
    if (!isLoggedIn || !coin_id || !user) {
      // If user is not logged in or coin_id/user is missing, reset loading states
      setLoadingPortfolio(false);
      setLoadingHistory(false);
      return;
    }
    
    // Avoid loading if already in progress
    if (loadingPortfolio || loadingHistory) return;
    
    try {
      // Check if we need to fetch new data
      const now = Date.now();
      if (!forceRefresh && 
          (now - lastFetchTime.portfolio < FETCH_INTERVAL) && 
          (now - lastFetchTime.history < FETCH_INTERVAL)) {
        console.log("Using cached data");
        return;
      }
      
      setLoadingPortfolio(true);
      setLoadingHistory(true);
      
      // Increase axios timeout to prevent request aborted errors
      const axiosOptions = { timeout: 30000 }; // 30 seconds timeout
      
      try {
        // Load portfolio and transaction data in parallel
        const [portfolioResponse, transactionsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/portfolio?user_id=${user.user_id}`, axiosOptions),
          axios.get(`${process.env.REACT_APP_API_URL}/transactions?user_id=${user.user_id}`, axiosOptions)
        ]);
        
        // Process portfolio data - handle empty data gracefully
        const portfolio = portfolioResponse.data.portfolio || [];
        const currentCoin = portfolio.find(item => item.coin_id === coin_id);
        setOwnedCoins(currentCoin || null);
        
        // Process transaction history - handle empty data gracefully
        const transactions = transactionsResponse.data.transactions || [];
        
        // Preprocess transactions to convert date fields if needed
        const processedTransactions = transactions.map(transaction => {
          const processed = { ...transaction };
          
          // Convert date if needed
          if (processed.trans_date) {
            // Already has the proper field name, no conversion needed
          } else if (processed.date) {
            processed.trans_date = processed.date;
          } else if (processed.created_at) {
            processed.trans_date = processed.created_at;
          } else {
            processed.trans_date = new Date().toISOString();
          }
          
          return processed;
        });
        
        // Filter and sort transactions for this coin
        const coinTransactions = processedTransactions
          .filter(transaction => transaction.coin_id === coin_id)
          .sort((a, b) => {
            // Try to use trans_date or date field
            const dateA = a.trans_date || a.date;
            const dateB = b.trans_date || b.date;
            
            if (dateA && dateB) {
              // Try to parse as Date objects
              const dateObjA = new Date(dateA);
              const dateObjB = new Date(dateB);
              
              if (!isNaN(dateObjA) && !isNaN(dateObjB)) {
                return dateObjB - dateObjA; // Newest first
              }
              
              // Fallback to string comparison
              return String(dateB).localeCompare(String(dateA));
            }
            
            return 0;
          });
        
        setTransactionHistory(coinTransactions);
        
        // Update fetch time
        setLastFetchTime({
          portfolio: now,
          history: now
        });
        
        // Important: No error toast for empty data - this is a normal condition
      } catch (apiError) {
        console.error("API Error loading user data:", apiError);
        
        // Only show error toast for network/server errors, not for empty data
        if (apiError.code !== 'ERR_BAD_RESPONSE' && apiError.code !== 'ERR_BAD_REQUEST') {
          toast.error("Network error. Please check your connection and try again.", {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
            toastId: "network-error"
          });
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      
      // Only show error toast for unexpected errors, not for empty data
      if (error.name !== 'AxiosError' || (error.code && error.code !== 'ECONNABORTED')) {
        toast.error("An unexpected error occurred. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
          toastId: "load-data-error"
        });
      }
    } finally {
      // Always reset loading states
      setLoadingPortfolio(false);
      setLoadingHistory(false);
    }
  }, [isLoggedIn, coin_id, user, lastFetchTime, loadingPortfolio, loadingHistory]);

  // Listen for login/logout events
  useEffect(() => {
    const handleUserLoggedIn = () => {
      const userData = localStorage.getItem('userLogin');
      if (userData) {
        try {
          const parsedUserLogin = JSON.parse(userData);
          setUser(parsedUserLogin);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing userLogin:', error);
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };
    
    const handleUserLoggedOut = () => {
      setUser(null);
      setIsLoggedIn(false);
      setOwnedCoins(null);
      setTransactionHistory([]);
    };
    
    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    window.addEventListener('userLoggedOut', handleUserLoggedOut);
    
    // Check initial login status
    handleUserLoggedIn();
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('userLoggedOut', handleUserLoggedOut);
    };
  }, []);

  // Effect to load user data when logged in
  useEffect(() => {
    let mounted = true;
    
    if (isLoggedIn && coin_id && user && mounted) {
      loadUserData(true);
    }
    
    return () => {
      mounted = false;
    };
  }, [isLoggedIn, coin_id, user?.user_id, loadUserData]);

  // Listen for transaction updates
  useEffect(() => {
    let mounted = true;
    
    const handleTransactionCompleted = () => {
      if (!mounted) return;
      loadUserData(true);
    };
    
    window.addEventListener('transactionCompleted', handleTransactionCompleted);
    window.addEventListener('transactionUpdated', handleTransactionCompleted);
    
    return () => {
      mounted = false;
      window.removeEventListener('transactionCompleted', handleTransactionCompleted);
      window.removeEventListener('transactionUpdated', handleTransactionCompleted);
    };
  }, [loadUserData]);

  // Get real-time price updates
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      if (!symbol) return;
      
      try {
        if (currentPrice === 0) {
          setPriceLoading(true);
        }
        
        const priceData = await getCurrentPrice(symbol);
        
        if (priceData && priceData.price) {
          const newPrice = parseFloat(priceData.price);
          setCurrentPrice(newPrice);
        }
      } catch (err) {
        console.error('Error fetching current price:', err);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchCurrentPrice();
    
    // Update price every 1 second
    const priceInterval = setInterval(fetchCurrentPrice, 1000);
    
    return () => clearInterval(priceInterval);
  }, [symbol]);

  // Main data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      if (!coin_id || !symbol) {
        setError('Missing coin_id or symbol');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch coin details
        const coinData = await getCoinDetail(coin_id, symbol);
        if (!coinData || typeof coinData !== 'object') {
          throw new Error('Invalid coin data received');
        }
        setCoinDetail(coinData);

        // Check login status
        const userLogin = localStorage.getItem('userLogin');
        if (userLogin) {
          try {
            const parsedUserLogin = JSON.parse(userLogin);
            setIsLoggedIn(true);
            setUser(parsedUserLogin);
          } catch (parseError) {
            console.error('Error parsing userLogin:', parseError);
            setIsLoggedIn(false);
            setFavorite(false);
          }
        } else {
          setIsLoggedIn(false);
          setFavorite(false);
        }

        // Fetch favorites if logged in
        if (isLoggedIn) {
          try {
            const favoritesData = await getFavorites();
            const isFavorite = favoritesData.favorites?.some(item => item.coin_id === coin_id);
            setFavorite(isFavorite || false);
          } catch (favError) {
            console.error('Error fetching favorites:', favError);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.error || 'Failed to fetch coin details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coin_id, symbol, isLoggedIn]);

  // Fetch news data
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/news/all`);
        const data = await response.json();
        if (response.ok) {
          setNewsData(data.news);
        } else {
          console.error("API Error:", data.error);
        }
      } catch (error) {
        console.error("Error connecting to API:", error);
      }
    };

    fetchNewsData();
  }, []);
    
  // Handle favorite toggling
  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.info('Please log in to manage favorites', {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
      setOpenSignIn(true);
      return;
    }

    try {
      if (favorite) {
        await removeFavorite(coin_id);
        setFavorite(false);
        toast.success('Removed from favorites', {
          position: "top-right",
          autoClose: 2000,
          theme: "dark"
        });
      } else {
        await addFavorite(coin_id);
        setFavorite(true);
        toast.success('Added to favorites', {
          position: "top-right",
          autoClose: 2000,
          theme: "dark"
        });
      }
      window.dispatchEvent(new Event("favoritesUpdated"));
    } catch (err) {
      setError(err.error || 'Failed to update favorite status');
      toast.error('Failed to update favorites', {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-300">Loading coin data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto min-h-screen flex items-center justify-center">
        <div className="bg-red-900 text-white p-6 rounded-lg shadow-lg max-w-xl">
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!coinDetail) {
    return (
      <div className="container mx-auto min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-xl">
          <h2 className="text-xl font-bold mb-2">No Data Available</h2>
          <p>Could not find information for this cryptocurrency.</p>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Format the display symbol by removing "USDT" for display purposes
  const displaySymbol = coinDetail?.symbol?.replace('USDT', '') || 'N/A';

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Login modals */}
      <SignIn
        openSI={openSignIn}
        setOpenSI={setOpenSignIn}
        swapModels={swapModals}
        setUser={(userData) => handleSuccessfulLogin(userData, false)}
      />
      <SignUp
        openSU={openSignUp}
        setOpenSU={setOpenSignUp}
        swapModels={swapModals}
      />
      
      {/* Coin Header */}
      <CoinHeader 
        coinDetail={coinDetail}
        isLoggedIn={isLoggedIn}
        favorite={favorite}
        handleToggleFavorite={handleToggleFavorite}
        priceUsd={currentPrice || coinDetail.price_usd || 0}
        setOpenSignIn={setOpenSignIn}
      />
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Left Column (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Price Chart */}
          <CoinPriceChart 
            symbol={symbol} 
            name={coinDetail.name} 
          />
          
          {/* Tab interface for user investment information - PRESERVED FROM ORIGINAL */}
          <div className="mx-3 my-6 text-white">
            {isLoggedIn ? (
              <div>
                <div className="flex mb-4 border-b border-gray-700">
                  <button 
                    className={`px-6 py-3 font-medium text-sm relative ${activeTab === 'overview' ? 'text-white' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                    {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                  </button>
                  <button 
                    className={`px-6 py-3 font-medium text-sm relative ${activeTab === 'holdings' ? 'text-white' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('holdings')}
                  >
                    Holdings
                    {activeTab === 'holdings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                  </button>
                  <button 
                    className={`px-6 py-3 font-medium text-sm relative ${activeTab === 'transactions' ? 'text-white' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('transactions')}
                  >
                    Transaction History
                    {activeTab === 'transactions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                  </button>
                </div>
                
                {/* Tab Overview */}
                {activeTab === 'overview' && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex justify-between mb-4">
                      <h2 className="text-lg font-semibold">Overview {displaySymbol}</h2>
                      {ownedCoins ? (
                        <div className="flex items-center gap-2">
                          <IoMdWallet className="text-blue-500" />
                          <span className="text-sm">Currently holding: <span className="font-medium">{ownedCoins.amount.toFixed(8)} {displaySymbol}</span></span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">
                          You don't own this coin yet
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-gray-400 text-sm mb-2">Investment Information</h3>
                        {ownedCoins ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-300">Holdings</span>
                              <span className="font-medium">{ownedCoins.amount.toFixed(8)} {displaySymbol}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-300">Purchase Price</span>
                              <span className="font-medium">${ownedCoins.purchase_price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-300">Current Price</span>
                              <span className="font-medium">${(currentPrice || coinDetail.price_usd || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-300">Investment Value</span>
                              <span className="font-medium">${(ownedCoins.amount * ownedCoins.purchase_price).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-300">Current Value</span>
                              <span className="font-medium">${(ownedCoins.amount * (currentPrice || coinDetail.price_usd || 0)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-700 pt-2">
                              <span className="text-sm text-gray-300">Profit/Loss</span>
                              {ownedCoins.purchase_price < (currentPrice || coinDetail.price_usd || 0) ? (
                                <span className="font-medium text-green-500 flex items-center">
                                  <FaCaretUp className="mr-1" />
                                  ${(((currentPrice || coinDetail.price_usd || 0) - ownedCoins.purchase_price) * ownedCoins.amount).toFixed(2)} 
                                  ({(((currentPrice || coinDetail.price_usd || 0) / ownedCoins.purchase_price - 1) * 100).toFixed(2)}%)
                                </span>
                              ) : ownedCoins.purchase_price > (currentPrice || coinDetail.price_usd || 0) ? (
                                <span className="font-medium text-red-500 flex items-center">
                                  <FaCaretDown className="mr-1" />
                                  ${((ownedCoins.purchase_price - (currentPrice || coinDetail.price_usd || 0)) * ownedCoins.amount).toFixed(2)} 
                                  ({((1 - (currentPrice || coinDetail.price_usd || 0) / ownedCoins.purchase_price) * 100).toFixed(2)}%)
                                </span>
                              ) : (
                                <span className="font-medium text-gray-300">$0.00 (0.00%)</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            <div>
                              <p>No investment information available</p>
                              <p className="text-sm mt-2">You don't own any {displaySymbol}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-gray-400 text-sm mb-2">Recent Activity</h3>
                        {transactionHistory.length > 0 ? (
                          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                            {transactionHistory.slice(0, 5).map((transaction, index) => (
                              <div key={index} className="flex justify-between border-b border-gray-700 pb-2">
                                <div>
                                  <div className={`font-medium ${transaction.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                                    {transaction.type === 'buy' ? 'Buy' : 'Sell'} {transaction.amount ? transaction.amount.toFixed(6) : '0.000000'} {displaySymbol}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {transaction.trans_date || transaction.date || 'No date available'}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">${transaction.price ? transaction.price.toFixed(2) : '0.00'}</div>
                                  <div className="text-xs text-gray-400">
                                    ${transaction.amount && transaction.price ? (transaction.amount * transaction.price).toFixed(2) : '0.00'}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {transactionHistory.length > 5 && (
                              <div className="text-center text-sm text-blue-500 hover:underline cursor-pointer py-1" onClick={() => setActiveTab('transactions')}>
                                View all {transactionHistory.length} transactions
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            <p>No transaction records found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Tab Holdings */}
                {activeTab === 'holdings' && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">{displaySymbol} Holdings</h2>
                    
                    {ownedCoins ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Coin</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Purchase Price</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Current Price</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Current Value</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Profit/Loss</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            <tr>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img className="h-8 w-8 rounded-full mr-3" src={coinDetail.image_url} alt={coinDetail.name} />
                                  <div>
                                    <div className="font-medium">{coinDetail.name}</div>
                                    <div className="text-xs text-gray-400">{displaySymbol}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right font-medium">
                                {ownedCoins.amount.toFixed(8)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right font-medium">
                                ${ownedCoins.purchase_price.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right font-medium">
                                ${(currentPrice || coinDetail.price_usd || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right font-medium">
                                ${(ownedCoins.amount * (currentPrice || coinDetail.price_usd || 0)).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right">
                                {ownedCoins.purchase_price < (currentPrice || coinDetail.price_usd || 0) ? (
                                  <div className="text-green-500 font-medium flex items-center justify-end">
                                    <FaCaretUp className="mr-1" />
                                    ${(((currentPrice || coinDetail.price_usd || 0) - ownedCoins.purchase_price) * ownedCoins.amount).toFixed(2)}
                                    <span className="ml-1 text-xs">({(((currentPrice || coinDetail.price_usd || 0) / ownedCoins.purchase_price - 1) * 100).toFixed(2)}%)</span>
                                  </div>
                                ) : ownedCoins.purchase_price > (currentPrice || coinDetail.price_usd || 0) ? (
                                  <div className="text-red-500 font-medium flex items-center justify-end">
                                    <FaCaretDown className="mr-1" />
                                    ${((ownedCoins.purchase_price - (currentPrice || coinDetail.price_usd || 0)) * ownedCoins.amount).toFixed(2)}
                                    <span className="ml-1 text-xs">({((1 - (currentPrice || coinDetail.price_usd || 0) / ownedCoins.purchase_price) * 100).toFixed(2)}%)</span>
                                  </div>
                                ) : (
                                  <div className="text-gray-300 font-medium">
                                    $0.00 <span className="ml-1 text-xs">(0.00%)</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        
                        {/* <div className="mt-6 bg-gray-800 rounded-lg p-4">
                          <h3 className="text-gray-300 font-medium mb-3">Investment Value Over Time</h3>
                          <InvestmentStats transactionHistory={transactionHistory} currentPrice={(currentPrice || coinDetail.price_usd || 0)} />
                          <div className="h-48">
                            <InvestmentChart transactionHistory={transactionHistory} currentPrice={(currentPrice || coinDetail.price_usd || 0)} />
                          </div>
                        </div> */}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-400">
                        <div>
                          <p className="text-lg">No holdings data available</p>
                          <p className="text-sm mt-2">You don't own any {displaySymbol}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Tab Transaction History */}
                {activeTab === 'transactions' && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">{displaySymbol} Transaction History</h2>
                      <div className="flex items-center gap-3">
                        <button 
                          className={`text-xs px-3 py-2 rounded-full ${
                            filteredTransactionType === 'all' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white'
                          } transition-colors`}
                          onClick={() => setFilteredTransactionType('all')}
                        >
                          All Transactions
                        </button>
                        <button 
                          className={`text-xs px-3 py-2 rounded-full ${
                            filteredTransactionType === 'buy' 
                              ? 'bg-green-700 text-white' 
                              : 'bg-gray-800 text-gray-300 hover:bg-green-700 hover:text-white'
                          } transition-colors`}
                          onClick={() => setFilteredTransactionType('buy')}
                        >
                          Buy
                        </button>
                        <button 
                          className={`text-xs px-3 py-2 rounded-full ${
                            filteredTransactionType === 'sell' 
                              ? 'bg-red-700 text-white' 
                              : 'bg-gray-800 text-gray-300 hover:bg-red-700 hover:text-white'
                          } transition-colors`}
                          onClick={() => setFilteredTransactionType('sell')}
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                    
                    {transactionHistory.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead className="bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {transactionHistory
                              .filter(transaction => 
                                filteredTransactionType === 'all' || transaction.type === filteredTransactionType
                              )
                              .map((transaction, index) => (
                                <tr key={index} className="hover:bg-gray-800">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      transaction.type === 'buy' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                    }`}>
                                      {transaction.type === 'buy' ? 'Buy' : 'Sell'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    {transaction.trans_date || transaction.date || 'No date available'}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right font-medium">
                                    ${transaction.price ? transaction.price.toFixed(2) : '0.00'}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right font-medium">
                                    {transaction.amount ? transaction.amount.toFixed(8) : '0.00000000'} {displaySymbol}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right font-medium">
                                    ${transaction.amount && transaction.price ? (transaction.amount * transaction.price).toFixed(2) : '0.00'}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        
                        {transactionHistory.filter(transaction => 
                          filteredTransactionType === 'all' || transaction.type === filteredTransactionType
                        ).length === 0 && (
                          <div className="text-center py-10 text-gray-400">
                            <p>No {filteredTransactionType !== 'all' ? filteredTransactionType : ''} transactions found</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-400">
                        <div>
                          <p className="text-lg">No transactions found</p>
                          <p className="text-sm mt-2">You haven't made any transactions with {displaySymbol}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <h2 className="text-lg font-semibold mb-4">Investment Information and Transaction History</h2>
                <p className="text-gray-400 mb-4">Please log in to view your investment information and transaction history</p>
                <button 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setOpenSignIn(true)}
                >
                  Login Now
                </button>
              </div>
            )}
          </div>
          
          {/* Stats and Info Cards - Two column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CoinStatistics 
              coinDetail={coinDetail}
              priceUsd={currentPrice || coinDetail.price_usd || 0}
            />
            
            <CoinLinks 
              coinDetail={coinDetail}
            />
          </div>
          
          {/* News Section */}
          <CoinNews 
            newsData={newsData} 
            coinId={coin_id}
          />
        </div>
        
        {/* Right Column (1 col) - Trade Panel */}
        <div className="lg:col-span-1">
          <CoinTradePanel 
            coinDetail={coinDetail}
            isLoggedIn={isLoggedIn}
            setOpenSignIn={setOpenSignIn}
            priceUsd={currentPrice || coinDetail.price_usd || 0}
            ownedCoins={ownedCoins}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default CoinDetailPage; 
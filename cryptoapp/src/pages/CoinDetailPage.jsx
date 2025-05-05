import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TiStarOutline } from "react-icons/ti";
import { IoShareSocialSharp } from "react-icons/io5";
import dayjs from "dayjs";

import { FaStar, FaFileAlt, FaGithub, FaReddit, FaGlobe, FaCaretUp, FaCaretDown } from 'react-icons/fa';
import { IoMdWallet } from 'react-icons/io';
import { Tooltip } from 'flowbite-react';
import { IoIosArrowDown } from "react-icons/io";
import { ToggleCheck } from '../components/ToggleCheck';
import { DropdownCustom } from '../components/DropdownCustom';
import ButtonComponent from '../components/ButtonComponent';
import CryptoChart from '../components/CryptoChart';
import InvestmentChart from '../components/InvestmentChart';
import InvestmentStats from '../components/InvestmentStats';
import { getCoinDetail } from '../api/coindetail';
import { getFavorites, addFavorite, removeFavorite } from '../api/favorites';
import axios from 'axios';
import SignIn from '../models/SignIn';
import SignUp from '../models/SignUp';
import { toast } from 'react-toastify';
import { getCurrentPrice } from '../api/price';
import { buyCoin, sellCoin } from '../api/transactions';
import 'react-toastify/dist/ReactToastify.css';

const CoinDetailPage = () => {
  const location = useLocation();
  const coin_id = location?.state?.coin_id || null;
  const symbol = location?.state?.symbol || null;

  console.log('Navigated Coin ID:', coin_id);
  console.log('Navigated Symbol:', symbol);

  const [check, setCheck] = useState(true);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceLoading, setPriceLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [titleSubmit, setTitleSubmit] = useState("Buy");
  const [coinDetail, setCoinDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [activeField, setActiveField] = useState(null); // Để theo dõi trường đang được chỉnh sửa
  
  // State cho portfolio và lịch sử giao dịch
  const [ownedCoins, setOwnedCoins] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, holdings, transactions
  
  // Modal login states
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [user, setUser] = useState(null);

  // Thêm state để cache dữ liệu và tránh gọi API quá nhiều lần
  const [lastFetchTime, setLastFetchTime] = useState({
    portfolio: 0,
    history: 0
  });
  const FETCH_INTERVAL = 10000; // Khoảng thời gian tối thiểu giữa các lần gọi API (10 giây)

  // Function to switch between SignIn and SignUp modals
  const swapModels = () => {
    setOpenSignIn(openSignUp);
    setOpenSignUp(openSignIn);
  };

  // Function to handle successful login
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

  // Tách hàm loadData ra khỏi useEffect và memoize nó để tránh tạo hàm mới mỗi khi render
  const loadData = useCallback(async (forceRefresh = false) => {
    if (!isLoggedIn || !coin_id || !user) return;
    
    // Nếu đang load dữ liệu thì không gọi lại
    if (loadingPortfolio || loadingHistory) return;
    
    try {
      // Kiểm tra xem đã đến lúc cần fetch dữ liệu mới chưa
      const now = Date.now();
      if (!forceRefresh && 
          (now - lastFetchTime.portfolio < FETCH_INTERVAL) && 
          (now - lastFetchTime.history < FETCH_INTERVAL)) {
        console.log("Skipping data fetch, using cached data");
        return;
      }
      
      setLoadingPortfolio(true);
      setLoadingHistory(true);
      
      console.log("Fetching portfolio and transaction data");
      
      // Gọi API song song để cải thiện hiệu suất
      const [portfolioRes, transactionsRes] = await Promise.all([
        axios.get(`http://localhost:5000/portfolio?user_id=${user.user_id}`),
        axios.get(`http://localhost:5000/transactions?user_id=${user.user_id}`)
      ]);
      
      // Gỡ lỗi dữ liệu từ API
      console.log('=== KIỂM TRA DỮ LIỆU GIAO DỊCH TỪ API ===');
      console.log('Headers API:', transactionsRes.headers);
      console.log('Status API:', transactionsRes.status);
      console.log('Loại dữ liệu:', typeof transactionsRes.data);
      console.log('Cấu trúc JSON:', Object.keys(transactionsRes.data));
      
      // Kiểm tra mảng giao dịch
      if (transactionsRes.data && transactionsRes.data.transactions) {
        console.log('Số lượng giao dịch:', transactionsRes.data.transactions.length);
        if (transactionsRes.data.transactions.length > 0) {
          const sample = transactionsRes.data.transactions[0];
          console.log('Thuộc tính mẫu giao dịch đầu tiên:', Object.keys(sample));
          console.log('Giá trị date đầu tiên:', sample.date, typeof sample.date);
          console.log('Giá trị trans_date đầu tiên:', sample.trans_date, typeof sample.trans_date);
        }
      } else {
        console.log('Không tìm thấy mảng transactions trong dữ liệu API');
      }
      
      // Xử lý dữ liệu portfolio
      const portfolio = portfolioRes.data.portfolio || [];
      const currentCoin = portfolio.find(item => item.coin_id === coin_id);
      setOwnedCoins(currentCoin || null);
      
      // Xử lý dữ liệu transaction history
      const transactions = transactionsRes.data.transactions || [];
      console.log('Raw transaction data example:', transactions.length > 0 ? transactions[0] : 'No transactions');
      
      if (transactions.length > 0) {
        console.log('DEBUG ALL TRANSACTIONS DATE FIELDS:');
        transactions.forEach((t, idx) => {
          console.log(`Transaction ${idx} - date: "${t.date}" (${typeof t.date})`);
        });
      }
      
      // Preprocess transactions to convert date fields if needed
      const processedTransactions = transactions.map(transaction => {
        const processed = { ...transaction };
        
        // Kiểm tra trường date hoặc các trường thay thế
        if (!transaction.date) {
          console.log('Không tìm thấy trường date trong giao dịch, tìm trường thay thế...');
          
          // Kiểm tra các trường thay thế có thể có
          if (transaction.created_at) {
            console.log('Sử dụng trường created_at thay thế:', transaction.created_at);
            processed.date = formatDate(transaction.created_at);
          } else if (transaction.timestamp) {
            console.log('Sử dụng trường timestamp thay thế:', transaction.timestamp);
            processed.date = formatDate(transaction.timestamp);
          } else if (transaction.transaction_date) {
            console.log('Sử dụng trường transaction_date thay thế:', transaction.transaction_date);
            processed.date = formatDate(transaction.transaction_date);
          } else {
            // Nếu không có trường nào, hiển thị thời gian của giao dịch gần nhất trong ngày
            console.log('Không tìm thấy trường thay thế, sử dụng timestamp hiện tại');
            
            // Kiểm tra xem transaction_id có phải là timestamp không (thường ID tự tăng)
            if (transaction.transaction_id && !isNaN(Number(transaction.transaction_id))) {
              const possibleDate = new Date(Number(transaction.transaction_id));
              if (!isNaN(possibleDate.getTime()) && possibleDate.getFullYear() > 2000) {
                processed.date = formatDate(possibleDate);
                console.log('Sử dụng transaction_id như timestamp:', processed.date);
              } else {
                processed.date = formatDate(new Date());
                console.log('Sử dụng thời gian hiện tại');
              }
            } else {
              processed.date = formatDate(new Date());
              console.log('Sử dụng thời gian hiện tại');
            }
          }
        } else {
          // Kiểm tra và định dạng trường ngày tháng nếu đã có
          console.log(`Xử lý date ban đầu: ${transaction.date} (${typeof transaction.date})`);
          
          // Nếu trường date là chuỗi MySQL định dạng đúng, giữ nguyên
          if (typeof transaction.date === 'string' && 
              transaction.date.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
            // Đã đúng định dạng, giữ nguyên
            console.log(`- Giữ nguyên MySQL format: ${transaction.date}`);
          }
          // Định dạng trường date nếu là Date object
          else if (transaction.date instanceof Date) {
            const formattedDate = formatDate(transaction.date);
            processed.date = formattedDate;
            console.log(`- Date object -> formatted: ${formattedDate}`);
          }
          // Cố gắng chuyển đổi sang Date rồi định dạng
          else {
            try {
              const dateObj = new Date(transaction.date);
              if (!isNaN(dateObj.getTime())) {
                const formattedDate = formatDate(dateObj);
                processed.date = formattedDate;
                console.log(`- Chuyển đổi thành công: ${formattedDate}`);
              } else {
                console.log(`- Không thể chuyển đổi thành Date hợp lệ`);
                // Giữ nguyên giá trị gốc nếu không chuyển đổi được
              }
            } catch (e) {
              console.error(`- Lỗi xử lý ngày: ${e.message}`);
            }
          }
        }
        
        return processed;
      });
      
      const coinTransactions = processedTransactions
        .filter(transaction => transaction.coin_id === coin_id)
        .sort((a, b) => {
          // Handle date sorting with fallbacks
          if (a.date instanceof Date && b.date instanceof Date) {
            return b.date - a.date; // Newest first
          }
          // Fallback to string comparison if dates couldn't be parsed
          return String(b.date).localeCompare(String(a.date));
        });
      
      console.log('Processed transaction data:', coinTransactions);
      console.log('Transaction dates detail:');
      coinTransactions.forEach((t, idx) => {
        console.log(`Transaction ${idx} - date: "${t.date}" (${typeof t.date}) - exists: ${Boolean(t.date)}`);
      });
      
      setTransactionHistory(coinTransactions);
      
      // Cập nhật thời gian fetch
      setLastFetchTime({
        portfolio: now,
        history: now
      });
    } catch (error) {
      console.error("Error loading data:", error);
      // Chỉ hiển thị lỗi nếu người dùng đã đăng nhập
      if (isLoggedIn) {
        toast.error("Unable to load investment data, please try again later", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
          toastId: "load-data-error" // Prevent duplicate toasts
        });
      }
    } finally {
      setLoadingPortfolio(false);
      setLoadingHistory(false);
    }
  }, [isLoggedIn, coin_id, user, lastFetchTime, loadingPortfolio, loadingHistory]);

  // useEffect để lấy dữ liệu khi component mount hoặc khi người dùng đăng nhập/coin thay đổi
  useEffect(() => {
    let mounted = true;
    
    // Chỉ gọi loadData khi cần thiết
    if (isLoggedIn && coin_id && user && mounted) {
      // Force refresh khi dependency thay đổi
      loadData(true);
    }
    
    // Cleanup function để tránh memory leak và update state sau khi unmount
    return () => {
      mounted = false;
    };
    
  }, [isLoggedIn, coin_id, user?.user_id]);
  
  // Cập nhật lại dữ liệu sau khi thực hiện giao dịch
  useEffect(() => {
    let mounted = true;
    
    // Định nghĩa handler function
    const handleTransactionCompleted = () => {
      if (!mounted) return;
      
      console.log("Transaction completed event detected");
      // Khi có giao dịch hoàn thành, luôn force refresh
      loadData(true);
    };
    
    window.addEventListener('transactionCompleted', handleTransactionCompleted);
    window.addEventListener('transactionUpdated', handleTransactionCompleted);
    
    return () => {
      mounted = false;
      window.removeEventListener('transactionCompleted', handleTransactionCompleted);
      window.removeEventListener('transactionUpdated', handleTransactionCompleted);
    };
  }, [loadData]);

  // Lấy giá hiện tại từ Binance qua API - giữ nguyên cập nhật mỗi giây
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      if (!symbol) return;
      
      try {
        // Chỉ set loading khi chưa có giá
        if (currentPrice === 0) {
          setPriceLoading(true);
        }
        
        const priceData = await getCurrentPrice(symbol);
        
        if (priceData && priceData.price) {
          const newPrice = parseFloat(priceData.price);
          setCurrentPrice(newPrice);
          setPrice(newPrice); // Cập nhật giá trị vào ô input
          
          // Cập nhật Order Value nếu Quantity đã được nhập
          if (quantity && quantity !== '' && activeField !== 'orderValue') {
            const calcOrderValue = (parseFloat(quantity) * newPrice).toFixed(2);
            setOrderValue(calcOrderValue);
          } 
          // Cập nhật Quantity nếu Order Value đã được nhập
          else if (orderValue && orderValue !== '' && activeField !== 'quantity') {
            const calcQuantity = (parseFloat(orderValue) / newPrice).toFixed(8);
            setQuantity(calcQuantity);
          }
        }
      } catch (err) {
        console.error('Error fetching current price:', err);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchCurrentPrice();
    
    // Cập nhật giá mỗi 1 giây
    const priceInterval = setInterval(fetchCurrentPrice, 1000);
    
    return () => clearInterval(priceInterval);
  }, [symbol]);

  // Xử lý khi giá thay đổi
  useEffect(() => {
    if (price > 0) {
      if (quantity && activeField === 'quantity') {
        // Nếu quantity đang được chỉnh sửa, cập nhật orderValue
        const calcOrderValue = (parseFloat(quantity) * price).toFixed(2);
        setOrderValue(calcOrderValue);
      } else if (orderValue && activeField === 'orderValue') {
        // Nếu orderValue đang được chỉnh sửa, cập nhật quantity
        const calcQuantity = (parseFloat(orderValue) / price).toFixed(8);
        setQuantity(calcQuantity);
      }
    }
  }, [price, quantity, orderValue, activeField]);

  // Xử lý khi nhập Quantity
  const handleQuantityChange = (e) => {
    const newQuantity = e.target.value;
    setActiveField('quantity');
    setQuantity(newQuantity);
    
    if (newQuantity && !isNaN(newQuantity) && price > 0) {
      const calcOrderValue = (parseFloat(newQuantity) * price).toFixed(2);
      setOrderValue(calcOrderValue);
    } else {
      setOrderValue('');
    }
  };

  // Xử lý khi nhập Order Value
  const handleOrderValueChange = (e) => {
    const newOrderValue = e.target.value;
    setActiveField('orderValue');
    setOrderValue(newOrderValue);
    
    if (newOrderValue && !isNaN(newOrderValue) && price > 0) {
      const calcQuantity = (parseFloat(newOrderValue) / price).toFixed(8);
      setQuantity(calcQuantity);
    } else {
      setQuantity('');
    }
  };

  // Xử lý khi thay đổi giá
  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    setActiveField('price');
    setPrice(newPrice);
    
    if (newPrice && !isNaN(newPrice)) {
      const parsedPrice = parseFloat(newPrice);
      if (quantity && !isNaN(quantity)) {
        const calcOrderValue = (parseFloat(quantity) * parsedPrice).toFixed(2);
        setOrderValue(calcOrderValue);
      } else if (orderValue && !isNaN(orderValue)) {
        const calcQuantity = (parseFloat(orderValue) / parsedPrice).toFixed(8);
        setQuantity(calcQuantity);
      }
    }
  };

  // Lắng nghe sự kiện đăng nhập/đăng xuất
  useEffect(() => {
    const handleUserLoggedIn = () => {
      const userData = localStorage.getItem('userLogin');
      if (userData) {
        try {
          const parsedUserLogin = JSON.parse(userData);
          setUser(parsedUserLogin);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing userLogin after update:', error);
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
    
    // Kiểm tra ngay lập tức khi component mount
    handleUserLoggedIn();
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('userLoggedOut', handleUserLoggedOut);
    };
  }, []);

  // Update the fetchData useEffect to use the memoized loadData
  useEffect(() => {
    const fetchData = async () => {
      if (!coin_id || !symbol) {
        setError('Missing coin_id or symbol in navigation state');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch coin details (accessible regardless of login status)
        console.log(`Fetching coin details for coin_id: ${coin_id}, symbol: ${symbol}`);
        const coinData = await getCoinDetail(coin_id, symbol);
        console.log('Fetched Coin Detail:', coinData);
        if (!coinData || typeof coinData !== 'object') {
          throw new Error('Invalid coin data received');
        }
        setCoinDetail(coinData);

        // Check for userLogin in local storage
        const userLogin = localStorage.getItem('userLogin');
        console.log('User Login in Local Storage:', userLogin ? 'Present' : 'Missing');

        if (userLogin) {
          try {
            // Parse userLogin to ensure it's valid JSON
            const parsedUserLogin = JSON.parse(userLogin);
            console.log('Parsed User Login:', parsedUserLogin);
            setIsLoggedIn(true);
            setUser(parsedUserLogin);
            
            // Portfolio and transaction data will be loaded by the main useEffect
            // when isLoggedIn and user are updated
          } catch (parseError) {
            console.error('Error parsing userLogin from local storage:', parseError);
            setIsLoggedIn(false);
            setFavorite(false);
          }
        } else {
          console.log('userLogin missing in local storage, user is not logged in, skipping favorites check.');
          setIsLoggedIn(false);
          setFavorite(false); // Default to not favorited
        }

        // Fetch favorites if user is logged in
        if (isLoggedIn) {
          try {
            console.log('Fetching favorites...');
            const favoritesData = await getFavorites();
            console.log('Fetched Favorites:', favoritesData);
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

  useEffect(() => {
      async function fetchNews() {
        try {
          const response = await fetch("http://localhost:5000/news/all");
          const data = await response.json();
          if (response.ok) {
            setNewsData(data.news);
          } else {
            console.error("Lỗi API:", data.error);
          }
        } catch (error) {
          console.error("Lỗi kết nối đến API:", error);
        }
      }
  
      fetchNews();
    }, []);
    
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
      } else {
        await addFavorite(coin_id);
        setFavorite(true);
      }
      window.dispatchEvent(new Event("favoritesUpdated"));
    } catch (err) {
      setError(err.error || 'Failed to update favorite status');
    }
  };

  const toggleColor = (a) => {
    setCheck(a);
    // Update the title based on the selection
    setTitleSubmit(a ? "Buy" : "Sell");
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
      
      console.log(`Points update: ${oldPoints} → ${newPoints}`);
      
      // Save back to localStorage
      localStorage.setItem('userLogin', JSON.stringify(userLogin));
      
      // Update local state
      setUser({...userLogin});
      
      // Dispatch events to update UI
      window.dispatchEvent(new CustomEvent('userPointsUpdated'));
      window.dispatchEvent(new Event('userLoggedIn'));
      
      // Verify update
      setTimeout(() => {
        const verifyData = localStorage.getItem('userLogin');
        if (verifyData) {
          const verifyUser = JSON.parse(verifyData);
          console.log(`Verified points in localStorage: ${verifyUser.points}`);
        }
      }, 100);
      
    } catch (error) {
      console.error("Error updating points:", error);
    }
  };

  // Handle Buy/Sell button click
  const handleBuySellClick = async () => {
    try {
      if (!isLoggedIn) {
        setOpenSignIn(true);
        toast.info("Please log in to continue with the transaction", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
          toastId: "login-required"
        });
        return;
      }
      
      if (!quantity || quantity <= 0) {
        toast.error("Please enter a valid quantity", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
          toastId: "invalid-quantity"
        });
        return;
      }
      
      if (!price || price <= 0) {
        toast.error("Invalid price", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
          toastId: "invalid-price"
        });
        return;
      }
      
      // For selling, check if user has enough coins
      if (titleSubmit === "Sell") {
        // Check if the user has any coins
        if (!ownedCoins) {
          toast.error(`You don't own any ${displaySymbol} to sell`, {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
            toastId: "no-coins-to-sell"
          });
          return;
        }
        
        // Check if user has enough coins to sell
        if (ownedCoins.amount < parseFloat(quantity)) {
          toast.error(`You only own ${ownedCoins.amount.toFixed(6)} ${displaySymbol}, not enough to sell ${quantity} ${displaySymbol}`, {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
            toastId: "insufficient-coins"
          });
          return;
        }
      }
      
      // Show processing status
      const processingToast = toast.info("Processing transaction...", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
        toastId: "processing-transaction"
      });
      
      let result;
      
      try {
        if (titleSubmit === "Buy") {
          // Handle Buy transaction
          result = await buyCoin(coin_id, parseFloat(quantity), priceUsd);
          
          // Validate the result before showing success message
          if (!result || typeof result !== 'object') {
            throw new Error("Invalid response from server");
          }
          
          // Dismiss the processing toast
          toast.dismiss(processingToast);
          
          // Update user points in localStorage FIRST before showing any toasts
          if (result && result.remaining_points !== undefined) {
            console.log("BUY: Updating points in localStorage:", result.remaining_points);
            updatePointsAndRefreshUI(result.remaining_points);
            
            // Force another userPointsUpdated event after a short delay
            setTimeout(() => {
              console.log("BUY: Dispatching secondary point update event");
              window.dispatchEvent(new CustomEvent('userPointsUpdated'));
              window.dispatchEvent(new Event('userLoggedIn'));
            }, 200);
          }
          
          // Calculate the order value that was spent
          const orderValueSpent = parseFloat(quantity) * priceUsd;
          
          // Show a single consolidated toast instead of multiple toasts
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
              theme: "dark",
              toastId: "buy-success"
            }
          );
        } else {
          // Handle Sell transaction
          console.log("Selling coin with parameters:", {
            coin_id,
            quantity: parseFloat(quantity),
            price: priceUsd
          });
          
          result = await sellCoin(coin_id, parseFloat(quantity), priceUsd);
          console.log("Sell response:", result);
          
          // Validate the result before showing success message
          if (!result || typeof result !== 'object') {
            throw new Error("Invalid response from server");
          }
          
          // Dismiss the processing toast
          toast.dismiss(processingToast);
          
          // Update user points in localStorage FIRST before showing any toasts
          // This ensures the header updates before showing transaction results
          if (result && result.remaining_points !== undefined) {
            console.log("SELL: Updating points in localStorage:", result.remaining_points);
            updatePointsAndRefreshUI(result.remaining_points);
            
            // Force another userPointsUpdated event after a short delay
            setTimeout(() => {
              console.log("SELL: Dispatching secondary point update event");
              window.dispatchEvent(new CustomEvent('userPointsUpdated'));
              window.dispatchEvent(new Event('userLoggedIn'));
            }, 200);
          } else {
            console.warn("Transaction completed but no remaining_points provided");
          }
          
          // Calculate the order value that was earned
          const orderValueEarned = parseFloat(quantity) * priceUsd;
          
          // Calculate profit/loss if purchase_price is available
          let profitLossElement = null;
          if (result.purchase_price !== undefined) {
            try {
              const purchasePrice = parseFloat(result.purchase_price);
              const currentPrice = priceUsd;
              const soldQuantity = parseFloat(quantity);
              
              // Calculate profit = (selling price - purchase price) * quantity
              const profit = (currentPrice - purchasePrice) * soldQuantity;
              const profitFormatted = profit.toFixed(2);
              const profitPercent = purchasePrice !== 0 
                ? ((currentPrice / purchasePrice - 1) * 100).toFixed(2) 
                : 0;
              
              console.log("Profit calculation:", {
                purchasePrice,
                currentPrice,
                soldQuantity,
                profit,
                profitPercent
              });
              
              if (profit > 0) {
                profitLossElement = (
                  <p className="text-sm text-green-400 mt-1">
                    Profit: +{profitFormatted} points (+{profitPercent}%)
                  </p>
                );
              } else if (profit < 0) {
                profitLossElement = (
                  <p className="text-sm text-red-400 mt-1">
                    Loss: {profitFormatted} points ({profitPercent}%)
                  </p>
                );
              } else {
                profitLossElement = (
                  <p className="text-sm text-gray-300 mt-1">
                    Break-even (0%)
                  </p>
                );
              }
            } catch (profitError) {
              console.error("Error calculating profit:", profitError);
              // Silently fail profit calculation - don't show any profit/loss message
            }
          }
          
          // Show a single consolidated toast instead of multiple toasts
          toast.success(
            <div>
              <p>Successfully sold {quantity} {displaySymbol}</p>
              {result.remaining_points !== undefined && (
                <p className="text-sm text-gray-300 mt-1">
                  Points: +{orderValueEarned.toFixed(2)} • Current: {result.remaining_points.toFixed(2)}
                </p>
              )}
              {profitLossElement}
            </div>, 
            {
              position: "top-right",
              autoClose: 5000,
              theme: "dark",
              toastId: "sell-success"
            }
          );
        }
        
        // Dispatch transaction completed event and force refresh data
        window.dispatchEvent(new CustomEvent('transactionCompleted'));
        
        // Reset form after successful transaction - make sure these are set to '0' or empty
        setQuantity('');
        setOrderValue('');
        setActiveField(null);

        // Reset price to current market price
        setPrice(currentPrice);
      } catch (transactionError) {
        console.error("Transaction API error:", transactionError);
        
        // Dismiss the processing toast
        toast.dismiss(processingToast);
        
        // Show error message
        if (transactionError.response && transactionError.response.data && transactionError.response.data.message) {
          toast.error(transactionError.response.data.message, {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
            toastId: "transaction-api-error"
          });
        } else {
          let errorMessage = "Transaction failed. Please try again later.";
          
          // Provide more specific error messages for common issues
          if (titleSubmit === "Sell" && transactionError.message && transactionError.message.includes("not enough")) {
            errorMessage = `Not enough ${displaySymbol} to sell. Please check your balance.`;
          }
          
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
            toastId: "transaction-error"
          });
        }
        
        // Do not re-throw, just handle it here
      }
      
    } catch (error) {
      console.error("General error in transaction process:", error);
      // This will catch any other errors not related to the transaction API
    }
  };

  // Hàm định dạng ngày tháng đơn giản
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Nếu là chuỗi đúng định dạng MySQL, trả về trực tiếp
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        return dateString;
      }
      
      // Nếu là đối tượng Date, định dạng
      if (dateString instanceof Date) {
        const year = dateString.getFullYear();
        const month = String(dateString.getMonth() + 1).padStart(2, '0');
        const day = String(dateString.getDate()).padStart(2, '0');
        const hours = String(dateString.getHours()).padStart(2, '0');
        const minutes = String(dateString.getMinutes()).padStart(2, '0');
        const seconds = String(dateString.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
      
      // Trường hợp khác, thử chuyển đổi thành Date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
      
      // Nếu không thể chuyển đổi, trả về chuỗi gốc
      return String(dateString);
    } catch (error) {
      return String(dateString);
    }
  };

  if (loading) return <div className='container mx-auto text-white'>Loading...</div>;
  if (error) return <div className='container mx-auto text-red-500'>Error: {error}</div>;
  if (!coinDetail) return <div className='container mx-auto text-white'>No data available</div>;

  // Add fallback values for all numeric fields
  const priceUsd = currentPrice || coinDetail.price_usd || 0; // Sử dụng giá từ Binance nếu có
  const marketCap = coinDetail.market_cap ?? 0;
  const volume24h = coinDetail.volume_24h ?? 0;
  const fdv = coinDetail.fdv ?? 0;
  const totalSupply = coinDetail.total_supply ?? 0;
  const maxSupply = coinDetail.max_supply ?? 0;
  const circulatingSupply = coinDetail.circulating_supply ?? 0;
  const ratingScore = coinDetail.rating_score ?? 0;

  // Calculate Vol/Mkt Cap (24h) as a percentage
  const volMktCapRatio = marketCap > 0 ? (volume24h / marketCap * 100).toFixed(4) : 'N/A';

  // Adjust symbol by removing "USDT" for display purposes
  const displaySymbol = coinDetail.symbol?.replace('USDT', '') || 'N/A';

  return (  
    <div className='container mx-auto'>
      {/* Add SignIn and SignUp modals */}
      <SignIn
        openSI={openSignIn}
        setOpenSI={setOpenSignIn}
        swapModels={swapModels}
        setUser={(userData) => handleSuccessfulLogin(userData, false)}
      />
      <SignUp
        openSU={openSignUp}
        setOpenSU={setOpenSignUp}
        swapModels={swapModels}
      />
      
      <div className='grid grid-cols-4 flex-row-reverse mt-20 mb-10'>
        <div className='p-4 py-8 border-y-2 border-gray-500'>
          <div className='text-white flex justify-between items-center py-2'>
            <div className='flex items-center gap-2'>
              <img src={coinDetail.image_url || "https://via.placeholder.com/20"} className='w-6 h-6' alt={coinDetail.name || 'Coin'} />
              <p className='text-xl font-medium'>
                {coinDetail.name || 'Unknown'} <span className='text-gray-700 text-base'>{displaySymbol}</span>
              </p>
            </div>
            <div className='flex gap-2 items-center'>
              {isLoggedIn ? (
                <div onClick={handleToggleFavorite} className='flex gap-1 items-center p-2 cursor-pointer bg-gray-800 rounded-lg'>
                  {favorite ? <FaStar className='text-base text-yellow-300'/> : <TiStarOutline className='text-base text-gray-500'/>}
                </div>
              ) : (
                <Tooltip content="Please log in to add to favorites" placement="bottom">
                  <div className='flex gap-1 items-center p-2 bg-gray-800 rounded-lg opacity-50 cursor-not-allowed'>
                    <TiStarOutline className='text-base text-gray-500'/>
                  </div>
                </Tooltip>
              )}
              <div className='p-2 rounded-lg bg-gray-800'>
                <IoShareSocialSharp className='text-base text-gray-500'/>
              </div>
            </div>
          </div>
          <div className="flex gap-2 py-2 text-3xl font-bold items-center text-white">
            <p>${priceUsd.toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 py-2 text-white font-medium">
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>Market cap</p>
              <div className='flex items-center gap-1'>
                <Tooltip content={`$${marketCap.toLocaleString()}`} placement='bottom'>
                  <p className='text-sm'>${marketCap.toLocaleString()}</p>
                </Tooltip>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>Volume (24h)</p>
              <div className='flex items-center gap-1'>
                <Tooltip content={`$${volume24h.toLocaleString()}`} placement='bottom'>
                  <p className='text-sm'>${volume24h.toLocaleString()}</p>
                </Tooltip>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>FDV</p>
              <div className='flex items-center gap-1'>
                <Tooltip content={`$${fdv.toLocaleString()}`} placement='bottom'>
                  <p className='text-sm'>${fdv.toLocaleString()}</p>
                </Tooltip>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>Vol/Mkt Cap (24h)</p>
              <div className='flex items-center gap-1'>
                <p className='text-sm'>{volMktCapRatio}%</p>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>Total supply</p>
              <div className='flex items-center gap-1'>
                <Tooltip content={`${totalSupply.toLocaleString()} ${displaySymbol}`} placement='bottom'>
                  <p className='text-sm'>{totalSupply.toLocaleString()} {displaySymbol}</p>
                </Tooltip>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>Max. supply</p>
              <div className='flex items-center gap-1'>
                <Tooltip content={`${maxSupply.toLocaleString()} ${displaySymbol}`} placement='bottom'>
                  <p className='text-sm'>{maxSupply.toLocaleString()} {displaySymbol}</p>
                </Tooltip>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2 col-span-2'>
              <p className='text-[12px] text-gray-500'>Circulating supply</p>
              <div className='flex items-center gap-1'>
                <Tooltip content={`${circulatingSupply.toLocaleString()} ${displaySymbol}`} placement='bottom'>
                  <p className='text-sm'>{circulatingSupply.toLocaleString()} {displaySymbol}</p>
                </Tooltip>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-white text-sm py-2 w-full rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span>Website</span>
              <div className="flex space-x-2">
                <a href={coinDetail.homepage || '#'} target="_blank" rel="noopener noreferrer" className="bg-gray-700 px-3 rounded-full flex items-center space-x-1">
                  <FaGlobe /> <span>Website</span>
                </a>
                <button className="bg-gray-700 px-3 rounded-full flex items-center space-x-1">
                  <FaFileAlt /> <span>Whitepaper</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Socials</span>
              <div className="flex space-x-2">
                {coinDetail.twitter ? (
                  <a href={`https://twitter.com/${coinDetail.twitter}`} target="_blank" rel="noopener noreferrer">
                    <FaReddit className="text-red-500 text-xl" />
                  </a>
                ) : (
                  <FaReddit className="text-gray-500 text-xl" />
                )}
                <FaGithub className="text-white text-xl" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Rating</span>
              <div className="flex items-center space-x-2 bg-gray-700 px-3 rounded-full">
                <span>{ratingScore.toFixed(1)}</span>
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`text-yellow-400 ${i >= Math.round(ratingScore / 2) || ratingScore === 0 ? 'opacity-50' : ''}`} />
                ))}
                <IoIosArrowDown />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Explorers</span>
              <div className='flex gap-2'>
                {coinDetail.explorers?.[0] ? (
                  <a href={coinDetail.explorers[0]} target="_blank" rel="noopener noreferrer" className="bg-gray-700 px-3 rounded-full flex items-center space-x-1">
                    <span>{new URL(coinDetail.explorers[0]).hostname}</span>
                  </a>
                ) : (
                  <button className="bg-gray-700 px-3 rounded-full flex items-center space-x-1">
                    <span>N/A</span>
                  </button>
                )}
                {coinDetail.explorers?.length > 1 && (
                  <div className='bg-gray-700 p-1 rounded-full flex items-center'>
                    <IoIosArrowDown />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Wallets</span>
              <div className="flex space-x-2">
                <div className='bg-gray-700 p-1 rounded-full flex items-center'>
                  <img className='w-4 h-4 rounded-full' src="https://s3.coinmarketcap.com/static/img/as/2024-11-22T08:06:55.818Z_2024_11_18T10_38_53_883Z_m2kXHwEY_400x400.png" alt="" />
                </div>
                <div className='bg-gray-700 p-1 rounded-full flex items-center'>
                  <img className='w-4 h-4 rounded-full' src="https://s3.coinmarketcap.com/static/img/as/2025-01-23T08:40:26.516Z_Trustwallet_logo.png" alt="" />
                </div>
                <div className='bg-gray-700 p-1 rounded-full flex items-center'>
                  <img className='w-4 h-4 rounded-full' src="https://s2.coinmarketcap.com/static/img/wallets/128x128/9017.png" alt="" />
                </div>
                <div className='bg-gray-700 p-1 rounded-full flex items-center'>
                  <img className='w-4 h-4 rounded-full' src="https://s2.coinmarketcap.com/static/img/wallets/128x128/9020.png" alt="" />
                </div>
                <div className='bg-gray-700 p-1 rounded-full flex items-center'>
                  <IoIosArrowDown />
                </div>
              </div>
            </div>
            
          </div>
        </div>
        <div className='col-span-2 border-2 border-gray-500'>
          <div className=''>
            <CryptoChart symbol={symbol} />  
          </div>
          
          {/* Phần tab hiển thị thông tin đầu tư và lịch sử giao dịch */}
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
                
                {/* Tab Tổng quan */}
                {activeTab === 'overview' && (
                  <div className="bg-[#1a1d26] rounded-lg p-4">
                    <div className="flex justify-between mb-4">
                      <h2 className="text-lg font-semibold">Overview {displaySymbol}</h2>
                      {ownedCoins ? (
                        <div className="flex items-center gap-2">
                          <IoMdWallet className="text-blue-500" />
                          <span className="text-sm">Currently holding: <span className="font-medium">{ownedCoins.amount.toFixed(8)} {displaySymbol}</span></span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">
                          {loadingPortfolio ? "Loading..." : "You don't own this coin yet"}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#272b38] rounded-lg p-4">
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
                              <span className="font-medium">${priceUsd.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-300">Investment Value</span>
                              <span className="font-medium">${(ownedCoins.amount * ownedCoins.purchase_price).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-300">Current Value</span>
                              <span className="font-medium">${(ownedCoins.amount * priceUsd).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-600 pt-2">
                              <span className="text-sm text-gray-300">Profit/Loss</span>
                              {ownedCoins.purchase_price < priceUsd ? (
                                <span className="font-medium text-green-500 flex items-center">
                                  <FaCaretUp />
                                  ${((priceUsd - ownedCoins.purchase_price) * ownedCoins.amount).toFixed(2)} 
                                  ({((priceUsd / ownedCoins.purchase_price - 1) * 100).toFixed(2)}%)
                                </span>
                              ) : ownedCoins.purchase_price > priceUsd ? (
                                <span className="font-medium text-red-500 flex items-center">
                                  <FaCaretDown />
                                  ${((ownedCoins.purchase_price - priceUsd) * ownedCoins.amount).toFixed(2)} 
                                  ({((1 - priceUsd / ownedCoins.purchase_price) * 100).toFixed(2)}%)
                                </span>
                              ) : (
                                <span className="font-medium text-gray-300">$0.00 (0.00%)</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            {loadingPortfolio ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin w-6 h-6 border-t-2 border-blue-500 border-r-2 border-r-transparent rounded-full"></div>
                                <p>Loading information...</p>
                              </div>
                            ) : (
                              <div>
                                <p>You don't own any {displaySymbol}</p>
                                <p className="text-sm mt-2">Start investing by clicking the "Buy" button</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-[#272b38] rounded-lg p-4">
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
                            {loadingHistory ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin w-6 h-6 border-t-2 border-blue-500 border-r-2 border-r-transparent rounded-full"></div>
                                <p>Loading transaction history...</p>
                              </div>
                            ) : (
                              <p>No recent transactions</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Tab Số dư đang sở hữu */}
                {activeTab === 'holdings' && (
                  <div className="bg-[#1a1d26] rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">{displaySymbol} Holdings</h2>
                    
                    {ownedCoins ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Coin</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Average Purchase Price</th>
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
                                ${priceUsd.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right font-medium">
                                ${(ownedCoins.amount * priceUsd).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right">
                                {ownedCoins.purchase_price < priceUsd ? (
                                  <div className="text-green-500 font-medium flex items-center justify-end">
                                    <FaCaretUp />
                                    ${((priceUsd - ownedCoins.purchase_price) * ownedCoins.amount).toFixed(2)}
                                    <span className="ml-1 text-xs">({((priceUsd / ownedCoins.purchase_price - 1) * 100).toFixed(2)}%)</span>
                                  </div>
                                ) : ownedCoins.purchase_price > priceUsd ? (
                                  <div className="text-red-500 font-medium flex items-center justify-end">
                                    <FaCaretDown />
                                    ${((ownedCoins.purchase_price - priceUsd) * ownedCoins.amount).toFixed(2)}
                                    <span className="ml-1 text-xs">({((1 - priceUsd / ownedCoins.purchase_price) * 100).toFixed(2)}%)</span>
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
                        
                        <div className="mt-6 bg-[#272b38] rounded-lg p-4">
                          <h3 className="text-gray-300 font-medium mb-3">Investment Value Over Time</h3>
                          <InvestmentStats transactionHistory={transactionHistory} currentPrice={priceUsd} />
                          <div className="h-48">
                            <InvestmentChart transactionHistory={transactionHistory} currentPrice={priceUsd} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-400">
                        {loadingPortfolio ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin w-8 h-8 border-t-2 border-blue-500 border-r-2 border-r-transparent rounded-full"></div>
                            <p className="mt-4">Loading portfolio information...</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg">You don't own any {displaySymbol}</p>
                            <p className="text-sm mt-2">You can buy {displaySymbol} using the "Buy" button on the right sidebar</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Tab Lịch sử giao dịch */}
                {activeTab === 'transactions' && (
                  <div className="bg-[#1a1d26] rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">{displaySymbol} Transaction History</h2>
                      <div className="flex items-center gap-3">
                        <button className="text-xs px-3 py-2 rounded-full bg-[#272b38] text-gray-300 hover:bg-blue-600 hover:text-white transition-colors">
                          All Transactions
                        </button>
                        <button className="text-xs px-3 py-2 rounded-full bg-[#272b38] text-gray-300 hover:bg-blue-600 hover:text-white transition-colors">
                          Buy
                        </button>
                        <button className="text-xs px-3 py-2 rounded-full bg-[#272b38] text-gray-300 hover:bg-blue-600 hover:text-white transition-colors">
                          Sell
                        </button>
                      </div>
                    </div>
                    
                    {transactionHistory.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead className="bg-[#272b38]">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {transactionHistory.map((transaction, index) => (
                              <tr key={index} className="hover:bg-[#272b38]">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    transaction.type === 'buy' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                  }`}>
                                    {transaction.type === 'buy' ? 'Buy' : 'Sell'}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  {dayjs(transaction.trans_date).format("YYYY-MM-DD HH:mm:ss")}
                                  <div className="text-xs text-gray-500 mt-1">
                                  </div>
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
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-400">
                        {loadingHistory ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin w-8 h-8 border-t-2 border-blue-500 border-r-2 border-r-transparent rounded-full"></div>
                            <p className="mt-4">Loading transaction history...</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg">No transactions found</p>
                            <p className="text-sm mt-2">You haven't made any transactions with {displaySymbol}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#1a1d26] rounded-lg p-8 text-center">
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
          <div className='mt-6'>
            <div className='grid grid-cols-2 gap-3 px-3 my-2 mb-4 text-white'>
              {newsData.length > 0 ? (
                newsData.filter(news => news.coin_id === coin_id).map((news) => (
                  <div key={news.news_id} className='font-medium'>
                    <div className=''>
                        <div className="bg-[#ffffff14] hover:bg-[#414141] hover:bg-opacity-70 border border-[#ffffff1f] shadow-md rounded-lg overflow-hidden h-full">
                          <Link to={news.news_link} target="_blank" rel="noopener noreferrer" className="block h-full">
                            <div className="p-5 pt-6 flex flex-col min-h-[178px] h-full justify-between ">
                              <div className=''>
                                <p className="text-[#3760c7] text-xs font-bold">{news.source_name} - {formatDate(news.updated_at)}</p>
                                <h3 className="text-lg font-semibold mt-2 line-clamp-3 pr-4" >
                                  {news.title}
                                </h3>
                              </div>
                              <div className=" flex items-center justify-end">
                                →
                              </div>
                            </div>
                          </Link>
                        </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Loading news...</p>
              )}
              
            </div>
          </div>                
        </div>
        <div className='p-4 py-10 border-y-2 border-gray-500'>
          <div>
            <div className='text-white w-full rounded-full bg-gray-900 border border-gray-700 flex relative'>
              <div className={`w-[174px] h-full bg-black absolute transition delay-150 duration-300 rounded-full left-0 ${check ? 'translate-x-[0] bg-green-400' : 'translate-x-[173px] bg-red-400'}`}></div>
              <button className='w-full opacity-60 transition delay-150 duration-300 py-2 text-xs font-medium rounded-full bg-gray-900' onClick={() => { toggleColor(true); }}>Buy</button>
              <button className='w-full opacity-60 transition delay-150 duration-300 py-2 text-xs font-medium rounded-full bg-gray-900' onClick={() => { toggleColor(false); }}>Sell</button>
            </div>
            <div className="text-white w-full mt-6 space-y-4">
            <br />
              <div className="border border-gray-500">
                <div className='bg-gray-800 py-[2px] px-2 rounded flex justify-between items-center'>
                  <span className='text-sm text-gray-400 font-medium'>Price</span>
                  <input 
                    type="text"                                                
                    placeholder="1000" 
                    className="rtl text-right bg-gray-800 p-2 pl-10 border-none outline-none w-64 focus:border-none focus:outline-none focus:ring-0 focus:shadow-none"
                    pattern="^[0-9]*(\.[0-9]*)?$"   
                    autoComplete="off"       
                    value={price} 
                    onChange={handlePriceChange}           
                  />
                  <span className='text-sm text-gray-400 font-medium'>USD</span>
                </div>
              </div>
              <div className="border border-gray-500">
                <div className='bg-gray-800 py-[2px] px-2 flex justify-between items-center'>
                  <span className="text-sm text-gray-400 font-medium">Quantity</span>
                  <input
                    type="text"
                    className="bg-transparent p-2 w-full text-white text-right border-none outline-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none"
                    placeholder="0"
                    value={quantity}
                    onChange={handleQuantityChange}
                    onFocus={() => setActiveField('quantity')}
                  />
                  <span className='text-sm text-gray-400 font-medium'>{displaySymbol}</span>
                </div>
              </div>
              <div className="border border-gray-500">
                <div className='bg-gray-800 py-[2px] px-2 flex justify-between items-center'>
                  <span className="text-sm text-gray-400 font-medium">Order Value</span>
                  <div className='flex items-center'>
                    <input
                      type="text"
                      className="bg-transparent p-2 text-white text-right border-none outline-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none"
                      placeholder="0"
                      value={orderValue}
                      onChange={handleOrderValueChange}
                      onFocus={() => setActiveField('orderValue')}
                    />
                    <span className="text-sm text-gray-400 font-medium float-right">USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='flex justify-center mt-12 items-center'>
            <div className='w-36' onClick={handleBuySellClick}>
              <ButtonComponent contentButton={`${titleSubmit} ${displaySymbol}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDetailPage;
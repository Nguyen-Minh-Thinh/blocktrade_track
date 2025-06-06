import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { TiStarOutline } from "react-icons/ti";
import { FaStar } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";
import ButtonComponent from '../components/ButtonComponent';
import SignUp from '../models/SignUp';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';
import { fetchCoins } from '../api/coins';
import { getFavorites, addFavorite, removeFavorite } from '../api/favorites';
import { checkAuth } from '../api/auth';
import { toast } from 'react-toastify';
import SignIn from '../models/SignIn';

const HomePage = () => {
  const [started, setStarted] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
    const [openSignUp, setOpenSignUp] = useState(false);
  const [coins, setCoins] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [chartData, setChartData] = useState({});
  const [user, setUser] = useState(null);
  const [togglingFavorites, setTogglingFavorites] = useState({});
  const location = useLocation();
  const isOnCoinDetailPage = location.pathname.includes('/coin/');
  const navigate = useNavigate(); // Initialize useNavigate
const [newsData, setNewsData] = useState([]); // State for news data  
  // Load user from localStorage
  const loadUserFromStorage = () => {
    const userData = localStorage.getItem("userLogin");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  };

  const swapModels = () => {
    setOpenSignIn(started);
    setStarted(openSignIn);
  };
  const handleSuccessfulLogin = (userData, shouldShowToast = true) => {
      setUser(userData);
      setOpenSignIn(false);
      setStarted(false);
      
      // Show success toast if shouldShowToast is true
      if (shouldShowToast) {
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
      
      // Trigger UI updates without page reload
      window.dispatchEvent(new Event("userLoggedIn"));
      
      // Check if we need to reload the page (only if on CoinDetailPage)
      if (isOnCoinDetailPage) {
        console.log('Login successful on CoinDetailPage, reloading after delay...');
        // Delay the reload to allow toast to be visible
        setTimeout(() => {
          window.location.reload();
        }, 1500); // 1.5 second delay
      }
    };
  

  // Verify authentication if no user data in localStorage
  const verifyAuth = async () => {
    try {
      const userData = await checkAuth();
      if (userData) {
        setUser(userData);
        localStorage.setItem("userLogin", JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem("userLogin");
      }
    } catch (err) {
      console.error('Error verifying auth:', err);
      setUser(null);
      localStorage.removeItem("userLogin");
    }
  };

  // Fetch favorites from the backend
  const fetchFavorites = async () => {
    if (user) {
      try {
        const favoritesData = await getFavorites();
        const favoritesMap = favoritesData.favorites.reduce((acc, favorite) => {
          acc[favorite.coin_id] = true;
          return acc;
        }, {});
        setFavorites({ ...favoritesMap });
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error(error.error || 'Failed to load favorites', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
    } else {
      setFavorites({});
    }
  };
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

  // Fetch user on mount
  useEffect(() => {
    loadUserFromStorage();
    if (!localStorage.getItem("userLogin")) {
      verifyAuth();
    }

    const handleUserUpdated = () => {
      loadUserFromStorage();
    };

    window.addEventListener("userUpdated", handleUserUpdated);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdated);
    };
  }, []);

  // Fetch coins and favorites when user changes
  useEffect(() => {
    const loadCoinsAndFavorites = async () => {
      try {
        const response = await fetchCoins();
        const fetchedCoins = response.coins || [];
        setCoins(fetchedCoins);

        const fetchChartData = async () => {
          const endTime = Date.now();
          const startTime = endTime - 7 * 24 * 60 * 60 * 1000;

          const promises = fetchedCoins.map(async (coin) => {
            try {
              const url = 'https://api.binance.com/api/v3/klines';
              const params = {
                symbol: coin.symbol,
                interval: '1d',
                startTime: startTime,
                endTime: endTime,
                limit: 7,
              };

              const response = await fetch(url + '?' + new URLSearchParams(params));
              const responseData = await response.json();

              const data = responseData.map((item) => ({
                date: new Date(item[0]).toISOString().split('T')[0],
                price: parseFloat(item[4]),
              }));

              return { index: coin.index, data };
            } catch (error) {
              console.error(`Error fetching chart data for ${coin.symbol}:`, error);
              return { index: coin.index, data: [] };
            }
          });

          const results = await Promise.all(promises);
          const chartDataMap = results.reduce((acc, { index, data }) => {
            acc[index] = data;
            return acc;
          }, {});
          setChartData(chartDataMap);
        };

        await fetchChartData();
        await fetchFavorites();
      } catch (error) {
        console.error('Error fetching coins from backend:', error);
        toast.error(error.error || 'Failed to load coins', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
    };

    loadCoinsAndFavorites();
  }, [user]);

  // Toggle favorite status for a specific coin
  const toggleFavorite = async (coinId, e) => {
    e.stopPropagation(); // Prevent row click from triggering navigation
    if (!user) {
      toast.error('Please sign in to manage favorites', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }

    setTogglingFavorites((prev) => ({ ...prev, [coinId]: true }));

    try {
      const isFavorite = favorites[coinId];
      if (isFavorite) {
        await removeFavorite(coinId);
        toast.success('Removed from favorites', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      } else {
        await addFavorite(coinId);
        toast.success('Added to favorites', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }

      await fetchFavorites();
      window.dispatchEvent(new CustomEvent("favoritesUpdated", { detail: { timestamp: Date.now() } }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(error.error || 'Failed to update favorite', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      await fetchFavorites();
    } finally {
      setTogglingFavorites((prev) => ({ ...prev, [coinId]: false }));
    }
  };

  // Navigate to coin detail page
  const handleRowClick = (coinId, symbol) => {
    navigate('/coindetail', { state: { coin_id: coinId, symbol: symbol } });
  };

  return (
    <div className='mx-14 mb-36 '>
      <SignIn
              openSI={openSignIn}
              setOpenSI={setOpenSignIn}
              swapModels={swapModels}
              setUser={(userData) => handleSuccessfulLogin(userData, true)}
            />
            <SignUp
              openSU={started} 
              setOpenSU={setStarted}
              swapModels={swapModels}
            />
      <SignUp ></SignUp>
      <div className='flex flex-col items-center'>
        <div className='relative max-w-[1700px] w-full'>
          <div className='absolute w-full -z-10 left-'>
            <img src="/bg.webp" alt="logo" className='w-full opacity-15' />
          </div>
        </div>
        <div className='text-3xl md:text-6xl lg:text-7xl text-white font-bold text-center pt-40'>
          <h1>Secure & Intuitive</h1>
          <h1>Crypto Trading</h1>
        </div>
        <div className='text-slate-500 font-medium text-center text-sm md:text-base pt-6'>
          <p>Empower your future with cutting-edge crypto smart contracts.</p>
          <p>Start developing your smart contract today with Blocktrade Track.</p>
        </div>
        <div className='flex justify-center my-6'>
          {
            user ? (
              <Link to="market" className='w-32'>
                <ButtonComponent  contentButton={"Get Started →"}></ButtonComponent>
              </Link>) :(
              <div onClick={() => { setStarted(true) }} className='w-32'>
                <ButtonComponent contentButton={"Get Started →"}></ButtonComponent>
              </div>
            )
          }
        </div>
      </div>
      <div className='mt-[250px]'>
        <h1 className='text-white text-3xl md:text-4xl text-center font-medium my-6 mb-10'>Crypto Market Trade And Metrics</h1>
          <div className='my-3 overflow-x-auto 2xl:overflow-hidden custom-scroll '>
            <div className="min-w-full inline-block 2xl:flex items-center justify-center align-middle">
              <table className='min-w-max text-white font-medium'>
                <colgroup>
                  <col />
                  <col className='w-12' />
                  <col className='w-52' />
                  <col />
                  <col className='w-20' />
                  <col className='w-20' />
                  <col className='w-20' />
                  <col className='w-48' />
                  <col className='w-48' />
                  <col className='w-48' />
                  <col className='w-52' />
                </colgroup>
                <thead>
                  <tr className='border-b text-sm border-gray-700'>
                    <th></th>
                    <th className='text-nowrap text-start p-2'>#</th>
                    <th className='text-nowrap text-start p-2'>Name</th>
                    <th className='text-nowrap text-end p-2'>Price</th>
                    <th className='text-nowrap text-end p-2'>1h%</th>
                    <th className='text-nowrap text-end p-2'>24h%</th>
                    <th className='text-nowrap text-end p-2'>7d%</th>
                    <th className='text-nowrap text-end p-2'>Market Cap</th>
                    <th className='text-nowrap text-end p-2'>Volume (<span className=' text-[10px]'>24h</span>)</th>
                    <th className='text-nowrap text-end p-2'>Circulating Supply</th>
                    <th className='text-nowrap text-end p-2'>Last 7 Days</th>
                  </tr>
                </thead>
                <tbody>
                  {coins.length > 0 ? (
                    coins.slice(0, 5).map((coin) => (
                      <tr 
                        key={coin.index} 
                        className='text-sm border-y border-gray-700 hover:bg-slate-900 cursor-pointer'
                        onClick={() => handleRowClick(coin.coin_id, coin.symbol)} // Navigate on row click
                      >
                        <td>
                          <div 
                            onClick={(e) => toggleFavorite(coin.coin_id, e)} 
                            className='text-start p-2'
                          >
                            {togglingFavorites[coin.coin_id] ? (
                              <FaSpinner className='text-[18px] text-gray-500 animate-spin' />
                            ) : favorites[coin.coin_id] ? (
                              <FaStar className='text-[18px] text-yellow-300' />
                            ) : (
                              <TiStarOutline className='text-[18px] text-gray-500' />
                            )}
                          </div>
                        </td>
                        <td className='text-start p-2'>{coin.index}</td>
                        <td>
                          <div className='flex justify-between items-center p-2'>
                            <div className='flex gap-2 items-center'>
                              <img src={coin.image_url} alt={coin.name} className='w-5 h-5' />
                              <p className='max-h-[60px] line-clamp-3'>{coin.name} {coin.symbol.replace('USDT', '')}</p>
                            </div>
                            <div>
                              <p className='px-2 text-[10px] border-2 border-blue-500 rounded-full'>Buy</p>
                            </div>
                          </div>
                        </td>
                        <td className='text-end p-2'>{coin.price}</td>
                        <td className={`text-end p-2 ${coin.price_change_1h.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                          {coin.price_change_1h}
                        </td>
                        <td className={`text-end p-2 ${coin.price_change_24h.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                          {coin.price_change_24h}
                        </td>
                        <td className={`text-end p-2 ${coin.price_change_7d.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                          {coin.price_change_7d}
                        </td>
                        <td className='text-end p-2'>{coin.market_cap}</td>
                        <td className='text-end p-2'>
                          <div>
                            <p>{coin.volume_24h}</p>
                            <p className='text-[10px]'>
                              {coin.price !== "N/A" && coin.volume_24h !== "N/A"
                                ? (parseFloat(coin.volume_24h.replace('$', '').replace(/,/g, '')) / parseFloat(coin.price.replace('$', '').replace(/,/g, ''))).toFixed(2) + ` ${coin.symbol.replace('USDT', '')}`
                                : 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className='text-end p-2'>{coin.circulating_supply} {coin.symbol.replace('USDT', '')}</td>
                        <td className='p-2 flex justify-end items-end'>
                          <div style={{ width: '70%', height: '65px' }}>
                            {chartData[coin.index] && chartData[coin.index].length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData[coin.index]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                  <XAxis hide dataKey="date" />
                                  <YAxis hide dataKey="price" />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px', color: '#fff' }}
                                    labelStyle={{ color: '#fff' }}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke={coin.price_change_7d.includes('-') ? '#ff0000' : '#00ff00'}
                                    fill={coin.price_change_7d.includes('-') ? '#ff0000' : '#00ff00'}
                                    fillOpacity={0.3}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <p>Loading chart...</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className='text-center p-4'>Loading coins...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        <div className='flex justify-end my-2 py-1 text-blue-500 '>
          <Link to="/market" className='w-fit hover:text-blue-500 cursor-pointer hover:underline'>View other Crypto &raquo;</Link>
        </div>
      </div>
      <div>
        <div className=' text-white mt-20 gap-x-16'>
          <div className='flex items-center mb-10 justify-between'>
            <h1 className='text-4xl text-center'>Featured News</h1>
            <Link to="/news" className='text-blue-500 text-medium hover:underline '>More News &raquo;</Link>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-5'>
            {newsData.length > 0 ? (
              newsData.slice(0, 8).map((news) => (
                <div key={news.news_id} className='font-medium'>
                  <div className=''>
                      <div className="bg-[#ffffff14] hover:bg-[#414141] hover:bg-opacity-70 border border-[#ffffff1f] shadow-md rounded-lg overflow-hidden h-full">
                        <Link to={news.news_link} target="_blank" rel="noopener noreferrer" className="block h-full">
                          <div className="p-5 pt-6 flex flex-col min-h-[178px] h-full justify-between ">
                            <div className=''>
                              <p className="text-[#3760c7] text-xs font-bold">{news.source_name} - {news.updated_at}</p>
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
    </div>
  );
};

export default HomePage;
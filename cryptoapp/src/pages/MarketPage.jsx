import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { TiStarOutline } from "react-icons/ti";
import { FaStar } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";
import axios from 'axios';
import { BsFire } from "react-icons/bs";
import { IoMdTime } from "react-icons/io";
import { IoEyeOutline } from "react-icons/io5";
import { PiDiamondsFour } from "react-icons/pi";
import { LuSprout } from "react-icons/lu";
import { TfiCup } from "react-icons/tfi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import MarketChart from '../components/MarketChart';
import CryptoNewsCard from '../components/CryptoNewsCard';
import LineChart from '../components/LineChart';
import { fetchCoins } from '../api/coins';
import { getFavorites, addFavorite, removeFavorite } from '../api/favorites';
import { checkAuth } from '../api/auth';
import { toast } from 'react-toastify';

const coinList = [
  {
    id: 1,
    name: "Bitcoin",
    symbol: "BTC",
    price: "$93,500",
    change: "+2.14%",
    img: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
    isPositive: true,
  },
  {
    id: 2,
    name: "Ethereum",
    symbol: "ETH",
    price: "$3,100",
    change: "-1.05%",
    img: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    isPositive: false,
  },
  {
    id: 3,
    name: "Solana",
    symbol: "SOL",
    price: "$145.67",
    change: "+5.21%",
    img: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
    isPositive: true,
  },
  {
    id: 4,
    name: "Ripple",
    symbol: "XRP",
    price: "$0.527",
    change: "-0.89%",
    img: "https://s2.coinmarketcap.com/static/img/coins/64x64/52.png",
    isPositive: false,
  },
  {
    id: 5,
    name: "Dogecoin",
    symbol: "DOGE",
    price: "$0.142",
    change: "+3.67%",
    img: "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
    isPositive: true,
  },
];

const coinListTrending = [
  {
    id: 1,
    name: 'BTC',
    price: '$93,500',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png'
  },
  {
    id: 2,
    name: 'ETH',
    price: '$3,100',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
  },
  {
    id: 3,
    name: 'BNB',
    price: '$350.21',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2710.png'
  },
  {
    id: 4,
    name: 'ADA',
    price: '$0.83',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png'
  },
  {
    id: 5,
    name: 'DOT',
    price: '$24.75',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png'
  },
];




const MarketPage = () => {
  const [coins, setCoins] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [chartData, setChartData] = useState({});
  const [togglingFavorites, setTogglingFavorites] = useState({});
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate
  const [showInput, setShowInput] = useState(false);
  // Load user from localStorage
  const loadUserFromStorage = () => {
    const userData = localStorage.getItem("userLogin");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
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
  const fetchFavorites = useCallback(async () => {
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
  }, [user]);

  // Fetch user and set up event listeners on mount
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

              const response = await axios.get(url, { params });
              const data = response.data.map((item) => ({
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

        if (user) {
          await fetchFavorites();
        } else {
          setFavorites({});
        }
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
  }, [user, fetchFavorites]);

  // Toggle favorite status for a specific coin
  const toggleFavorite = async (coinId, e) => {
    e.stopPropagation(); // Prevent the row's onClick from firing
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
  };;

  return (
    <div className='px-14 mt-[130px] mb-36 container mx-auto'>
      <div className='grid grid-cols-4 text-white gap-x-2'>
        <div className='rounded-lg bg-gray-800 p-4'>
          <div className='flex justify-between items-center font-medium'>
            <p>Trending Coins</p>
            <div className='flex justify-between items-center rounded-lg bg-gray-600 px-1 py-[2px]'>
              <p className='px-2 py-1 bg-gray-800 rounded-lg'><BsFire className='text-white text-xs'/></p>
              <p className='px-2 py-1'><IoMdTime className='text-white text-sm'/></p>
              <p className='px-2 py-1'><IoEyeOutline className='text-white text-sm'/></p>
            </div>
          </div>
          <div className='mt-3'>
            {coinListTrending.map((coin, index) => (
              <div key={coin.id} className='flex justify-between items-center text-sm font-medium mt-1'>
                <div className='w-2/3 flex justify-between py-2'>
                  <div className='flex items-center gap-2'>
                    <p>{index + 1}</p>
                    <img src={coin.image} alt={coin.name} className='w-5 h-5'/>
                    <p>{coin.name}</p>
                  </div>
                  <div>
                    <p>{coin.price}</p>
                  </div>
                </div>
                <div className='w-1/3 flex flex-col gap-1 px-2 relative'>
                  <div className='flex justify-end'>
                    <div className='w-2/3'>
                      <LineChart />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='rounded-lg bg-gray-800 p-4'>
          <div className='flex justify-between items-center font-medium'>
            <p>Trending on DexScan</p>
            <div className='flex justify-between rounded-lg items-center bg-gray-600 px-1 py-[2px]'>
              <p className='px-2 py-1 bg-gray-800 rounded-lg'><PiDiamondsFour className='text-white text-xs'/></p>
              <p className='px-2 py-1 '><LuSprout className='text-white text-sm'/></p>
              <p className='px-2 py-1 '><TfiCup className='text-white text-xs'/></p>
            </div>
          </div>
          <div className='mt-3'>
            {coinList.map((coin, index) => (
              <div key={index} className='flex justify-between items-center text-sm font-medium mt-1'>
                <div className='w-3/4 flex justify-between py-2'>
                  <div className='flex items-center gap-2'>
                    <p>{coin.id}</p>
                    <img className='w-5 h-5 rounded-full' src={coin.img} alt={`${coin.name} logo`} />
                    <p>{coin.name}</p>
                    <p className='text-gray-600 font-medium text-xs'>/{coin.symbol}</p>
                  </div>
                  <div>
                    <p>{coin.price}</p>
                  </div>
                </div>
                <div className='w-1/4 py-2'>
                  <p className={`flex items-center justify-end gap-1 text-xs font-medium ${coin.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {coin.isPositive ? 
                      (<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="12px" width="12px" viewBox="0 0 24 24" className="h-3 w-3">
                        <path d="M18.0566 16H5.94336C5.10459 16 4.68455 14.9782 5.27763 14.3806L11.3343 8.27783C11.7019 7.90739 12.2981 7.90739 12.6657 8.27783L18.7223 14.3806C19.3155 14.9782 18.8954 16 18.0566 16Z"></path>
                      </svg>) :
                      (<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="24px" width="24px" viewBox="0 0 24 24" className="h-3 w-3 text-red-600">
                        <path d="M18.0566 8H5.94336C5.10459 8 4.68455 9.02183 5.27763 9.61943L11.3343 15.7222C11.7019 16.0926 12.2981 16.0926 12.6657 15.7222L18.7223 9.61943C19.3155 9.02183 18.8954 8 18.0566 8Z"></path>
                      </svg>)
                    }
                    {coin.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="grid grid-rows-2 gap-2 max-h-[288px] h-[288px]">
            <div className="font-medium rounded-lg bg-gray-800 px-4 py-3 flex justify-center items-center text-2xl  h-full">
              <p className="font-semibold" > 51 Coins</p>
            </div>
            <div className="font-medium rounded-lg bg-gray-800 px-4 py-3 flex justify-center items-center text-2xl  h-full">
            <p className="font-semibold" > 193 News</p>
            </div>
          </div>
        </div>
        <div>
          <div className="grid grid-rows-2 gap-2 max-h-[288px] h-[288px]">
          <CryptoNewsCard
            avatar="https://s2.coinmarketcap.com/static/img/coins/64x64/22861.png"
            user="Celestia"
            time="8 hours"
            content={
              <a 
                href="https://coinmarketcap.com/community/articles/67a3b72ecd6835482020786c/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:underline"
              >
                Celestia (TIA) and Optimism (OP) Testing Key Support Amid Significant Correction: Is a Bounce Back Ahead?
              </a>
            }
            comments={9}
            retweets={2}
            likes={305}
            views=""
          />
            <CryptoNewsCard
              avatar="https://s2.coinmarketcap.com/static/img/coins/64x64/1.png"
              user="Bitcoin"
              time="8 hours"
              content={
                <a 
                  href="https://coinmarketcap.com/community/articles/your-article-id" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:underline"
                >
                  Bitcoin Users Targeted in Sophisticated Address Poisoning Scam, Warns Jameson Lopp
                </a>
              }
              comments={9}
              retweets={2}
              likes={305}
              views=""
            />
          </div>
        </div>
      </div>
      
      <div className='mt-[100px]'>
        <h1 className='text-white text-4xl text-center font-medium my-6 mb-10'>Crypto Market Trade And Metrics</h1>
        <div className="relative w-full h-10 mb-4">
        <div className="relative w-full h-10 mb-4 flex justify-end items-center pr-6">
      <div 
        className="text-gray-400 cursor-pointer"
        onClick={() => setShowInput(!showInput)} 
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 7.65a7.5 7.5 0 010 10.6z"
          />
        </svg>
      </div>
      {showInput && (
        <input
          type="text"
          placeholder="Search"
          className="text-black font-bold text-sm p-1 border rounded-lg w-32 ml-2 transition-all duration-300"
        />
      )}
    </div>
        </div>
        <div className='my-3 flex items-center justify-center'>
          <table className='text-white font-medium'>
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
                <th className='text-start p-2'>#</th>
                <th className='text-start p-2'>Name</th>
                <th className='text-end p-2'>Price</th>
                <th className='text-end p-2'>1h%</th>
                <th className='text-end p-2'>24h%</th>
                <th className='text-end p-2'>7d%</th>
                <th className='text-end p-2'>Market Cap</th>
                <th className='text-end p-2'>Volume (<span className='text-[10px]'>24h</span>)</th>
                <th className='text-end p-2'>Circulating Supply</th>
                <th className='text-end p-2'>Last 7 Days</th>
              </tr>
            </thead>
            <tbody>
              {coins.length > 0 ? (
                coins.map((coin) => (
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
    </div>
  );
};

export default MarketPage;
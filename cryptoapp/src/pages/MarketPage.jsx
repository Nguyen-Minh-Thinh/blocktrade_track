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
          <div className='grid grid-cols-2 gap-2 max-h-[288px]'>
            <div className='font-medium rounded-lg bg-gray-800 px-4 py-3'>
              <p className='text-[14px] mb-2'>Market Cap</p>
              <p className='text-base'>$2.7T</p>
              <p className='flex items-center gap-1 text-[10px] text-red-600 font-medium'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="24px" width="24px" viewBox="0 0 24 24" className="h-3 w-3 text-red-600">
                  <path d="M18.0566 8H5.94336C5.10459 8 4.68455 9.02183 5.27763 9.61943L11.3343 15.7222C11.7019 16.0926 12.2981 16.0926 12.6657 15.7222L18.7223 9.61943C19.3155 9.02183 18.8954 8 18.0566 8Z"></path>
                </svg>
                0,12%
              </p>
              <div className=''>
                <MarketChart/>
              </div>
            </div>
            <div className='font-medium rounded-lg bg-gray-800 px-4 py-3'>
              <p className='text-[14px] mb-2'>CMC100</p>
              <p className='text-base'>$162.53</p>
              <p className='flex items-center gap-1 text-[10px] text-green-600 font-medium'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="24px" width="24px" viewBox="0 0 24 24" className="h-3 w-3 text-green-600">
                  <path d="M18.0566 16H5.94336C5.10459 16 4.68455 14.9782 5.27763 14.3806L11.3343 8.27783C11.7019 7.90739 12.2981 7.90739 12.6657 8.27783L18.7223 14.3806C19.3155 14.9782 18.8954 16 18.0566 16Z"></path>
                </svg>
                0,20%
              </p>
              <div>
                <MarketChart/>
              </div>
            </div>
            <div className='font-medium rounded-lg bg-gray-800 px-4 py-3'>
              <p className='text-[14px]'>Fear & Greed</p>
              <div className='relative flex justify-center items-center py-1 px-2'>
                <svg width="130" height="79" viewBox="0 0 130 79">
                  <path d="M 12 71 A 53 53 0 0 1 18.91676873622339 44.82108107103576" stroke="#EA3943" stroke-width="6" stroke-linecap="round" fill="none"></path>
                  <path d="M 23.008648902174897 38.66230631323281 A 53 53 0 0 1 44.46167391803855 22.141252965809464" stroke="#EA8C00" stroke-width="6" stroke-linecap="round" fill="none"></path>
                  <path d="M 51.46137482940311 19.75836040396365 A 53 53 0 0 1 78.5386251705969 19.75836040396365" stroke="#F3D42F" stroke-width="6" stroke-linecap="round" fill="none"></path>
                  <path d="M 85.53832608196146 22.14125296580947 A 53 53 0 0 1 106.99135109782512 38.662306313232826" stroke="#93D900" stroke-width="6" stroke-linecap="round" fill="none"></path>
                  <path d="M 111.08323126377661 44.82108107103576 A 53 53 0 0 1 118 71" stroke="#16C784" stroke-width="6" stroke-linecap="round" fill="none"></path>
                  <path d="M 12 71 A 53 53 0 0 1 18.91676873622339 44.82108107103576" stroke="none" stroke-width="6" stroke-linecap="round" fill="none"></path>
                  <path d="M 23.008648902174897 38.66230631323281 A 53 53 0 0 1 35.20958097383708 27.164729563448226" stroke="none" stroke-width="6" stroke-linecap="round" fill="none"></path>
                  <circle cx="35.20958097383708" cy="27.164729563448226" r="6" fill="none" stroke="var(--c-color-gray-100)" stroke-width="2"></circle>
                  <circle cx="35.20958097383708" cy="27.164729563448226" r="5" fill="white"></circle>
                </svg>
                <div className='absolute text-center w-full bottom-2'>
                  <p className='text-xl font-bold'>31</p>
                  <p className='text-gray-600 text-xs'>Fear</p>
                </div>
              </div>
            </div>
            <div className='font-medium rounded-lg bg-gray-800 px-4 py-3'>
              <p className='text-[14px] mb-2'>Altcoin Season</p>
              <div className='mb-2'>
                <span className='text-xl font-medium'>16</span>
                <span className='text-gray-600 text-[18px]'>/100</span>
              </div>
              <div>
                <div className='flex justify-between items-center text-[10px] text-gray-500 font-medium mb-2'>
                  <span>Bitcoin</span>
                  <span>Altcoin</span>
                </div>
                <div className="w-full h-[5px] flex justify-center items-center relative flex-col">
                  <div className="w-full"></div>
                  <div className="relative w-full">
                    <div className="h-[5px] rounded-[3px] flex overflow-hidden">
                      <div className="bg-[#f68819] w-[43px] h-full rounded-l-[3px]"></div>
                      <div className="bg-[#fcdbb9] w-[40px] h-full"></div>
                      <div className="bg-[#c1ccfd] w-[40px] h-full"></div>
                      <div className="bg-[#3156fa] w-[43px] h-full rounded-r-[3px]"></div>
                    </div>
                    <div className="absolute left-[26.56px] top-1/2 w-[18px] h-[18px] bg-white border-[4px] border-gray-950 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-[0px_8px_32px_0px_rgba(128,138,157,0.24),0px_1px_2px_0px_rgba(128,138,157,0.12)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="max-h-[288px] flex flex-col items-center gap-y-2">
            <CryptoNewsCard
              avatar="https://s3.coinmarketcap.com/static-gravity/image/291a8a31f1d44a649d0a9572251e345d.jpg"
              user="Crypto Rand"
              time="8 hours"
              content="Exchanges are running out of #Bitcoin supply. Imminent ₿ $BTC supply shock, read between the lines!..."
              comments={9}
              retweets={2}
              likes={305}
              views=""
            />
            <CryptoNewsCard
              avatar="https://s3.coinmarketcap.com/static-gravity/image/834969bc316043e196e18f24eee50f0c.jpg"
              user="Cointelegraph"
              time="1 hour"
              content="Bitcoin death cross still present despite rally to $86K — Should BTC traders be afraid?"
              image="https://i.imgur.com/L6sMREs.png"
              comments={0}
              retweets={0}
              likes={0}
              views=""
            />
          </div>
        </div>
      </div>
      
      <div className='mt-[100px]'>
        <h1 className='text-white text-4xl text-center font-medium my-6 mb-10'>Crypto Market Trade And Metrics</h1>
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
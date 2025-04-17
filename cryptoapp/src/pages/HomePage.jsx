import React, { useEffect, useState } from 'react';
import { TiStarOutline } from "react-icons/ti";
import { FaStar } from "react-icons/fa";
import ButtonComponent from '../components/ButtonComponent';
import SignUp from '../models/SignUp';
import { List } from 'flowbite-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';
import { fetchCoins } from '../api/coins';

const HomePage = () => {
  const [started, setStarted] = useState(false);
  const [listTabs2, setListTabs2] = useState("popular");
  const [coins, setCoins] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [chartData, setChartData] = useState({});

  // Fetch coin data from the backend
  useEffect(() => {
    const loadCoins = async () => {
      try {
        const response = await fetchCoins();
        const fetchedCoins = response.coins || [];
        setCoins(fetchedCoins);

        // Fetch historical data for all coins
        const fetchChartData = async () => {
          const endTime = Date.now();
          const startTime = endTime - 7 * 24 * 60 * 60 * 1000; // 7 days ago

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

        fetchChartData();
      } catch (error) {
        console.error('Error fetching coins from backend:', error);
      }
    };

    loadCoins();
  }, []);

  // Toggle favorite status for a specific coin
  const toggleFavorite = (coinIndex) => {
    setFavorites((prev) => ({
      ...prev,
      [coinIndex]: !prev[coinIndex],
    }));
  };

  return (
    <div className='mx-14 mb-36'>
      <SignUp openSU={started} setOpenSU={setStarted}></SignUp>
      <div className='flex flex-col items-center'>
        <div className='relative max-w-[1700px] w-full'>
          <div className='absolute w-full -z-10 left-'>
            <img src="/bg.webp" alt="logo" className='w-full opacity-15' />
          </div>
        </div>
        <div className='text-7xl text-white font-bold text-center pt-40'>
          <h1>Secure & Intuitive</h1>
          <h1>Crypto Trading</h1>
        </div>
        <div className='text-slate-500 font-medium text-center text-base pt-6'>
          <p>Empower your future with cutting-edge crypto smart contracts.</p>
          <p>Start developing your smart contract today with Blocktrade Track.</p>
        </div>
        <div className='flex justify-center my-6'>
          <div onClick={() => { setStarted(true) }} className='w-32'>
            <ButtonComponent contentButton={"Get Started →"}></ButtonComponent>
          </div>
        </div>
      </div>
      <div className='mt-[250px]'>
        <h1 className='text-white text-4xl text-center font-medium my-6'>Crypto Market Trade And Metrics</h1>
        <div className='flex justify-center gap-3'>
          <p onClick={() => { setListTabs2("popular") }} className={`${listTabs2 === "popular" && "border-b-2 border-blue-700 text-white"} text-base text-gray-500 font-medium pb-1 px-1 cursor-pointer`}>Popular</p>
          <p onClick={() => { setListTabs2("topGainers") }} className={`${listTabs2 === "topGainers" && "border-b-2 border-blue-700 text-white"} text-base text-gray-500 font-medium pb-1 px-1 cursor-pointer`}>Top Gainers</p>
          <p onClick={() => { setListTabs2("topVolume") }} className={`${listTabs2 === "topVolume" && "border-b-2 border-blue-700 text-white"} text-base text-gray-500 font-medium pb-1 px-1 cursor-pointer`}>Top Volume</p>
          <p onClick={() => { setListTabs2("newListings") }} className={`${listTabs2 === "newListings" && "border-b-2 border-blue-700 text-white"} text-base text-gray-500 font-medium pb-1 px-1 cursor-pointer`}>New Listings</p>
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
                  <tr key={coin.index} className='text-sm border-y border-gray-700 hover:bg-slate-900 cursor-pointer'>
                    <td>
                      <div onClick={() => toggleFavorite(coin.index)} className='text-start p-2'>
                        {favorites[coin.index] ? (
                          <FaStar className='text-[18px] text-yellow-300' />
                        ) : (
                          <TiStarOutline className='text-[18px] text-gray-500' />
                        )}
                      </div>
                    </td>
                    <td className='text-start p-2'>{coin.index}</td>
                    <td>
                      <div className='flex justify-between p-2'>
                        <div className='flex gap-2 items-center'>
                          <img src={coin.image_url} alt={coin.name} className='w-5 h-5' />
                          <p>{coin.name} {coin.symbol.replace('USDT', '')}</p>
                        </div>
                        <p className='px-2 text-[10px] border-2 border-blue-500 rounded-full'>Buy</p>
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
                            <LineChart data={chartData[coin.index]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                              <XAxis hide dataKey="date" />
                              <YAxis hide dataKey="price" />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px', color: '#fff' }}
                                labelStyle={{ color: '#fff' }}
                              />
                              <Line
                                type="monotone"
                                dataKey="price"
                                stroke={coin.price_change_7d.includes('-') ? '#ff0000' : '#00ff00'}
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
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
        <div className='flex justify-end my-2 py-1 text-blue-900 font-medium'>
          <p className='w-fit hover:text-blue-500 cursor-pointer'>View other Crypto</p>
        </div>
      </div>
      <div>
        <h1 className='text-4xl text-white font-medium text-center mt-40 mb-6'>News And Learn</h1>
        <div className='flex justify-center text-white gap-x-16'>
          <div className='w-[500px]'>
            <div className='flex justify-between my-6 font-medium'>
              <h1 className='text-3xl'>News</h1>
              <Link to={"newpage"} className='text-blue-600 cursor-pointer'>View All</Link>
            </div>
            <div className='font-medium'>
              <div className='p-5 my-3 bg-gray-900 rounded-xl cursor-pointer'>
                <Link to={"newdetail"}>
                  <p className='truncate'>Crypto.com Surpasses 100 Million Global Users</p>
                  <p className='truncate text-gray-500'>New Major Milestone Reached Following Latest Marketing Campaign</p>
                </Link>
              </div>
              <div className='p-5 my-3 bg-gray-900 rounded-xl cursor-pointer'>
                <p className='truncate'>Crypto.com’s Dubai Entity Receives Full Operational Approval</p>
                <p className='truncate text-gray-500'>Crypto.com Exchange for Institutional Investors Launches as First Operational Milestone</p>
              </div>
              <div className='p-5 my-3 bg-gray-900 rounded-xl cursor-pointer'>
                <p className='truncate'>Crypto.com’s Dubai Entity Receives Full Operational Approval</p>
                <p className='truncate text-gray-500'>Crypto.com Exchange for Institutional Investors Launches as First Operational Milestone</p>
              </div>
              <div className='p-5 my-3 bg-gray-900 rounded-xl cursor-pointer'>
                <p className='truncate'>Crypto.com’s Dubai Entity Receives Full Operational Approval</p>
                <p className='truncate text-gray-500'>Crypto.com Exchange for Institutional Investors Launches as First Operational Milestone</p>
              </div>
            </div>
          </div>
          <div className='w-[500px]'>
            <div className='flex justify-between my-6 font-medium'>
              <h1 className='text-3xl'>Learn</h1>
              <p className='text-blue-600 cursor-pointer'>View All</p>
            </div>
            <div className='font-medium'>
              <div className='p-5 my-3 bg-gray-900 rounded-xl cursor-pointer'>
                <p>Liquidity in Crypto Markets: What It Is and Why It Matters</p>
                <List className='text-blue-600 font-medium'>
                  <List.Item>Beginner</List.Item>
                </List>
              </div>
              <div className='p-5 my-3 bg-gray-900 rounded-xl cursor-pointer'>
                <p>What Is Render Network and How to Buy the RNDR Crypto Token</p>
                <List className='text-blue-600 font-medium'>
                  <List.Item>Beginner</List.Item>
                </List>
              </div>
              <div className='p-5 my-3 bg-gray-900 rounded-xl cursor-pointer'>
                <p>What Is Render Network and How to Buy the RNDR Crypto Token</p>
                <List className='text-blue-600 font-medium'>
                  <List.Item>Beginner</List.Item>
                </List>
              </div>
              <div className='p-5 my-3 bg-gray-900 rounded-xl cursor-pointer'>
                <p>What Is Render Network and How to Buy the RNDR Crypto Token</p>
                <List className='text-blue-600 font-medium'>
                  <List.Item>Beginner</List.Item>
                </List>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
import React, { useEffect, useState } from 'react'
import { TiStarOutline } from "react-icons/ti";
import { FaStar } from "react-icons/fa";
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
} from 'recharts';
import MarketChart from '../components/MarketChart';
import CryptoNewsCard from '../components/CryptoNewsCard';
import LineChart from '../components/LineChart';
const coinList = [
  {
    id: 1,
    name: "Fartcoin",
    symbol: "SQL",
    price: "$0.8266",
    change: "0.20%",
    img: "https://s2.coinmarketcap.com/static/img/coins/64x64/33597.png",
    isPositive: true,
    
  },
  { id: 2,
    name: 'TRUMP', 
    symbol: 'USDC', 
    price: '$7.93', 
    change: '1.28%',
    img: "https://s2.coinmarketcap.com/static/img/coins/64x64/33597.png",
    isPositive: false, },
  { id: 3, name: 'Fartcoin', symbol: 'USDC', price: '$0.8469', change: '6.57%', isPositive: false, img: "https://s2.coinmarketcap.com/static/img/coins/64x64/33597.png" },
  { id: 4, name: 'Fur', symbol: 'SOL', price: '$0.003747', change: '7017%', img: "https://s2.coinmarketcap.com/static/img/coins/64x64/33597.png", isPositive: true },
  { id: 5, name: 'RAY', symbol: 'SOL', price: '$2.11', change: '2.31%',  img: "https://s2.coinmarketcap.com/static/img/coins/64x64/33597.png", isPositive: true },
];
const coinListTrending = [
  {
    id: 1,
    name: 'BTC',
    price: '$0.1430',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png'
  },
  {
    id: 2,
    name: 'ETH',
    price: '$0.0930',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
  },
  {
    id: 3,
    name: 'DOGE',
    price: '$0.0045',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png'
  },
  {
    id: 4,
    name: 'DOGE',
    price: '$0.0045',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png'
  },
  {
    id: 5,
    name: 'DOGE',
    price: '$0.0045',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png'
  },
];


const MarketPage = () => {
  const [listTabs2, setListTabs2] = useState("popular")
  const [data, setData] = useState([]);
  const [favorites, setFavorites] = useState(false)

  useEffect(() => {
    // Hàm lấy dữ liệu từ API Binance
    const fetchBitcoinData = async () => {
      try {
        const endTime = Date.now();
        const startTime = endTime - 7 * 24 * 60 * 60 * 1000; // 7 ngày trước

        const url = 'https://api.binance.com/api/v1/klines';
        const params = {
          symbol: 'BTCUSDT', // Cặp giao dịch Bitcoin với USD
          interval: '1d', // Lấy dữ liệu theo ngày
          startTime: startTime,
          endTime: endTime,
          limit: 7, // Lấy 7 ngày
        };

        const response = await axios.get(url, { params });

        // Chuyển đổi dữ liệu thành định dạng phù hợp cho biểu đồ
        const chartData = response.data.map((item) => ({
          date: new Date(item[0]).toISOString().split('T')[0], // Lấy ngày
          uv: parseFloat(item[4]), // Giá đóng cửa (Close)
        }));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching data from Binance API:', error);
      }
    };

    fetchBitcoinData();
  }, []);
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
                  {/* Biểu đồ phần trăm có thể thêm vào đây nếu có */}
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
                        <path d="M18.0566 16H5.94336C5.10459 16 4.68455 14.9782 5.27763 14.3806L11.3343 8.27783C11.7019 7.90739 12.2981 7.90739 12.6657 8.27783L18.7223 14.3806C19.3155 14.9782 18.8954 16 18.0566 16Z"></path>:
                      </svg>):
                      (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="24px" width="24px" viewBox="0 0 24 24" class="sc-4c05d6ef-0 dMwnWW" className="h-3 w-3 text-red-600">
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="24px" width="24px" viewBox="0 0 24 24" class="sc-4c05d6ef-0 dMwnWW" className="h-3 w-3 text-red-600"><path d="M18.0566 8H5.94336C5.10459 8 4.68455 9.02183 5.27763 9.61943L11.3343 15.7222C11.7019 16.0926 12.2981 16.0926 12.6657 15.7222L18.7223 9.61943C19.3155 9.02183 18.8954 8 18.0566 8Z"></path></svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="24px" width="24px" viewBox="0 0 24 24" class="sc-4c05d6ef-0 dMwnWW" className="h-3 w-3 text-green-600"><path d="M18.0566 16H5.94336C5.10459 16 4.68455 14.9782 5.27763 14.3806L11.3343 8.27783C11.7019 7.90739 12.2981 7.90739 12.6657 8.27783L18.7223 14.3806C19.3155 14.9782 18.8954 16 18.0566 16Z"></path></svg>
                0,20%
              </p>
              <div >

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
              avatar="https://i.imgur.com/1XGQ1Zf.png"
              user="Crypto Rand"
              time="8 hours"
              content="Exchanges are running out of #Bitcoin supply. Imminent ₿ $BTC supply shock, read between the lines!..."
              comments={9}
              retweets={2}
              likes={305}
              views=""
            />
            <CryptoNewsCard
              avatar="https://i.imgur.com/dKMUjZk.png"
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
      
      
      <div className=' mt-[100px]'>
        <h1 className='text-white text-4xl text-center font-medium my-6'>Crypto Market Trade And Metrics</h1>
        <div className='flex justify-center gap-3 '>
          <p onClick={() => {setListTabs2("popular")}} className={`${listTabs2 === "popular" && "border-b-2 border-blue-700 text-white"} text-[18px] text-gray-500 font-medium pb-1 px-1 cursor-pointer`}>Popular</p>
          <p onClick={() => {setListTabs2("topGainers")}} className={`${listTabs2 === "topGainers" && "border-b-2 border-blue-700 text-white"} text-[18px] text-gray-500 font-medium pb-1 px-1 cursor-pointer`}>Top Gainers</p>
          <p onClick={() => {setListTabs2("topVolume")}} className={`${listTabs2 === "topVolume" && "border-b-2 border-blue-700 text-white"} text-[18px] text-gray-500 font-medium pb-1 px-1 cursor-pointer`}>Top Volume</p>
          <p onClick={() => {setListTabs2("newListings")}} className={`${listTabs2 === "newListings" && "border-b-2 border-blue-700 text-white"} text-[18px] text-gray-500 font-medium pb-1 px-1 cursor-pointer`}>New Listings</p>
        </div>
        <div className='my-3 flex items-center justify-center'>
          <table className='text-white font-medium ' >
            <colgroup>
              <col/>
              <col className='w-12' />
              <col className='w-52' />
              <col />
              <col className='w-20' />
              <col className='w-20' />
              <col className='w-20' />
              <col className='w-48' />
              <col className='w-48' />
              <col className='w-48' />
              <col className='w-52'/>
            </colgroup>
            <thead>
              <tr className='border-b border-gray-700'>
                <th></th>
                <th className='text-start p-2'>#</th>
                <th className='text-start p-2'>Name</th>
                <th className='text-end p-2'>Price</th>
                <th className='text-end p-2'>1h%</th>
                <th className='text-end p-2'>24h%</th>
                <th className='text-end p-2'>7d%</th>
                <th className='text-end p-2'>Market Cap</th>
                <th className='text-end p-2'>Volume(24h)</th>
                <th className='text-end p-2'>Circulating Supply</th>
                <th className='text-end p-2'>Last 7 Days</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-y border-gray-700 hover:bg-slate-900 cursor-pointer'>
                <td >
                  <div onClick={()=>{setFavorites(!favorites)}} className='text-start p-2'>
                    {favorites ? <FaStar className='text-[18px] text-yellow-300'/>
                             : <TiStarOutline className='text-[18px] text-gray-500'/> }
                  </div>
                </td>
                <td className='text-start p-2'>1</td>
                <td>
                  <div className='flex justify-between p-2'>
                    <p>BitCoin BTC</p>
                    <p className='px-2 text-xs border-2 border-blue-500 rounded-full'>Buy</p>
                  </div>
                </td>
                <td className='text-end p-2'>$84,198.38</td>
                <td className='text-end p-2 text-red-600'>0.13%</td>
                <td className='text-end p-2 text-green-600'>0.12%</td>
                <td className='text-end p-2 text-green-600'>0.17%</td>
                <td className='text-end p-2'>$1,671,064,518,944</td>
                <td className='text-end p-2'>
                  <div>
                    <p>$9,431,294,831</p>
                    <p className='text-xs'>112.12K BTC</p>
                  </div>
                </td>
                <td className='text-end p-2'>19.84M BTC</td>
                <td className='p-2 flex justify-end items-end '>
                  {/* Biểu đồ mini cho Last 7 Days */}
                  <div style={{ width: '70%', height: '65px'}} >
                    {data.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                          
                          <XAxis hide  dataKey="date" />
                          <YAxis hide dataKey="uv"/>
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="uv"
                            stroke="#8884d8"
                            fill="#8884d8"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p>Loading data...</p>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  )
}

export default MarketPage
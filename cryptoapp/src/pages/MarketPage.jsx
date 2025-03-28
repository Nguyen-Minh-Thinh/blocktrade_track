import React, { useEffect, useState } from 'react'
import { TiStarOutline } from "react-icons/ti";
import { FaStar } from "react-icons/fa";
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
const HomePage = () => {
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
    <div className='mx-14 mb-36'>
      
      
      
      <div className=' mt-[250px]'>
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

export default HomePage
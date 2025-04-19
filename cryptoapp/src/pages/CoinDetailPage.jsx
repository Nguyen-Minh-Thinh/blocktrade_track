import React, { useState } from 'react'
import { TiStarOutline } from "react-icons/ti";
import { IoShareSocialSharp } from "react-icons/io5";
import {   TabItem, Tabs, Tooltip } from 'flowbite-react';
import { FaGlobe, FaFileAlt, FaReddit, FaGithub, FaStar } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { ToggleCheck } from '../components/ToggleCheck';
import { DropdownCustom } from '../components/DropdownCustom';
import AreaChartFillByValue from '../components/AreaChartFillByValue';
import ButtonComponent from '../components/ButtonComponent';
import CryptoChart from '../components/CryptoChart';
import CryptoNewsCard from '../components/CryptoNewsCard';

const CoinDetailPage = () => {
  const [check,setCheck] =useState(true)
  const [price,setPrice] =useState(0)
  const [favorite, setFavorite] = useState(false)
  const [titleSubmit, setTittleSubmit] = useState("Buy")
  const customStyle = {
    tablist:{
      variant:{
        pills: "flex-wrap space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400",
      },
      tabitem:{
        base:"flex flex-row-reverse gap-1 bg-gray-900 items-center justify-center rounded-t-lg py-2 px-4 text-sm font-medium first:ml-0 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500",
        variant:{
          pills:{
            active:{
              on:"rounded-lg bg-gray-800 text-white",
              off:"rounded-lg hover:bg-gray-800 hover:text-white dark:hover:bg-gray-800 dark:hover:text-white",
            },
          },
        }
      },
    }
  }
  const toggleColor = (a)=> {
    setCheck(a)
  }
  
  return (  
    <div className='container mx-auto'>
      <div className='grid grid-cols-4 flex-row-reverse mt-20'>
        <div className='p-4 py-8 border-y-2 border-gray-500'>
          <div className='text-white flex justify-between items-center py-2'>
            <div className='flex items-center gap-2'>
              <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" className='w-6 h-6' alt="" />
              <p className='text-xl font-medium'>Bitcoin <span className='text-gray-700 text-base'>BTC</span></p>
            </div>
            <div className='flex gap-2 items-center'>
              <div onClick={() => {setFavorite(!favorite)}} className='flex gap-1 items-center p-2 cursor-pointer bg-gray-800 rounded-lg'>
                {
                  favorite ? <FaStar className=' text-base text-yellow-300'/> :
                  <TiStarOutline className='text-base text-gray-500'/>
                }
                <p className='text-xs text-gray-500 font-medium'>5M</p>
              </div>
              <div className='p-2 rounded-lg bg-gray-800'>
                <IoShareSocialSharp className='text-base text-gray-500'/>
              </div>
            </div>
          </div>
          <div className="flex gap-2 py-2 text-3xl font-bold items-center text-white">
              <p>$82,719.83</p>
              <p className='text-green-400 text-sm flex items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="14px" width="14px" viewBox="0 0 24 24" class="sc-4c05d6ef-0 dMwnWW"><path d="M18.0566 16H5.94336C5.10459 16 4.68455 14.9782 5.27763 14.3806L11.3343 8.27783C11.7019 7.90739 12.2981 7.90739 12.6657 8.27783L18.7223 14.3806C19.3155 14.9782 18.8954 16 18.0566 16Z"></path></svg>
                0.62% (1d)
              </p>
          </div>
          <div className="grid grid-cols-2 gap-2 py-2 text-white font-medium">
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>Market cap</p>
              <div className='flex items-center gap-1'>
                <Tooltip content="$1,638,985,674,527.69" placement='bottom'>
                  <p className='text-sm'>$1.63T</p>
                </Tooltip>
                <p className='text-[11px] text-green-500 flex items-center'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="12px" width="12px" viewBox="0 0 24 24" class="sc-4c05d6ef-0 dMwnWW"><path d="M18.0566 16H5.94336C5.10459 16 4.68455 14.9782 5.27763 14.3806L11.3343 8.27783C11.7019 7.90739 12.2981 7.90739 12.6657 8.27783L18.7223 14.3806C19.3155 14.9782 18.8954 16 18.0566 16Z"></path></svg>
                  0.42%
                </p>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>Volume (24h)</p>
              <div className='flex items-center gap-1'>
                <Tooltip content="$13,666,400,852.14" placement='bottom'>
                  <p className='text-sm'>$13.66B</p>
                </Tooltip>
                <p className='text-[11px] text-red-500 flex items-center'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="12px" width="12px" viewBox="0 0 24 24" class="sc-4c05d6ef-0 dMwnWW" ><path d="M18.0566 8H5.94336C5.10459 8 4.68455 9.02183 5.27763 9.61943L11.3343 15.7222C11.7019 16.0926 12.2981 16.0926 12.6657 15.7222L18.7223 9.61943C19.3155 9.02183 18.8954 8 18.0566 8Z"></path></svg>
                  27.79%
                </p>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>FDV</p>
              <div className='flex items-center gap-1'>
                <Tooltip content="$1,734,418,491,006.65" placement='bottom'>
                  <p className='text-sm'>$1.73T</p>
                </Tooltip>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>Vol/Mkt Cap (24h)</p>
              <div className='flex items-center gap-1'>
                <p className='text-sm'>0.8303%</p>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>Total supply</p>
              <div className='flex items-center gap-1'>
                <Tooltip content="19,844,168 BTC" placement='bottom'>
                  <p className='text-sm'>19.84M BTC</p>
                </Tooltip>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2'>
              <p className='text-[12px] text-gray-500'>Max. supply</p>
              <div className='flex items-center gap-1'>
                <Tooltip content="21,000,000 BTC" placement='bottom'>
                  <p className='text-sm'>21M BTC</p>
                </Tooltip>
              </div>
            </div>
            <div className='border border-gray-600 rounded-lg flex flex-col items-center p-2 col-span-2'>
              <p className='text-[12px] text-gray-500'>Circulating supply</p>
              <div className='flex items-center gap-1'>
                <Tooltip content="19,844,168 BTC" placement='bottom'>
                  <p className='text-sm'>19.84M BTC</p>
                </Tooltip>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-white text-sm py-2 w-full rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span>Website</span>
              <div className="flex space-x-2">
                <button className="bg-gray-700 px-3 rounded-full flex items-center space-x-1">
                  <FaGlobe /> <span>Website</span>
                </button>
                <button className="bg-gray-700 px-3 rounded-full flex items-center space-x-1">
                  <FaFileAlt /> <span>Whitepaper</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Socials</span>
              <div className="flex space-x-2">
                <FaReddit className="text-red-500 text-xl" />
                <FaGithub className="text-white text-xl" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Rating</span>
              <div className="flex items-center space-x-2 bg-gray-700 px-3  rounded-full">
                <span>4.6</span>
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`text-yellow-400 ${i >= 4.6 ? 'opacity-50' : ''}`} />
                ))}
                 <IoIosArrowDown />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Explorers</span>
              <div className='flex gap-2'>
                <button className="bg-gray-700 px-3 rounded-full flex items-center space-x-1">
                  <span>blockchain.info</span>
                </button>
                <div className='bg-gray-700 p-1 rounded-full flex items-center '>
                  <IoIosArrowDown />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Wallets</span>
              <div className="flex space-x-2">
                <div className='bg-gray-700 p-1 rounded-full flex items-center '>
                  <img className='w-4 h-4 rounded-full' src="https://s3.coinmarketcap.com/static/img/as/2024-11-22T08:06:55.818Z_2024_11_18T10_38_53_883Z_m2kXHwEY_400x400.png" alt="" />
                </div>
                <div className='bg-gray-700 p-1 rounded-full flex items-center '>
                  <img className='w-4 h-4 rounded-full' src="https://s3.coinmarketcap.com/static/img/as/2025-01-23T08:40:26.516Z_Trustwallet_logo.png" alt="" />
                </div>
                <div className='bg-gray-700 p-1 rounded-full flex items-center '>
                  <img className='w-4 h-4 rounded-full' src="https://s2.coinmarketcap.com/static/img/wallets/128x128/9017.png" alt="" />
                </div>
                <div className='bg-gray-700 p-1 rounded-full flex items-center '>
                  <img className='w-4 h-4 rounded-full' src="https://s2.coinmarketcap.com/static/img/wallets/128x128/9020.png" alt="" />
                </div>
                <div className='bg-gray-700 p-1 rounded-full flex items-center '>
                  <IoIosArrowDown />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>UCID</span>
              <button className="bg-gray-700 px-3 py-1 rounded-full flex items-center space-x-1">
                <span>1</span>
                <IoIosArrowDown />
              </button>
            </div>
          </div>
        </div>
        <div className='col-span-2 border-2 border-gray-500'>
          <div className=''>
            {/* <AreaChartFillByValue/> */}
            <CryptoChart/>
          </div>
          <div className='mt-6'>
            <div className='my-2 grid grid-cols-2 gap-2 px-3'>
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
                avatar="https://i.imgur.com/1XGQ1Zf.png"
                user="Crypto Rand"
                time="8 hours"
                content="Exchanges are running out of #Bitcoin supply. Imminent ₿ $BTC supply shock, read between the lines!..."
                comments={9}
                retweets={2}
                likes={305}
                views=""
              />
            </div>
          </div>
        </div>
        <div className='p-4 py-10 border-y-2 border-gray-500'>
          <div>
            <div className='text-white w-full rounded-full bg-gray-900 border border-gray-700 flex relative'>
              <div className={`w-[174px] h-full bg-black absolute transition delay-150 duration-300 rounded-full left-0 ${check?'translate-x-[0] bg-green-400':'translate-x-[173px] bg-red-400'} `}></div>
              <button className='w-full opacity-60 transition delay-150 duration-300 py-2 text-xs font-medium rounded-full bg-gray-900 ' onClick={()=>{toggleColor(true); setTittleSubmit("Buy")}}>Buy</button>
              <button className='w-full opacity-60 transition delay-150 duration-300 py-2 text-xs font-medium rounded-full bg-gray-900 ' onClick={()=>{toggleColor(false); setTittleSubmit("Sell")}}>Sell</button>
            </div>
            <div className=" text-white w-full mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable Margin Trading</span>
                <ToggleCheck/>
              </div>
              <DropdownCustom title={"Limit"} data={[
                {id:1, name:"Limit"},
                {id:2, name:"Market"},
                {id:3, name:"Stop Loss"},
              ]}/>
              <div className="border border-gray-500">
                <div className='bg-gray-800 py-[2px] px-2 rounded flex justify-between items-center'>
                  <span className='text-sm text-gray-400 font-medium'>Price</span>
                  <input 
                    type="text"                                                
                    placeholder="1000" 
                    class="rtl text-right bg-gray-800 p-2 pl-10 border-none outline-none w-64 focus:border-none focus:outline-none focus:ring-0 focus:shadow-none"
                    pattern="^[0-9]*(\.[0-9]*)?$"   
                    autocomplete="off"       
                    value={price} 
                    onChange={(e)=>setPrice(e.target.value)}           
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
                  />
                  <span className='text-sm text-gray-400 font-medium'>BTC</span>
                </div>
              </div>
              
              <div className="border border-gray-500">
                <div className='bg-gray-800 py-[2px] px-2 flex justify-between items-center'>
                  <span className="text-sm text-gray-400 font-medium">Order Value</span>
                  <div className='flex items-center'>
                    <input
                        type="text"
                        className="bg-transparent p-2  text-white text-right border-none outline-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none"
                        placeholder="0"
                    />
                    <span className="text-sm text-gray-400 font-medium float-right">USD</span>
                  </div>
                </div>
              </div>
              <div className='flex justify-between'>
                <div className="flex items-center gap-2 justify-between">
                  <span className='text-sm text-gray-400'>Post-Only</span>
                  <ToggleCheck/>
                </div>
                <div>
                  <div className="bg-gray-800 w-20 rounded flex justify-between items-center">
                    <DropdownCustom title={"GTC"} data={[
                      {id:1, name: "GTC"},
                      {id:2, name:"FOK"},
                      {id:3, name:"IOC"},
                    ]}/>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
          <div className='flex justify-center mt-12 items-center '>
            <div className='w-36'>
              <ButtonComponent contentButton={titleSubmit + " BTC"}/>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className='grid grid-cols-4 h-64'>
          <div className='py-4 col-span-3 px-4 border-r-2 border-gray-500'>
            <Tabs aria-label="Default tabs" variant="pills" theme={customStyle}>
              <TabItem active title="Balance">
              </TabItem>
              <TabItem title="Positions"></TabItem>
              <TabItem title="Open Orders"></TabItem>
              <TabItem title="Trigger Orders"></TabItem>
              <TabItem title="Order History"></TabItem>
              <TabItem title="Trade History"></TabItem>
              <TabItem title="Bots"></TabItem>
              <TabItem title="News">
                <div className='my-2 flex gap-2'>
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
                    avatar="https://i.imgur.com/1XGQ1Zf.png"
                    user="Crypto Rand"
                    time="8 hours"
                    content="Exchanges are running out of #Bitcoin supply. Imminent ₿ $BTC supply shock, read between the lines!..."
                    comments={9}
                    retweets={2}
                    likes={305}
                    views=""
                  />
                </div>
              </TabItem>
            </Tabs>
          </div>
          <div className='py-4 px-4'>
            <Tabs aria-label="Default tabs" variant="pills" theme={customStyle}>
              <TabItem title="Wallet Details" >
                <div className=''>
                  <div className='text-gray-400 text-sm flex justify-between'>
                    <p>Wallet Balance</p>
                    <p>--</p>
                  </div>
                  <div className='text-gray-400 text-sm flex justify-between'>
                    <p>Available Margin</p>
                    <p>--</p>
                  </div>
                </div>
              </TabItem>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoinDetailPage

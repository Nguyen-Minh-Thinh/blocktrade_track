import React, { useState } from 'react'
import { FaSearch } from 'react-icons/fa'
const Search = () => {
    const [showSearch, setShowSearch] = useState(false)   
    const [value , setValue] = useState('all')
  return (
    <div className='relative flex items-center mr-4' >
        <FaSearch className='text-white text-lg cursor-pointer' onClick={()=>{setShowSearch(!showSearch)}} />
            {showSearch &&
                <div>
                    <div className='absolute top-10 right-0 bg-gray-900  rounded-lg shadow-lg min-w-[400px] z-30'>
                        <h1 className='text-white text-2xl font-medium pt-4 pl-4'>Search</h1>
                        <div className='border-b border-gray-600'>
                            <div className='px-4 pt-4 '>
                                <div className='relative'>
                                    <FaSearch className='text-gray-400 text-lg  absolute top-3 left-2' />
                                    <input 
                                        type='text' 
                                        placeholder='Search Market' 
                                        className='w-full p-2 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-0 focus:border-gray-400'
                                    />
                                </div>
                                <div className='flex flex-row justify-between cursor-pointer mt-4 text-sm font-bold  px-5 text-gray-500 '>
                                    <p onClick={()=>{setValue("all")}} className={`${value==="all" && "text-white border-b-2 border-b-blue-600"}  px-2 pb-2 hover:text-white`}>All</p>
                                    <p onClick={()=>{setValue("marketCap")}} className={`${value==="marketCap" && "text-white border-b-2 border-b-blue-600"} px-2 pb-2 hover:text-white`}>Market Cap</p>
                                    <p onClick={()=>{setValue("value")}} className={`${value==="value" && "text-white border-b-2 border-b-blue-600"} px-2 pb-2 hover:text-white`}>Value</p>
                                    <p onClick={()=>{setValue("tradingVolume")}} className={`${value==="tradingVolume" && "text-white border-b-2 border-b-blue-600"} px-2 pb-2 hover:text-white`}>Trading Volume</p>
                                </div>
                            </div>
                        </div>
                        <div className='h-[390px] overflow-y-auto custom-scroll'>
                            <div className='p-4'>
                                <div className='grid grid-cols-5 my-3 font-medium text-[16px] text-white cursor-pointer group'>
                                    <div className='flex items-center col-span-3'>
                                        <img src='https://cryptologos.cc/logos/bitcoin-btc-logo.png' alt="logo" className='w-5 h-5' />
                                        <p className='ml-4 group-hover:text-blue-700'>Bitcoin</p>
                                    </div>
                                    <p className='text-end text-green-500'>0.1558</p>
                                    <p className='text-end text-green-500'>+2.5%</p>
                                </div>
                                <div className='grid grid-cols-5 my-3 font-medium text-[16px] text-white cursor-pointer group'>
                                    <div className='flex items-center col-span-3'>
                                        <img src='https://cryptologos.cc/logos/bitcoin-btc-logo.png' alt="logo" className='w-5 h-5' />
                                        <p className='ml-4 group-hover:text-blue-700'>Bitcoin</p>
                                    </div>
                                    <p className='text-end text-green-500'>0.1558</p>
                                    <p className='text-end text-green-500'>+2.5%</p>
                                </div>
                                <div className='grid grid-cols-5 my-3 font-medium text-[16px] text-white cursor-pointer group'>
                                    <div className='flex items-center col-span-3'>
                                        <img src='https://cryptologos.cc/logos/bitcoin-btc-logo.png' alt="logo" className='w-5 h-5' />
                                        <p className='ml-4 group-hover:text-blue-700'>Bitcoin</p>
                                    </div>
                                    <p className='text-end text-green-500'>0.1558</p>
                                    <p className='text-end text-green-500'>+2.5%</p>
                                </div>
                                <div className='grid grid-cols-5 my-3 font-medium text-[16px] text-white cursor-pointer group'>
                                    <div className='flex items-center col-span-3'>
                                        <img src='https://cryptologos.cc/logos/bitcoin-btc-logo.png' alt="logo" className='w-5 h-5' />
                                        <p className='ml-4 group-hover:text-blue-700'>Bitcoin</p>
                                    </div>
                                    <p className='text-end text-green-500'>0.1558</p>
                                    <p className='text-end text-green-500'>+2.5%</p>
                                </div>
                                <div className='grid grid-cols-5 my-3 font-medium text-[16px] text-white cursor-pointer group'>
                                    <div className='flex items-center col-span-3'>
                                        <img src='https://cryptologos.cc/logos/bitcoin-btc-logo.png' alt="logo" className='w-5 h-5' />
                                        <p className='ml-4 group-hover:text-blue-700'>Bitcoin</p>
                                    </div>
                                    <p className='text-end text-green-500'>0.1558</p>
                                    <p className='text-end text-green-500'>+2.5%</p>
                                </div>
                                <div className='grid grid-cols-5 my-3 font-medium text-[16px] text-white cursor-pointer group'>
                                    <div className='flex items-center col-span-3'>
                                        <img src='https://cryptologos.cc/logos/bitcoin-btc-logo.png' alt="logo" className='w-5 h-5' />
                                        <p className='ml-4 group-hover:text-blue-700'>Bitcoin</p>
                                    </div>
                                    <p className='text-end text-green-500'>0.1558</p>
                                    <p className='text-end text-green-500'>+2.5%</p>
                                </div>
                                <div className='grid grid-cols-5 my-3 font-medium text-[16px] text-white cursor-pointer group'>
                                    <div className='flex items-center col-span-3'>
                                        <img src='https://cryptologos.cc/logos/bitcoin-btc-logo.png' alt="logo" className='w-5 h-5' />
                                        <p className='ml-4 group-hover:text-blue-700'>Bitcoin</p>
                                    </div>
                                    <p className='text-end text-green-500'>0.1558</p>
                                    <p className='text-end text-green-500'>+2.5%</p>
                                </div>
                                <div className='grid grid-cols-5 my-3 font-medium text-[16px] text-white cursor-pointer group'>
                                    <div className='flex items-center col-span-3'>
                                        <img src='https://cryptologos.cc/logos/ethereum-eth-logo.png' alt="logo" className='w-5 h-5' />
                                        <p className='ml-4 group-hover:text-blue-700'>Ethereum</p>
                                    </div>
                                    <p className='text-end text-green-500'>0.1558</p>
                                    <p className='text-end text-green-500'>+2.5%</p>
                                </div>
                                <div className='grid grid-cols-5 my-3 font-medium text-[16px] text-white cursor-pointer group'>
                                    <div className='flex items-center col-span-3'>
                                        <img src='https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=002' alt="logo" className='w-5 h-5' />
                                        <p className='ml-4 group-hover:text-blue-700'>Ripple</p>
                                    </div>
                                    <p className='text-end text-green-500'>0.1558</p>
                                    <p className='text-end text-red-500'>-2.5%</p>
                                </div>
                                <div className='grid grid-cols-5 my-3 font-medium text-[16px] text-white cursor-pointer group'>
                                    <div className='flex items-center col-span-3'>
                                        <img src='https://cryptologos.cc/logos/litecoin-ltc-logo.png' alt="logo" className='w-5 h-5' />
                                        <p className='ml-4 group-hover:text-blue-700'>Litecoin</p>
                                    </div>
                                    <p className='text-end text-green-500'>0.1558</p>
                                    <p className='text-end text-green-500'>+2.5%</p>
                                </div>
                                <div className='grid grid-cols-5 my-3 font-medium text-[16px] text-white cursor-pointer group'>
                                    <div className='flex items-center col-span-3'>
                                        <img src='https://cryptologos.cc/logos/cardano-ada-logo.png' alt="logo" className='w-5 h-5' />
                                        <p className='ml-4 group-hover:text-blue-700'>Cardano</p>
                                    </div>
                                    <p className='text-end text-green-500'>0.1558</p>
                                    <p className='text-end text-red-500'>-2.5%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
    
    </div>
                    
  )
}

export default Search
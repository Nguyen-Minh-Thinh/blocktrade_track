import React, { useState } from 'react'
import { FaStar } from "react-icons/fa";

const FavoritesList = () => {
  const [showFavoritesList, setShowFavoriteList] = useState(false)
  const [favorites, setFavorites] = useState([
    { id: 1, name: "Bitcoin", price: "$84,198.38", change: "0.12%", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
    { id: 2, name: "Ethereum", price: "$4,289.32", change: "1.45%", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    { id: 3, name: "Litecoin", price: "$305.67", change: "-0.72%", logo: "https://cryptologos.cc/logos/litecoin-ltc-logo.png" },
    { id: 4, name: "Ripple", price: "$1.24", change: "2.31%", logo: "https://cryptologos.cc/logos/xrp-xrp-logo.png" },
    { id: 5, name: "Cardano", price: "$2.14", change: "0.89%", logo: "https://cryptologos.cc/logos/cardano-ada-logo.png" },
    { id: 6, name: "Polkadot", price: "$38.12", change: "-1.23%", logo: "https://cryptologos.cc/logos/polkadot-new-dot-logo.png" },
    { id: 7, name: "Dogecoin", price: "$0.29", change: "5.12%", logo: "https://cryptologos.cc/logos/dogecoin-doge-logo.png" },
    { id: 8, name: "Binance Coin", price: "$479.25", change: "-0.98%", logo: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png" },
    { id: 9, name: "Solana", price: "$146.78", change: "3.45%", logo: "https://cryptologos.cc/logos/solana-sol-logo.png" },
    { id: 10, name: "Avalanche", price: "$87.22", change: "-2.19%", logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png" },
    { id: 11, name: "Shiba Inu", price: "$0.000035", change: "6.89%", logo: "https://cryptologos.cc/logos/shiba-inu-shib-logo.png" },
    { id: 12, name: "Chainlink", price: "$27.13", change: "-0.34%", logo: "https://cryptologos.cc/logos/chainlink-link-logo.png" },
    { id: 13, name: "Polygon", price: "$1.63", change: "2.04%", logo: "https://cryptologos.cc/logos/polygon-matic-logo.png" },
    { id: 14, name: "Stellar", price: "$0.37", change: "-1.10%", logo: "https://cryptologos.cc/logos/stellar-xlm-logo.png" }
]);
  const handleRemoveFavorite = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };
  return (
    <div >
      <div onMouseLeave={() => {setShowFavoriteList(false)}} className='py-5 px-1 mx-2 relative'>
        <FaStar onMouseEnter={() => {setShowFavoriteList(true)}} className='cursor-pointer text-xl text-yellow-300'/>
        {showFavoritesList &&
          (<div className='bg-gray-900 min-w-[360px] absolute right-0 top-14 rounded-lg shadow-lg z-50'>
            <div className='w-full border-b border-gray-600'>
              <h1 className='text-xl font-medium text-white m-3'>Favorites List</h1>
            </div>
            <div className='max-h-[290px] overflow-y-auto custom-scroll'>
              <div className='py-4'>
                {favorites.length>0 ? 
                (
                  favorites.map(item => (
                    <div key={item.id} className='grid grid-cols-4 px-3 py-3 font-medium text-sm text-white cursor-pointer group hover:bg-gray-800 hover:rounded-lg'>
                      <div className='flex justify-start items-center col-span-2'>
                        <FaStar onClick={() => {handleRemoveFavorite(item.id)}} className='text-yellow-300 mr-3'/>
                        <img src={item.logo} alt="logo" className='w-5 h-5' />
                        <p className='ml-4 '>{item.name}</p>
                      </div>
                      <p className='text-end'>{item.price}</p>
                      <p className='text-end'>{item.change}</p>
                    </div>
                  ))
                ) : 
                (
                  <p className="text-white text-center">No favorites added.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesList
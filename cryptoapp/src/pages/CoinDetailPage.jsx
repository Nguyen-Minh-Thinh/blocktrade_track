import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TiStarOutline } from "react-icons/ti";
import { IoShareSocialSharp } from "react-icons/io5";
import { TabItem, Tabs, Tooltip } from 'flowbite-react';
import { FaGlobe, FaFileAlt, FaReddit, FaGithub, FaStar } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { ToggleCheck } from '../components/ToggleCheck';
import { DropdownCustom } from '../components/DropdownCustom';
import AreaChartFillByValue from '../components/AreaChartFillByValue';
import ButtonComponent from '../components/ButtonComponent';
import CryptoChart from '../components/CryptoChart';
import CryptoNewsCard from '../components/CryptoNewsCard';
import { getCoinDetail } from '../api/coindetail';
import { getFavorites, addFavorite, removeFavorite } from '../api/favorites';

const CoinDetailPage = () => {
  const location = useLocation();
  const coin_id = location?.state?.coin_id || null;
  const symbol = location?.state?.symbol || null;

  console.log('Navigated Coin ID:', coin_id);
  console.log('Navigated Symbol:', symbol);

  const [check, setCheck] = useState(true);
  const [price, setPrice] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [titleSubmit, setTitleSubmit] = useState("Buy");
  const [coinDetail, setCoinDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null: unknown, true: logged in, false: not logged in

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
            // Fetch favorites since user is logged in
            try {
              console.log('Fetching favorites...');
              const favoritesData = await getFavorites();
              console.log('Fetched Favorites:', favoritesData);
              const isFavorite = favoritesData.favorites?.some(item => item.coin_id === coin_id);
              setFavorite(isFavorite || false);
            } catch (favError) {
              console.error('Error fetching favorites:', favError);
              setError(favError.error || 'Failed to fetch favorites');
            }
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
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.error || 'Failed to fetch coin details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coin_id, symbol]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      alert('Please log in to manage favorites.');
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

  const customStyle = {
    tablist: {
      variant: {
        pills: "flex-wrap space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400",
      },
      tabitem: {
        base: "flex flex-row-reverse gap-1 bg-gray-900 items-center justify-center rounded-t-lg py-2 px-4 text-sm font-medium first:ml-0 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500",
        variant: {
          pills: {
            active: {
              on: "rounded-lg bg-gray-800 text-white",
              off: "rounded-lg hover:bg-gray-800 hover:text-white dark:hover:bg-gray-800 dark:hover:text-white",
            },
          },
        },
      },
    },
  };

  const toggleColor = (a) => {
    setCheck(a);
  };

  if (loading) return <div className='container mx-auto text-white'>Loading...</div>;
  if (error) return <div className='container mx-auto text-red-500'>Error: {error}</div>;
  if (!coinDetail) return <div className='container mx-auto text-white'>No data available</div>;

  // Add fallback values for all numeric fields
  const priceUsd = coinDetail.price_usd ?? 0;
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
      <div className='grid grid-cols-4 flex-row-reverse mt-20'>
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
            <CryptoChart />
          </div>
          <div className='mt-6'>
            <div className='my-2 grid grid-cols-2 gap-2 px-3'>
              <CryptoNewsCard
                avatar="https://i.imgur.com/1XGQ1Zf.png"
                user="Crypto Rand"
                time="8 hours"
                content={`Exchanges are running out of #${coinDetail.name || 'Coin'} supply. Imminent ₿ $${displaySymbol} supply shock, read between the lines!...`}
                comments={9}
                retweets={2}
                likes={305}
                views=""
              />
              <CryptoNewsCard
                avatar="https://i.imgur.com/1XGQ1Zf.png"
                user="Crypto Rand"
                time="8 hours"
                content={`Exchanges are running out of #${coinDetail.name || 'Coin'} supply. Imminent ₿ $${displaySymbol} supply shock, read between the lines!...`}
                comments={9}
                retweets={2}
                likes={305}
                views=""
              />
              <CryptoNewsCard
                avatar="https://i.imgur.com/1XGQ1Zf.png"
                user="Crypto Rand"
                time="8 hours"
                content={`Exchanges are running out of #${coinDetail.name || 'Coin'} supply. Imminent ₿ $${displaySymbol} supply shock, read between the lines!...`}
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
              <div className={`w-[174px] h-full bg-black absolute transition delay-150 duration-300 rounded-full left-0 ${check ? 'translate-x-[0] bg-green-400' : 'translate-x-[173px] bg-red-400'}`}></div>
              <button className='w-full opacity-60 transition delay-150 duration-300 py-2 text-xs font-medium rounded-full bg-gray-900' onClick={() => { toggleColor(true); setTitleSubmit("Buy"); }}>Buy</button>
              <button className='w-full opacity-60 transition delay-150 duration-300 py-2 text-xs font-medium rounded-full bg-gray-900' onClick={() => { toggleColor(false); setTitleSubmit("Sell"); }}>Sell</button>
            </div>
            <div className="text-white w-full mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable Margin Trading</span>
                <ToggleCheck />
              </div>
              <DropdownCustom
                title={"Limit"}
                data={[
                  { id: 1, name: "Limit" },
                  { id: 2, name: "Market" },
                  { id: 3, name: "Stop Loss" },
                ]}
              />
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
                    onChange={(e) => setPrice(e.target.value)}           
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
                    />
                    <span className="text-sm text-gray-400 font-medium float-right">USD</span>
                  </div>
                </div>
              </div>
              <div className='flex justify-between'>
                <div className="flex items-center gap-2 justify-between">
                  <span className='text-sm text-gray-400'>Post-Only</span>
                  <ToggleCheck />
                </div>
                <div>
                  <div className="bg-gray-800 w-20 rounded flex justify-between items-center">
                    <DropdownCustom
                      title={"GTC"}
                      data={[
                        { id: 1, name: "GTC" },
                        { id: 2, name: "FOK" },
                        { id: 3, name: "IOC" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='flex justify-center mt-12 items-center'>
            <div className='w-36'>
              <ButtonComponent contentButton={`${titleSubmit} ${displaySymbol}`} />
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
                    content={`Exchanges are running out of #${coinDetail.name || 'Coin'} supply. Imminent ₿ $${displaySymbol} supply shock, read between the lines!...`}
                    comments={9}
                    retweets={2}
                    likes={305}
                    views=""
                  />
                  <CryptoNewsCard
                    avatar="https://i.imgur.com/1XGQ1Zf.png"
                    user="Crypto Rand"
                    time="8 hours"
                    content={`Exchanges are running out of #${coinDetail.name || 'Coin'} supply. Imminent ₿ $${displaySymbol} supply shock, read between the lines!...`}
                    comments={9}
                    retweets={2}
                    likes={305}
                    views=""
                  />
                  <CryptoNewsCard
                    avatar="https://i.imgur.com/1XGQ1Zf.png"
                    user="Crypto Rand"
                    time="8 hours"
                    content={`Exchanges are running out of #${coinDetail.name || 'Coin'} supply. Imminent ₿ $${displaySymbol} supply shock, read between the lines!...`}
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
              <TabItem title="Wallet Details">
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
  );
};

export default CoinDetailPage;
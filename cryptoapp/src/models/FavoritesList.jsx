import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { FaStar } from "react-icons/fa";
import { getFavorites, addFavorite, removeFavorite } from '../api/favorites';
import { toast } from 'react-toastify';

const FavoritesList = ({ coin }) => {
  const [showFavoritesList, setShowFavoriteList] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch favorites from the backend
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFavorites();
      if (!response || !response.favorites) {
        throw new Error('Invalid response format: missing favorites property');
      }
      setFavorites(response.favorites);

      // Check if the current coin is in favorites (only if coin is provided)
      if (coin) {
        const isCoinFavorite = response.favorites.some(item => item.coin_id === coin.coin_id);
        setIsFavorite(isCoinFavorite);
      }
    } catch (err) {
      setError(err.error || 'Failed to load favorites. Please try again.');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [coin]);

  // Fetch favorites when the component mounts or coin changes, and listen for updates
  useEffect(() => {
    fetchFavorites();

    const handleFavoritesUpdated = () => {
      fetchFavorites();
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdated);

    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
    };
  }, [fetchFavorites]);

  // Handle adding a favorite
  const handleAddFavorite = async (coinId) => {
    try {
      await addFavorite(coinId);
      await fetchFavorites();
      toast.success("Added to favorites", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      // Dispatch event to notify other components
      window.dispatchEvent(new Event("favoritesUpdated"));
    } catch (err) {
      setError(err.error || 'Failed to add favorite. Please try again.');
      toast.error(err.error || 'Failed to add favorite', {
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

  // Handle removing a favorite
  const handleRemoveFavorite = async (coinId, e) => {
    e.stopPropagation(); // Prevent row click from triggering navigation
    try {
      await removeFavorite(coinId);
      await fetchFavorites();
      toast.success("Removed from favorites", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      // Dispatch event to notify other components
      window.dispatchEvent(new Event("favoritesUpdated"));
    } catch (err) {
      setError(err.error || 'Failed to remove favorite. Please try again.');
      toast.error(err.error || 'Failed to remove favorite', {
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

  // Navigate to coin detail page
  const handleRowClick = (coinId) => {
    navigate('/coindetail', { state: { coin_id: coinId } });
  };

  return (
    <div>
      <div onMouseLeave={() => setShowFavoriteList(false)} className='py-5 px-1 mx-2 relative'>
        {/* Star icon to toggle favorites list and add/remove current coin */}
        {coin ? (
          <FaStar
            onClick={() => isFavorite ? handleRemoveFavorite(coin.coin_id) : handleAddFavorite(coin.coin_id)}
            onMouseEnter={() => setShowFavoriteList(true)}
            className={`cursor-pointer text-xl ${isFavorite ? 'text-yellow-300' : 'text-gray-400'}`}
          />
        ) : (
          <FaStar
            onMouseEnter={() => setShowFavoriteList(true)}
            className='cursor-pointer text-xl text-yellow-300'
          />
        )}
        {showFavoritesList && (
          <div className='bg-gray-900 min-w-[360px] absolute right-0 top-14 rounded-lg shadow-lg z-50'>
            <div className='w-full border-b border-gray-600'>
              <h1 className='text-xl font-medium text-white m-3'>Favorites List</h1>
            </div>
            <div className='max-h-[290px] overflow-y-auto custom-scroll'>
              <div className='py-4'>
                {loading ? (
                  <p className="text-white text-center">Loading...</p>
                ) : error ? (
                  <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                      onClick={fetchFavorites}
                      className="text-blue-500 underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : favorites.length > 0 ? (
                  favorites.map(item => (
                    <div 
                      key={item.id} 
                      className='grid grid-cols-4 px-3 py-3 font-medium text-sm text-white cursor-pointer group hover:bg-gray-800 hover:rounded-lg'
                      onClick={() => handleRowClick(item.coin_id)} // Navigate on row click
                    >
                      <div className='flex justify-start items-center col-span-2'>
                        <FaStar
                          onClick={(e) => handleRemoveFavorite(item.coin_id, e)}
                          className='text-yellow-300 mr-3 cursor-pointer'
                        />
                        <img src={item.logo} alt="logo" className='w-5 h-5' />
                        <p className='ml-4'>{item.name}</p>
                      </div>
                      <p className='text-end'>{item.price}</p>
                      <p className={`text-end ${item.change.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                        {item.change}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-white text-center">No favorites added.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesList;
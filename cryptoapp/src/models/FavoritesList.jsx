import React, { useState, useEffect, useCallback } from 'react';
import { FaStar } from "react-icons/fa";
import { getFavorites, removeFavorite } from '../api/favorites';

const FavoritesList = ({ userId }) => {
  const [showFavoritesList, setShowFavoriteList] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch favorites from the backend
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching favorites for userId:', userId);
      const response = await getFavorites(userId);
      console.log('API response:', response);
      if (!response || !response.favorites) {
        throw new Error('Invalid response format: missing favorites property');
      }
      console.log('Setting favorites:', response.favorites);
      setFavorites(response.favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.error || 'Failed to load favorites. Please try again.');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch favorites when the component mounts or userId changes
  useEffect(() => {
    console.log('useEffect triggered with userId:', userId);
    if (userId && typeof userId === 'string' && userId.trim() !== '') {
      fetchFavorites();
    } else {
      setError('User ID is missing or invalid. Please log in.');
      setFavorites([]);
    }
  }, [userId, fetchFavorites]);

  // Handle removing a favorite
  const handleRemoveFavorite = async (coinId) => {
    try {
      await removeFavorite(userId, coinId);
      setFavorites(favorites.filter(item => item.coin_id !== coinId));
    } catch (err) {
      setError(err.error || 'Failed to remove favorite. Please try again.');
    }
  };

  return (
    <div>
      <div onMouseLeave={() => setShowFavoriteList(false)} className='py-5 px-1 mx-2 relative'>
        <FaStar onMouseEnter={() => setShowFavoriteList(true)} className='cursor-pointer text-xl text-yellow-300'/>
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
                    <div key={item.id} className='grid grid-cols-4 px-3 py-3 font-medium text-sm text-white cursor-pointer group hover:bg-gray-800 hover:rounded-lg'>
                      <div className='flex justify-start items-center col-span-2'>
                        <FaStar onClick={() => handleRemoveFavorite(item.coin_id)} className='text-yellow-300 mr-3'/>
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
import React from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { AiOutlineRetweet, AiOutlineHeart } from "react-icons/ai";

const CryptoNewsCard = ({ avatar, user, time, content, image, comments, retweets, likes, views }) => {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-xl w-full max-w-md shadow-md">
      {/* Header */}
      <div className="flex items-center mb-2">
        <img src={avatar} alt="avatar" className="w-6 h-6 rounded-full mr-2" />
        <span className="font-semibold text-sm">{user}</span>
        <svg className="w-4 h-4 text-blue-500 ml-1 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.5 12c0 5.8-4.7 10.5-10.5 10.5S1.5 17.8 1.5 12 6.2 1.5 12 1.5 22.5 6.2 22.5 12zm-10.5 9a9 9 0 100-18 9 9 0 000 18z" />
        </svg>
        <span className="text-gray-400 text-sm">{time}</span>
      </div>

      {/* Content */}
      <div className="text-sm font-medium text-gray-300 max-h-[42px] mb-2 line-clamp-2">
        {content}
      </div>

      {/* Optional image */}
      {/* {image && (
        <div className="mt-2">
          <img src={image} alt="news" className="rounded-lg" />
        </div>
      )} */}

      {/* Actions */}
      <div className="flex items-center text-gray-400 text-xs mt-3 space-x-4">
        <div className="flex items-center space-x-1">
          <FaRegCommentDots />
          <span>{comments}</span>
        </div>
        <div className="flex items-center space-x-1">
          <AiOutlineRetweet />
          <span>{retweets}</span>
        </div>
        <div className="flex items-center space-x-1">
          <AiOutlineHeart />
          <span>{likes}</span>
        </div>
        <div className="ml-auto">{views}</div>
      </div>
    </div>
  );
};

export default CryptoNewsCard;

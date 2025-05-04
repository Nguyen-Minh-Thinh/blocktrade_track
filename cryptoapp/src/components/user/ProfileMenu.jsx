import React from "react";
import {
  WalletOutlined,
  HistoryOutlined,
  UserOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Divider, Badge } from "antd";
import { toast } from 'react-toastify';
import { logout, refreshToken } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

const ProfileMenu = ({ activeKey, setActiveKey, userData }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "portfolio",
      icon: <WalletOutlined />,
      label: "Portfolio",
      description: "Track your crypto holdings",
    },
    {
      key: "transactionHistory",
      icon: <HistoryOutlined />,
      label: "Trade History",
      description: "View all your transaction records",
    },
    {
      key: "editProfile",
      icon: <UserOutlined />,
      label: "Profile Settings",
      description: "Update your personal information",
    },
  ];

  // Function to refresh token if expired
  const checkAndRefreshToken = async () => {
    try {
      // Attempt to refresh the token
      await refreshToken();
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // Enhanced logout function that uses React Router navigation instead of page reload
  const handleLogout = async (e) => {
    e.preventDefault();
    
    try {
      // Before logging out, refresh the token if expired
      await checkAndRefreshToken();

      // Proceed with logout
      await logout();
      
      // Clear user data from localStorage
      localStorage.removeItem("userLogin");
      
      // Dispatch events to notify components
      window.dispatchEvent(new Event("userUpdated"));
      window.dispatchEvent(new Event("userLoggedOut"));
      
      // Show success notification
      toast.success("Logout successful", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      
      // Navigate to home page without page reload
      navigate('/');
    } catch (err) {
      // Handle errors
      console.error('Logout failed:', err);
      toast.error(err.error || 'Logout failed', {
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

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
      {/* User Info Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img
              src={userData.image_url || "https://via.placeholder.com/48"}
              alt={userData.name || "User"}
              className="w-12 h-12 rounded-full border-2 border-blue-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/48";
              }}
            />
          </div>
          <div className="ml-3">
            <h3 className="text-white font-medium truncate max-w-[180px]">
              {userData.name || "User"}
            </h3>
            <p className="text-blue-200 text-sm truncate max-w-[180px]">
              {userData.username || "username"}
            </p>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-gray-900 bg-opacity-40 rounded-md backdrop-blur-sm">
          <div className="flex items-center text-white">
            <DollarOutlined className="mr-2" />
            <span className="text-sm font-medium">Balance: </span>
            <span className="ml-auto font-bold">
              {userData.points ? userData.points.toLocaleString() : 0} USDT
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`p-3 rounded-md mb-1 cursor-pointer transition-all duration-200 ${
              activeKey === item.key
                ? "bg-blue-900 text-blue-300"
                : "hover:bg-gray-700 text-gray-300"
            }`}
            onClick={() => setActiveKey(item.key)}
          >
            <div className="flex items-center">
              <div
                className={`text-xl ${
                  activeKey === item.key ? "text-blue-300" : "text-gray-400"
                }`}
              >
                {item.icon}
              </div>
              <div className="ml-3">
                <div
                  className={`font-medium ${
                    activeKey === item.key ? "text-blue-300" : "text-gray-300"
                  }`}
                >
                  {item.label}
                </div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Divider className="my-2 border-gray-700" />

      {/* Links at bottom */}
      <div className="p-2">
        <a
          href="/"
          onClick={handleLogout}
          className="flex items-center p-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-gray-300"
        >
          <LogoutOutlined className="text-gray-500" />
          <span className="ml-2">Logout</span>
        </a>
      </div>
    </div>
  );
};

export default ProfileMenu; 
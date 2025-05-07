import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Alert } from "antd";
import { checkAuth } from '../api/auth';

// Import our new components
import Portfolio from '../components/user/Portfolio';
import EnhancedTradeHistory from '../components/user/EnhancedTradeHistory';
import ProfileEditor from '../components/user/ProfileEditor';
import ProfileMenu from '../components/user/ProfileMenu';

const UserInfoPage = () => {
  const [activeKey, setActiveKey] = useState("portfolio");
  const [userData, setUserData] = useState({
    user_id: "",
    name: "",
    email: "",
    username: "",
    points: 0,
    image_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Load user data from localStorage
  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem("userLogin");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData({
        user_id: parsedUser.user_id || "",
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        username: parsedUser.username || "",
        points: parsedUser.points || 0,
        image_url: parsedUser.image_url || "",
      });
      return parsedUser;
    }
    return null;
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        // First try to load from localStorage
        const localUser = loadUserFromStorage();

        // If localStorage has user data, verify with checkAuth
        if (localUser) {
          const authData = await checkAuth();
          if (authData) {
            // Update state with latest data from server
            setUserData({
              user_id: authData.user_id || "",
              name: authData.name || "",
              email: authData.email || "",
              username: authData.username || "",
              points: authData.points || 0,
              image_url: authData.image_url || "",
            });
            // Update localStorage
            localStorage.setItem("userLogin", JSON.stringify(authData));
          } else {
            // Auth check failed
            localStorage.removeItem("userLogin");
            window.dispatchEvent(new Event("userUpdated"));
            setErrorMessage("Session expired. Please log in again.");
            setTimeout(() => {
              setErrorMessage("");
              navigate("/");
            }, 2000);
          }
        } else {
          // No user in localStorage, try checkAuth
          const authData = await checkAuth();
          if (authData) {
            setUserData({
              user_id: authData.user_id || "",
              name: authData.name || "",
              email: authData.email || "",
              username: authData.username || "",
              points: authData.points || 0,
              image_url: authData.image_url || "",
            });
            localStorage.setItem("userLogin", JSON.stringify(authData));
          } else {
            setErrorMessage("Please log in to access this page.");
            setTimeout(() => {
              setErrorMessage("");
              navigate("/");
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setErrorMessage("Failed to load user info. Please log in again.");
        setTimeout(() => {
          setErrorMessage("");
          navigate("/");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();

    // Listen for user updates from other components
    const handleUserUpdated = () => {
      loadUserFromStorage();
    };

    window.addEventListener("userUpdated", handleUserUpdated);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("userUpdated", handleUserUpdated);
    };
  }, [navigate]);

  // Handle user data updates from child components
  const handleUserUpdate = (updatedUser) => {
    setUserData(updatedUser);
  };

  // Render different content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      );
    }

    if (errorMessage) {
      return (
        <Alert
          message="Error"
          description={errorMessage}
          type="error"
          showIcon
        />
      );
    }

    switch (activeKey) {
      case "portfolio":
        return <Portfolio userId={userData.user_id} />;
      case "transactionHistory":
        return <EnhancedTradeHistory userId={userData.user_id} />;
      case "editProfile":
        return <ProfileEditor userData={userData} onUserUpdate={handleUserUpdate} />;
      default:
        return <div className="text-gray-300">Please select an option from the menu</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-930 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Account Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <ProfileMenu 
              activeKey={activeKey} 
              setActiveKey={setActiveKey} 
              userData={userData} 
            />
          </div>
          
          {/* Main Content Area */}
          <div className="md:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;
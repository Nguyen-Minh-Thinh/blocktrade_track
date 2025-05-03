import { Navbar, Dropdown } from 'flowbite-react';
import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaUser, FaChevronCircleDown } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { MdWbSunny } from "react-icons/md";
import SignIn from '../models/SignIn';
import SignUp from '../models/SignUp';
import ButtonComponent from './ButtonComponent';
import Search from '../models/Search';
import { checkAuth, logout, refreshToken } from '../api/auth';
import Spot from '../models/Spot';
import FavoritesList from '../models/FavoritesList';
import { toast } from 'react-toastify';

const HeaderComponent = () => {
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [user, setUser] = useState(null);

  const swapModels = () => {
    setOpenSignIn(openSignUp);
    setOpenSignUp(openSignIn);
  };

  // Load user from localStorage
  const loadUserFromStorage = () => {
    const userData = localStorage.getItem("userLogin");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  };

  // Verify authentication if no user data in localStorage
  const verifyAuth = async () => {
    try {
      const userData = await checkAuth();
      if (userData) {
        setUser(userData);
        localStorage.setItem("userLogin", JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem("userLogin");
      }
    } catch (err) {
      console.error('Error verifying auth:', err);
      setUser(null);
      localStorage.removeItem("userLogin");
    }
  };

  // Function to refresh token if expired
  const checkAndRefreshToken = async () => {
    try {
      // Attempt to refresh the token
      await refreshToken();
    } catch (error) {
      // If token refresh fails, logout the user
      console.error('Error refreshing token:', error);
      setUser(null);
      localStorage.removeItem("userLogin");
      window.location.reload(); // Optionally reload the page
    }
  };

  useEffect(() => {
    // Load user from localStorage on mount
    loadUserFromStorage();

    // Verify auth if no user data in localStorage
    if (!localStorage.getItem("userLogin")) {
      verifyAuth();
    }

    // Listen for user updates from UserInfo
    const handleUserUpdated = () => {
      loadUserFromStorage();
    };

    window.addEventListener("userUpdated", handleUserUpdated);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("userUpdated", handleUserUpdated);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Before logging out, refresh the token if expired
      await checkAndRefreshToken();

      // Proceed with logout
      await logout();
      setUser(null);
      localStorage.removeItem("userLogin");
      toast.success("Logout successful", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      window.location.reload();
    } catch (err) {
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
    <Navbar
      rounded
      className="bg-gray-950 py-1 fixed top-0 left-0 w-full z-50 shadow-md"
    >
      <SignIn
        openSI={openSignIn}
        setOpenSI={setOpenSignIn}
        swapModels={swapModels}
        setUser={setUser}
      />
      <SignUp
        openSU={openSignUp}
        setOpenSU={setOpenSignUp}
        swapModels={swapModels}
      />
      <Navbar.Brand href="/">
        <div>
          <img src="/logo.png" alt="" className="w-28" />
        </div>
      </Navbar.Brand>
      <div className="flex md:order-2 items-center">
        <Search />
        {user ? (
          <>
            <FavoritesList user_id={user.user_id} />
            <Spot value={user.points} />
            <Dropdown
              theme={{
                floating: {
                  item: {
                    base: "flex w-full cursor-pointer items-center justify-start px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 focus:bg-gray-800 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:bg-gray-600 dark:focus:text-white"
                  }
                },
                content: "focus:outline-none"
              }}
              label={
                <div className="relative space-x-2 bg-transparent rounded-full p-1 hover:opacity-90 transition cursor-pointer">
                  {user.image_url ? (
                    <img
                      src={user.image_url}
                      alt="User Avatar"
                      className="w-9 h-9 rounded-full object-cover transition duration-200 group-hover:border-gray-400"
                    />
                  ) : (
                    <FaUserCircle className="w-9 h-9 text-gray-300 rounded-full bg-transparent object-cover transition duration-200 group-hover:border-gray-400" />
                  )}
                  <FaChevronCircleDown className="absolute bottom-1 text-gray-900 p-0 m-0 border-[3px] border-gray-950 rounded-full bg-gray-300 right-0 text-[16px]" />
                </div>
              }
              inline
              arrowIcon={false}
              className="bg-gray-900 z-50 min-w-[132px] border border-gray-800 rounded shadow-lg animate-fadeIn"
            >
              <Dropdown.Item
                href="/user-info"
                className="hover:text-gray-400 transition flex text-start items-center gap-x-3 py-[6px] px-3"
              >
                <FaUser className="text-base w-4 p-0 m-0" />
                <p className="w-[80px] truncate">
                  {user.name}
                </p>
              </Dropdown.Item>
              <Dropdown.Item
                className="hover:text-gray-400 transition flex text-start items-center gap-x-3 py-[6px] px-3"
              >
                <MdWbSunny className="text-base w-4 p-0 m-0" />
                <p>Light</p>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={handleLogout}
                className="hover:text-gray-400 transition flex text-start items-center gap-x-3 py-[6px] px-3"
              >
                <TbLogout className="text-[18px] w-4 p-0 m-0" />
                <p>Logout</p>
              </Dropdown.Item>
            </Dropdown>
          </>
        ) : (
          <>
            <div onClick={() => setOpenSignIn(true)} className="w-[92px] mx-1">
              <ButtonComponent contentButton="Sign in" />
            </div>
            <div onClick={() => setOpenSignUp(true)} className="w-[92px] mx-1">
              <ButtonComponent contentButton="Sign up" />
            </div>
          </>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse className="">
        <Navbar.Link className="text-white" href="/">Home</Navbar.Link>
        <Navbar.Link className="text-white" href="market">Market</Navbar.Link>
        <Navbar.Link className="text-white" href="news">News</Navbar.Link>
        <Navbar.Link className="text-white" href="about">About Us</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default HeaderComponent;

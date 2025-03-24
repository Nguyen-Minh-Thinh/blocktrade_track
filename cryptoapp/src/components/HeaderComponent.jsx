import { Navbar, Dropdown } from 'flowbite-react';
import React, { useState, useEffect } from 'react';
import SignIn from '../models/SignIn';
import SignUp from '../models/SignUp';
import ButtonComponent from './ButtonComponent';
import Search from '../models/Search';
import { checkAuth } from '../api/auth';

const HeaderComponent = () => {
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [user, setUser] = useState(null);

  const swapModels = () => {
    setOpenSignIn(openSignUp);
    setOpenSignUp(openSignIn);
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const userData = await checkAuth();
      setUser(userData);
    };
    verifyAuth();
  }, []);

  const handleLogout = () => {
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
  };

  return (
    <Navbar
      rounded
      className="bg-gray-950  py-1 fixed top-0 left-0 w-full z-50 shadow-md"
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
      <Navbar.Brand href="/homepage">
        <div>
          <img src="/logo.png" alt="" className="w-28" />
        </div>
      </Navbar.Brand>
      <div className="flex md:order-2 items-center space-x-4">
        <Search />
        {user ? (
          <Dropdown
            label={
              <div className="group flex items-center space-x-2 bg-gray-800 rounded-full p-1 hover:bg-gray-700 transition duration-300 cursor-pointer">
                <img
                  src={user.image_url || 'https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/19/465/avatar-trang-1.jpg'}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-gray-600 object-cover transition duration-200 group-hover:border-gray-400"
                />
                <span className="text-white font-medium text-sm pr-2 transition duration-200 group-hover:text-gray-200">
                  {user.username}
                </span>
              </div>
            }
            inline
            arrowIcon={false}
            placement="bottom-end"
            className="bg-gray-800 border-gray-700 rounded-lg shadow-lg p-0 mt-2 animate-fadeIn"
          >
            <Dropdown.Item
              href="/user-info"
              className="text-white hover:bg-gray-700 px-4 py-2 rounded-t-lg transition duration-200 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              User Info
            </Dropdown.Item>
            <Dropdown.Item
              onClick={handleLogout}
              className="text-white hover:bg-gray-700 px-4 py-2 rounded-b-lg transition duration-200 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </Dropdown.Item>
          </Dropdown>
        ) : (
          <>
            <div onClick={() => setOpenSignIn(true)} className="w-[92px]">
              <ButtonComponent contentButton="Sign in" />
            </div>
            <div onClick={() => setOpenSignUp(true)} className="w-[92px]">
              <ButtonComponent contentButton="Sign up" />
            </div>
          </>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse className="">
        <Navbar.Link className="text-white" href="#">
          Home
        </Navbar.Link>
        <Navbar.Link className="text-white" href="#">About</Navbar.Link>
        <Navbar.Link className="text-white" href="#">Services</Navbar.Link>
        <Navbar.Link className="text-white" href="#">Pricing</Navbar.Link>
        <Navbar.Link className="text-white" href="#">Contact</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default HeaderComponent;
import { Navbar, Dropdown } from 'flowbite-react';
import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaUser, FaChevronCircleDown } from "react-icons/fa";
import { TbLogout} from "react-icons/tb";
import { MdWbSunny } from "react-icons/md";
import { IoMoon } from "react-icons/io5";
import SignIn from '../models/SignIn';
import SignUp from '../models/SignUp';
import ButtonComponent from './ButtonComponent';
import Search from '../models/Search';
import { checkAuth } from '../api/auth';
import { Link } from 'react-router-dom';
import Spot from '../models/Spot';
const HeaderComponent = () => {
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const swapModels = () => {
    setOpenSignIn(openSignUp);
    setOpenSignUp(openSignIn);
  };
  const verifyAuth = async () => {
    const userData = await checkAuth();
    if(userData){
      console.log('userData', userData)
      setUser(userData);
      localStorage.setItem("userLogin",JSON.stringify(userData))
    }
  };
  useEffect(() => {
    const userLogin = localStorage.getItem("userLogin")
    if(userLogin){
      console.log('first')
      setUser(JSON.parse(userLogin));
    }else{
      console.log('me')
      verifyAuth();
    }
  }, []);

  const handleLogout = () => {
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
    localStorage.removeItem("userLogin")
  };

  return (
    <Navbar
      rounded
      className="bg-gray-950  py-1 fixed top-0 left-0 w-full z-50 shadow-md "
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
      <Navbar.Brand as={Link} to="/">
        <div>
          <img src="/logo.png" alt="" className="w-28" />
        </div>
      </Navbar.Brand>
      <div className="flex md:order-2 items-center ">
        <Search />
        <Spot/>
        {user ? (
          <Dropdown 
          theme={{
            floating:{
              item:{
                base:"flex w-full cursor-pointer items-center justify-start px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 focus:bg-gray-800 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:bg-gray-600 dark:focus:text-white"
              }
            },
            content:" focus:outline-none"
          }}
            label={
              <div className=" relative space-x-2 bg-transparent rounded-full p-1 hover:opacity-90 transition cursor-pointer">
                {user.image_url ? 
                (<img
                  src={user.image_url}
                  alt="User Avatar"
                  className="w-9 h-9  rounded-full object-cover transition duration-200 group-hover:border-gray-400"
                />)
                :(
                  <FaUserCircle className="w-9 h-9  text-gray-300 rounded-full bg-transparent object-cover transition duration-200 group-hover:border-gray-400"/>
                )}
                <FaChevronCircleDown className='absolute bottom-1 text-gray-900 p-0 m-0 border-[3px] border-gray-950 rounded-full bg-gray-300 right-0 text-[16px]'/>
                
              </div>
            }
            
            inline
            arrowIcon={false}
            className="bg-gray-900 z-50 min-w-[132px] border border-gray-800 rounded shadow-lg animate-fadeIn"

          >
            <Dropdown.Item 
              href="/user-info"
              className="  hover:text-gray-400  transition flex text-start items-center gap-x-3 py-[6px] px-3 "
            >
              <FaUser className='text-base w-4 p-0 m-0'/>
              <p className="w-[80px] truncate">
                {user.username}
              </p>
            </Dropdown.Item>
            <Dropdown.Item 
              className="  hover:text-gray-400  transition flex text-start items-center gap-x-3 py-[6px] px-3"
            >
              <MdWbSunny className='text-base w-4 p-0 m-0 hidden'/>
              <IoMoon className='text-base w-4 p-0 m-0'/>
              <p>Dark</p>
            </Dropdown.Item>
            <Dropdown.Item 
              onClick={handleLogout}
              className="  hover:text-gray-400  transition flex text-start items-center gap-x-3 py-[6px] px-3"
            >
              <TbLogout className='text-[18px] w-4 p-0 m-0'/>
              <p>Logout</p>
            </Dropdown.Item>
          </Dropdown>
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
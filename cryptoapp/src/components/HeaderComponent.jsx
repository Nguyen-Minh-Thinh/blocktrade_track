import { Navbar } from 'flowbite-react'
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa'
import SignIn from '../models/SignIn'
import SignUp from '../models/SignUp'
import ButtonComponent from './ButtonComponent'
const HeaderComponent = () => {
    const [openSignIn, setOpenSignIn] = useState(false)
    const [openSignUp, setOpenSignUp] = useState(false)
    const [showSearch, setShowSearch] = useState(false);
    
    const swapModels = () =>{
        setOpenSignIn(openSignUp)
        setOpenSignUp(openSignIn)
    }
    
  return (
   <Navbar rounded className='bg-transparent'>
        <SignIn openSI={openSignIn} setOpenSI={setOpenSignIn} swapModels={swapModels}></SignIn>
        <SignUp openSU={openSignUp} setOpenSU={setOpenSignUp} swapModels={swapModels}></SignUp>
        <Navbar.Brand href="/homepage">
            <div className='flex relative self-center whitespace-nowrap text-4xl font-semibold text-white'>
                Blocktrade
                <div className='flex items-center justify-center absolute -right-8 top-0 font-bold border-2 border-white rounded-full w-6 h-6 text-xs '>
                    T
                </div>
            </div>
        </Navbar.Brand>
        <div className="flex md:order-2">
           
            <div className='relative cursor-pointer flex items-center mr-4' onClick={() => setShowSearch(!showSearch)}>
                    <FaSearch className='text-white text-lg' />
                </div>
                
                {/* Hộp tìm kiếm chưa lm*/}
                {showSearch && (
                    <div className='absolute top-14 right-0 bg-gray-900 p-4 rounded-lg shadow-lg w-80 z-50'>
                        <input 
                            type='text' 
                            placeholder='Tìm kiếm Thị trường' 
                            className='w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-700'
                        />
                    </div>
                )}
            <div onClick={() => {setOpenSignIn(true)}} className='w-32'>
                <ButtonComponent  contentButton={"Sign in"}></ButtonComponent>
            </div>            
            <div onClick={() => {setOpenSignUp(true)}} className='w-32 mx-2' >
                <ButtonComponent contentButton={"Sign up"}></ButtonComponent>
            </div>
            <Navbar.Toggle />
        </div>
        <Navbar.Collapse className=''>
            <Navbar.Link className='text-white' href="#">
                Home
            </Navbar.Link>
            <Navbar.Link className='text-white' href="#">About</Navbar.Link>
            <Navbar.Link className='text-white' href="#">Services</Navbar.Link>
            <Navbar.Link className='text-white' href="#">Pricing</Navbar.Link>
            <Navbar.Link className='text-white' href="#">Contact</Navbar.Link>
        </Navbar.Collapse>
    </Navbar>
  )
}

export default HeaderComponent
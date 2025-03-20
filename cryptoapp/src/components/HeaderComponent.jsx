import { Navbar } from 'flowbite-react'
import React, { useState } from 'react'
import SignIn from '../models/SignIn'
import SignUp from '../models/SignUp'
import ButtonComponent from './ButtonComponent'
const HeaderComponent = () => {
    const [openSignIn, setOpenSignIn] = useState(false)
    const [openSignUp, setOpenSignUp] = useState(false)
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
                Block Trade
                <div className='flex items-center justify-center absolute -right-8 top-0 font-bold border-2 border-white rounded-full w-6 h-6 text-xs '>
                    T
                </div>
            </div>
        </Navbar.Brand>
        <div className="flex md:order-2">
            <div className='w-32'>
                <ButtonComponent onClick={() => {setOpenSignIn(true)}} contentButton={"Đăng nhập"}></ButtonComponent>
            </div>            
            <div className='w-32 mx-2'>
                <ButtonComponent onClick={() => {setOpenSignUp(true)}} contentButton={"Đăng ký"}></ButtonComponent>
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
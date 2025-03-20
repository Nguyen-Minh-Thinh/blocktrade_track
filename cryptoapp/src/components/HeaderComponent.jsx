import {  Button, Navbar } from 'flowbite-react'
import React from 'react'

const HeaderComponent = () => {
  return (
   <Navbar fluid rounded className='bg-transparent'>
        <Navbar.Brand href="https://flowbite-react.com">
            <div className='flex relative self-center whitespace-nowrap text-4xl font-semibold text-white'>
                Block <span className=''>Trade</span>
                <div className='flex items-center justify-center absolute -right-8 top-0 font-bold border-2 border-buttonColor rounded-full w-6 h-6 text-xs '>
                    T
                </div>
            </div>
        </Navbar.Brand>
        <div className="flex md:order-2">
            <Button>đang nhập</Button>
            <Button>Đăng ký</Button>
            <Navbar.Toggle />
        </div>
        <Navbar.Collapse className='text-white'>
            <Navbar.Link href="#" active>
                Home
            </Navbar.Link>
            <Navbar.Link href="#">About</Navbar.Link>
            <Navbar.Link href="#">Services</Navbar.Link>
            <Navbar.Link href="#">Pricing</Navbar.Link>
            <Navbar.Link href="#">Contact</Navbar.Link>
        </Navbar.Collapse>
    </Navbar>
  )
}

export default HeaderComponent
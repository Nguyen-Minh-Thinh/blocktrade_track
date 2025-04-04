import React from 'react'
import HeaderComponent from '../components/HeaderComponent'
import FooterComponent from '../components/FooterComponent'
import { Outlet } from 'react-router-dom'
import ChatBot from '../components/ChatBot'

const DefaulPage = () => {
  return (
    <div >
        <HeaderComponent />
        <div className='min-h-[100vh] mt-[68px]'>
          <Outlet/>
        </div>
        <ChatBot/>
        <FooterComponent />
    </div>
  )
}

export default DefaulPage
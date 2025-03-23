import React from 'react'
import HeaderComponent from '../components/HeaderComponent'
import FooterComponent from '../components/FooterComponent'
import { Outlet } from 'react-router-dom'

const DefaulPage = () => {
  return (
    <div >
        <HeaderComponent />
        <div className='min-h-[100vh]'>
          <Outlet/>
        </div>
        <FooterComponent />
    </div>
  )
}

export default DefaulPage
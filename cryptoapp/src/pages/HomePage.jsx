import React, { useState } from 'react'
import ButtonComponent from '../components/ButtonComponent'
import SignUp from '../models/SignUp'

const HomePage = () => {
  const [started,setStarted] = useState(false)
  return (
    <div>
      <SignUp openSU={started} setOpenSU={setStarted}></SignUp>
      <div className='relative'>
        <div className='absolute w-full -z-10'>
            <img src="/bg.webp" alt="logo" className='w-full opacity-15 inline-block ' />
        </div>
        <div className='text-7xl text-white font-bold text-center pt-36 '>
          <h1 >Secure & Intuitive</h1>
          <h1>Crypto Trading</h1>
        </div>
        <div className='text-slate-500 font-medium text-center text-base pt-6'>
          <p>Empower your future with cutting-edge crypto smart contracts.</p>
          <p>Start developing your smart contract today with Blocktrade Track.</p>
        </div>
        <div className='flex justify-center my-6'>
          <div onClick={()=>{setStarted(true)}} className='w-32 '>
            <ButtonComponent contentButton={"Get Started →"}></ButtonComponent>
          </div>
        </div>
      </div>
      <div>
        
      </div>
    </div>
  )
}

export default HomePage
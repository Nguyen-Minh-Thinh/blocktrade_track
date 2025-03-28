import React from 'react'
import { FaCoins } from "react-icons/fa6";
const Spot = () => {
  return (
    <div>
        <div className='text-white cursor-pointer px-3 flex items-center gap-2'>
            <FaCoins className='text-[18px] text-yellow-200'/>
            <p className='text-xs'>20</p>
        </div>
    </div>
  )
}

export default Spot
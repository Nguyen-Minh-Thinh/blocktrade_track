import React from 'react'
import { FaCoins } from "react-icons/fa6";
const Spot = ({ value }) => {
  return (
    <div>
        <div className='text-white cursor-pointer ml-3 mr-7 flex items-center gap-2'>
            <FaCoins className='text-[18px] text-yellow-200'/>
            <p className='text-xs'>{ value }</p>
        </div>
        <div>       
        </div>
    </div>
  )
}

export default Spot
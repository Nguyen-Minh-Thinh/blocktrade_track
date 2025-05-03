import React from 'react'
import { FaCoins } from "react-icons/fa6";

const Spot = ({ value }) => {
  // Format số tiền để hiển thị 2 chữ số thập phân
  const formattedValue = typeof value === 'number' 
    ? value.toFixed(2) 
    : parseFloat(value || 0).toFixed(2);
    
  return (
    <div>
        <div className='text-white cursor-pointer ml-3 mr-7 flex items-center gap-2'>
            <FaCoins className='text-[18px] text-yellow-200'/>
            <p className='text-xs'>{ formattedValue }</p>
        </div>
        <div>       
        </div>
    </div>
  )
}

export default Spot
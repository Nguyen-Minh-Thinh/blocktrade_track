import React from 'react'

const ButtonComponent = ({contentButton}) => {
  return (
    <button className='text-black text-[14px] bg-white w-full px-3 py-2 rounded-full'><b>{contentButton}</b></button>
  )
}

export default ButtonComponent
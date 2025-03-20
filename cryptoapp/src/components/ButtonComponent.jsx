import React from 'react'

const ButtonComponent = ({contentButton}) => {
  return (
    <button className='text-black text-[14px] bg-white w-full px-4 py-3 rounded-full'><b>{contentButton}</b></button>
  )
}

export default ButtonComponent
import React, { useEffect, useRef, useState } from 'react'
import { IoIosArrowDown } from 'react-icons/io'
import { Link } from 'react-router-dom'

export const DropdownCustom = ({title,data }) => {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null); 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='w-full relative' ref={dropdownRef} >
        <button  onClick={()=>setOpen(!open) } className="bg-gray-800 border border-gray-500 flex justify-between w-full items-center p-2 focus-within:border-blue-500" type="button">
            {title}
            <IoIosArrowDown/>
        </button>
        <div className={`z-10 ${open?"":"hidden"} absolute bg-gray-700 divide-y divide-gray-100 shadow-sm w-full dark:bg-gray-700`}>
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" >
              {data.length>0&&
                data.map((data,index)=>{
                  return(
                    <li>
                      <Link to={""} className="block px-4 py-2 hover:bg-blue-600 text-white font-bold">{data?.name}</Link>
                    </li>
                  )
                })
              }
            </ul>
        </div>
    </div>
  )
}

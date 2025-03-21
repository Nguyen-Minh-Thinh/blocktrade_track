import React from 'react'

import { Checkbox, Label, Modal, TextInput } from "flowbite-react";
import { Link } from "react-router-dom";
import ButtonComponent from '../components/ButtonComponent';
const SignIn = ({openSI,setOpenSI, swapModels }) => {
  const customStyles = {
    "body": {
      "base": "relative bg-gray-950 h-full w-full p-4 md:h-auto",
    },
    "header": {
    "base": "flex bg-gray-950 items-start justify-between rounded-t border-b p-5 dark:border-gray-600",
    },
   "field":{
     "input":{
       "colors":{
        "custom-bg":"text-white bg-gray-800 placeholder-gray-600 focus:ring-gray-400 focus:border-gray-400 focus:placeholder-gray-400",
      }
     }
   }
  } 
  return (
    <>
    <Modal show={openSI} onClose={() => setOpenSI(false)} initialFocus size='md' popup theme={customStyles} >
      <Modal.Header />
      <Modal.Body>
        <div className="my-6 px-4 text-white">
          <h3 className="text-xl font-medium  dark:text-white text-center">Sign in</h3>
          <div>
            <div className="mb-2 mt-3 block">
              <Label className='text-white' htmlFor="email" value="Your email" />
            </div>
            <TextInput
              theme={customStyles}
              color='custom-bg'
              id="email"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <div className="mb-2 mt-3 block">
              <Label className='text-white' htmlFor="password" value="Your password" />
            </div>
            <TextInput color="custom-bg" theme={customStyles} id="password" type="password" required placeholder='Your password' />
          </div>
          <div className="flex justify-between my-2">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label className='text-white' htmlFor="remember">Remember me</Label>
            </div>
            <Link to="/" className="text-sm text-gray-500 hover:text-white hover:underline ">
              Lost Password?
            </Link>
          </div>
          <div className='flex justify-center my-4'>
            <div className="w-28">
              <ButtonComponent contentButton={"Log in"}></ButtonComponent>
            </div>
          </div>
          <div className="flex justify-center text-sm text-white dark:text-gray-300">
            Not registered?&nbsp;
            <p onClick={swapModels}  className="text-gray-500 font-medium hover:text-white hover:underline cursor-pointer pl-1" >
              Create account
            </p>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  </>
  )
}

export default SignIn
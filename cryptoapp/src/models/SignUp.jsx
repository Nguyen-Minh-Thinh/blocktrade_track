import React from 'react'
import { Label, Modal, TextInput } from "flowbite-react";
import ButtonComponent from '../components/ButtonComponent';
const SignUp = ({openSU, setOpenSU, swapModels}) => {
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
       <Modal show={openSU} onClose={() => {setOpenSU(false)}} initialFocus size='md' popup theme={customStyles} >
         <Modal.Header />
         <Modal.Body>
           <div className="my-6 px-4">
             <h3 className="text-xl font-medium text-white dark:text-white text-center">Sign up</h3>
             <div>
               <div className="mb-2 block mt-3">
                 <Label className="text-white" htmlFor="user" value="Your username" />
               </div>
               <TextInput
                  theme={customStyles}
                  color='custom-bg'
                 id="UserName"
                 placeholder="Enter your username"
                 required
               />
             </div>
             <div>
               <div className="mb-2 block mt-3">
                 <Label className="text-white" htmlFor="email" value="Your email" />
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
               <div className="mb-2 block mt-3">
                 <Label className="text-white" htmlFor="password" value="Password" />
               </div>
               <TextInput  theme={customStyles} color='custom-bg' id="password" placeholder="Enter your password" type="password" required />
             </div>
             <div>
               <div className="mb-2 block mt-3">
                 <Label className="text-white" htmlFor="password_cf" value="Password confirmation" />
               </div>
               <TextInput theme={customStyles} color='custom-bg' id="password_cf" placeholder="Confirm your password" type="password" required />
             </div>
             <div className='flex justify-center my-4'>
                <div className="w-28">
                  <ButtonComponent contentButton={"Sign Up"}></ButtonComponent>
                </div>
             </div>
             <div className="flex justify-center text-sm text-white dark:text-gray-300">
               Already have an account?&nbsp;
               <p onClick={swapModels} className="text-gray-500 font-medium hover:text-white hover:underline dark:text-cyan-500 cursor-pointer pl-1">
                 Sign in
               </p>
             </div>
           </div>
         </Modal.Body>
       </Modal>
     </>
  )
}

export default SignUp
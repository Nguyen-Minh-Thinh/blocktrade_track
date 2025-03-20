import React from 'react'
import { Button, Checkbox, Label, Modal, TextInput } from "flowbite-react";
const SignUp = ({openSU, setOpenSU, swapModels}) => {
  return (
      <>
       <Modal show={openSU} onClose={() => {setOpenSU(false)}} initialFocus popup>
         <Modal.Header />
         <Modal.Body>
           <div className="space-y-6">
             <h3 className="text-xl font-medium text-gray-900 dark:text-white">Sign up</h3>
             <div>
               <div className="mb-2 block">
                 <Label htmlFor="user" value="Your username" />
               </div>
               <TextInput
                 id="UserName"
                 placeholder="Enter your username"
                
                 required
               />
             </div>
             <div>
               <div className="mb-2 block">
                 <Label htmlFor="email" value="Your email" />
               </div>
               <TextInput
                 id="email"
                 placeholder="name@company.com"

                 required
               />
             </div>
             <div>
               <div className="mb-2 block">
                 <Label htmlFor="password" value="Password" />
               </div>
               <TextInput id="password" placeholder="Enter your password" type="password" required />
             </div>
             <div>
               <div className="mb-2 block">
                 <Label htmlFor="password_cf" value="Password confirmation" />
               </div>
               <TextInput id="password_cf" placeholder="Confirm your password" type="password" required />
             </div>
             <div className="w-full">
               <Button>Sign up</Button>
             </div>
             <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
               Already have an account?&nbsp;
               <p onClick={swapModels} className="text-cyan-700 hover:underline dark:text-cyan-500 cursor-pointer">
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
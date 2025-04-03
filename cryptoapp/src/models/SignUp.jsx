import React, { useState } from 'react';
import { Label, Modal, TextInput } from "flowbite-react";
import ButtonComponent from '../components/ButtonComponent';
import { register } from '../api/auth';
import { HiEye, HiEyeOff } from 'react-icons/hi'; // Add icons from react-icons
import { toast } from 'react-toastify';

const SignUp = ({openSU, setOpenSU, swapModels}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  console.log('formData', formData)
  const [error, setError] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); //Password hide/show status
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Show/hide confirm password status
  const customStyles = {
    "body": {
      "base": "relative bg-gray-950 h-full w-full p-4 md:h-auto",
    },
    "header": {
      "base": "flex bg-gray-950 items-start justify-between rounded-t border-b p-5 dark:border-gray-600",
    },
    "field": {
      "input": {
        "colors": {
          "custom-bg": "text-white bg-gray-800  placeholder-gray-600 focus:ring-gray-400 focus:border-gray-400 focus:placeholder-gray-400 autofill:bg-gray-800 autofill:text-white",
        }
      }
    }
  };

  const handleChange = (e) => {
  setError({
    ...error,
    [e.target.id]: e.target.value.length <= 0 ? "This value cannot be empty" : ""
  });
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // setError(null);
    let newErrors = { ...error };

    if (!formData.name.trim()) {
      newErrors.name = "This value cannot be empty";
    }
    if (!formData.username.trim()) {
      newErrors.username = "This value cannot be empty";
    }
    if (!formData.email.trim()) {
      newErrors.email = "This value cannot be empty";
    }
    if (!formData.password.trim()) {
      newErrors.password = "This value cannot be empty";
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "This value cannot be empty";
    }
    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setError(newErrors);
    if(newErrors.name === "" && newErrors.username === "" && newErrors.email === "" && newErrors.password === "" && newErrors.confirmPassword === ""){
      setLoading(true);
      try {
        await register(
          formData.name,
          formData.email,
          formData.username,
          formData.password,
          formData.confirmPassword
        );
        console.log('Register success')
        toast.success("Register success")
        setOpenSU(false);
        setFormData({name: '',email: '',username: '',password: '',confirmPassword: ''});
        swapModels();
      } catch (err) {
        toast.error(err.error)
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Modal show={openSU} onClose={() => {setOpenSU(false);setFormData({name: '',email: '',username: '',password: '',confirmPassword: ''});setError({name: '',email: '',username: '',password: '',confirmPassword: ''})}} initialFocus size='md' popup theme={customStyles}>
        <Modal.Header />
        <Modal.Body>
          <div className="my-2 px-4">
            <h3 className="text-xl font-medium text-white dark:text-white text-center">Sign up</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <div className="mb-2 block mt-3">
                  <Label className="text-white" htmlFor="name" value="Your name" />
                </div>
                <TextInput
                  theme={customStyles}
                  color='custom-bg'
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  
                />
                  {error.name !== ""&&
                    <span className="text-red-500 text-xs text-center mt-2">{error.name}</span>
                  }
              </div>
              <div>
                <div className="mb-2 block mt-2">
                  <Label className="text-white" htmlFor="username" value="Your Username" />
                </div>
                <TextInput
                  theme={customStyles}
                  color='custom-bg'
                  id="username"
                  placeholder="Enter your Username"
                  value={formData.username}
                  onChange={handleChange}
                  
                />
                {error.username !== ""&&
                  <span className="text-red-500 text-xs text-center mt-2">{error.username}</span>
                }
              </div>
              <div>
                <div className="mb-2 block mt-2">
                  <Label className="text-white" htmlFor="email" value="Your email" />
                </div>
                <TextInput
                  theme={customStyles}
                  color='custom-bg'
                  id="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  
                />
                {error.email !== ""&&
                    <span className="text-red-500 text-xs text-center mt-2">{error.email}</span>
                  }
              </div>
              <div className="relative">
                <div className="mb-2 block mt-2">
                  <Label className="text-white" htmlFor="password" value="Password" />
                </div>
                <TextInput
                  theme={customStyles}
                  color='custom-bg'
                  id="password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6 text-gray-400 hover:text-white"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
                {error.password !== ""&&
                    <span className="text-red-500 text-xs text-center mt-2">{error.password}</span>
                  }
              </div>
              <div className="relative">
                <div className="mb-2 block mt-2">
                  <Label className="text-white" htmlFor="confirmPassword" value="Password confirmation" />
                </div>
                <TextInput
                  theme={customStyles}
                  color='custom-bg'
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6 text-gray-400 hover:text-white"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
                {error.confirmPassword !== ""&&
                    <span className="text-red-500 text-xs text-center mt-2">{error.confirmPassword}</span>
                  }
                  
              </div>
              <div className='flex justify-center my-4'>
                <div className="w-28">
                  <ButtonComponent 
                    contentButton={loading ? "Signing Up..." : "Sign Up"}
                    disabled={loading}
                  />
                </div>
              </div>
            </form>
            <div className="flex justify-center text-sm text-white dark:text-gray-300">
              Already have an account? 
              <p onClick={swapModels} className="text-gray-500 font-medium hover:text-white hover:underline dark:text-cyan-500 cursor-pointer pl-1">
                Sign in
              </p>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SignUp;
import React, { useState } from 'react';
import { Checkbox, Label, Modal, TextInput } from "flowbite-react";
import { Link } from "react-router-dom";
import ButtonComponent from '../components/ButtonComponent';
import { login } from '../api/auth';
import { HiEye, HiEyeOff } from 'react-icons/hi'; // Add icons from react-icons
import { checkAuth } from '../api/auth'

const SignIn = ({ openSI, setOpenSI, swapModels, setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Password hide/show status

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
          "custom-bg": "text-white bg-gray-800 placeholder-gray-600 focus:ring-gray-400 focus:border-gray-400 focus:placeholder-gray-400",
        }
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(
        formData.username,
        formData.password
      );
      setOpenSI(false);
      const userData = await checkAuth(); // Lấy thông tin người dùng sau khi đăng nhập
      setUser(userData); // Cập nhật state user trong HeaderComponent
      setOpenSI(false)
    } catch (err) {
      setError(err.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal show={openSI} onClose={() => setOpenSI(false)} initialFocus size='md' popup theme={customStyles}>
        <Modal.Header />
        <Modal.Body>
          <div className="my-6 px-4 text-white">
            <h3 className="text-xl font-medium dark:text-white text-center">Sign in</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <div className="mb-2 mt-3 block">
                  <Label className='text-white' htmlFor="username" value="Your Username/Email" />
                </div>
                <TextInput
                  theme={customStyles}
                  color='custom-bg'
                  id="username"
                  placeholder="Enter your Username/Email"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="relative">
                <div className="mb-2 mt-3 block">
                  <Label className='text-white' htmlFor="password" value="Your password" />
                </div>
                <TextInput
                  theme={customStyles}
                  color='custom-bg'
                  id="password"
                  type={showPassword ? 'text' : 'password'} // Toggle between text and password
                  placeholder='Enter your password'
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6 text-gray-400 hover:text-white"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
              {error && (
                <div className="text-red-500 text-center mt-2">
                  {error}
                </div>
              )}
              <div className="flex justify-between my-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label className='text-white' htmlFor="remember">Remember me</Label>
                </div>
                <Link to="/" className="text-sm text-gray-500 hover:text-white hover:underline">
                  Lost Password?
                </Link>
              </div>
              <div className='flex justify-center my-4'>
                <div className="w-28">
                  <ButtonComponent 
                    contentButton={loading ? "Logging in..." : "Log in"}
                    disabled={loading}
                  />
                </div>
              </div>
            </form>
            <div className="flex justify-center text-sm text-white dark:text-gray-300">
              Not registered? 
              <p onClick={swapModels} className="text-gray-500 font-medium hover:text-white hover:underline cursor-pointer pl-1">
                Create account
              </p>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SignIn;
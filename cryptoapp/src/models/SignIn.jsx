import React, { useState } from 'react';
import { Checkbox, Label, Modal, TextInput } from "flowbite-react";
import { Link } from "react-router-dom";
import ButtonComponent from '../components/ButtonComponent';
import { login } from '../api/auth';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { checkAuth } from '../api/auth';
import { toast } from 'react-toastify';

const SignIn = ({ openSI, setOpenSI, swapModels, setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false, // Add remember field to formData
  });
  const [error, setError] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    const { id, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setError({
      ...error,
      [id]: newValue.length <= 0 && id !== 'remember' ? "This value cannot be empty" : ""
    });
    setFormData({
      ...formData,
      [id]: newValue
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = { username: '', password: '' };
    if (!formData.username.trim()) {
      newErrors.username = "This value cannot be empty";
    }
    if (!formData.password.trim()) {
      newErrors.password = "This value cannot be empty";
    }
    setError(newErrors);

    if (newErrors.username === "" && newErrors.password === "") {
      setLoading(true);
      try {
        await login(
          formData.username,
          formData.password,
          formData.remember // Pass the "remember" option to the login function
        );
        setOpenSI(false);
        toast.success("Login successful", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
        setFormData({ username: '', password: '', remember: false });
        setError({ username: '', password: '' });
        const userData = await checkAuth();
        setUser(userData);
      } catch (err) {
        toast.error(err.error || 'Login failed', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setOpenSI(false);
    setFormData({ username: '', password: '', remember: false });
    setError({ username: '', password: '' });
    setLoading(false); // Reset loading state on close
  };

  return (
    <>
      <Modal show={openSI} onClose={handleClose} initialFocus size='md' popup theme={customStyles}>
        <Modal.Header />
        <Modal.Body>
          <div className="my-2 px-4 text-white">
            <h3 className="text-xl font-medium dark:text-white text-center">Sign in</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <div className="mb-2 mt-2 block">
                  <Label className='text-white' htmlFor="username" value="Your Username/Email" />
                </div>
                <TextInput
                  theme={customStyles}
                  color='custom-bg'
                  id="username"
                  placeholder="Enter your Username/Email"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading} // Disable input during loading
                />
                {error.username !== "" && (
                  <span className="text-red-500 text-xs text-center mt-2">{error.username}</span>
                )}
              </div>
              <div className="relative">
                <div className="mb-2 mt-2 block">
                  <Label className='text-white' htmlFor="password" value="Your password" />
                </div>
                <TextInput
                  theme={customStyles}
                  color='custom-bg'
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading} // Disable input during loading
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6 text-gray-400 hover:text-white"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
                {error.password !== "" && (
                  <span className="text-red-500 text-xs text-center mt-2">{error.password}</span>
                )}
              </div>
              <div className="flex justify-between my-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <Label className='text-white' htmlFor="remember">Remember me</Label>
                </div>
                <Link
                  to="/forgot"
                  onClick={handleClose}
                  className="text-sm text-gray-500 hover:text-white hover:underline"
                >
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
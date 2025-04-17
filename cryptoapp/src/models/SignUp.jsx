import React, { useState } from 'react';
import { Label, Modal, TextInput } from "flowbite-react";
import ButtonComponent from '../components/ButtonComponent';
import { register } from '../api/auth';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { toast } from 'react-toastify';

const SignUp = ({ openSU, setOpenSU, swapModels }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          "custom-bg": "text-white bg-gray-800 placeholder-gray-600 focus:ring-gray-400 focus:border-gray-400 focus:placeholder-gray-400 autofill:bg-gray-800 autofill:text-white",
        }
      }
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    let newError = value.length <= 0 ? "This value cannot be empty" : "";

    // Additional validation for email
    if (id === "email" && value.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        newError = "Please enter a valid email address";
      }
    }

    // Additional validation for password
    if (id === "password" && value.length > 0) {
      if (value.length < 8) {
        newError = "Password must be at least 8 characters long";
      }
    }

    setError({
      ...error,
      [id]: newError
    });
    setFormData({
      ...formData,
      [id]: value
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

    let newErrors = { name: '', email: '', username: '', password: '', confirmPassword: '' };

    if (!formData.name.trim()) {
      newErrors.name = "This value cannot be empty";
    }
    if (!formData.username.trim()) {
      newErrors.username = "This value cannot be empty";
    }
    if (!formData.email.trim()) {
      newErrors.email = "This value cannot be empty";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    if (!formData.password.trim()) {
      newErrors.password = "This value cannot be empty";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "This value cannot be empty";
    }
    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setError(newErrors);

    if (Object.values(newErrors).every(err => err === "")) {
      setLoading(true);
      try {
        await register(
          formData.name,
          formData.email,
          formData.username,
          formData.password,
          formData.confirmPassword
        );
        toast.success("Registration successful", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
        setOpenSU(false);
        setFormData({ name: '', email: '', username: '', password: '', confirmPassword: '' });
        setError({ name: '', email: '', username: '', password: '', confirmPassword: '' });
        swapModels();
      } catch (err) {
        toast.error(err.error || 'Registration failed', {
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
    setOpenSU(false);
    setFormData({ name: '', email: '', username: '', password: '', confirmPassword: '' });
    setError({ name: '', email: '', username: '', password: '', confirmPassword: '' });
    setLoading(false);
  };

  return (
    <>
      <Modal show={openSU} onClose={handleClose} initialFocus size='md' popup theme={customStyles}>
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
                  disabled={loading}
                />
                {error.name !== "" && (
                  <span className="text-red-500 text-xs text-center mt-2">{error.name}</span>
                )}
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
                  disabled={loading}
                />
                {error.username !== "" && (
                  <span className="text-red-500 text-xs text-center mt-2">{error.username}</span>
                )}
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
                  disabled={loading}
                />
                {error.email !== "" && (
                  <span className="text-red-500 text-xs text-center mt-2">{error.email}</span>
                )}
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
                  disabled={loading}
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
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6 text-gray-400 hover:text-white"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={loading}
                >
                  {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
                {error.confirmPassword !== "" && (
                  <span className="text-red-500 text-xs text-center mt-2">{error.confirmPassword}</span>
                )}
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
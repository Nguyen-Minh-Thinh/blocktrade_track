import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage  = () => {
    const [message, setMessage] = useState({password: '', passwordConfirm: ''});
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
      if (!password.trim() || !passwordConfirm.trim()) {
        setMessage({password:'This value cannot be empty',passwordConfirm: 'This value cannot be empty'});
        setLoading(false);
        return;
      }
      if (password !== passwordConfirm) {
        setMessage({password:'',passwordConfirm: 'Passwords do not match'});
        setLoading(false);
        return;
      }
      setLoading(false);
      navigate('/');
      setMessage('');

  };
  return (
    <div className=" relative min-h-screen flex items-center justify-center bg-gray-900/50 text-white">
      <div className=" bg-gray-950 p-6 rounded-lg shadow-lg w-[450px]">
        <h2 className="text-2xl text-white font-semibold text-center mb-4">Reset password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder='Password'
                className="w-full bg-gray-800 px-4 text-sm py-3 mt-1 placeholder-gray-600 rounded-lg focus:ring-gray-400 focus:border-gray-400 focus:placeholder-gray-400"
                
              />
              {message !=="" && (
                  <p className="text-sm text-red-500 mt-2">
                  {message.password}
                  </p>
              )}
            </div>
            <div>
              <label htmlFor="passwordconfi" className="block text-sm font-medium text-white">Password Confirmation</label>
              <input
                type="password"
                onChange={(e) => setPasswordConfirm(e.target.value)}
                value={passwordConfirm}
                placeholder='Password Confirmation'
                className="w-full bg-gray-800 px-4 text-sm py-3 mt-1 placeholder-gray-600 rounded-lg focus:ring-gray-400 focus:border-gray-400 focus:placeholder-gray-400"
                
              />
              {message !=="" && (
                  <p className="text-sm text-red-500 mt-2">
                  {message.passwordConfirm}
                  </p>
              )}
            </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-white text-black font-bold text-[14px] rounded-lg"
          >
            {loading ? 'Loading...' : "Apply"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({email: '', code: ''});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [checkbutton, setCheckButton] = useState(true);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkbutton) {
      if (!email.trim()) {
        setMessage({email:'This value cannot be empty', code: ''});
        setLoading(false);
        return;
      }

      setLoading(false);
      setMessage({email: '', code: ''});
      setCheckButton(false);
    }else{
      if (!code.trim()) {
        setMessage({email:'',code:'This value cannot be empty'});
        setLoading(false);
        return;
      }
      navigate('/resetpass');
      setMessage({email: '', code: ''});
      setLoading(false);
    }
    
    
  };

  return (
    <div className=" relative min-h-screen flex items-center justify-center bg-gray-900/50 text-white">
      <div className=" bg-gray-950 p-6 rounded-lg shadow-lg w-[450px]">
        <h2 className="text-2xl text-white font-semibold text-center mb-4">Forgot your password?</h2>
        {checkbutton && 
          <p className='text-[13px] text-gray-400 mb-4  '>Enter your email below, you will receive an email with instructions on how to reset your password in a few minutes. You can also set a new password if you’ve never set one before.</p>
        }
        <form onSubmit={handleSubmit} className="space-y-4">
          {checkbutton ? 
          (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">Enter your e-mail address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder='Enter your e-mail address '
                className="w-full bg-gray-800 px-4 text-sm py-3 mt-1 placeholder-gray-600 rounded-lg focus:ring-gray-400 focus:border-gray-400 focus:placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                
              />
              {message.email !=="" && (
                  <p className="text-sm text-red-500 mt-2">
                  {message.email}
                  </p>
              )}
            </div>
          ):
          (
            <div>
              <p className='text-[13px] text-gray-400 mb-4'>The code was sent to your mail</p>
              <label htmlFor="code" className="block text-sm font-medium text-white">Enter code</label>
              <input
                type="text"         
                placeholder='Enter code'
                className="w-full bg-gray-800 px-4 text-sm py-3 mt-1 placeholder-gray-600 rounded-lg focus:ring-gray-400 focus:border-gray-400 focus:placeholder-gray-400"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                
              />
              {message.code !=="" && (
                  <p className="text-sm text-red-500 mt-2">
                  {message.code}
                  </p>
              )}      
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-white text-black font-bold text-[14px] rounded-lg"
          >
            {loading ? 'Loading...' : checkbutton ? 'Send Instructions': "Continue"}
          </button>
        </form>
        <p onClick={() => {checkbutton ? navigate("/") : setCheckButton(true)}} className="text-sm text-start text-gray-400 hover:text-gray-100 mt-4 cursor-pointer block">&lt;&lt; Back</p>
      </div>
    </div>
  );
};

export default ForgotPassPage;

// src/views/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

export const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      alert(result.error.message);
    } else {
      onLoginSuccess(result.data.user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleAuth} className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold text-center text-gray-800">
          {isSignUp ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập PMS'}
        </h2>
        <div>
          <label className="text-xs font-semibold text-gray-600">Email</label>
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">Mật khẩu</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm">
          {isSignUp ? 'Tạo Tài Khoản' : 'Đăng Nhập'}
        </button>
        <p 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-center text-xs text-blue-600 cursor-pointer font-medium pt-2"
        >
          {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
        </p>
      </form>
    </div>
  );
};
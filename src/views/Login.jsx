// src/views/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

export const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

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
          <input 
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-sm mt-1"
          />
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
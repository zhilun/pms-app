// src/components/Header.jsx
import React from 'react';
import { supabase } from '../services/supabase';

export const Header = ({ title, currentUser }) => {
  const handleLogout = async () => {
    const confirmLogout = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
    if (confirmLogout) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert('Lỗi đăng xuất: ' + error.message);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {currentUser?.email && (
          <p className="text-[10px] text-gray-500">{currentUser.email}</p>
        )}
      </div>

      {currentUser && (
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 active:scale-95 transition"
        >
          <span>🚪 Đăng xuất</span>
        </button>
      )}
    </header>
  );
};
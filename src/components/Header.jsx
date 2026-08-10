// components/Header.jsx
import React from 'react';

export const Header = ({ title, driveStatus, onSyncDrive }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      <button 
        onClick={onSyncDrive}
        className="flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-full bg-gray-100 active:bg-gray-200 transition"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${driveStatus ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
        <span className="text-gray-700">{driveStatus ? 'Đã đồng bộ' : 'Drive: Chưa kết nối'}</span>
      </button>
    </header>
  );
};
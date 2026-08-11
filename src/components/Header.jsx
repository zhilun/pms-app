// src/components/Header.jsx
import React from 'react';

export const Header = ({ title, driveStatus, onConnectDrive, onRestoreDrive }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      
      <div className="flex items-center gap-2">
        {driveStatus ? (
          <button 
            onClick={onRestoreDrive}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 active:scale-95 transition"
            title="Bấm để tải dữ liệu từ Drive về"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Đã kết nối (Tải DB)</span>
          </button>
        ) : (
          <button 
            onClick={onConnectDrive}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-600 text-white shadow-sm active:scale-95 transition"
          >
            <span>🔗 Kết nối Drive</span>
          </button>
        )}
      </div>
    </header>
  );
};
// src/components/BottomNav.jsx
import React from 'react';

export const BottomNav = ({ activeTab, setActiveTab, pendingCount }) => {
  const navItems = [
    { id: 'booking', label: 'Đặt Phòng', icon: '➕' },
    { id: 'pending', label: 'Pending', icon: '⏳', badge: pendingCount },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'sales', label: 'Khai Báo Sales', icon: '👤' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50 pb-safe">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`relative flex flex-col items-center gap-1 text-xs font-medium transition ${
            activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span>{item.label}</span>
          {item.badge > 0 && (
            <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};
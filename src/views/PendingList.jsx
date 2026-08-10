// views/PendingList.jsx
import React, { useState } from 'react';

export const PendingList = ({ pendingBookings, onApproveBooking }) => {
  const [confirmCodes, setConfirmCodes] = useState({});

  const handleCodeChange = (id, value) => {
    setConfirmCodes(prev => ({ ...prev, [id]: value }));
  };

  const handleApprove = (id) => {
    const code = confirmCodes[id];
    if (!code || !code.trim()) {
      alert('Vui lòng nhập Mã Xác Nhận trước khi duyệt!');
      return;
    }
    onApproveBooking(id, code.trim());
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto space-y-3">
      {pendingBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-sm">Không có đơn hàng nào chờ duyệt!</p>
        </div>
      ) : (
        pendingBookings.map((b) => (
          <div key={b.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{b.customerName}</h3>
                <p className="text-xs text-gray-500">Phòng: <span className="font-semibold text-blue-600">{b.roomCode}</span> | Sales: {b.salesPerson}</p>
              </div>
              <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full">
                PENDING
              </span>
            </div>

            <div className="text-xs text-gray-600 grid grid-cols-2 gap-1 bg-gray-50 p-2.5 rounded-xl">
              <div>Lịch: {b.checkInDate} ➔ {b.checkOutDate}</div>
              <div className="text-right">Cọc: <span className="font-semibold">{b.deposit.toLocaleString()} VNĐ</span></div>
              <div className="col-span-2 font-medium text-gray-900">Tổng tiền: {b.totalPrice.toLocaleString()} VNĐ</div>
            </div>

            {/* Ô nhập mã & Duyệt nhanh */}
            <div className="flex gap-2 pt-1">
              <input 
                type="text" 
                placeholder="Nhập mã xác nhận..." 
                value={confirmCodes[b.id] || ''}
                onChange={(e) => handleCodeChange(b.id, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button 
                onClick={() => handleApprove(b.id)}
                className="bg-green-600 active:bg-green-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-sm"
              >
                Duyệt
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
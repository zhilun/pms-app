// views/PendingList.jsx
import React, { useState } from 'react';

const formatCurrencyInput = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/\D/g, '');
  return numStr ? Number(numStr).toLocaleString('en-US') : '';
};

const parseCurrencyValue = (valStr) => {
  if (!valStr) return 0;
  return Number(String(valStr).replace(/\D/g, '')) || 0;
};

export const PendingList = ({ pendingBookings = [], onApproveBooking, onEditBooking, salesList = [] }) => {
  const [confirmCodes, setConfirmCodes] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

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

  const handleStartEdit = (b) => {
    setEditingId(b.id);
    setEditData({
      customerName: b.customerName || b.customer_name || '',
      roomCode: b.roomCode || b.room_code || '',
      bedrooms: b.bedrooms || 1,
      checkInDate: b.checkInDate || b.check_in_date || '',
      checkOutDate: b.checkOutDate || b.check_out_date || '',
      roomPriceStr: formatCurrencyInput(b.roomPrice ?? b.room_price ?? 0),
      depositStr: formatCurrencyInput(b.deposit ?? 0),
      salesPerson: b.salesPerson || b.sales_person || ''
    });
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleMoneyChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: formatCurrencyInput(value) }));
  };

  const calculateEditNights = () => {
    if (!editData.checkInDate || !editData.checkOutDate) return 0;
    const start = new Date(editData.checkInDate);
    const end = new Date(editData.checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const editNights = calculateEditNights();
  const editBedroomsNum = Number(editData.bedrooms) || 1;
  const editServiceFee = editBedroomsNum * editNights * 350000;
  const editRoomPrice = parseCurrencyValue(editData.roomPriceStr);
  const editDeposit = parseCurrencyValue(editData.depositStr);
  const editTotalPrice = editRoomPrice * editNights;
  const editRemainingPrice = editTotalPrice - editDeposit;

  const handleSaveEdit = (bookingId) => {
    if (!editData.customerName?.trim() || !editData.roomCode?.trim()) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (editNights <= 0) {
      alert('Ngày Check-Out phải sau ngày Check-In ít nhất 1 ngày!');
      return;
    }

    const updatedBooking = {
      salesPerson: editData.salesPerson,
      customerName: editData.customerName,
      roomCode: editData.roomCode,
      bedrooms: editBedroomsNum,
      checkInDate: editData.checkInDate,
      checkOutDate: editData.checkOutDate,
      roomPrice: editRoomPrice,
      deposit: editDeposit,
      serviceFee: editServiceFee,
      totalPrice: editTotalPrice,
      remainingPrice: editRemainingPrice
    };

    onEditBooking(bookingId, updatedBooking);
    setEditingId(null);
    setEditData({});
    alert('Cập nhật đơn đặt phòng thành công!');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto space-y-3">
      {(!pendingBookings || pendingBookings.length === 0) ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-sm">Không có đơn hàng nào chờ duyệt!</p>
        </div>
      ) : (
        pendingBookings.map((b) => {
          // Trích xuất dữ liệu an toàn cho cả 2 kiểu đặt tên biến (CamelCase & Snake_case)
          const customerName = b.customerName || b.customer_name || 'Khách không tên';
          const roomCode = b.roomCode || b.room_code || '---';
          const salesPerson = b.salesPerson || b.sales_person || '---';
          const checkInDate = b.checkInDate || b.check_in_date || '---';
          const checkOutDate = b.checkOutDate || b.check_out_date || '---';
          const deposit = Number(b.deposit ?? 0);
          const totalPrice = Number(b.totalPrice ?? b.total_price ?? 0);

          return (
            <div key={b.id}>
              {editingId === b.id ? (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-3">
                  <h3 className="font-bold text-gray-900 text-sm">Chỉnh Sửa Đơn Đặt Phòng</h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Tên Khách (*)</label>
                      <input
                        type="text"
                        value={editData.customerName || ''}
                        onChange={(e) => handleEditChange('customerName', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Mã Phòng (*)</label>
                      <input
                        type="text"
                        value={editData.roomCode || ''}
                        onChange={(e) => handleEditChange('roomCode', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">NV Sales</label>
                    <select
                      value={editData.salesPerson || ''}
                      onChange={(e) => handleEditChange('salesPerson', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs mt-1"
                    >
                      <option value="">-- Chọn Sales Person --</option>
                      {salesList?.map((s, idx) => (
                        <option key={idx} value={s.name}>{s.name} ({s.company})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Phòng Ngủ</label>
                      <input
                        type="number"
                        min="1"
                        value={editData.bedrooms || 1}
                        onChange={(e) => handleEditChange('bedrooms', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Check-In</label>
                      <input
                        type="date"
                        value={editData.checkInDate || ''}
                        onChange={(e) => handleEditChange('checkInDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Check-Out</label>
                      <input
                        type="date"
                        value={editData.checkOutDate || ''}
                        onChange={(e) => handleEditChange('checkOutDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Giá Phòng (VNĐ)</label>
                      <input
                        type="text"
                        value={editData.roomPriceStr || '0'}
                        onChange={(e) => handleMoneyChange('roomPriceStr', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs mt-1 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Tiền Cọc (VNĐ)</label>
                      <input
                        type="text"
                        value={editData.depositStr || '0'}
                        onChange={(e) => handleMoneyChange('depositStr', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs mt-1 font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg space-y-1.5 text-xs border border-blue-300">
                    <div className="flex justify-between text-gray-600">
                      <span>Thời gian ở:</span>
                      <span className="font-semibold text-gray-900">{editNights} đêm</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Phí Dịch Vụ:</span>
                      <span className="font-semibold text-gray-900">{editServiceFee.toLocaleString('en-US')} VNĐ</span>
                    </div>
                    <div className="flex justify-between text-gray-800 pt-1 border-t border-blue-200">
                      <span>Tổng Tiền:</span>
                      <span className="font-bold text-gray-900">{editTotalPrice.toLocaleString('en-US')} VNĐ</span>
                    </div>
                    <div className="flex justify-between text-blue-700">
                      <span>Còn Phải Thu:</span>
                      <span className="font-bold text-blue-700">{editRemainingPrice.toLocaleString('en-US')} VNĐ</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleSaveEdit(b.id)}
                      className="flex-1 bg-green-600 active:bg-green-700 text-white font-semibold text-xs px-3 py-2 rounded-lg"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-400 active:bg-gray-500 text-white font-semibold text-xs px-3 py-2 rounded-lg"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{customerName}</h3>
                      <p className="text-xs text-gray-500">Phòng: <span className="font-semibold text-blue-600">{roomCode}</span> | Sales: {salesPerson}</p>
                    </div>
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full">
                      PENDING
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 grid grid-cols-2 gap-1 bg-gray-50 p-2.5 rounded-xl">
                    <div>Lịch: {checkInDate} ➔ {checkOutDate}</div>
                    <div className="text-right">Cọc: <span className="font-semibold">{deposit.toLocaleString('en-US')} VNĐ</span></div>
                    <div className="col-span-2 font-medium text-gray-900">Tổng tiền: {totalPrice.toLocaleString('en-US')} VNĐ</div>
                  </div>

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
                      className="bg-green-600 active:bg-green-700 text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-sm"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleStartEdit(b)}
                      className="bg-amber-600 active:bg-amber-700 text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-sm"
                    >
                      Sửa
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
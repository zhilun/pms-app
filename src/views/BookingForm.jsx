// views/BookingForm.jsx
import React, { useState, useEffect } from 'react';

export const BookingForm = ({ salesList, onSaveBooking, existingBookings, onOpenAddSales }) => {
  const [formData, setFormData] = useState({
    salesPerson: '',
    customerName: '',
    roomCode: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: '',
    roomPrice: 0,
    serviceFee: 0,
    deposit: 0,
    confirmationCode: ''
  });

  const [warning, setWarning] = useState('');

  // Tự động tính toán (Real-time Calculation)
  const totalPrice = Number(formData.roomPrice || 0) + Number(formData.serviceFee || 0);
  const remainingPrice = totalPrice - Number(formData.deposit || 0);

  // Check trùng lịch phòng
  useEffect(() => {
    if (formData.roomCode && formData.checkInDate && formData.checkOutDate) {
      const isOverlap = existingBookings.some(b => 
        b.roomCode.toLowerCase() === formData.roomCode.toLowerCase() &&
        !(formData.checkOutDate <= b.checkInDate || formData.checkInDate >= b.checkOutDate)
      );
      if (isOverlap) {
        setWarning(`⚠️ Cảnh báo: Phòng ${formData.roomCode} đã có lịch đặt trùng khoảng thời gian này!`);
      } else {
        setWarning('');
      }
    }
  }, [formData.roomCode, formData.checkInDate, formData.checkOutDate, existingBookings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBooking = {
      id: crypto.randomUUID(),
      createdDate: new Date().toISOString().split('T')[0],
      ...formData,
      roomPrice: Number(formData.roomPrice),
      serviceFee: Number(formData.serviceFee),
      deposit: Number(formData.deposit),
      totalPrice,
      remainingPrice,
      // Quy tắc Trạng thái (status logic)
      status: formData.confirmationCode.trim() !== '' ? 'CONFIRMED' : 'PENDING',
      updatedAt: new Date().toISOString()
    };

    onSaveBooking(newBooking);
    alert('Tạo đơn đặt phòng thành công!');
    // Reset form
    setFormData({
      salesPerson: '', customerName: '', roomCode: '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: '', roomPrice: 0, serviceFee: 0, deposit: 0, confirmationCode: ''
    });
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto space-y-4">
      {warning && (
        <div className="p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-800 text-sm rounded-r shadow-sm">
          {warning}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        {/* Sales Person Selection */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-gray-600">NV Sales (*)</label>
            <button type="button" onClick={onOpenAddSales} className="text-xs text-blue-600 font-medium">+ Thêm Sales</button>
          </div>
          <select 
            required
            value={formData.salesPerson} 
            onChange={e => setFormData({...formData, salesPerson: e.target.value})}
            className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          >
            <option value="">-- Chọn Sales Person --</option>
            {salesList.map((s, idx) => (
              <option key={idx} value={s.name}>{s.name} ({s.company})</option>
            ))}
          </select>
        </div>

        {/* Khách hàng & Phòng */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Tên Khách Hang (*)</label>
            <input 
              required type="text" placeholder="Nguyễn Văn A" 
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Mã Phòng (*)</label>
            <input 
              required type="text" placeholder="P101 / Villa 01" 
              value={formData.roomCode}
              onChange={e => setFormData({...formData, roomCode: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Check-in / Check-out */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Ngày Check-In (*)</label>
            <input 
              required type="date" 
              value={formData.checkInDate}
              onChange={e => setFormData({...formData, checkInDate: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Ngày Check-Out (*)</label>
            <input 
              required type="date" 
              value={formData.checkOutDate}
              onChange={e => setFormData({...formData, checkOutDate: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Tiền phòng & Dịch vụ */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Giá Phòng (VNĐ)</label>
            <input 
              type="number" min="0"
              value={formData.roomPrice}
              onChange={e => setFormData({...formData, roomPrice: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Phí Dịch Vụ (VNĐ)</label>
            <input 
              type="number" min="0"
              value={formData.serviceFee}
              onChange={e => setFormData({...formData, serviceFee: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Tiền cọc */}
        <div>
          <label className="text-xs font-semibold text-gray-600">Tiền Cọc Đã Trả (VNĐ)</label>
          <input 
            type="number" min="0"
            value={formData.deposit}
            onChange={e => setFormData({...formData, deposit: e.target.value})}
            className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
          />
        </div>

        {/* Card Tính toán tự động */}
        <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs text-gray-600 border border-gray-200">
          <div className="flex justify-between">
            <span>Tổng Giá Trị (totalPrice):</span>
            <span className="font-bold text-gray-900">{totalPrice.toLocaleString()} VNĐ</span>
          </div>
          <div className="flex justify-between">
            <span>Cần Thanh Toán (remainingPrice):</span>
            <span className="font-bold text-blue-600">{remainingPrice.toLocaleString()} VNĐ</span>
          </div>
        </div>

        {/* Mã xác nhận */}
        <div>
          <label className="text-xs font-semibold text-gray-600">Mã Xác Nhận Booking (Nếu có)</label>
          <input 
            type="text" placeholder="Nhập mã để CONFIRM ngay..." 
            value={formData.confirmationCode}
            onChange={e => setFormData({...formData, confirmationCode: e.target.value})}
            className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
          />
          <p className="text-[10px] text-gray-400 mt-1">*Để trống đơn sẽ ở trạng thái PENDING</p>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md active:scale-[0.98] transition"
        >
          Lưu Đơn Đặt Phòng
        </button>
      </form>
    </div>
  );
};
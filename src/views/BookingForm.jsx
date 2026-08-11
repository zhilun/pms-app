// src/views/BookingForm.jsx
import React, { useState, useEffect } from 'react';

// Hàm hỗ trợ format tiền tệ (Ví dụ: 1000000 -> "1,000,000")
const formatCurrencyInput = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/\D/g, '');
  return numStr ? Number(numStr).toLocaleString('en-US') : '';
};

// Hàm chuyển chuỗi formatted ("1,000,000") về Số (1000000)
const parseCurrencyValue = (valStr) => {
  if (!valStr) return 0;
  return Number(String(valStr).replace(/\D/g, '')) || 0;
};

export const BookingForm = ({ salesList, onSaveBooking, existingBookings, onOpenAddSales }) => {
  const [formData, setFormData] = useState({
    salesPerson: '',
    customerName: '',
    roomCode: '',
    bedrooms: 1, // Mặc định 1 phòng ngủ
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: '',
    roomPriceStr: '0',
    depositStr: '0',
    confirmationCode: ''
  });

  const [warning, setWarning] = useState('');

  // 1. Tính số đêm (Nights) từ checkInDate và checkOutDate
  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const start = new Date(formData.checkInDate);
    const end = new Date(formData.checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();

  // 2. Tự động tính Phí Dịch Vụ: Số phòng ngủ x Số đêm x 350,000
  const bedroomsNum = Number(formData.bedrooms) || 0;
  const autoServiceFee = bedroomsNum * nights * 350000;

  // 3. Tổng Giá Trị = Giá Phòng (không cộng phí dịch vụ)
  const roomPriceNum = parseCurrencyValue(formData.roomPriceStr);
  const totalPrice = roomPriceNum;

  // 4. Còn Phải Thu = Tổng Giá Trị - Tiền Cọc
  const depositNum = parseCurrencyValue(formData.depositStr);
  const remainingPrice = totalPrice - depositNum;

  // Kiểm tra trùng lịch phòng
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

  // Xử lý thay đổi tiền tệ ở input
  const handleMoneyChange = (fieldStr, rawValue) => {
    const formatted = formatCurrencyInput(rawValue);
    setFormData(prev => ({ ...prev, [fieldStr]: formatted }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nights <= 0) {
      alert('Ngày Check-Out phải sau ngày Check-In ít nhất 1 ngày!');
      return;
    }

    const newBooking = {
      id: crypto.randomUUID(),
      createdDate: new Date().toISOString().split('T')[0],
      salesPerson: formData.salesPerson,
      customerName: formData.customerName,
      roomCode: formData.roomCode,
      bedrooms: bedroomsNum,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      roomPrice: roomPriceNum,
      serviceFee: autoServiceFee,
      totalPrice: totalPrice,
      deposit: depositNum,
      remainingPrice: remainingPrice,
      confirmationCode: formData.confirmationCode,
      status: formData.confirmationCode.trim() !== '' ? 'CONFIRMED' : 'PENDING',
      updatedAt: new Date().toISOString()
    };

    onSaveBooking(newBooking);
    alert('Tạo đơn đặt phòng thành công!');
    
    // Reset form
    setFormData({
      salesPerson: '',
      customerName: '',
      roomCode: '',
      bedrooms: 1,
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: '',
      roomPriceStr: '0',
      depositStr: '0',
      confirmationCode: ''
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
        {/* Nhân Viên Sales */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-gray-600">NV Sales (*)</label>
            <button type="button" onClick={onOpenAddSales} className="text-xs text-blue-600 font-medium">+ Khai Báo Sales</button>
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

        {/* Khách Hàng & Mã Phòng */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Tên Khách Hàng (*)</label>
            <input 
              required type="text" placeholder="Nguyễn Văn A" 
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Mã Phòng / Số Phòng (*)</label>
            <input 
              required type="text" placeholder="P101 / Villa 01" 
              value={formData.roomCode}
              onChange={e => setFormData({...formData, roomCode: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Số Phòng Ngủ & Lịch Check-In / Check-Out */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-semibold text-gray-600">Số Phòng Ngủ (*)</label>
            <input 
              required type="number" min="1"
              value={formData.bedrooms}
              onChange={e => setFormData({...formData, bedrooms: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div>
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

        {/* Nhập Giá Phòng & Tiền Cọc (Định dạng tiền tệ) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Giá Phòng (VNĐ)</label>
            <input 
              type="text"
              placeholder="0"
              value={formData.roomPriceStr}
              onChange={e => handleMoneyChange('roomPriceStr', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Tiền Cọc Đã Trả (VNĐ)</label>
            <input 
              type="text"
              placeholder="0"
              value={formData.depositStr}
              onChange={e => handleMoneyChange('depositStr', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-medium"
            />
          </div>
        </div>

        {/* Bảng Tính Toán Tự Động */}
        <div className="p-3.5 bg-gray-50 rounded-2xl space-y-2 text-xs border border-gray-200">
          <div className="flex justify-between text-gray-600">
            <span>Thời gian ở:</span>
            <span className="font-semibold text-gray-900">{nights} đêm</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Phí Dịch Vụ tự động (350k x {bedroomsNum} P.Ngủ x {nights} đêm):</span>
            <span className="font-semibold text-gray-900">{autoServiceFee.toLocaleString('en-US')} VNĐ</span>
          </div>

          <div className="flex justify-between text-gray-800 pt-1 border-t border-gray-200">
            <span>Tổng Giá Trị (Bằng giá phòng):</span>
            <span className="font-bold text-gray-900 text-sm">{totalPrice.toLocaleString('en-US')} VNĐ</span>
          </div>

          <div className="flex justify-between text-blue-700">
            <span>Còn Phải Thu (Tổng tiền - Cọc):</span>
            <span className="font-bold text-blue-700 text-sm">{remainingPrice.toLocaleString('en-US')} VNĐ</span>
          </div>
        </div>

        {/* Mã Xác Nhận */}
        <div>
          <label className="text-xs font-semibold text-gray-600">Mã Xác Nhận Booking (Nếu có)</label>
          <input 
            type="text" placeholder="Nhập mã để CONFIRM ngay..." 
            value={formData.confirmationCode}
            onChange={e => setFormData({...formData, confirmationCode: e.target.value})}
            className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
          />
          <p className="text-[10px] text-gray-400 mt-1">*Để trống đơn sẽ tự động ở trạng thái PENDING</p>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 active:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition"
        >
          Lưu Đơn Đặt Phòng
        </button>
      </form>
    </div>
  );
};
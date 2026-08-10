// src/views/Dashboard.jsx
import React, { useState } from 'react';
import { exportBookingsToExcel } from '../services/excelService';

export const Dashboard = ({ bookings, salesList }) => {
  const [filterType, setFilterType] = useState('THIS_MONTH'); // TODAY, THIS_WEEK, THIS_MONTH, LAST_MONTH, CUSTOM, ALL
  const [dateField, setDateField] = useState('createdDate'); // createdDate | checkInDate
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includePending, setIncludePending] = useState(false);
  const [selectedSales, setSelectedSales] = useState('ALL');

  // Hàm kiểm tra ngày có thỏa mãn bộ lọc không
  const isDateInFilter = (targetDateStr) => {
    if (!targetDateStr) return false;
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (filterType === 'ALL') return true;

    if (filterType === 'TODAY') {
      return target.getTime() === now.getTime();
    }

    if (filterType === 'THIS_WEEK') {
      const first = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1); // Thứ 2 đầu tuần
      const last = first + 6;
      const firstDay = new Date(now.setDate(first));
      const lastDay = new Date(now.setDate(last));
      firstDay.setHours(0, 0, 0, 0);
      lastDay.setHours(23, 59, 59, 999);
      return target >= firstDay && target <= lastDay;
    }

    if (filterType === 'THIS_MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return target >= startOfMonth && target <= endOfMonth;
    }

    if (filterType === 'LAST_MONTH') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return target >= startOfLastMonth && target <= endOfLastMonth;
    }

    if (filterType === 'CUSTOM') {
      if (!startDate && !endDate) return true;
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date('2099-12-31');
      end.setHours(23, 59, 59, 999);
      return target >= start && target <= end;
    }

    return true;
  };

  // Áp dụng bộ lọc lên danh sách
  const filteredBookings = bookings.filter(b => {
    if (!includePending && b.status !== 'CONFIRMED') return false;
    if (selectedSales !== 'ALL' && b.salesPerson !== selectedSales) return false;
    const dateToCompare = dateField === 'checkInDate' ? b.checkInDate : b.createdDate;
    return isDateInFilter(dateToCompare);
  });

  // Tính các chỉ số
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalDeposit = filteredBookings.reduce((sum, b) => sum + (b.deposit || 0), 0);
  const totalRemaining = filteredBookings.reduce((sum, b) => sum + (b.remainingPrice || 0), 0);

  // Thống kê theo Sales Person
  const salesReport = salesList.map(sales => {
    const list = filteredBookings.filter(b => b.salesPerson === sales.name);
    return {
      name: sales.name,
      company: sales.company,
      count: list.length,
      revenue: list.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      deposit: list.reduce((sum, b) => sum + (b.deposit || 0), 0),
      remaining: list.reduce((sum, b) => sum + (b.remainingPrice || 0), 0)
    };
  });

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto space-y-4">
      {/* Bộ Lọc Chi Tiết */}
      <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 space-y-3 text-xs">
        {/* Hàng 1: Loại lọc ngày & Tiêu chí ngày */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-semibold text-gray-600 mb-1 block">Khoảng Thời Gian</label>
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="w-full p-2 border rounded-xl bg-gray-50 text-xs outline-none"
            >
              <option value="ALL">Tất cả thời gian</option>
              <option value="TODAY">Hôm nay</option>
              <option value="THIS_WEEK">Tuần này</option>
              <option value="THIS_MONTH">Tháng này</option>
              <option value="LAST_MONTH">Tháng trước</option>
              <option value="CUSTOM">Tùy chỉnh từ... đến...</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-600 mb-1 block">Lọc Theo Ngày</label>
            <select 
              value={dateField} 
              onChange={e => setDateField(e.target.value)}
              className="w-full p-2 border rounded-xl bg-gray-50 text-xs outline-none"
            >
              <option value="createdDate">Ngày Sales Đặt</option>
              <option value="checkInDate">Ngày Check-In</option>
            </select>
          </div>
        </div>

        {/* Lựa chọn ngày Tùy chỉnh (Hiện khi chọn CUSTOM) */}
        {filterType === 'CUSTOM' && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t">
            <div>
              <label className="text-[10px] text-gray-500 block">Từ ngày</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-1.5 border rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block">Đến ngày</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-1.5 border rounded-lg text-xs"
              />
            </div>
          </div>
        )}

        {/* Hàng 2: Lọc Sales & Toggle đơn Pending */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div>
            <label className="font-semibold text-gray-600 mb-1 block">NV Sales</label>
            <select 
              value={selectedSales} 
              onChange={e => setSelectedSales(e.target.value)}
              className="w-full p-1.5 border rounded-xl bg-gray-50 text-xs"
            >
              <option value="ALL">Tất cả Sales</option>
              {salesList.map((s, idx) => (
                <option key={idx} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-600">
              <input 
                type="checkbox" 
                checked={includePending} 
                onChange={e => setIncludePending(e.target.checked)} 
                className="rounded text-blue-600 w-4 h-4"
              />
              Bao gồm đơn Pending
            </label>
          </div>
        </div>

        <button 
          onClick={() => exportBookingsToExcel(filteredBookings)}
          className="w-full bg-emerald-600 active:bg-emerald-700 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm text-xs mt-1"
        >
          📥 Xuất File Excel Báo Cáo
        </button>
      </div>

      {/* Thống Kê Tổng Quan */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
          <p className="text-[10px] text-blue-600 font-semibold uppercase">Tổng Doanh Thu</p>
          <p className="text-sm font-bold text-blue-900 mt-1">{totalRevenue.toLocaleString()} đ</p>
        </div>
        <div className="bg-green-50 p-3 rounded-2xl border border-green-100 text-center">
          <p className="text-[10px] text-green-600 font-semibold uppercase">Thực Thu (Cọc)</p>
          <p className="text-sm font-bold text-green-900 mt-1">{totalDeposit.toLocaleString()} đ</p>
        </div>
        <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center">
          <p className="text-[10px] text-rose-600 font-semibold uppercase">Còn Phải Thu</p>
          <p className="text-sm font-bold text-rose-900 mt-1">{totalRemaining.toLocaleString()} đ</p>
        </div>
      </div>

      {/* Chi Tiết Theo Sales */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <h3 className="text-sm font-bold text-gray-800">Hiệu Quả Doanh Số Theo Sales</h3>
        <div className="space-y-2">
          {salesReport.map((s, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-gray-900">{s.name} <span className="font-normal text-gray-400">({s.company})</span></p>
                <p className="text-gray-500 mt-0.5">{s.count} đơn | Cọc: {s.deposit.toLocaleString()} đ</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{s.revenue.toLocaleString()} đ</p>
                <p className="text-[10px] text-rose-500">Nợ: {s.remaining.toLocaleString()} đ</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
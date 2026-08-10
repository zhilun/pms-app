// src/views/SalesManager.jsx
import React, { useState } from 'react';

export const SalesManager = ({ salesList, onAddSales }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && company.trim()) {
      onAddSales({ name: name.trim(), company: company.trim() });
      setName('');
      setCompany('');
      alert('Đã thêm Sales Person thành công!');
    }
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto space-y-4">
      {/* Form Khai Báo */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-bold text-gray-900 text-sm border-b pb-2">Khai Báo Sales Person Mới</h3>
        <div>
          <label className="text-xs font-semibold text-gray-600">Tên Sales (*)</label>
          <input 
            required type="text" placeholder="VD: Nguyễn Văn A" 
            value={name} onChange={e => setName(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-xl text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">Công Ty / Agency (*)</label>
          <input 
            required type="text" placeholder="VD: Agoda / Traveloka / Direct" 
            value={company} onChange={e => setCompany(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-xl text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button 
          type="submit"
          className="w-full py-2.5 bg-blue-600 active:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          Lưu Sales Person
        </button>
      </form>

      {/* Danh sách Sales Đã Khai Báo */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">Danh Sách Sales Person ({salesList.length})</h3>
        <div className="space-y-2">
          {salesList.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Chưa có thông tin Sales Person nào.</p>
          ) : (
            salesList.map((s, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-xs border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900">{s.name}</p>
                  <p className="text-gray-500">Công ty: {s.company}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] font-semibold">
                  Hoạt động
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// components/SalesModal.jsx
import React, { useState } from 'react';

export const SalesModal = ({ isOpen, onClose, onAddSales }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && company) {
      onAddSales({ name, company });
      setName('');
      setCompany('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="font-bold text-gray-900 text-base">Khai Báo Sales Person</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Tên Sales</label>
            <input 
              required type="text" placeholder="VD: Nguyễn Văn B" 
              value={name} onChange={e => setName(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Tên Công Ty / Agency</label>
            <input 
              required type="text" placeholder="VD: Agoda / Traveloka / Freelance" 
              value={company} onChange={e => setCompany(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm mt-1"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button 
              type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md"
            >
              Lưu Khai Báo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// src/views/SalesManager.jsx
import React, { useState } from 'react';

export const SalesManager = ({ salesList, onAddSales, onEditSales, onDeleteSales }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCompany, setEditCompany] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && company.trim()) {
      onAddSales({ name: name.trim(), company: company.trim() });
      setName('');
      setCompany('');
      alert('Đã thêm Sales Person thành công!');
    }
  };

  const handleStartEdit = (sales) => {
    setEditingId(sales.id);
    setEditName(sales.name);
    setEditCompany(sales.company);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editName.trim() && editCompany.trim()) {
      onEditSales(editingId, { name: editName.trim(), company: editCompany.trim() });
      setEditingId(null);
      setEditName('');
      setEditCompany('');
      alert('Đã cập nhật Sales Person thành công!');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditCompany('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Sales Person này?')) {
      onDeleteSales(id);
      alert('Đã xóa Sales Person thành công!');
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
            salesList.map((s) => (
              <div key={s.id}>
                {editingId === s.id ? (
                  <form onSubmit={handleSaveEdit} className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Tên Sales</label>
                      <input
                        type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Công Ty / Agency</label>
                      <input
                        type="text" value={editCompany} onChange={e => setEditCompany(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs mt-1"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold active:bg-green-700 transition"
                      >
                        Lưu
                      </button>
                      <button
                        type="button" onClick={handleCancelEdit}
                        className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold active:bg-gray-400 transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-start text-xs border border-gray-100">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{s.name}</p>
                      <p className="text-gray-500">Công ty: {s.company}</p>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => handleStartEdit(s)}
                        className="px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded-lg font-semibold text-[10px] hover:bg-amber-200 active:bg-amber-300 transition"
                        title="Sửa"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="px-2.5 py-1.5 bg-red-100 text-red-700 rounded-lg font-semibold text-[10px] hover:bg-red-200 active:bg-red-300 transition"
                        title="Xóa"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

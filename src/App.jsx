// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { 
  getBookings, 
  getSalesPersons, 
  createBooking, 
  approveBooking, 
  updateBooking, 
  createSalesPerson, 
  updateSalesPerson, 
  deleteSalesPerson 
} from './services/bookingService';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BookingForm } from './views/BookingForm';
import { PendingList } from './views/PendingList';
import { Dashboard } from './views/Dashboard';
import { SalesManager } from './views/SalesManager';
import { Login } from './views/Login';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('booking');

  const [bookings, setBookings] = useState([]);
  const [salesList, setSalesList] = useState([]);

  // 1. Quản lý phiên đăng nhập với Supabase Auth
  useEffect(() => {
    // Lấy thông tin user hiện tại
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Lắng nghe sự thay đổi trạng thái Auth (Đăng nhập / Đăng xuất)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Tải dữ liệu từ Supabase khi đã đăng nhập
  const loadData = async () => {
    if (!currentUser) return;
    const [fetchedBookings, fetchedSales] = await Promise.all([
      getBookings(),
      getSalesPersons()
    ]);
    setBookings(fetchedBookings);
    setSalesList(fetchedSales);
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Lọc danh sách đơn Pending
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');

  // Handlers thao tác dữ liệu
  const handleSaveBooking = async (newBooking) => {
    const { error } = await createBooking(newBooking, currentUser.id);
    if (error) {
      alert('Lỗi tạo đơn: ' + error.message);
    } else {
      await loadData();
    }
  };

  const handleApproveBooking = async (id, code) => {
    const { error } = await approveBooking(id, code);
    if (error) {
      alert('Lỗi duyệt đơn: ' + error.message);
    } else {
      await loadData();
    }
  };

  const handleEditBooking = async (id, updatedBooking) => {
    const { error } = await updateBooking(id, updatedBooking);
    if (error) {
      alert('Lỗi cập nhật đơn: ' + error.message);
    } else {
      await loadData();
    }
  };

  const handleAddSales = async (newSales) => {
    const { error } = await createSalesPerson(newSales.name, newSales.company);
    if (error) {
      alert('Lỗi thêm sales: ' + error.message);
    } else {
      await loadData();
    }
  };

  const handleEditSales = async (id, updatedSales) => {
    const { error } = await updateSalesPerson(id, updatedSales.name, updatedSales.company);
    if (error) {
      alert('Lỗi sửa sales: ' + error.message);
    } else {
      await loadData();
    }
  };

  const handleDeleteSales = async (id) => {
    const { error } = await deleteSalesPerson(id);
    if (error) {
      alert('Lỗi xóa sales: ' + error.message);
    } else {
      await loadData();
    }
  };

  // Màn hình chờ khi đang kiểm tra trạng thái đăng nhập
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
        Đang tải hệ thống...
      </div>
    );
  }

  // Chưa đăng nhập ➔ Chuyển hướng tới Màn hình Login
  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  // Đã đăng nhập ➔ Hiển thị App chính
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Header
        title={
          activeTab === 'booking' ? 'Tạo Đặt Phòng' :
          activeTab === 'pending' ? 'Đơn Pending' :
          activeTab === 'dashboard' ? 'Báo Cáo Doanh Thu' : 'Khai Báo Sales'
        }
        currentUser={currentUser}
      />

      <main>
        {activeTab === 'booking' && (
          <BookingForm
            salesList={salesList}
            existingBookings={bookings}
            onSaveBooking={handleSaveBooking}
            onOpenAddSales={() => setActiveTab('sales')}
          />
        )}
        {activeTab === 'pending' && (
          <PendingList
            pendingBookings={pendingBookings}
            onApproveBooking={handleApproveBooking}
            onEditBooking={handleEditBooking}
            salesList={salesList}
          />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard
            bookings={bookings}
            salesList={salesList}
          />
        )}
        {activeTab === 'sales' && (
          <SalesManager
            salesList={salesList}
            onAddSales={handleAddSales}
            onEditSales={handleEditSales}
            onDeleteSales={handleDeleteSales}
          />
        )}
      </main>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingCount={pendingBookings.length}
      />
    </div>
  );
}
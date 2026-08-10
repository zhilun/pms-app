// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';
import { initGoogleDriveAuth, loginGoogle, uploadBackupToDrive, restoreFromDrive } from './services/driveService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BookingForm } from './views/BookingForm';
import { PendingList } from './views/PendingList';
import { Dashboard } from './views/Dashboard';
import { SalesManager } from './views/SalesManager';

export default function App() {
  const [activeTab, setActiveTab] = useState('booking');
  const [driveToken, setDriveToken] = useState(localStorage.getItem('gdrive_token') || null);

  const bookings = useLiveQuery(() => db.bookings.toArray(), []) || [];
  const salesList = useLiveQuery(() => db.salesPersons.toArray(), []) || [];

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');

  useEffect(() => {
    initGoogleDriveAuth(
      (token) => setDriveToken(token),
      (err) => console.error('Google Auth Error', err)
    );
  }, []);

  const triggerAutoBackup = async () => {
    if (driveToken) await uploadBackupToDrive(driveToken);
  };

  const handleSaveBooking = async (newBooking) => {
    await db.bookings.add(newBooking);
    triggerAutoBackup();
  };

  const handleApproveBooking = async (id, code) => {
    await db.bookings.update(id, {
      confirmationCode: code,
      status: 'CONFIRMED',
      updatedAt: new Date().toISOString()
    });
    triggerAutoBackup();
  };

  const handleAddSales = async (newSales) => {
    await db.salesPersons.add(newSales);
    triggerAutoBackup();
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Header 
        title={
          activeTab === 'booking' ? 'Tạo Đặt Phòng' :
          activeTab === 'pending' ? 'Đơn Pending' :
          activeTab === 'dashboard' ? 'Báo Cáo Doanh Thu' : 'Khai Báo Sales'
        } 
        driveStatus={!!driveToken}
        onConnectDrive={loginGoogle}
        onRestoreDrive={() => driveToken && restoreFromDrive(driveToken)}
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
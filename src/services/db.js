// src/services/db.js
import Dexie from 'dexie';

export const db = new Dexie('PMSBookingDatabase');

// Đăng ký bảng và các chỉ mục (indexes)
db.version(1).stores({
  bookings: 'id, createdDate, salesPerson, checkInDate, checkOutDate, roomCode, status, updatedAt, bedrooms',
  salesPersons: '++id, name, company'
});

// Khởi tạo dữ liệu mẫu nếu chưa có
db.on('populate', () => {
  db.salesPersons.bulkAdd([
    { name: 'Nguyễn Văn A', company: 'Agoda' },
    { name: 'Trần Thị B', company: 'Direct' }
  ]);
});
// src/services/excelService.js
import * as XLSX from 'xlsx';

export const exportBookingsToExcel = (bookingsList) => {
  // Mapping dữ liệu theo đúng danh sách cột trong mục 3.3.4 SRS
  const formattedData = bookingsList.map((b) => ({
    'Ngày sales đặt': b.createdDate,
    'Tên sales': b.salesPerson,
    'Mã phòng': b.roomCode,
    'Ngày CheckIn': b.checkInDate,
    'Ngày CheckOut': b.checkOutDate,
    'Giá phòng': b.roomPrice,
    'Tiền Cọc': b.deposit,
    'Tiền cần thanh toán': b.remainingPrice,
    'Tiền dịch vụ': b.serviceFee,
    'Mã xác nhận': b.confirmationCode || ''
  }));

  // Tính tổng cộng
  
  const totalDeposit = bookingsList.reduce((sum, b) => sum + (b.deposit || 0), 0);
  const totalRemaining = bookingsList.reduce((sum, b) => sum + (b.remainingPrice || 0), 0);
  const totalServiceFee = bookingsList.reduce((sum, b) => sum + (b.serviceFee || 0), 0);

  // Thêm dòng tổng cộng
  formattedData.push({
    'Ngày sales đặt': '',
    'Tên sales': '',
    'Mã phòng': '',
    'Ngày CheckIn': '',
    'Ngày CheckOut': '',
    'Giá phòng': '',
    'Tiền Cọc': totalDeposit,
    'Tiền cần thanh toán': totalRemaining,
    'Tiền dịch vụ': totalServiceFee,
    'Mã xác nhận': 'TỔNG CỘNG'
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Tự động căn chỉnh độ rộng cột
  const columnWidths = [
    { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 18 }
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo Cáo Doanh Thu');

  const fileName = `PMS_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
// src/services/excelService.js
import ExcelJS from 'exceljs';

export const exportBookingsToExcel = (bookingsList) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo Cáo Doanh Thu');

  // Headers
  const headers = [
    'Ngày sales đặt', 'Tên sales', 'Mã phòng', 'Ngày CheckIn', 'Ngày CheckOut',
    'Giá phòng', 'Tiền Cọc', 'Tiền cần thanh toán', 'Tiền dịch vụ', 'Mã xác nhận'
  ];
  worksheet.addRow(headers);

  // Định dạng header: in đậm + border
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headers.forEach((_, index) => {
    headerRow.getCell(index + 1).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Tính tổng cộng
  const totalDeposit = bookingsList.reduce((sum, b) => sum + (b.deposit || 0), 0);
  const totalRemaining = bookingsList.reduce((sum, b) => sum + (b.remainingPrice || 0), 0);
  const totalServiceFee = bookingsList.reduce((sum, b) => sum + (b.serviceFee || 0), 0);

  // Thêm dữ liệu
  bookingsList.forEach((b) => {
    worksheet.addRow([
      b.createdDate,
      b.salesPerson,
      b.roomCode,
      b.checkInDate,
      b.checkOutDate,
      b.roomPrice,
      b.deposit,
      b.remainingPrice,
      b.serviceFee,
      b.confirmationCode || ''
    ]);
  });

  // Thêm dòng tổng cộng
  const totalRowNum = bookingsList.length + 2;
  worksheet.addRow([
    '', '', '', '', '', 'TỔNG CỘNG', totalDeposit, totalRemaining, totalServiceFee, ''
  ]);

  // Định dạng dòng tổng: in đậm + border
  const totalRow = worksheet.getRow(totalRowNum);
  totalRow.font = { bold: true };

  // Format border + tiền cho tất cả data rows
  for (let rowNum = 2; rowNum <= totalRowNum; rowNum++) {
    const row = worksheet.getRow(rowNum);

    // Cột tiền (col 6, 7, 8, 9): format + border
    [6, 7, 8, 9].forEach((colNum) => {
      const cell = row.getCell(colNum);
      cell.numFmt = '#,##0';
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Border cho các cột khác
    [1, 2, 3, 4, 5, 10].forEach((colNum) => {
      row.getCell(colNum).border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  }

  // Định dạng chiều rộng cột
  worksheet.columns = [
    { width: 15 }, { width: 20 }, { width: 12 }, { width: 15 }, { width: 15 },
    { width: 15 }, { width: 15 }, { width: 18 }, { width: 15 }, { width: 18 }
  ];

  // Xuất file
  const fileName = `PMS_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  });
};
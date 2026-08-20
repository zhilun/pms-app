// src/services/excelService.js
import ExcelJS from 'exceljs';

export const exportBookingsToExcel = (bookingsList, salesList = []) => {
  // Sắp xếp theo ngày từ cũ đến mới, sau đó là tên sales
  const sortedList = [...bookingsList].sort((a, b) => {
    const dateA = new Date(a.createdDate);
    const dateB = new Date(b.createdDate);
    if (dateA - dateB !== 0) {
      return dateA - dateB;
    }
    return (a.salesPerson || '').localeCompare(b.salesPerson || '');
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo Cáo Doanh Thu');

  // Headers
  const headers = [
    'Ngày sales đặt', 'Tên sales', 'Công ty', 'Tên khách', 'Mã phòng', 'Ngày CheckIn', 'Ngày CheckOut',
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
  const totalDeposit = sortedList.reduce((sum, b) => sum + (b.deposit || 0), 0);
  const totalRemaining = sortedList.reduce((sum, b) => sum + (b.remainingPrice || 0), 0);
  const totalServiceFee = sortedList.reduce((sum, b) => sum + (b.serviceFee || 0), 0);

  // Parse date string thành Date object
  const parseDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString);
  };

  // Thêm dữ liệu
  sortedList.forEach((b) => {
    const salesPerson = salesList.find(s => s.name === b.salesPerson);
    const company = salesPerson?.company || '';
    worksheet.addRow([
      parseDate(b.createdDate),
      b.salesPerson,
      company,
      b.customerName || b.customer_name || '',
      b.roomCode,
      parseDate(b.checkInDate),
      parseDate(b.checkOutDate),
      b.roomPrice,
      b.deposit,
      b.remainingPrice,
      b.serviceFee,
      b.confirmationCode || ''
    ]);
  });

  // Thêm dòng tổng cộng
  const totalRowNum = sortedList.length + 2;
  worksheet.addRow([
    '', '', '', '', '', '', '', 'TỔNG CỘNG', totalDeposit, totalRemaining, totalServiceFee, ''
  ]);

  // Định dạng dòng tổng: in đậm + border
  const totalRow = worksheet.getRow(totalRowNum);
  totalRow.font = { bold: true };

  // Format border + tiền + ngày cho tất cả data rows
  for (let rowNum = 2; rowNum <= totalRowNum; rowNum++) {
    const row = worksheet.getRow(rowNum);

    // Cột tiền (col 8, 9, 10, 11): format + border
    [8, 9, 10, 11].forEach((colNum) => {
      const cell = row.getCell(colNum);
      cell.numFmt = '#,##0';
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Cột ngày (col 1, 6, 7): format dd-MM-yyyy + border
    [1, 6, 7].forEach((colNum) => {
      const cell = row.getCell(colNum);
      cell.numFmt = 'dd-mm-yyyy';
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Border cho các cột khác
    [2, 3, 4, 5, 12].forEach((colNum) => {
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
    { width: 15 }, { width: 20 }, { width: 18 }, { width: 20 }, { width: 12 }, { width: 15 }, { width: 15 },
    { width: 15 }, { width: 15 }, { width: 18 }, { width: 15 }, { width: 18 }
  ];

  // Thêm AutoFilter cho hàng đầu
  worksheet.autoFilter = 'A1:L1';

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
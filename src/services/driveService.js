// src/services/driveService.js
import { db } from './db';

// ⚠️ BẮT BUỘC: Thay chuỗi dưới đây bằng Client ID thực tế từ Google Cloud Console
const CLIENT_ID = '654261831807-63lf63vk0jhqqkcm6t7lh9t5hesbo81q.apps.googleusercontent.com'; // Thay bằng Client ID Google Cloud của bạn
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

let tokenClient = null;

// Hàm hỗ trợ tải SDK động nếu file index.html chưa load kịp
const loadGoogleSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      return resolve();
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

// Khởi tạo Google Token Client
export const initGoogleDriveAuth = async (onSuccess, onError) => {
  try {
    await loadGoogleSDK();
    
    if (window.google?.accounts?.oauth2) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            localStorage.setItem('gdrive_token', tokenResponse.access_token);
            onSuccess(tokenResponse.access_token);
          } else {
            console.error('Lỗi phản hồi OAuth:', tokenResponse);
            if (onError) onError(tokenResponse);
          }
        },
      });
    }
  } catch (error) {
    console.error('Không thể tải Google Identity SDK:', error);
  }
};

// Kích hoạt cửa sổ đăng nhập Google
export const loginGoogle = () => {
  if (CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
    alert('⚠️ Bạn chưa cấu hình CLIENT_ID thực tế từ Google Cloud Console trong file driveService.js!');
    return;
  }

  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    alert('Đang tải kết nối Google Drive, vui lòng bấm lại sau 3 giây...');
  }
};

// Xuất dữ liệu Database
export const exportDatabaseJSON = async () => {
  const bookings = await db.bookings.toArray();
  const salesPersons = await db.salesPersons.toArray();
  return JSON.stringify({ bookings, salesPersons, exportedAt: new Date().toISOString() });
};

// Tải file backup lên Google Drive
export const uploadBackupToDrive = async (accessToken) => {
  try {
    const jsonString = await exportDatabaseJSON();
    
    // Kiểm tra file cũ trên Drive
    const searchRes = await fetch(
      "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='pms_backup.json'",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    const existingFile = searchData.files && searchData.files[0];

    const fileBlob = new Blob([jsonString], { type: 'application/json' });
    const metadata = {
      name: 'pms_backup.json',
      parents: existingFile ? [] : ['appDataFolder']
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', fileBlob);

    const endpoint = existingFile 
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const uploadRes = await fetch(endpoint, {
      method: existingFile ? 'PATCH' : 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData
    });

    return uploadRes.ok;
  } catch (error) {
    console.error('Lỗi khi sao lưu Google Drive:', error);
    return false;
  }
};

// Khôi phục dữ liệu từ Google Drive
export const restoreFromDrive = async (accessToken) => {
  try {
    const searchRes = await fetch(
      "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='pms_backup.json'",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    if (!searchData.files || searchData.files.length === 0) {
      alert('Không tìm thấy bản sao lưu nào trên Google Drive!');
      return false;
    }

    const fileId = searchData.files[0].id;
    const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const backupData = await fileRes.json();
    
    if (backupData.bookings) await db.bookings.bulkPut(backupData.bookings);
    if (backupData.salesPersons) await db.salesPersons.bulkPut(backupData.salesPersons);

    alert('Khôi phục dữ liệu từ Google Drive thành công!');
    window.location.reload();
    return true;
  } catch (error) {
    console.error('Lỗi khôi phục từ Drive:', error);
    alert('Khôi phục dữ liệu thất bại.');
    return false;
  }
};
// src/services/driveService.js
import { db } from './db';

const CLIENT_ID = '654261831807-63lf63vk0jhqqkcm6t7lh9t5hesbo81q.apps.googleusercontent.com'; // Thay bằng Client ID Google Cloud của bạn
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

let tokenClient = null;

// Khởi tạo Google Identity Services
export const initGoogleDriveAuth = (onSuccess, onError) => {
  if (window.google) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          localStorage.setItem('gdrive_token', tokenResponse.access_token);
          onSuccess(tokenResponse.access_token);
        } else {
          onError(tokenResponse);
        }
      },
    });
  }
};

export const loginGoogle = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    alert('Thư viện Google Identity Services chưa tải xong, vui lòng thử lại.');
  }
};

// Xuất toàn bộ DB thành JSON
export const exportDatabaseJSON = async () => {
  const bookings = await db.bookings.toArray();
  const salesPersons = await db.salesPersons.toArray();
  return JSON.stringify({ bookings, salesPersons, exportedAt: new Date().toISOString() });
};

// Tải backup đè/tạo mới lên Google Drive appDataFolder
export const uploadBackupToDrive = async (accessToken) => {
  try {
    const jsonString = await exportDatabaseJSON();
    
    // Tìm file pms_backup.json đã tồn tại trên Drive chưa
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

// Khôi phục dữ liệu từ Google Drive về IndexedDB
export const restoreFromDrive = async (accessToken) => {
  try {
    const searchRes = await fetch(
      "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='pms_backup.json'",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    if (!searchData.files || searchData.files.length === 0) {
      alert('Không tìm thấy bản sao lưu trên Google Drive!');
      return false;
    }

    const fileId = searchData.files[0].id;
    const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const backupData = await fileRes.json();
    
    // Merge vào IndexedDB
    if (backupData.bookings) await db.bookings.bulkPut(backupData.bookings);
    if (backupData.salesPersons) await db.salesPersons.bulkPut(backupData.salesPersons);

    alert('Đã khôi phục dữ liệu từ Google Drive thành công!');
    return true;
  } catch (error) {
    console.error('Lỗi khôi phục từ Drive:', error);
    alert('Khôi phục thất bại.');
    return false;
  }
};
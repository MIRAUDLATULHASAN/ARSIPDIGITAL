// ==================================================
// GOOGLE APPS SCRIPT BACKEND - ARSIP DIGITAL MI
// ==================================================

// ⚠️ KONFIGURASI YANG SUDAH DIISI DENGAN DATA ANDA ⚠️
const SHEET_ID = '15tQ7zUPWB3Ps7z8zQVd2PIqBvXBE8GslcB_KbWtNr6U';
const FOLDER_ID = '18gnKga8vSVYqmx2-A_yj1Z_yMSTtLq7X';

// ==================================================
// HANDLER UTAMA
// ==================================================

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
    return handleRequest(e);
}

function handleRequest(e) {
    const action = e?.parameter?.action || (e?.postData?.contents ? JSON.parse(e.postData.contents).action : 'getData');
    
    try {
        switch(action) {
            case 'login':
                return loginUser(e);
            case 'getSiswa':
                return getSiswa();
            case 'saveSiswa':
                return saveSiswa(e);
            case 'deleteSiswa':
                return deleteSiswa(e);
            case 'getGuru':
                return getGuru();
            case 'saveGuru':
                return saveGuru(e);
            case 'deleteGuru':
                return deleteGuru(e);
            case 'uploadFile':
                return uploadFile(e);
            case 'getArsip':
                return getArsip();
            case 'deleteArsip':
                return deleteArsip(e);
            case 'getStats':
                return getStats();
            case 'initialize':
                return initializeSpreadsheet();
            default:
                return sendResponse({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
        }
    } catch(error) {
        return sendResponse({ success: false, error: error.toString() });
    }
}

function sendResponse(data) {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

// ==================================================
// FUNGSI LOGIN
// ==================================================

function loginUser(e) {
    const username = e?.parameter?.username;
    const password = e?.parameter?.password;
    
    if (!username || !password) {
        return sendResponse({ success: false, error: 'Username dan password harus diisi!' });
    }
    
    const sheet = getOrCreateSheet('Users');
    const data = sheet.getDataRange().getValues();
    
    for(let i = 1; i < data.length; i++) {
        if(data[i][0] === username && data[i][1] === password) {
            return sendResponse({
                success: true,
                user: {
                    username: data[i][0],
                    role: data[i][2],
                    nama: data[i][3] || username,
                    email: data[i][4] || ''
                }
            });
        }
    }
    
    return sendResponse({ success: false, error: 'Username atau password salah!' });
}

// ==================================================
// FUNGSI SISWA
// ==================================================

function getSiswa() {
    const sheet = getOrCreateSheet('Siswa');
    const data = sheet.getDataRange().getValues();
    const siswa = [];
    
    for(let i = 1; i < data.length; i++) {
        if(data[i][0]) {
            siswa.push({
                id: data[i][0],
                nama: data[i][1] || '',
                nisn: data[i][2] || '',
                kelas: data[i][3] || '',
                jk: data[i][4] || '',
                alamat: data[i][5] || '',
                wali: data[i][6] || '',
                created_at: data[i][7] || ''
            });
        }
    }
    
    return sendResponse({ success: true, data: siswa });
}

function saveSiswa(e) {
    const sheet = getOrCreateSheet('Siswa');
    let data;
    
    if (e?.postData?.contents) {
        data = JSON.parse(e.postData.contents);
    } else if (e?.parameter) {
        data = e.parameter;
    } else {
        return sendResponse({ success: false, error: 'Data tidak ditemukan' });
    }
    
    const id = data.id || generateId();
    const existingData = sheet.getDataRange().getValues();
    let found = false;
    
    for(let i = 1; i < existingData.length; i++) {
        if(existingData[i][0].toString() === id.toString()) {
            sheet.getRange(i+1, 1, 1, 8).setValues([[
                id, data.nama, data.nisn, data.kelas, 
                data.jk, data.alamat, data.wali, new Date().toISOString()
            ]]);
            found = true;
            break;
        }
    }
    
    if (!found) {
        sheet.appendRow([
            id, data.nama, data.nisn, data.kelas, 
            data.jk, data.alamat, data.wali, new Date().toISOString()
        ]);
    }
    
    return sendResponse({ success: true, message: 'Data siswa berhasil disimpan', id: id });
}

function deleteSiswa(e) {
    const id = e?.parameter?.id;
    if (!id) return sendResponse({ success: false, error: 'ID tidak ditemukan' });
    
    const sheet = getOrCreateSheet('Siswa');
    const data = sheet.getDataRange().getValues();
    
    for(let i = data.length - 1; i >= 1; i--) {
        if(data[i][0].toString() === id.toString()) {
            sheet.deleteRow(i+1);
            break;
        }
    }
    
    return sendResponse({ success: true, message: 'Data siswa berhasil dihapus' });
}

// ==================================================
// FUNGSI GURU
// ==================================================

function getGuru() {
    const sheet = getOrCreateSheet('Guru');
    const data = sheet.getDataRange().getValues();
    const guru = [];
    
    for(let i = 1; i < data.length; i++) {
        if(data[i][0]) {
            guru.push({
                id: data[i][0],
                nama: data[i][1] || '',
                nip: data[i][2] || '',
                mapel: data[i][3] || '',
                nohp: data[i][4] || '',
                tahun: data[i][5] || '',
                created_at: data[i][6] || ''
            });
        }
    }
    
    return sendResponse({ success: true, data: guru });
}

function saveGuru(e) {
    const sheet = getOrCreateSheet('Guru');
    let data;
    
    if (e?.postData?.contents) {
        data = JSON.parse(e.postData.contents);
    } else if (e?.parameter) {
        data = e.parameter;
    } else {
        return sendResponse({ success: false, error: 'Data tidak ditemukan' });
    }
    
    const id = data.id || generateId();
    const existingData = sheet.getDataRange().getValues();
    let found = false;
    
    for(let i = 1; i < existingData.length; i++) {
        if(existingData[i][0].toString() === id.toString()) {
            sheet.getRange(i+1, 1, 1, 7).setValues([[
                id, data.nama, data.nip, data.mapel, data.nohp, data.tahun, new Date().toISOString()
            ]]);
            found = true;
            break;
        }
    }
    
    if (!found) {
        sheet.appendRow([
            id, data.nama, data.nip, data.mapel, data.nohp, data.tahun, new Date().toISOString()
        ]);
    }
    
    return sendResponse({ success: true, message: 'Data guru berhasil disimpan', id: id });
}

function deleteGuru(e) {
    const id = e?.parameter?.id;
    if (!id) return sendResponse({ success: false, error: 'ID tidak ditemukan' });
    
    const sheet = getOrCreateSheet('Guru');
    const data = sheet.getDataRange().getValues();
    
    for(let i = data.length - 1; i >= 1; i--) {
        if(data[i][0].toString() === id.toString()) {
            sheet.deleteRow(i+1);
            break;
        }
    }
    
    return sendResponse({ success: true, message: 'Data guru berhasil dihapus' });
}

// ==================================================
// FUNGSI ARSIP (UPLOAD KE GOOGLE DRIVE)
// ==================================================

function uploadFile(e) {
    try {
        // Parse multipart form data
        const fileData = e?.parameter?.file;
        const kategori = e?.parameter?.kategori;
        const fileName = e?.parameter?.fileName;
        
        if (!fileData) {
            return sendResponse({ success: false, error: 'File tidak ditemukan' });
        }
        
        // Decode base64 file
        const fileBlob = Utilities.newBlob(Utilities.base64Decode(fileData), 'application/octet-stream', fileName);
        
        // Upload ke Google Drive
        const folder = DriveApp.getFolderById(FOLDER_ID);
        const file = folder.createFile(fileBlob);
        file.setName(fileName);
        
        // Simpan ke sheet Arsip
        const sheet = getOrCreateSheet('Arsip');
        sheet.appendRow([
            generateId(),
            fileName,
            kategori,
            file.getId(),
            file.getSize(),
            new Date().toISOString(),
            Session.getActiveUser().getEmail() || 'system'
        ]);
        
        return sendResponse({
            success: true,
            fileId: file.getId(),
            fileUrl: file.getUrl(),
            message: 'File berhasil diupload ke Google Drive'
        });
    } catch(error) {
        return sendResponse({ success: false, error: error.toString() });
    }
}

function getArsip() {
    const sheet = getOrCreateSheet('Arsip');
    const data = sheet.getDataRange().getValues();
    const arsip = [];
    
    for(let i = 1; i < data.length; i++) {
        if(data[i][0]) {
            arsip.push({
                id: data[i][0],
                nama: data[i][1] || '',
                kategori: data[i][2] || '',
                fileId: data[i][3] || '',
                ukuran: data[i][4] || 0,
                tanggal: data[i][5] || '',
                uploader: data[i][6] || ''
            });
        }
    }
    
    return sendResponse({ success: true, data: arsip });
}

function deleteArsip(e) {
    const id = e?.parameter?.id;
    const fileId = e?.parameter?.fileId;
    
    if (!id) return sendResponse({ success: false, error: 'ID tidak ditemukan' });
    
    // Hapus file dari Drive jika ada
    if (fileId) {
        try {
            const file = DriveApp.getFileById(fileId);
            file.setTrashed(true);
        } catch(e) {}
    }
    
    // Hapus dari sheet
    const sheet = getOrCreateSheet('Arsip');
    const data = sheet.getDataRange().getValues();
    
    for(let i = data.length - 1; i >= 1; i--) {
        if(data[i][0].toString() === id.toString()) {
            sheet.deleteRow(i+1);
            break;
        }
    }
    
    return sendResponse({ success: true, message: 'Arsip berhasil dihapus' });
}

// ==================================================
// FUNGSI STATISTIK DASHBOARD
// ==================================================

function getStats() {
    const siswa = getOrCreateSheet('Siswa').getDataRange().getValues();
    const guru = getOrCreateSheet('Guru').getDataRange().getValues();
    const arsip = getOrCreateSheet('Arsip').getDataRange().getValues();
    
    const today = new Date().toDateString();
    let todayUploads = 0;
    for(let i = 1; i < arsip.length; i++) {
        if(arsip[i][5] && new Date(arsip[i][5]).toDateString() === today) {
            todayUploads++;
        }
    }
    
    return sendResponse({
        success: true,
        stats: {
            totalSiswa: Math.max(0, siswa.length - 1),
            totalGuru: Math.max(0, guru.length - 1),
            totalArsip: Math.max(0, arsip.length - 1),
            uploadHariIni: todayUploads
        }
    });
}

// ==================================================
// FUNGSI BANTUAN (HELPER)
// ==================================================

function getOrCreateSheet(sheetName) {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        
        // Setup header berdasarkan nama sheet
        switch(sheetName) {
            case 'Users':
                sheet.appendRow(['username', 'password', 'role', 'nama', 'email', 'created_at']);
                sheet.appendRow(['admin', 'admin123', 'admin', 'Administrator', 'admin@raudlatulhasan.sch.id', new Date().toISOString()]);
                sheet.appendRow(['guru', 'guru123', 'guru', 'Guru MI', 'guru@raudlatulhasan.sch.id', new Date().toISOString()]);
                break;
            case 'Siswa':
                sheet.appendRow(['id', 'nama', 'nisn', 'kelas', 'jk', 'alamat', 'wali', 'created_at']);
                // Tambah data contoh
                sheet.appendRow([generateId(), 'Ahmad Fathoni', '0012345678', '6', 'L', 'Jl. Pendidikan No. 1', 'Budi Santoso', new Date().toISOString()]);
                sheet.appendRow([generateId(), 'Siti Aisyah', '0012345679', '5', 'P', 'Jl. Madrasah No. 2', 'Siti Aminah', new Date().toISOString()]);
                sheet.appendRow([generateId(), 'Muhammad Rizki', '0012345680', '4', 'L', 'Jl. Merdeka No. 5', 'Ahmad Zainuri', new Date().toISOString()]);
                sheet.appendRow([generateId(), 'Fatimah Azzahra', '0012345681', '3', 'P', 'Jl. Kenangan No. 8', 'Siti Maimunah', new Date().toISOString()]);
                break;
            case 'Guru':
                sheet.appendRow(['id', 'nama', 'nip', 'mapel', 'nohp', 'tahun', 'created_at']);
                // Tambah data contoh
                sheet.appendRow([generateId(), 'Dr. H. Muhammad Ali, M.Pd', '196501011990031001', 'Matematika', '081234567890', '2005', new Date().toISOString()]);
                sheet.appendRow([generateId(), 'Hj. Siti Fatimah, S.Ag', '196702021992032002', 'Pendidikan Agama', '081234567891', '2008', new Date().toISOString()]);
                sheet.appendRow([generateId(), 'Drs. H. Ahmad Zaini, M.Pd', '196803031994031003', 'Bahasa Indonesia', '081234567892', '2010', new Date().toISOString()]);
                break;
            case 'Arsip':
                sheet.appendRow(['id', 'nama', 'kategori', 'fileId', 'ukuran', 'tanggal', 'uploader']);
                break;
            case 'LogActivity':
                sheet.appendRow(['timestamp', 'user', 'action', 'details', 'ip']);
                break;
        }
    }
    
    return sheet;
}

function generateId() {
    return 'ID_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function initializeSpreadsheet() {
    getOrCreateSheet('Users');
    getOrCreateSheet('Siswa');
    getOrCreateSheet('Guru');
    getOrCreateSheet('Arsip');
    getOrCreateSheet('LogActivity');
    
    return sendResponse({ success: true, message: 'Spreadsheet berhasil diinisialisasi!' });
}
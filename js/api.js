// ==================================================
// API CONFIGURATION - ARSIP DIGITAL MI
// ==================================================

// ⚠️ PERHATIAN: Ganti URL ini setelah deploy Apps Script! ⚠️
// Saat ini masih placeholder, nanti ganti dengan URL dari hasil deploy:
// https://script.google.com/macros/s/ID_HASIL_DEPLOY/exec

const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec';

// Fallback menggunakan localStorage jika API tidak tersedia
const USE_LOCAL_FALLBACK = true;

// ==================================================
// FUNGSI API CALL
// ==================================================

async function callAPI(action, data = null, method = 'GET') {
    try {
        let url = `${API_URL}?action=${action}`;
        let options = { method: method };
        
        if (data && method === 'POST') {
            options.method = 'POST';
            options.body = JSON.stringify(data);
        } else if (data && method === 'GET') {
            Object.keys(data).forEach(key => {
                url += `&${key}=${encodeURIComponent(data[key])}`;
            });
        }
        
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.warn(`API call failed for ${action}:`, error);
        
        if (USE_LOCAL_FALLBACK) {
            return handleLocalFallback(action, data);
        }
        
        return { success: false, error: error.message };
    }
}

function handleLocalFallback(action, data) {
    switch(action) {
        case 'getSiswa':
            return { success: true, data: JSON.parse(localStorage.getItem('siswa_data') || '[]') };
        case 'getGuru':
            return { success: true, data: JSON.parse(localStorage.getItem('guru_data') || '[]') };
        case 'getArsip':
            return { success: true, data: JSON.parse(localStorage.getItem('arsip_data') || '[]') };
        case 'saveSiswa':
            let siswa = JSON.parse(localStorage.getItem('siswa_data') || '[]');
            if (!data.id) data.id = Date.now();
            siswa.push(data);
            localStorage.setItem('siswa_data', JSON.stringify(siswa));
            return { success: true };
        case 'saveGuru':
            let guru = JSON.parse(localStorage.getItem('guru_data') || '[]');
            if (!data.id) data.id = Date.now();
            guru.push(data);
            localStorage.setItem('guru_data', JSON.stringify(guru));
            return { success: true };
        default:
            return { success: false, error: 'No fallback available' };
    }
}

// ==================================================
// FUNGSI SPESIFIK API
// ==================================================

async function getSiswa() {
    const result = await callAPI('getSiswa');
    return result.data || [];
}

async function saveSiswa(siswaData) {
    return await callAPI('saveSiswa', siswaData, 'POST');
}

async function deleteSiswa(id) {
    return await callAPI('deleteSiswa', { id: id }, 'GET');
}

async function getGuru() {
    const result = await callAPI('getGuru');
    return result.data || [];
}

async function saveGuru(guruData) {
    return await callAPI('saveGuru', guruData, 'POST');
}

async function deleteGuru(id) {
    return await callAPI('deleteGuru', { id: id }, 'GET');
}

async function getArsip() {
    const result = await callAPI('getArsip');
    return result.data || [];
}

async function uploadArsip(file, kategori) {
    return await callAPI('uploadFile', { file: file, kategori: kategori }, 'POST');
}

async function deleteArsip(id, fileId) {
    return await callAPI('deleteArsip', { id: id, fileId: fileId }, 'GET');
}

async function getStats() {
    const result = await callAPI('getStats');
    return result.stats || { totalSiswa: 0, totalGuru: 0, totalArsip: 0, uploadHariIni: 0 };
}

// ==================================================
// DATA DEFAULT
// ==================================================

function initDefaultData() {
    if (!localStorage.getItem('siswa_data')) {
        localStorage.setItem('siswa_data', JSON.stringify([
            { id: 1, nama: 'Ahmad Fathoni', nisn: '0012345678', kelas: '6', jk: 'L', alamat: 'Jl. Pendidikan No. 1', wali: 'Budi Santoso' },
            { id: 2, nama: 'Siti Aisyah', nisn: '0012345679', kelas: '5', jk: 'P', alamat: 'Jl. Madrasah No. 2', wali: 'Siti Aminah' }
        ]));
    }
    
    if (!localStorage.getItem('guru_data')) {
        localStorage.setItem('guru_data', JSON.stringify([
            { id: 1, nama: 'Dr. H. Muhammad Ali, M.Pd', nip: '196501011990031001', mapel: 'Matematika', nohp: '081234567890', tahun: '2005' },
            { id: 2, nama: 'Hj. Siti Fatimah, S.Ag', nip: '196702021992032002', mapel: 'Pendidikan Agama', nohp: '081234567891', tahun: '2008' }
        ]));
    }
    
    if (!localStorage.getItem('arsip_data')) {
        localStorage.setItem('arsip_data', JSON.stringify([]));
    }
}

initDefaultData();

// Ekspor ke global
window.API = {
    getSiswa, saveSiswa, deleteSiswa,
    getGuru, saveGuru, deleteGuru,
    getArsip, uploadArsip, deleteArsip,
    getStats
};
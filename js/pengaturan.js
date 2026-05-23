// Load Settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    
    // Dark Mode
    if (settings.darkMode) {
        document.getElementById('darkModeToggle').checked = true;
        document.body.classList.add('dark');
    }
    
    // Nama Sekolah
    if (settings.namaSekolah) {
        document.getElementById('namaSekolah').value = settings.namaSekolah;
    }
    
    // Drive Folder ID
    if (settings.driveFolderId) {
        document.getElementById('driveFolderId').value = settings.driveFolderId;
    }
}

// Toggle Dark Mode
document.getElementById('darkModeToggle')?.addEventListener('change', function(e) {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    settings.darkMode = e.target.checked;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    
    if (e.target.checked) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
});

// Change Theme Color
function changeTheme(color) {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    settings.tema = color;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    
    // Apply theme
    const root = document.documentElement;
    const colors = {
        pink: ['#f093fb', '#f5576c'],
        purple: ['#a855f7', '#7c3aed'],
        blue: ['#60a5fa', '#3b82f6'],
        green: ['#34d399', '#10b981']
    };
    
    root.style.setProperty('--gradient-start', colors[color][0]);
    root.style.setProperty('--gradient-end', colors[color][1]);
    
    showNotification(`Tema ${color} berhasil diterapkan!`, 'success');
}

// Save School Name
function saveSekolah() {
    const namaSekolah = document.getElementById('namaSekolah').value;
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    settings.namaSekolah = namaSekolah;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    
    // Update sidebar
    const schoolNameElement = document.querySelector('.sidebar-gradient p');
    if (schoolNameElement) {
        schoolNameElement.textContent = namaSekolah;
    }
    
    showNotification('Nama sekolah berhasil disimpan!', 'success');
}

// Save Drive Configuration
function saveDriveConfig() {
    const driveFolderId = document.getElementById('driveFolderId').value;
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    settings.driveFolderId = driveFolderId;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    
    showNotification('Konfigurasi Google Drive berhasil disimpan!', 'success');
}

// Backup Data
function backupData() {
    const data = {
        siswa: JSON.parse(localStorage.getItem(STORAGE_KEYS.SISWA) || '[]'),
        guru: JSON.parse(localStorage.getItem(STORAGE_KEYS.GURU) || '[]'),
        arsip: JSON.parse(localStorage.getItem(STORAGE_KEYS.ARSIP) || '[]'),
        settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}'),
        backupDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_arsip_digital_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Backup data berhasil dibuat!', 'success');
}

// Restore Backup
document.getElementById('restoreFile')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const backup = JSON.parse(event.target.result);
            
            if (backup.siswa) localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(backup.siswa));
            if (backup.guru) localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(backup.guru));
            if (backup.arsip) localStorage.setItem(STORAGE_KEYS.ARSIP, JSON.stringify(backup.arsip));
            if (backup.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(backup.settings));
            
            showNotification('Restore data berhasil!', 'success');
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            showNotification('File backup tidak valid!', 'error');
        }
    };
    reader.readAsText(file);
});

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-fade-in`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});
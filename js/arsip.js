let allArsip = [];

async function loadArsip() {
    allArsip = await getData('arsip');
    renderTable();
}

function renderTable() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterKategori = document.getElementById('filterKategori')?.value || '';
    
    const filteredArsip = allArsip.filter(arsip => {
        const matchSearch = arsip.nama.toLowerCase().includes(searchTerm);
        const matchKategori = !filterKategori || arsip.kategori === filterKategori;
        return matchSearch && matchKategori;
    });
    
    const tbody = document.getElementById('arsipTableBody');
    
    if (filteredArsip.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">Tidak ada arsip</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredArsip.map((arsip, index) => `
        <tr>
            <td class="px-4 py-3">${index + 1}</td>
            <td class="px-4 py-3">${arsip.nama}</td>
            <td class="px-4 py-3"><span class="category-badge category-${arsip.kategori.toLowerCase().replace(/ /g, '-')}">${arsip.kategori}</span></td>
            <td class="px-4 py-3">${formatFileSize(arsip.ukuran)}</td>
            <td class="px-4 py-3">${formatDate(arsip.tanggal)}</td>
            <td class="px-4 py-3">
                <button onclick="downloadArsip(${index})" class="btn-edit px-3 py-1 rounded-lg text-white text-sm mr-2">
                    <i data-lucide="download" class="w-4 h-4 inline"></i> Download
                </button>
                <button onclick="deleteArsip(${index})" class="btn-delete px-3 py-1 rounded-lg text-white text-sm">
                    <i data-lucide="trash-2" class="w-4 h-4 inline"></i> Hapus
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

function openUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('uploadForm').reset();
    document.getElementById('uploadProgress').classList.add('hidden');
}

async function uploadFile(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const kategori = document.getElementById('kategori').value;
    
    if (!fileInput.files.length) {
        alert('Pilih file terlebih dahulu!');
        return;
    }
    
    if (!kategori) {
        alert('Pilih kategori arsip!');
        return;
    }
    
    const progressDiv = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressDiv.classList.remove('hidden');
    
    for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        const progress = ((i + 1) / fileInput.files.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        // Simpan file ke localStorage (simulasi)
        const reader = new FileReader();
        await new Promise((resolve) => {
            reader.onload = async function(e) {
                const arsipData = {
                    id: generateId(),
                    nama: file.name,
                    kategori: kategori,
                    ukuran: file.size,
                    tanggal: new Date().toISOString(),
                    data: e.target.result
                };
                
                allArsip.push(arsipData);
                await saveData('arsip', allArsip);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }
    
    setTimeout(() => {
        closeUploadModal();
        loadArsip();
        showNotification('File berhasil diupload!', 'success');
    }, 500);
}

function downloadArsip(index) {
    const arsip = allArsip[index];
    if (arsip && arsip.data) {
        const link = document.createElement('a');
        link.href = arsip.data;
        link.download = arsip.nama;
        link.click();
    } else {
        alert('File tidak ditemukan!');
    }
}

async function deleteArsip(index) {
    if (confirm('Apakah Anda yakin ingin menghapus arsip ini?')) {
        allArsip.splice(index, 1);
        await saveData('arsip', allArsip);
        loadArsip();
        showNotification('Arsip berhasil dihapus!', 'success');
    }
}

// Drag and Drop
function setupDragAndDrop() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    
    dropzone.addEventListener('click', () => fileInput.click());
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        fileInput.files = e.dataTransfer.files;
        showNotification(`${fileInput.files.length} file siap diupload`, 'success');
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            showNotification(`${fileInput.files.length} file dipilih`, 'success');
        }
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-fade-in`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadArsip();
    setupDragAndDrop();
    document.getElementById('uploadForm')?.addEventListener('submit', uploadFile);
    document.getElementById('searchInput')?.addEventListener('input', () => renderTable());
    document.getElementById('filterKategori')?.addEventListener('change', () => renderTable());
});
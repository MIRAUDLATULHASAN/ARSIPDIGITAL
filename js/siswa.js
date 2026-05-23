let currentPage = 1;
let itemsPerPage = 10;
let allSiswa = [];
let filteredSiswa = [];

async function loadSiswa() {
    allSiswa = await getData('siswa');
    filteredSiswa = [...allSiswa];
    renderTable();
}

function renderTable() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterKelas = document.getElementById('filterKelas')?.value || '';
    
    filteredSiswa = allSiswa.filter(siswa => {
        const matchSearch = siswa.nama.toLowerCase().includes(searchTerm) || 
                           siswa.nisn.includes(searchTerm);
        const matchKelas = !filterKelas || siswa.kelas === filterKelas;
        return matchSearch && matchKelas;
    });
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageSiswa = filteredSiswa.slice(start, end);
    
    const tbody = document.getElementById('siswaTableBody');
    
    if (pageSiswa.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-gray-500">Tidak ada data</td></tr>';
        renderPagination();
        return;
    }
    
    tbody.innerHTML = pageSiswa.map((siswa, index) => `
        <tr>
            <td class="px-4 py-3" data-label="No">${start + index + 1}</td>
            <td class="px-4 py-3" data-label="Nama">${siswa.nama}</td>
            <td class="px-4 py-3" data-label="NISN">${siswa.nisn}</td>
            <td class="px-4 py-3" data-label="Kelas">Kelas ${siswa.kelas}</td>
            <td class="px-4 py-3" data-label="Jenis Kelamin">${siswa.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
            <td class="px-4 py-3" data-label="Alamat">${siswa.alamat || '-'}</td>
            <td class="px-4 py-3" data-label="Nama Wali">${siswa.wali || '-'}</td>
            <td class="px-4 py-3" data-label="Aksi">
                <button onclick="editSiswa(${siswa.id})" class="btn-edit px-3 py-1 rounded-lg text-white text-sm mr-2">
                    <i data-lucide="edit-2" class="w-4 h-4 inline"></i> Edit
                </button>
                <button onclick="deleteSiswa(${siswa.id})" class="btn-delete px-3 py-1 rounded-lg text-white text-sm">
                    <i data-lucide="trash-2" class="w-4 h-4 inline"></i> Hapus
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredSiswa.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<div class="flex gap-2">';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="goToPage(${i})" class="pagination-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    html += '</div>';
    pagination.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

function openModal(editMode = false, data = null) {
    const modal = document.getElementById('siswaModal');
    const title = document.getElementById('modalTitle');
    
    if (editMode && data) {
        title.textContent = 'Edit Siswa';
        document.getElementById('siswaId').value = data.id;
        document.getElementById('nama').value = data.nama;
        document.getElementById('nisn').value = data.nisn;
        document.getElementById('kelas').value = data.kelas;
        document.getElementById('jk').value = data.jk;
        document.getElementById('alamat').value = data.alamat || '';
        document.getElementById('wali').value = data.wali || '';
    } else {
        title.textContent = 'Tambah Siswa';
        document.getElementById('siswaForm').reset();
        document.getElementById('siswaId').value = '';
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModal() {
    const modal = document.getElementById('siswaModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function saveSiswa(event) {
    event.preventDefault();
    
    const id = document.getElementById('siswaId').value;
    const siswaData = {
        nama: document.getElementById('nama').value,
        nisn: document.getElementById('nisn').value,
        kelas: document.getElementById('kelas').value,
        jk: document.getElementById('jk').value,
        alamat: document.getElementById('alamat').value,
        wali: document.getElementById('wali').value
    };
    
    if (id) {
        // Edit existing
        const index = allSiswa.findIndex(s => s.id == id);
        if (index !== -1) {
            allSiswa[index] = { ...allSiswa[index], ...siswaData };
        }
    } else {
        // Add new
        siswaData.id = generateId();
        allSiswa.push(siswaData);
    }
    
    await saveData('siswa', allSiswa);
    closeModal();
    loadSiswa();
    showNotification('Data berhasil disimpan!', 'success');
}

function editSiswa(id) {
    const siswa = allSiswa.find(s => s.id === id);
    if (siswa) {
        openModal(true, siswa);
    }
}

async function deleteSiswa(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        allSiswa = allSiswa.filter(s => s.id !== id);
        await saveData('siswa', allSiswa);
        loadSiswa();
        showNotification('Data berhasil dihapus!', 'success');
    }
}

function exportToExcel() {
    const headers = ['No', 'Nama Siswa', 'NISN', 'Kelas', 'Jenis Kelamin', 'Alamat', 'Nama Wali'];
    const rows = filteredSiswa.map((siswa, index) => [
        index + 1,
        siswa.nama,
        siswa.nisn,
        `Kelas ${siswa.kelas}`,
        siswa.jk === 'L' ? 'Laki-laki' : 'Perempuan',
        siswa.alamat || '',
        siswa.wali || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_siswa_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data berhasil diekspor!', 'success');
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
    loadSiswa();
    document.getElementById('siswaForm')?.addEventListener('submit', saveSiswa);
    document.getElementById('searchInput')?.addEventListener('input', () => {
        currentPage = 1;
        renderTable();
    });
    document.getElementById('filterKelas')?.addEventListener('change', () => {
        currentPage = 1;
        renderTable();
    });
});
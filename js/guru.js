let allGuru = [];

async function loadGuru() {
    allGuru = await getData('guru');
    renderTable();
}

function renderTable() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filteredGuru = allGuru.filter(guru => 
        guru.nama.toLowerCase().includes(searchTerm) ||
        guru.nip.includes(searchTerm) ||
        guru.mapel.toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.getElementById('guruTableBody');
    
    if (filteredGuru.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">Tidak ada data</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredGuru.map((guru, index) => `
        <tr>
            <td class="px-4 py-3" data-label="No">${index + 1}</td>
            <td class="px-4 py-3" data-label="Nama Guru">${guru.nama}</td>
            <td class="px-4 py-3" data-label="NIP">${guru.nip || '-'}</td>
            <td class="px-4 py-3" data-label="Mata Pelajaran"><span class="mapel-badge">${guru.mapel}</span></td>
            <td class="px-4 py-3" data-label="No HP">${guru.nohp}</td>
            <td class="px-4 py-3" data-label="Tahun Mengajar">${guru.tahun}</td>
            <td class="px-4 py-3" data-label="Aksi">
                <button onclick="editGuru(${guru.id})" class="btn-edit px-3 py-1 rounded-lg text-white text-sm mr-2">
                    <i data-lucide="edit-2" class="w-4 h-4 inline"></i> Edit
                </button>
                <button onclick="deleteGuru(${guru.id})" class="btn-delete px-3 py-1 rounded-lg text-white text-sm">
                    <i data-lucide="trash-2" class="w-4 h-4 inline"></i> Hapus
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

function openModal(editMode = false, data = null) {
    const modal = document.getElementById('guruModal');
    const title = document.getElementById('modalTitle');
    
    if (editMode && data) {
        title.textContent = 'Edit Guru';
        document.getElementById('guruId').value = data.id;
        document.getElementById('nama').value = data.nama;
        document.getElementById('nip').value = data.nip || '';
        document.getElementById('mapel').value = data.mapel;
        document.getElementById('nohp').value = data.nohp;
        document.getElementById('tahun').value = data.tahun;
    } else {
        title.textContent = 'Tambah Guru';
        document.getElementById('guruForm').reset();
        document.getElementById('guruId').value = '';
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModal() {
    const modal = document.getElementById('guruModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function saveGuru(event) {
    event.preventDefault();
    
    const id = document.getElementById('guruId').value;
    const guruData = {
        nama: document.getElementById('nama').value,
        nip: document.getElementById('nip').value,
        mapel: document.getElementById('mapel').value,
        nohp: document.getElementById('nohp').value,
        tahun: document.getElementById('tahun').value
    };
    
    if (id) {
        const index = allGuru.findIndex(g => g.id == id);
        if (index !== -1) {
            allGuru[index] = { ...allGuru[index], ...guruData };
        }
    } else {
        guruData.id = generateId();
        allGuru.push(guruData);
    }
    
    await saveData('guru', allGuru);
    closeModal();
    loadGuru();
    showNotification('Data guru berhasil disimpan!', 'success');
}

function editGuru(id) {
    const guru = allGuru.find(g => g.id === id);
    if (guru) {
        openModal(true, guru);
    }
}

async function deleteGuru(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
        allGuru = allGuru.filter(g => g.id !== id);
        await saveData('guru', allGuru);
        loadGuru();
        showNotification('Data guru berhasil dihapus!', 'success');
    }
}

function exportToExcel() {
    const headers = ['No', 'Nama Guru', 'NIP', 'Mata Pelajaran', 'No HP', 'Tahun Mengajar'];
    const rows = allGuru.map((guru, index) => [
        index + 1,
        guru.nama,
        guru.nip || '',
        guru.mapel,
        guru.nohp,
        guru.tahun
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_guru_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data guru berhasil diekspor!', 'success');
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
    loadGuru();
    document.getElementById('guruForm')?.addEventListener('submit', saveGuru);
    document.getElementById('searchInput')?.addEventListener('input', () => renderTable());
});
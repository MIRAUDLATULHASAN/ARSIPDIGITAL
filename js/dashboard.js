// Load Dashboard Data
async function loadDashboard() {
    try {
        const siswa = await getData('siswa');
        const guru = await getData('guru');
        const arsip = await getData('arsip');
        
        // Update counters with animation
        animateCounter('totalSiswa', siswa.length);
        animateCounter('totalGuru', guru.length);
        animateCounter('totalArsip', arsip.length);
        
        // Today's uploads
        const today = new Date().toDateString();
        const todayUploads = arsip.filter(a => new Date(a.tanggal).toDateString() === today);
        animateCounter('uploadHariIni', todayUploads.length);
        
        // Load charts
        loadArsipChart(arsip);
        loadAktivitasChart(arsip);
        
        // Load recent uploads
        loadRecentUploads(arsip);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let currentValue = 0;
    const duration = 1000;
    const increment = targetValue / (duration / 16);
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            element.textContent = targetValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(currentValue);
        }
    }, 16);
}

function loadArsipChart(arsip) {
    const categories = ['Raport', 'Administrasi', 'Surat', 'Data Guru', 'Data Siswa', 'Dokumen Sekolah'];
    const counts = categories.map(cat => arsip.filter(a => a.kategori === cat).length);
    
    const ctx = document.getElementById('arsipChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: counts,
                backgroundColor: [
                    '#10b981', '#3b82f6', '#f59e0b',
                    '#8b5cf6', '#ec489a', '#06b6d4'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function loadAktivitasChart(arsip) {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toDateString());
    }
    
    const counts = last7Days.map(day => 
        arsip.filter(a => new Date(a.tanggal).toDateString() === day).length
    );
    
    const ctx = document.getElementById('aktivitasChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days.map(d => d.substring(0, 10)),
            datasets: [{
                label: 'Jumlah Upload',
                data: counts,
                borderColor: '#f5576c',
                backgroundColor: 'rgba(245, 87, 108, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function loadRecentUploads(arsip) {
    const recent = [...arsip].reverse().slice(0, 5);
    const tbody = document.getElementById('recentUploads');
    
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-gray-500">Belum ada arsip</td></tr>';
        return;
    }
    
    tbody.innerHTML = recent.map(file => `
        <tr>
            <td class="px-4 py-3">${file.nama}</td>
            <td class="px-4 py-3"><span class="category-badge category-${file.kategori.toLowerCase().replace(/ /g, '-')}">${file.kategori}</span></td>
            <td class="px-4 py-3">${formatDate(file.tanggal)}</td>
        </tr>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
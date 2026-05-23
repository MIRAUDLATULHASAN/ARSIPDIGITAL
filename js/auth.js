// ==================================================
// SISTEM AUTENTIKASI - ARSIP DIGITAL MI
// ==================================================

const AUTH_CONFIG = {
    STORAGE_KEY: 'arsip_auth',
    USER_KEY: 'arsip_user',
    DEFAULT_USER: {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        nama: 'Administrator',
        email: 'admin@raudlatulhasan.sch.id'
    },
    DEFAULT_GURU: {
        username: 'guru',
        password: 'guru123',
        role: 'guru',
        nama: 'Guru MI',
        email: 'guru@raudlatulhasan.sch.id'
    }
};

function isLoggedIn() {
    const auth = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
    if (!auth) return false;
    try {
        const data = JSON.parse(auth);
        const now = new Date().getTime();
        if (now - data.timestamp > 24 * 60 * 60 * 1000) {
            logout();
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

async function login(username, password) {
    if (!username || !password) {
        return { success: false, message: 'Username dan password harus diisi!' };
    }
    
    // Cek ke backend jika API tersedia
    try {
        const response = await fetch(`${API_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
        const result = await response.json();
        if (result.success) {
            const session = {
                user: result.user,
                timestamp: new Date().getTime(),
                token: btoa(username + ':' + new Date().getTime())
            };
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(session));
            localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(result.user));
            return { success: true, user: result.user };
        }
    } catch (error) {
        console.log('Backend tidak tersedia, menggunakan mode offline');
    }
    
    // Mode offline
    if (username === AUTH_CONFIG.DEFAULT_USER.username && password === AUTH_CONFIG.DEFAULT_USER.password) {
        const user = { ...AUTH_CONFIG.DEFAULT_USER };
        const session = { user, timestamp: new Date().getTime(), token: btoa(username + ':' + new Date().getTime()) };
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(session));
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
        return { success: true, user: user };
    }
    
    if (username === AUTH_CONFIG.DEFAULT_GURU.username && password === AUTH_CONFIG.DEFAULT_GURU.password) {
        const user = { ...AUTH_CONFIG.DEFAULT_GURU };
        const session = { user, timestamp: new Date().getTime(), token: btoa(username + ':' + new Date().getTime()) };
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(session));
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
        return { success: true, user: user };
    }
    
    return { success: false, message: 'Username atau password salah!' };
}

function logout() {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    window.location.href = 'index.html';
}

function getCurrentUser() {
    const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

function hasRole(roles) {
    const user = getCurrentUser();
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return false;
}

function requireAuth(redirectUrl = 'index.html') {
    if (!isLoggedIn()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

function showAuthMessage(message, type = 'error') {
    const oldMsg = document.querySelector('.auth-message');
    if (oldMsg) oldMsg.remove();
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `auth-message p-3 rounded-lg text-sm mb-4 ${
        type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
    }`;
    msgDiv.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="w-4 h-4"></i><span>${message}</span></div>`;
    
    const form = document.getElementById('loginForm');
    if (form) form.insertBefore(msgDiv, form.firstChild);
    
    lucide.createIcons();
    setTimeout(() => msgDiv.remove(), 3000);
}

function togglePasswordVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    if (!input || !button) return;
    
    button.addEventListener('click', () => {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        const icon = button.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
            lucide.createIcons();
        }
    });
}

function initAuthProtection() {
    if (!requireAuth()) return false;
    updateUserUI();
    return true;
}

function updateUserUI() {
    const user = getCurrentUser();
    if (!user) return;
    
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = user.nama || user.username;
    
    const userInitialEl = document.getElementById('userInitial');
    if (userInitialEl) userInitialEl.textContent = (user.nama || user.username).charAt(0).toUpperCase();
}

window.Auth = {
    isLoggedIn, login, logout, getCurrentUser, hasRole,
    requireAuth, showAuthMessage, togglePasswordVisibility, initAuthProtection
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('password')) {
        togglePasswordVisibility('password', 'togglePassword');
    }
});
// Admin oturum kontrolü
function checkAdminAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin-login.html';
        return false;
    }
    return true;
}

// Admin çıkış işlemi
function adminLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login.html';
}

// Sayfa yüklendiğinde oturum kontrolü yap
document.addEventListener('DOMContentLoaded', () => {
    // Admin paneli sayfasındaysa ve oturum yoksa login sayfasına yönlendir
    if (window.location.pathname === '/admin.html') {
        checkAdminAuth();
    }
}); 
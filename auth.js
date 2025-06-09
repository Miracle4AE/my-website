// API endpoint'leri
const API_URL = window.location.origin;

// Oturum kontrolü ve navbar güncelleme
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        // Navbar'ı güncelle
        const navbar = document.querySelector('.navbar-nav');
        if (navbar) {
            navbar.innerHTML = `
                <li class="nav-item">
                    <span class="nav-link">Hoş geldin, ${user.name}</span>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/profile.html">Profilim</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="logout()">Çıkış Yap</a>
                </li>
            `;
        }
        return true;
    }
    return false;
}

// Sayfa yüklendiğinde oturum kontrolü yap
document.addEventListener('DOMContentLoaded', checkAuth);

// Kullanıcı kaydı
async function register(name, email, password) {
    try {
        const response = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Kayıt işlemi başarısız');
        }

        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            id: data._id,
            name: data.name,
            email: data.email
        }));

        return data;
    } catch (error) {
        console.error('Kayıt hatası:', error);
        throw error;
    }
}

// Kullanıcı girişi
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Giriş başarısız');
        }

        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            id: data._id,
            name: data.name,
            email: data.email
        }));

        return data;
    } catch (error) {
        console.error('Giriş hatası:', error);
        throw error;
    }
}

// Kullanıcı çıkışı
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Profil bilgilerini getir
async function getProfile() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Profil bilgileri alınamadı');
        }

        return data;
    } catch (error) {
        console.error('Profil bilgileri hatası:', error);
        throw error;
    }
}

// Profil güncelleme
async function updateProfile(updateData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Profil güncellenemedi');
        }

        // Kullanıcı bilgilerini güncelle
        localStorage.setItem('user', JSON.stringify({
            id: data._id,
            name: data.name,
            email: data.email
        }));

        return data;
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        throw error;
    }
}

// Token kontrolü
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
}

// Email format kontrolü
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Güçlü şifre kontrolü
function isStrongPassword(password) {
    // En az 8 karakter
    // En az 1 büyük harf
    // En az 1 küçük harf
    // En az 1 sayı
    // En az 1 özel karakter
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
} 
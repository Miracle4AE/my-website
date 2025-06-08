document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    // Basit client-side doğrulama (geçici çözüm)
    if (username === 'admin' && password === 'admin123') {
        // Token oluştur
        const token = btoa(username + ':' + new Date().getTime());
        // Token'ı localStorage'a kaydet
        localStorage.setItem('adminToken', token);
        // Admin paneline yönlendir
        window.location.href = 'admin.html';
    } else {
        errorMessage.textContent = 'Kullanıcı adı veya şifre hatalı!';
    }
}); 
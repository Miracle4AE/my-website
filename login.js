document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Token'ı localStorage'a kaydet
            localStorage.setItem('adminToken', data.token);
            // Admin paneline yönlendir
            window.location.href = 'admin.html';
        } else {
            errorMessage.textContent = 'Kullanıcı adı veya şifre hatalı!';
        }
    } catch (error) {
        errorMessage.textContent = 'Giriş yapılırken bir hata oluştu!';
        console.error('Login error:', error);
    }
}); 
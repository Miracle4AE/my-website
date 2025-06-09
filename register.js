document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const submitButton = document.querySelector('.register-submit-btn');
    const captchaItems = document.querySelectorAll('.captcha-item');
    const selectedCountElement = document.getElementById('selectedCount');
    let selectedStars = 0;
    
    // Captcha işlemleri
    captchaItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.value === 'star') {
                if (!item.classList.contains('selected') && selectedStars < 3) {
                    item.classList.add('selected');
                    selectedStars++;
                } else if (item.classList.contains('selected')) {
                    item.classList.remove('selected');
                    selectedStars--;
                }
            } else {
                if (item.classList.contains('selected')) {
                    item.classList.remove('selected');
                } else if (document.querySelectorAll('.captcha-item.selected').length < 3) {
                    item.classList.add('selected');
                }
            }
            
            selectedCountElement.textContent = selectedStars;
            
            // Submit butonunu kontrol et
            submitButton.disabled = selectedStars !== 3;
        });
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Form verilerini al
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            birthDate: document.getElementById('birthDate').value,
            email: document.getElementById('email').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            joinDate: new Date().toISOString()
        };
        
        // Şifre kontrolü
        if (formData.password !== formData.confirmPassword) {
            alert('Şifreler eşleşmiyor!');
            return;
        }
        
        // Email formatı kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Geçerli bir email adresi giriniz!');
            return;
        }
        
        // Kullanıcı adı kontrolü (en az 3 karakter)
        if (formData.username.length < 3) {
            alert('Kullanıcı adı en az 3 karakter olmalıdır!');
            return;
        }
        
        // Şifre güvenlik kontrolü (en az 6 karakter)
        if (formData.password.length < 6) {
            alert('Şifre en az 6 karakter olmalıdır!');
            return;
        }
        
        // Captcha kontrolü
        if (selectedStars !== 3) {
            alert('Lütfen güvenlik doğrulamasını tamamlayın!');
            return;
        }
        
        // Mevcut kullanıcıları kontrol et
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        
        // Kullanıcı adı kontrolü
        if (registeredUsers.some(user => user.username === formData.username)) {
            alert('Bu kullanıcı adı zaten kullanılıyor!');
            return;
        }
        
        // Yeni kullanıcıyı kaydet
        registeredUsers.push(formData);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        // Kullanıcı bilgilerini aktif oturum için kaydet
        localStorage.setItem('userInfo', JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            birthDate: formData.birthDate,
            joinDate: formData.joinDate,
            username: formData.username
        }));
        
        alert('Üyelik başarıyla oluşturuldu! Profilinize yönlendiriliyorsunuz.');
        window.location.href = 'profile.html';
    });
}); 
// Loading Screen
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    
    // 2 saniye sonra loading ekranını kaldır
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);
});

// Slider görselleri
const sliderImages = [
    'images/fitness-back.jpg.png',
    'images/Screenshot_1.png',
    'images/Screenshot_2.png',
    'images/Screenshot_3.png',
    'images/Screenshot_4.png'
];

let currentSlide = 0;
const slider = document.querySelector('.slider');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

// Slider'ı başlat
function initSlider() {
    console.log('Slider başlatılıyor...');
    console.log('Slider görselleri:', sliderImages);
    
    sliderImages.forEach((image, index) => {
        const img = document.createElement('img');
        img.src = image;
        img.style.position = 'absolute';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.opacity = index === 0 ? '1' : '0';
        img.style.transition = 'opacity 0.5s ease-in-out';
        
        // Görsel yüklenme hatası kontrolü
        img.onerror = () => {
            console.error('Görsel yüklenemedi:', image);
        };
        
        // Görsel başarıyla yüklendiğinde
        img.onload = () => {
            console.log('Görsel yüklendi:', image);
        };
        
        slider.appendChild(img);
    });
    console.log('Slider başlatıldı');
}

// Slider'ı güncelle
function updateSlider() {
    const images = slider.querySelectorAll('img');
    images.forEach((img, index) => {
        img.style.opacity = index === currentSlide ? '1' : '0';
    });
}

// Önceki slide'a git
function prevSlide() {
    currentSlide = (currentSlide - 1 + sliderImages.length) % sliderImages.length;
    updateSlider();
}

// Sonraki slide'a git
function nextSlide() {
    currentSlide = (currentSlide + 1) % sliderImages.length;
    updateSlider();
}

// Event listener'ları ekle
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// Otomatik slide değişimi
setInterval(nextSlide, 5000);

// Slider'ı başlat
initSlider();

// Login işlemleri
const loginForm = document.querySelector('.login-section');
const loginBtn = document.querySelector('.login-btn');

loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const username = loginForm.querySelector('input[type="text"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;
    
    // Kayıtlı kullanıcı bilgilerini kontrol et
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const user = registeredUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('userInfo', JSON.stringify({
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate,
            joinDate: user.joinDate,
            username: user.username
        }));
        
        // Profil sayfasına yönlendir
        window.location.href = 'profile.html';
    } else {
        alert('Kullanıcı adı veya şifre hatalı!');
    }
}); 
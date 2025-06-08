document.addEventListener('DOMContentLoaded', () => {
    // Kullanıcı giriş kontrolü
    const currentUser = JSON.parse(localStorage.getItem('userInfo'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Kullanıcı bilgilerini göster
    displayUserInfo(currentUser);
    
    // Admin tarafından girilen verileri göster
    displayUserData(currentUser);
});

function displayUserInfo(user) {
    // Üst menüdeki isim
    document.getElementById('userFullName').textContent = `${user.firstName} ${user.lastName}`;
    
    // Profil bilgileri
    document.getElementById('userFirstName').textContent = user.firstName;
    document.getElementById('userLastName').textContent = user.lastName;
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userBirthDate').textContent = new Date(user.birthDate).toLocaleDateString('tr-TR');
    document.getElementById('userJoinDate').textContent = new Date(user.joinDate).toLocaleDateString('tr-TR');
}

function displayUserData(user) {
    const userData = JSON.parse(localStorage.getItem(`userData_${user.username}`)) || {
        activeCourses: [],
        paidFees: [],
        pendingFees: []
    };

    // Aktif dersleri göster
    const activeCoursesElement = document.getElementById('activeCourses');
    if (userData.activeCourses && userData.activeCourses.length > 0) {
        activeCoursesElement.innerHTML = userData.activeCourses
            .map(course => `<li>${course.name} - ${new Date(course.date).toLocaleDateString('tr-TR')} ${course.time}</li>`)
            .join('');
    } else {
        activeCoursesElement.innerHTML = '<li>Henüz aktif ders bulunmamaktadır.</li>';
    }

    // Ödenmiş ücretleri göster
    const paidFeesElement = document.getElementById('paidFees');
    if (userData.paidFees && userData.paidFees.length > 0) {
        paidFeesElement.innerHTML = userData.paidFees
            .map(fee => `<li>${new Date(fee.date).toLocaleDateString('tr-TR')} - ${fee.amount} TL</li>`)
            .join('');
    } else {
        paidFeesElement.innerHTML = '<li>Henüz ödenmiş ücret bulunmamaktadır.</li>';
    }

    // Ödenecek ücretleri göster
    const pendingFeesElement = document.getElementById('pendingFees');
    if (userData.pendingFees && userData.pendingFees.length > 0) {
        pendingFeesElement.innerHTML = userData.pendingFees
            .map(fee => `<li>${new Date(fee.date).toLocaleDateString('tr-TR')} - ${fee.amount} TL</li>`)
            .join('');
    } else {
        pendingFeesElement.innerHTML = '<li>Henüz ödenecek ücret bulunmamaktadır.</li>';
    }
}

function logout() {
    localStorage.removeItem('userInfo');
    window.location.href = 'index.html';
} 
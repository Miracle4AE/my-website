document.addEventListener('DOMContentLoaded', () => {
    // Admin kontrolü
    const adminInfo = {
        username: 'admin',
        password: '1234'
    };

    // Eğer admin girişi yapılmamışsa login sayfasına yönlendir
    if (!localStorage.getItem('adminLoggedIn')) {
        const username = prompt('Admin kullanıcı adı:');
        const password = prompt('Admin şifresi:');

        if (username === adminInfo.username && password === adminInfo.password) {
            localStorage.setItem('adminLoggedIn', 'true');
        } else {
            alert('Hatalı giriş! Ana sayfaya yönlendiriliyorsunuz.');
            window.location.href = 'index.html';
            return;
        }
    }

    // Üye listesini yükle
    loadUserList();

    // Üye ekleme formunu dinle
    const addUserForm = document.getElementById('adminAddUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }
});

function loadUserList() {
    const userList = document.getElementById('userList');
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    userList.innerHTML = '';
    registeredUsers.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.textContent = `${user.firstName} ${user.lastName}`;
        userItem.onclick = () => loadUserDetails(user);
        userList.appendChild(userItem);
    });
}

function loadUserDetails(user) {
    // Aktif kullanıcıyı seç
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
        if (item.textContent === `${user.firstName} ${user.lastName}`) {
            item.classList.add('active');
        }
    });

    const userDetails = document.getElementById('userDetails');
    const userInfoDisplay = userDetails.querySelector('.user-info-display');
    const editSections = userDetails.querySelector('.edit-sections');

    // Kullanıcı bilgilerini göster
    userInfoDisplay.innerHTML = `
        <h3>${user.firstName} ${user.lastName}</h3>
        <p><strong>Kullanıcı Adı:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Doğum Tarihi:</strong> ${new Date(user.birthDate).toLocaleDateString('tr-TR')}</p>
        <p><strong>Üyelik Tarihi:</strong> ${new Date(user.joinDate).toLocaleDateString('tr-TR')}</p>
        <button class="delete-user-btn" onclick="deleteUser('${user.username}')">Üyeyi Sil</button>
    `;

    // Düzenleme bölümünü göster
    editSections.style.display = 'block';

    // Mevcut verileri yükle
    const userData = JSON.parse(localStorage.getItem(`userData_${user.username}`)) || {
        activeCourses: [],
        paidFees: [],
        pendingFees: []
    };

    // Aktif dersleri listele
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';
    userData.activeCourses.forEach((course, index) => {
        const courseItem = createCourseItem(course, index);
        courseList.appendChild(courseItem);
    });
    
    // Ödenmiş ücretleri listele
    const paidFeesList = document.getElementById('paidFeesList');
    paidFeesList.innerHTML = '';
    userData.paidFees.forEach((fee, index) => {
        const feeItem = createFeeItem(fee, index, true);
        paidFeesList.appendChild(feeItem);
    });

    // Ödenecek ücretleri listele
    const pendingFeesList = document.getElementById('pendingFeesList');
    pendingFeesList.innerHTML = '';
    userData.pendingFees.forEach((fee, index) => {
        const feeItem = createFeeItem(fee, index, false);
        pendingFeesList.appendChild(feeItem);
    });

    // Kaydet butonuna kullanıcı bilgisini ekle
    window.currentUsername = user.username;
}

function createCourseItem(course, index) {
    const div = document.createElement('div');
    div.className = 'course-item';
    div.innerHTML = `
        <div class="course-info">
            ${course.name} - ${new Date(course.date).toLocaleDateString('tr-TR')} ${course.time}
        </div>
        <div class="course-actions">
            <button class="edit-course-btn" onclick="editCourse(${index})">Düzenle</button>
            <button class="delete-course-btn" onclick="deleteCourse(${index})">Sil</button>
        </div>
    `;
    return div;
}

function addCourse() {
    const courseName = document.getElementById('courseSelect').value;
    const courseDate = document.getElementById('courseDate').value;
    const courseTime = document.getElementById('courseTime').value;

    if (!courseName || !courseDate || !courseTime) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    const userData = JSON.parse(localStorage.getItem(`userData_${window.currentUsername}`)) || {
        activeCourses: [],
        paidFees: [],
        pendingFees: []
    };

    const newCourse = {
        name: courseName,
        date: courseDate,
        time: courseTime
    };

    userData.activeCourses.push(newCourse);
    localStorage.setItem(`userData_${window.currentUsername}`, JSON.stringify(userData));

    // Listeyi güncelle
    const courseList = document.getElementById('courseList');
    const courseItem = createCourseItem(newCourse, userData.activeCourses.length - 1);
    courseList.appendChild(courseItem);

    // Input alanlarını temizle
    document.getElementById('courseSelect').value = '';
    document.getElementById('courseDate').value = '';
    document.getElementById('courseTime').value = '';
}

function editCourse(index) {
    const userData = JSON.parse(localStorage.getItem(`userData_${window.currentUsername}`));
    const course = userData.activeCourses[index];

    // Input alanlarını doldur
    document.getElementById('courseSelect').value = course.name;
    document.getElementById('courseDate').value = course.date;
    document.getElementById('courseTime').value = course.time;

    // Eski dersi sil
    deleteCourse(index);
}

function deleteCourse(index) {
    const userData = JSON.parse(localStorage.getItem(`userData_${window.currentUsername}`));
    userData.activeCourses.splice(index, 1);
    localStorage.setItem(`userData_${window.currentUsername}`, JSON.stringify(userData));

    // Listeyi güncelle
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';
    userData.activeCourses.forEach((course, i) => {
        const courseItem = createCourseItem(course, i);
        courseList.appendChild(courseItem);
    });
}

function createFeeItem(fee, index, isPaid) {
    const div = document.createElement('div');
    div.className = 'fee-item';
    div.innerHTML = `
        <div class="fee-info">
            ${new Date(fee.date).toLocaleDateString('tr-TR')} - ${fee.amount} TL
        </div>
        <div class="fee-actions">
            <button class="delete-fee-btn" onclick="deleteFee(${index}, ${isPaid})">Sil</button>
        </div>
    `;
    return div;
}

function addPaidFee() {
    const date = document.getElementById('paidFeeDate').value;
    const amount = document.getElementById('paidFeeAmount').value;

    if (!date || !amount) {
        alert('Lütfen tarih ve miktar giriniz!');
        return;
    }

    const userData = JSON.parse(localStorage.getItem(`userData_${window.currentUsername}`)) || {
        activeCourses: [],
        paidFees: [],
        pendingFees: []
    };

    userData.paidFees.push({ date, amount });
    localStorage.setItem(`userData_${window.currentUsername}`, JSON.stringify(userData));

    // Listeyi güncelle
    const paidFeesList = document.getElementById('paidFeesList');
    const feeItem = createFeeItem({ date, amount }, userData.paidFees.length - 1, true);
    paidFeesList.appendChild(feeItem);

    // Input alanlarını temizle
    document.getElementById('paidFeeDate').value = '';
    document.getElementById('paidFeeAmount').value = '';
}

function addPendingFee() {
    const date = document.getElementById('pendingFeeDate').value;
    const amount = document.getElementById('pendingFeeAmount').value;

    if (!date || !amount) {
        alert('Lütfen tarih ve miktar giriniz!');
        return;
    }

    const userData = JSON.parse(localStorage.getItem(`userData_${window.currentUsername}`)) || {
        activeCourses: [],
        paidFees: [],
        pendingFees: []
    };

    userData.pendingFees.push({ date, amount });
    localStorage.setItem(`userData_${window.currentUsername}`, JSON.stringify(userData));

    // Listeyi güncelle
    const pendingFeesList = document.getElementById('pendingFeesList');
    const feeItem = createFeeItem({ date, amount }, userData.pendingFees.length - 1, false);
    pendingFeesList.appendChild(feeItem);

    // Input alanlarını temizle
    document.getElementById('pendingFeeDate').value = '';
    document.getElementById('pendingFeeAmount').value = '';
}

function deleteFee(index, isPaid) {
    const userData = JSON.parse(localStorage.getItem(`userData_${window.currentUsername}`));
    
    if (isPaid) {
        userData.paidFees.splice(index, 1);
        const paidFeesList = document.getElementById('paidFeesList');
        paidFeesList.innerHTML = '';
        userData.paidFees.forEach((fee, i) => {
            const feeItem = createFeeItem(fee, i, true);
            paidFeesList.appendChild(feeItem);
        });
    } else {
        userData.pendingFees.splice(index, 1);
        const pendingFeesList = document.getElementById('pendingFeesList');
        pendingFeesList.innerHTML = '';
        userData.pendingFees.forEach((fee, i) => {
            const feeItem = createFeeItem(fee, i, false);
            pendingFeesList.appendChild(feeItem);
        });
    }

    localStorage.setItem(`userData_${window.currentUsername}`, JSON.stringify(userData));
}

function saveUserDetails() {
    const userData = {
        activeCourses: JSON.parse(localStorage.getItem(`userData_${window.currentUsername}`))?.activeCourses || [],
        paidFees: JSON.parse(localStorage.getItem(`userData_${window.currentUsername}`))?.paidFees || [],
        pendingFees: JSON.parse(localStorage.getItem(`userData_${window.currentUsername}`))?.pendingFees || []
    };

    localStorage.setItem(`userData_${window.currentUsername}`, JSON.stringify(userData));
    alert('Değişiklikler kaydedildi!');
}

function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
}

function deleteUser(username) {
    if (!confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) {
        return;
    }

    // Kayıtlı kullanıcıları al
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    // Kullanıcıyı listeden çıkar
    registeredUsers = registeredUsers.filter(user => user.username !== username);
    
    // Güncellenmiş listeyi kaydet
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    // Kullanıcının verilerini sil
    localStorage.removeItem(`userData_${username}`);
    
    // Kullanıcı listesini güncelle
    loadUserList();
    
    // Kullanıcı detaylarını temizle
    const userDetails = document.getElementById('userDetails');
    const userInfoDisplay = userDetails.querySelector('.user-info-display');
    const editSections = userDetails.querySelector('.edit-sections');
    
    userInfoDisplay.innerHTML = '<p>Lütfen sol menüden bir üye seçin.</p>';
    editSections.style.display = 'none';
    
    alert('Üye başarıyla silindi!');
}

function toggleAddUserForm() {
    const form = document.getElementById('addUserForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function handleAddUser(e) {
    e.preventDefault();

    // Form verilerini al
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        birthDate: document.getElementById('birthDate').value,
        joinDate: new Date().toISOString()
    };

    // Kayıtlı kullanıcıları al
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    // Kullanıcı adı kontrolü
    if (registeredUsers.some(user => user.username === formData.username)) {
        alert('Bu kullanıcı adı zaten kullanılıyor!');
        return;
    }

    // Yeni kullanıcıyı kaydet
    registeredUsers.push(formData);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    // Formu temizle ve gizle
    e.target.reset();
    toggleAddUserForm();

    // Kullanıcı listesini güncelle
    loadUserList();

    alert('Üye başarıyla eklendi!');
} 
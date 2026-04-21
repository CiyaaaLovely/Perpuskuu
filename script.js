// 1. INIT DATABASE - BUAT DATA AWAL DI LOCALSTORAGE
// ============================================
function initLocalStorage() {
    // Data user default (admin & siswa)
    if (!localStorage.getItem('lib_users')) {
        localStorage.setItem('lib_users', JSON.stringify([
            { id: 1, username: 'admin', password: '123', role: 'admin', foto: null },
            { id: 2, username: 'siswa', password: '123', role: 'user', foto: null }
        ]));
    }
    // Data buku default biar ga kosong
    if (!localStorage.getItem('lib_books')) {
        localStorage.setItem('lib_books', JSON.stringify([
            { id: 1, title: 'Laskar Pelangi', author: 'Andrea Hirata', category: 'Fiksi' },
            { id: 2, title: 'Atomic Habits', author: 'James Clear', category: 'Self Help' },
            { id: 3, title: 'Bumi', author: 'Tere Liye', category: 'Fiksi' }
        ]));
    }
    // Data peminjaman default
    if (!localStorage.getItem('lib_loans')) {
        localStorage.setItem('lib_loans', JSON.stringify([]));
    }
    // Data log aktivitas (fitur baru)
    if (!localStorage.getItem('lib_activities')) {
        localStorage.setItem('lib_activities', JSON.stringify([]));
    }
}
initLocalStorage(); // Panggil langsung biar kejalan

// Variabel global buat nyimpen data user yang login
let currentUser = null;
let confirmCallback = null;

// ============================================
// 2. FUNGSI BANTUAN (UTILITY) - BIAR GA NGULANG
// ============================================

// Tampilkan loading spinner
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

// Sembunyikan loading spinner
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

// Tampilkan notifikasi pop-up (kayak alert tapi keren)
function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    notif.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 12px 20px;
        background: white; border: 3px solid #2b2b2b; box-shadow: 5px 5px 0 #2b2b2b;
        z-index: 9999; font-weight: bold; border-radius: 0;
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Biar aman dari serangan XSS (biar ga bisa inject HTML)
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Konfirmasi pake modal (biar ga pake alert jadul)
function askConfirm(message, title, callback) {
    // Kalo title ga dikasih, anggap callback
    if (typeof title === 'function') {
        callback = title;
        title = 'Konfirmasi';
    }
    
    confirmCallback = callback;
    const modal = document.getElementById('confirmModal');
    if (modal) {
        document.getElementById('confirmMessage').innerHTML = `<i class="fas fa-question-circle"></i> ${message}`;
        modal.style.display = 'flex';
    } else {
        if (confirm(message)) callback();
    }
}

// Tutup modal konfirmasi
function closeConfirm() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
    confirmCallback = null;
}

// ============================================
// 3. FITUR AKTIVITAS LOG (CATATAN SEMUA AKTIVITAS)
// ============================================

// Nambahin log aktivitas baru
function addActivityLog(action, details) {
    let logs = JSON.parse(localStorage.getItem('lib_activities')) || [];
    
    const activity = {
        id: Date.now(),
        action: action,
        details: details,
        user: currentUser?.username || 'System',
        role: currentUser?.role || 'system',
        timestamp: new Date().toLocaleString('id-ID'),
        time: new Date().getTime()
    };
    
    logs.unshift(activity); // Tambah di paling atas
    
    // Simpan maksimal 100 log aja biar ga berat
    if (logs.length > 100) logs = logs.slice(0, 100);
    
    localStorage.setItem('lib_activities', JSON.stringify(logs));
    
    // Refresh tampilan log kalo lagi dibuka
    renderActivityLog();
}

// Tampilin log aktivitas ke tabel
function renderActivityLog() {
    const logContainer = document.getElementById('activityLogList');
    if (!logContainer) return;
    
    let logs = JSON.parse(localStorage.getItem('lib_activities')) || [];
    
    if (logs.length === 0) {
        logContainer.innerHTML = '<div class="activity-item"><i class="fas fa-info-circle"></i> <span>Belum ada aktivitas</span></div>';
        return;
    }
    
    logContainer.innerHTML = logs.map(log => {
        let icon = 'fa-info-circle';
        let color = '#3498db';
        
        // Pilih icon berdasarkan jenis aktivitas
        switch(log.action) {
            case 'TAMBAH_BUKU': icon = 'fa-plus-circle'; color = '#2ecc71'; break;
            case 'EDIT_BUKU': icon = 'fa-edit'; color = '#f39c12'; break;
            case 'HAPUS_BUKU': icon = 'fa-trash'; color = '#e74c3c'; break;
            case 'TAMBAH_ANGGOTA': icon = 'fa-user-plus'; color = '#2ecc71'; break;
            case 'EDIT_ANGGOTA': icon = 'fa-user-edit'; color = '#3498db'; break;
            case 'HAPUS_ANGGOTA': icon = 'fa-user-minus'; color = '#e74c3c'; break;
            case 'PINJAM_BUKU': icon = 'fa-hand-holding-heart'; color = '#3498db'; break;
            case 'KEMBALI_BUKU': icon = 'fa-undo'; color = '#2ecc71'; break;
            case 'GANTI_PASSWORD': icon = 'fa-key'; color = '#f39c12'; break;
            default: icon = 'fa-info-circle';
        }
        
        return `
            <div class="activity-item">
                <i class="fas ${icon}" style="color: ${color}"></i>
                <div style="flex:1">
                    <strong>${escapeHtml(log.user)}</strong> ${log.details}
                </div>
                <div class="activity-time">${log.timestamp}</div>
            </div>
        `;
    }).join('');
}

// Hapus semua log aktivitas
function clearActivityLog() {
    askConfirm('🗑️ Yakin hapus semua log aktivitas?', 'Hapus Log', () => {
        localStorage.setItem('lib_activities', JSON.stringify([]));
        renderActivityLog();
        showNotification('✅ Semua aktivitas berhasil dihapus!');
    });
}

// ============================================
// 4. HALAMAN LOGIN & REGISTER
// ============================================

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        const users = JSON.parse(localStorage.getItem('lib_users'));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            addActivityLog('LOGIN', `login ke sistem`);
            showNotification('✅ Login berhasil!', 'success');
            setTimeout(() => {
                window.location.href = user.role === 'admin' ? 'admin.html' : 'user.html';
            }, 500);
        } else {
            showNotification('❌ Username atau password salah!', 'error');
        }
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const role = document.getElementById('regRole').value;
        
        if (!username || !password) {
            showNotification('Username dan password harus diisi!', 'error');
            return;
        }
        
        let users = JSON.parse(localStorage.getItem('lib_users'));
        if (users.some(u => u.username === username)) {
            showNotification('Username sudah terdaftar!', 'error');
            return;
        }
        
        users.push({ id: Date.now(), username, password, role, foto: null });
        localStorage.setItem('lib_users', JSON.stringify(users));
        showNotification('✅ Pendaftaran berhasil! Silakan login.', 'success');
        
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    });
}

function toggleForm() {
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
    }
}

// ============================================
// 5. DASHBOARD ADMIN (HALAMAN ADMIN)
// ============================================

if (window.location.pathname.includes('admin.html')) {
    initAdminDashboard();
}

function initAdminDashboard() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('displayUser').innerText = currentUser.username;
    renderAdminData();
    loadUserFoto();
    addExportButtons();
    initDarkMode();
    renderActivityLog();
}

// Render semua data di halaman admin (buku, anggota, peminjaman)
function renderAdminData() {
    const books = JSON.parse(localStorage.getItem('lib_books')) || [];
    const users = JSON.parse(localStorage.getItem('lib_users')) || [];
    const loans = JSON.parse(localStorage.getItem('lib_loans')) || [];
    
    // Update statistik dashboard
    if (document.getElementById('countBuku')) {
        document.getElementById('countBuku').innerText = books.length;
        document.getElementById('countAnggota').innerText = users.filter(u => u.id !== 1).length;
        document.getElementById('countPinjaman').innerText = loans.filter(l => l.status === 'Dipinjam').length;
    }
    
    // ========== RENDER TABEL BUKU ==========
    const tableBuku = document.getElementById('tableBuku');
    if (tableBuku) {
        const searchValue = document.getElementById('searchBuku')?.value.toLowerCase() || '';
        const filtered = books.filter(b => b.title.toLowerCase().includes(searchValue) || b.author.toLowerCase().includes(searchValue));
        
        if (filtered.length === 0) {
            tableBuku.innerHTML = '<tr><td colspan="4" style="text-align:center;"><i class="fas fa-book-open"></i> 📭 Tidak ada data buku</td</tr>';
        } else {
            tableBuku.innerHTML = filtered.map(book => `
                <tr>
                    <td><i class="fas fa-book"></i> ${escapeHtml(book.title)}</td>
                    <td><i class="fas fa-user-edit"></i> ${escapeHtml(book.author)}</td>
                    <td><i class="fas fa-tag"></i> ${escapeHtml(book.category)}</td>
                    <td style="display: flex; gap: 5px; flex-wrap: wrap;">
                        <button class="btn-retro" style="background:#3498db; padding:5px 10px;" onclick="editBook(${book.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-retro" style="background:#e74c3c; padding:5px 10px;" onclick="deleteBook(${book.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
    
    // ========== RENDER TABEL ANGGOTA ==========
    const tableAnggota = document.getElementById('tableAnggota');
    if (tableAnggota) {
        const members = users.filter(u => u.id !== 1);
        if (members.length === 0) {
            tableAnggota.innerHTML = '<tr><td colspan="3" style="text-align:center;"><i class="fas fa-users"></i> 👥 Belum ada anggota</td</tr>';
        } else {
            tableAnggota.innerHTML = members.map(user => `
                <tr>
                    <td><i class="fas fa-user"></i> ${escapeHtml(user.username)}</td>
                    <td>${user.role === 'admin' ? '<i class="fas fa-crown"></i> 👑 Admin' : '<i class="fas fa-user-graduate"></i> 📖 Anggota'}</td>
                    <td style="display: flex; gap: 5px; flex-wrap: wrap;">
                        <button class="btn-retro" style="background:#3498db; padding:5px 10px;" onclick="editMember(${user.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-retro" style="background:#e74c3c; padding:5px 10px;" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
    
    // ========== RENDER TABEL PEMINJAMAN ==========
    const tablePeminjaman = document.getElementById('tablePeminjaman');
    if (tablePeminjaman) {
        if (loans.length === 0) {
            tablePeminjaman.innerHTML = '<tr><td colspan="8" style="text-align:center;">📭 Belum ada data peminjaman</td</tr>';
        } else {
            tablePeminjaman.innerHTML = loans.map((loan) => {
                let denda = loan.denda || 0;
                return `
                    <tr>
                        <td>${loan.id || '-'}</td>
                        <td><i class="fas fa-user"></i> ${escapeHtml(loan.username)}</td>
                        <td><i class="fas fa-book"></i> ${escapeHtml(loan.bookTitle)}</td>
                        <td><i class="fas fa-calendar-alt"></i> ${loan.tanggalPinjam || loan.borrowDate || '-'}</td>
                        <td><i class="fas fa-hourglass-end"></i> ${loan.dueDate || '-'}</td>
                        <td>${loan.status === 'Dipinjam' ? '<span class="badge-dipinjam">📖 Dipinjam</span>' : '<span class="badge-kembali">✅ Dikembalikan</span>'}</td>
                        <td>${denda > 0 ? `💰 Rp ${denda.toLocaleString()}` : '-'}</td>
                        <td style="display: flex; gap: 5px; flex-wrap: wrap;">
                            <button class="btn-retro" style="background:#3498db; padding:5px 10px;" onclick="editTransaction(${loan.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-retro" style="background:#e74c3c; padding:5px 10px;" onclick="deleteTransaction(${loan.id})">
                                <i class="fas fa-trash"></i> Hapus
                            </button>
                            ${loan.status === 'Dipinjam' ? 
                                `<button class="btn-retro" style="background:#2ecc71; padding:5px 10px;" onclick="returnBookTransaction(${loan.id})">
                                    <i class="fas fa-undo"></i> Kembalikan
                                </button>` : ''
                            }
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
}

// ============================================
// 6. CRUD BUKU (Tambah, Edit, Hapus)
// ============================================

// Modal untuk tambah/edit buku
function openBookModal(book = null) {
    const modal = document.getElementById('crudModal');
    const modalTitle = document.getElementById('modalTitle');
    const formFields = document.getElementById('formFields');
    if (!modal) return;
    
    const categoryOptions = `
        <option value="Fiksi">📖 Fiksi</option>
        <option value="Non-Fiksi">📚 Non-Fiksi</option>
        <option value="Sains">🔬 Sains</option>
        <option value="Sejarah">🏛️ Sejarah</option>
        <option value="Teknologi">💻 Teknologi</option>
        <option value="Self Help">🌱 Self Help</option>
        <option value="Komik">🎨 Komik</option>
        <option value="Novel">📕 Novel</option>
    `;
    
    if (book) {
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Buku';
        formFields.innerHTML = `
            <input type="hidden" id="editBookId" value="${book.id}">
            <div class="input-group"><i class="fas fa-book"></i><input type="text" id="bookTitle" value="${escapeHtml(book.title)}" placeholder="Judul Buku" required></div>
            <div class="input-group"><i class="fas fa-user-edit"></i><input type="text" id="bookAuthor" value="${escapeHtml(book.author)}" placeholder="Penulis" required></div>
            <div class="input-group"><i class="fas fa-tag"></i><select id="bookCategory" required>${categoryOptions}</select></div>
        `;
        setTimeout(() => { if(document.getElementById('bookCategory')) document.getElementById('bookCategory').value = book.category; }, 10);
    } else {
        modalTitle.innerHTML = '<i class="fas fa-plus"></i> Tambah Buku';
        formFields.innerHTML = `
            <input type="hidden" id="editBookId" value="">
            <div class="input-group"><i class="fas fa-book"></i><input type="text" id="bookTitle" placeholder="Judul Buku" required></div>
            <div class="input-group"><i class="fas fa-user-edit"></i><input type="text" id="bookAuthor" placeholder="Penulis" required></div>
            <div class="input-group"><i class="fas fa-tag"></i><select id="bookCategory" required>${categoryOptions}</select></div>
        `;
    }
    modal.style.display = 'flex';
}

// Fungsi edit buku (dipanggil dari tombol Edit)
function editBook(bookId) {
    const books = JSON.parse(localStorage.getItem('lib_books'));
    const book = books.find(b => b.id === bookId);
    if (book) openBookModal(book);
}

// Hapus buku
function deleteBook(bookId) {
    askConfirm('⚠️ Yakin mau hapus buku ini?', 'Hapus Buku', () => {
        showLoading();
        setTimeout(() => {
            let books = JSON.parse(localStorage.getItem('lib_books'));
            const bookToDelete = books.find(b => b.id === bookId);
            books = books.filter(b => b.id !== bookId);
            localStorage.setItem('lib_books', JSON.stringify(books));
            renderAdminData();
            hideLoading();
            addActivityLog('HAPUS_BUKU', `menghapus buku "${bookToDelete?.title}"`);
            showNotification(`✅ Buku "${bookToDelete?.title || ''}" berhasil dihapus!`);
        }, 500);
    });
}

// ============================================
// 7. CRUD ANGGOTA (Tambah, Edit, Hapus)
// ============================================

// Modal tambah anggota
function openUserModal() {
    const modal = document.getElementById('crudModal');
    const modalTitle = document.getElementById('modalTitle');
    const formFields = document.getElementById('formFields');
    modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Tambah Anggota';
    formFields.innerHTML = `
        <input type="hidden" id="editMemberId" value="">
        <div class="input-group"><i class="fas fa-user"></i><input type="text" id="memberUsername" placeholder="Username" required></div>
        <div class="input-group"><i class="fas fa-lock"></i><div class="password-wrapper"><input type="password" id="memberPassword" class="password-field" placeholder="Password" required><span class="toggle-password" onclick="togglePasswordField('memberPassword')"><i class="fas fa-eye"></i></span></div></div>
        <div class="input-group"><i class="fas fa-user-tag"></i>
            <select id="memberRole">
                <option value="user"><i class="fas fa-user-graduate"></i> Anggota (User)</option>
                <option value="admin"><i class="fas fa-crown"></i> Admin</option>
            </select>
        </div>
    `;
    modal.style.display = 'flex';
}

// Modal edit anggota
function openEditMemberModal(user) {
    const modal = document.getElementById('crudModal');
    const modalTitle = document.getElementById('modalTitle');
    const formFields = document.getElementById('formFields');
    
    modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit Anggota';
    formFields.innerHTML = `
        <input type="hidden" id="editMemberId" value="${user.id}">
        <div class="input-group"><i class="fas fa-user"></i><input type="text" id="editMemberUsername" value="${escapeHtml(user.username)}" placeholder="Username" required></div>
        <div class="input-group"><i class="fas fa-lock"></i><div class="password-wrapper"><input type="password" id="editMemberPassword" class="password-field" placeholder="Password Baru (kosongkan jika tidak diubah)"><span class="toggle-password" onclick="togglePasswordField('editMemberPassword')"><i class="fas fa-eye"></i></span></div></div>
        <div class="input-group"><i class="fas fa-user-tag"></i>
            <select id="editMemberRole">
                <option value="user" ${user.role === 'user' ? 'selected' : ''}><i class="fas fa-user-graduate"></i> Anggota (User)</option>
                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}><i class="fas fa-crown"></i> Admin</option>
            </select>
        </div>
    `;
    modal.style.display = 'flex';
}

// Fungsi edit anggota
function editMember(id) {
    const users = JSON.parse(localStorage.getItem('lib_users'));
    const user = users.find(u => u.id === id);
    if (user) openEditMemberModal(user);
}

// Hapus anggota
function deleteUser(userId) {
    if (userId === 1) {
        showNotification('❌ Gagal: Admin utama tidak bisa dihapus!', 'error');
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('lib_users'));
    const userToDelete = users.find(u => u.id === userId);
    
    askConfirm(`⚠️ Yakin mau hapus anggota "${userToDelete?.username}"?`, 'Hapus Anggota', () => {
        showLoading();
        setTimeout(() => {
            let users = JSON.parse(localStorage.getItem('lib_users'));
            users = users.filter(u => u.id !== userId);
            localStorage.setItem('lib_users', JSON.stringify(users));
            renderAdminData();
            hideLoading();
            addActivityLog('HAPUS_ANGGOTA', `menghapus anggota "${userToDelete?.username}"`);
            showNotification(`✅ Anggota "${userToDelete?.username}" berhasil dihapus!`);
        }, 500);
    });
}

// ============================================
// 8. CRUD TRANSAKSI PEMINJAMAN (Tambah, Edit, Hapus, Kembalikan)
// ============================================

// Modal tambah/edit transaksi peminjaman
function openTransactionModal(transaction = null) {
    const modal = document.getElementById('crudModal');
    const modalTitle = document.getElementById('modalTitle');
    const formFields = document.getElementById('formFields');
    
    const users = JSON.parse(localStorage.getItem('lib_users')) || [];
    const books = JSON.parse(localStorage.getItem('lib_books')) || [];
    
    // Buat dropdown options
    let userOptions = '<option value="">-- Pilih Anggota --</option>';
    for (let i = 0; i < users.length; i++) {
        if (users[i].id !== 1) {
            userOptions += `<option value="${users[i].id}|${users[i].username}">${users[i].username}</option>`;
        }
    }
    
    let bookOptions = '<option value="">-- Pilih Buku --</option>';
    for (let i = 0; i < books.length; i++) {
        bookOptions += `<option value="${books[i].id}|${books[i].title}">${books[i].title}</option>`;
    }
    
    if (transaction) {
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Peminjaman';
        formFields.innerHTML = `
            <input type="hidden" id="editTransId" value="${transaction.id}">
            <div class="input-group"><i class="fas fa-user"></i><select id="transUserId" required>${userOptions}</select></div>
            <div class="input-group"><i class="fas fa-book"></i><select id="transBookId" required>${bookOptions}</select></div>
            <div class="input-group"><i class="fas fa-calendar-alt"></i><input type="text" id="transBorrowDate" value="${transaction.borrowDate || transaction.tanggalPinjam || ''}" placeholder="Tanggal Pinjam (DD/MM/YYYY)" required></div>
            <div class="input-group"><i class="fas fa-calendar-check"></i><input type="text" id="transReturnDate" value="${transaction.returnDate === '-' ? '' : (transaction.returnDate || '')}" placeholder="Tanggal Kembali (DD/MM/YYYY)"></div>
            <div class="input-group"><i class="fas fa-exchange-alt"></i>
                <select id="transStatus">
                    <option value="Dipinjam" ${transaction.status === 'Dipinjam' ? 'selected' : ''}>📖 Dipinjam</option>
                    <option value="Dikembalikan" ${transaction.status === 'Dikembalikan' ? 'selected' : ''}>✅ Dikembalikan</option>
                </select>
            </div>
        `;
        // Set selected values
        setTimeout(() => {
            const userId = transaction.userId;
            const bookId = transaction.bookId;
            const userSelect = document.getElementById('transUserId');
            const bookSelect = document.getElementById('transBookId');
            
            for (let i = 0; i < userSelect.options.length; i++) {
                if (userSelect.options[i].value.startsWith(userId + '|')) {
                    userSelect.selectedIndex = i;
                    break;
                }
            }
            for (let i = 0; i < bookSelect.options.length; i++) {
                if (bookSelect.options[i].value.startsWith(bookId + '|')) {
                    bookSelect.selectedIndex = i;
                    break;
                }
            }
        }, 10);
    } else {
        modalTitle.innerHTML = '<i class="fas fa-plus"></i> Tambah Peminjaman';
        formFields.innerHTML = `
            <input type="hidden" id="editTransId" value="">
            <div class="input-group"><i class="fas fa-user"></i><select id="transUserId" required>${userOptions}</select></div>
            <div class="input-group"><i class="fas fa-book"></i><select id="transBookId" required>${bookOptions}</select></div>
            <div class="input-group"><i class="fas fa-calendar-alt"></i><input type="text" id="transBorrowDate" value="${new Date().toLocaleDateString('id-ID')}" placeholder="Tanggal Pinjam (DD/MM/YYYY)" required></div>
            <div class="input-group"><i class="fas fa-calendar-check"></i><input type="text" id="transReturnDate" placeholder="Tanggal Kembali (DD/MM/YYYY)"></div>
            <div class="input-group"><i class="fas fa-exchange-alt"></i>
                <select id="transStatus">
                    <option value="Dipinjam">📖 Dipinjam</option>
                    <option value="Dikembalikan">✅ Dikembalikan</option>
                </select>
            </div>
        `;
    }
    modal.style.display = 'flex';
}

// Edit transaksi
function editTransaction(id) {
    const loans = JSON.parse(localStorage.getItem('lib_loans'));
    const transaction = loans.find(t => t.id === id);
    if (transaction) openTransactionModal(transaction);
}

// Hapus transaksi
function deleteTransaction(id) {
    askConfirm('⚠️ Hapus Peminjaman', 'Yakin ingin menghapus data peminjaman ini?', () => {
        let loans = JSON.parse(localStorage.getItem('lib_loans'));
        loans = loans.filter(t => t.id !== id);
        localStorage.setItem('lib_loans', JSON.stringify(loans));
        renderAdminData();
        showNotification('✅ Transaksi peminjaman berhasil dihapus!');
    });
}

// Kembalikan buku (update status)
function returnBookTransaction(id) {
    askConfirm('🔄 Kembalikan Buku', 'Apakah buku ini sudah dikembalikan?', () => {
        let loans = JSON.parse(localStorage.getItem('lib_loans'));
        const index = loans.findIndex(t => t.id === id);
        if (index !== -1) {
            loans[index].status = 'Dikembalikan';
            loans[index].returnDate = new Date().toLocaleDateString('id-ID');
            localStorage.setItem('lib_loans', JSON.stringify(loans));
            renderAdminData();
            addActivityLog('KEMBALI_BUKU', `mengembalikan buku "${loans[index].bookTitle}"`);
            showNotification('✅ Buku berhasil dikembalikan!');
        }
    });
}

// ============================================
// 9. FUNGSI PINJAM & KEMBALI UNTUK USER
// ============================================

// Pinjam buku (user)
function borrowBook(bookTitle) {
    if (!currentUser) currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let loans = JSON.parse(localStorage.getItem('lib_loans')) || [];
    
    // Cek apakah udah pinjam buku yang sama
    const existing = loans.find(l => l.username === currentUser.username && l.bookTitle === bookTitle && l.status === 'Dipinjam');
    if (existing) {
        showNotification('❌ Kamu sedang meminjam buku ini!', 'error');
        return;
    }
    
    askConfirm(`📖 Pinjam buku "${bookTitle}"?\n\n📅 Batas waktu: 7 hari\n💰 Denda telat: Rp 2.000/hari`, 'Pinjam Buku', () => {
        showLoading();
        setTimeout(() => {
            const tanggalPinjam = new Date().toLocaleDateString('id-ID');
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);
            
            loans.push({
                id: Date.now(),
                username: currentUser.username,
                bookTitle: bookTitle,
                status: 'Dipinjam',
                tanggalPinjam: tanggalPinjam,
                dueDate: dueDate.toLocaleDateString('id-ID'),
                denda: 0
            });
            localStorage.setItem('lib_loans', JSON.stringify(loans));
            if (window.location.pathname.includes('user.html')) renderUserData();
            else renderAdminData();
            hideLoading();
            addActivityLog('PINJAM_BUKU', `meminjam buku "${bookTitle}"`);
            showNotification(`✅ Berhasil meminjam "${bookTitle}"!\n📅 Kembalikan sebelum: ${dueDate.toLocaleDateString('id-ID')}`);
        }, 500);
    });
}

// Kembalikan buku (dari admin)
function returnBook(loanIndex) {
    let loans = JSON.parse(localStorage.getItem('lib_loans'));
    const loan = loans[loanIndex];
    if (!loan) {
        showNotification('❌ Data peminjaman tidak ditemukan!', 'error');
        return;
    }
    
    // Hitung denda kalo telat
    let denda = 0;
    let pesanDenda = '';
    if (loan.tanggalPinjam) {
        const pinjamDate = new Date(loan.tanggalPinjam.split('/').reverse().join('-'));
        const now = new Date();
        const selisihHari = Math.floor((now - pinjamDate) / (1000 * 60 * 60 * 24));
        if (selisihHari > 7) {
            const hariTelat = selisihHari - 7;
            denda = hariTelat * 2000;
            pesanDenda = `\n\n⚠️ Telat ${hariTelat} hari!\n💰 Denda: Rp ${denda.toLocaleString()}`;
        }
    }
    
    askConfirm(`🔄 Kembalikan Buku "${loan.bookTitle}"?${pesanDenda}`, 'Kembalikan Buku', () => {
        showLoading();
        setTimeout(() => {
            loans[loanIndex].status = 'Kembali';
            loans[loanIndex].tanggalKembali = new Date().toLocaleDateString('id-ID');
            loans[loanIndex].denda = denda;
            localStorage.setItem('lib_loans', JSON.stringify(loans));
            if (window.location.pathname.includes('admin.html')) {
                renderAdminData();
            } else {
                renderUserData();
            }
            hideLoading();
            let dendaText = denda > 0 ? ` (denda Rp ${denda.toLocaleString()})` : '';
            addActivityLog('KEMBALI_BUKU', `mengembalikan buku "${loan.bookTitle}"${dendaText}`);
            
            if (denda > 0) {
                showNotification(`✅ Buku dikembalikan!\n💰 Denda: Rp ${denda.toLocaleString()}`, 'error');
            } else {
                showNotification('✅ Buku berhasil dikembalikan tepat waktu!');
            }
        }, 500);
    });
}

// Kembalikan buku (dari user)
function returnBookUser(bookTitle) {
    let loans = JSON.parse(localStorage.getItem('lib_loans'));
    const loanIndex = loans.findIndex(l => l.username === currentUser?.username && l.bookTitle === bookTitle && l.status === 'Dipinjam');
    if (loanIndex !== -1) {
        returnBook(loanIndex);
        setTimeout(() => renderUserData(), 600);
    } else {
        showNotification('❌ Buku tidak ditemukan di peminjaman kamu!', 'error');
    }
}

// ============================================
// 10. FORM SUBMIT (UNTUK SEMUA CRUD)
// ============================================

const crudForm = document.getElementById('crudForm');
if (crudForm) {
    crudForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Cek mode ganti password
        const isChangePassword = document.getElementById('changePasswordMode') !== null;
        if (isChangePassword) {
            const oldPass = document.getElementById('oldPassword')?.value;
            const newPass = document.getElementById('newPassword')?.value;
            const confirmPass = document.getElementById('confirmPassword')?.value;
            changePasswordLogic(oldPass, newPass, confirmPass);
            return;
        }
        
        // ===== EDIT ANGGOTA =====
        const editMemberId = document.getElementById('editMemberId')?.value;
        if (editMemberId) {
            const newUsername = document.getElementById('editMemberUsername')?.value;
            const newPassword = document.getElementById('editMemberPassword')?.value;
            const newRole = document.getElementById('editMemberRole')?.value;
            
            if (!newUsername) {
                showNotification('❌ Username harus diisi!', 'error');
                return;
            }
            
            let users = JSON.parse(localStorage.getItem('lib_users'));
            const index = users.findIndex(u => u.id == editMemberId);
            
            if (index !== -1) {
                // Cek username duplikat
                const duplicate = users.some(u => u.username === newUsername && u.id != editMemberId);
                if (duplicate) {
                    showNotification('❌ Username sudah digunakan!', 'error');
                    return;
                }
                
                const oldUsername = users[index].username;
                users[index].username = newUsername;
                if (newPassword && newPassword.trim() !== '') {
                    users[index].password = newPassword;
                }
                users[index].role = newRole;
                
                localStorage.setItem('lib_users', JSON.stringify(users));
                addActivityLog('EDIT_ANGGOTA', `mengedit anggota "${oldUsername}" menjadi "${newUsername}"`);
                showNotification('✅ Anggota berhasil diupdate!');
                renderAdminData();
                closeModal();
            }
            return;
        }
        
        // ===== TAMBAH/EDIT BUKU =====
        const bookTitle = document.getElementById('bookTitle')?.value;
        if (bookTitle !== undefined) {
            const editBookId = document.getElementById('editBookId')?.value;
            const author = document.getElementById('bookAuthor')?.value;
            const category = document.getElementById('bookCategory')?.value;
            
            if (!bookTitle || !author || !category) {
                showNotification('❌ Semua field harus diisi!', 'error');
                return;
            }
            
            let books = JSON.parse(localStorage.getItem('lib_books'));
            if (editBookId) {
                const index = books.findIndex(b => b.id == editBookId);
                if (index !== -1) {
                    const oldTitle = books[index].title;
                    books[index] = { ...books[index], title: bookTitle, author: author, category: category };
                    localStorage.setItem('lib_books', JSON.stringify(books));
                    addActivityLog('EDIT_BUKU', `mengedit buku "${oldTitle}" menjadi "${bookTitle}"`);
                    showNotification('<i class="fas fa-save"></i> Buku berhasil diupdate!');
                }
            } else {
                books.push({ id: Date.now(), title: bookTitle, author: author, category: category });
                localStorage.setItem('lib_books', JSON.stringify(books));
                addActivityLog('TAMBAH_BUKU', `menambahkan buku baru "${bookTitle}"`);
                showNotification('<i class="fas fa-plus-circle"></i> Buku berhasil ditambahkan!');
            }
            renderAdminData();
            closeModal();
            return;
        }
        
        // ===== TAMBAH ANGGOTA =====
        const memberUsername = document.getElementById('memberUsername')?.value;
        if (memberUsername !== undefined) {
            const memberPass = document.getElementById('memberPassword')?.value;
            const memberRole = document.getElementById('memberRole')?.value;
            
            if (!memberUsername || !memberPass) {
                showNotification('❌ Username dan password harus diisi!', 'error');
                return;
            }
            
            let users = JSON.parse(localStorage.getItem('lib_users'));
            if (users.some(u => u.username === memberUsername)) {
                showNotification('❌ Username sudah ada!', 'error');
                return;
            }
            
            users.push({ id: Date.now(), username: memberUsername, password: memberPass, role: memberRole, foto: null });
            localStorage.setItem('lib_users', JSON.stringify(users));
            addActivityLog('TAMBAH_ANGGOTA', `menambahkan anggota baru "${memberUsername}" (${memberRole === 'admin' ? 'Admin' : 'Anggota'})`);
            showNotification('<i class="fas fa-user-check"></i> Anggota berhasil ditambahkan!');
            renderAdminData();
            closeModal();
            return;
        }
        
        // ===== TAMBAH/EDIT TRANSAKSI =====
        const transUserId = document.getElementById('transUserId')?.value;
        if (transUserId && transUserId !== '') {
            const editTransId = document.getElementById('editTransId')?.value;
            const transBookId = document.getElementById('transBookId')?.value;
            const borrowDate = document.getElementById('transBorrowDate')?.value;
            const returnDate = document.getElementById('transReturnDate')?.value || '-';
            const status = document.getElementById('transStatus')?.value;
            
            if (!transUserId || !transBookId || !borrowDate) {
                showNotification('❌ Peminjam, buku, dan tanggal pinjam harus diisi!', 'error');
                return;
            }
            
            const [userId, userName] = transUserId.split('|');
            const [bookId, bookTitle] = transBookId.split('|');
            
            let loans = JSON.parse(localStorage.getItem('lib_loans'));
            
            if (editTransId) {
                const index = loans.findIndex(t => t.id == editTransId);
                if (index !== -1) {
                    loans[index] = {
                        ...loans[index],
                        userId: parseInt(userId),
                        username: userName,
                        bookId: parseInt(bookId),
                        bookTitle: bookTitle,
                        borrowDate: borrowDate,
                        returnDate: returnDate === '-' ? '-' : returnDate,
                        status: status
                    };
                    showNotification('✅ Transaksi berhasil diupdate!');
                }
            } else {
                const newId = Date.now();
                loans.push({
                    id: newId,
                    userId: parseInt(userId),
                    username: userName,
                    bookId: parseInt(bookId),
                    bookTitle: bookTitle,
                    borrowDate: borrowDate,
                    returnDate: returnDate === '-' ? '-' : returnDate,
                    status: status
                });
                showNotification('✅ Peminjaman berhasil ditambahkan!');
            }
            localStorage.setItem('lib_loans', JSON.stringify(loans));
            renderAdminData();
            closeModal();
            return;
        }
    });
}

function closeModal() {
    const modal = document.getElementById('crudModal');
    if (modal) modal.style.display = 'none';
}

// ============================================
// 11. GANTI PASSWORD
// ============================================

function openChangePasswordModal() {
    const modal = document.getElementById('crudModal');
    const modalTitle = document.getElementById('modalTitle');
    const formFields = document.getElementById('formFields');
    if (!modal) return;
    
    modalTitle.innerHTML = '<i class="fas fa-key"></i> Ganti Password';
    formFields.innerHTML = `
        <input type="hidden" id="changePasswordMode" value="true">
        <div class="input-group"><i class="fas fa-lock"></i><div class="password-wrapper"><input type="password" id="oldPassword" class="password-field" placeholder="Password Lama" required><span class="toggle-password" onclick="togglePasswordField('oldPassword')"><i class="fas fa-eye"></i></span></div></div>
        <div class="input-group"><i class="fas fa-key"></i><div class="password-wrapper"><input type="password" id="newPassword" class="password-field" placeholder="Password Baru" required><span class="toggle-password" onclick="togglePasswordField('newPassword')"><i class="fas fa-eye"></i></span></div></div>
        <div class="input-group"><i class="fas fa-check"></i><div class="password-wrapper"><input type="password" id="confirmPassword" class="password-field" placeholder="Konfirmasi Password Baru" required><span class="toggle-password" onclick="togglePasswordField('confirmPassword')"><i class="fas fa-eye"></i></span></div></div>
    `;
    modal.style.display = 'flex';
}

function togglePasswordField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
        field.setAttribute('type', type);
        const eye = field.parentElement.querySelector('.toggle-password i');
        if (eye) eye.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
}

function changePasswordLogic(oldPass, newPass, confirmPass) {
    if (newPass !== confirmPass) {
        showNotification('❌ Password baru tidak cocok!', 'error');
        return false;
    }
    if (newPass.length < 3) {
        showNotification('❌ Password minimal 3 karakter!', 'error');
        return false;
    }
    
    let currentUserData = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUserData) {
        showNotification('❌ Sesi login tidak ditemukan!', 'error');
        return false;
    }
    
    if (currentUserData.password !== oldPass) {
        showNotification('❌ Password lama salah!', 'error');
        return false;
    }
    
    let users = JSON.parse(localStorage.getItem('lib_users'));
    const userIndex = users.findIndex(u => u.id === currentUserData.id);
    if (userIndex !== -1) {
        users[userIndex].password = newPass;
        localStorage.setItem('lib_users', JSON.stringify(users));
        
        currentUserData.password = newPass;
        localStorage.setItem('currentUser', JSON.stringify(currentUserData));
        
        if (typeof currentUser !== 'undefined') {
            currentUser = currentUserData;
        }
        
        addActivityLog('GANTI_PASSWORD', `mengubah password`);
        showNotification('✅ Password berhasil diubah!');
        closeModal();
        return true;
    }
    
    showNotification('❌ Gagal mengubah password!', 'error');
    return false;
}

// ============================================
// 12. DARK MODE (BIAR MALEM NYAMAN)
// ============================================

function initDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) document.body.classList.add('dark-mode');
    
    if (!document.querySelector('.dark-mode-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'dark-mode-toggle';
        toggleBtn.innerHTML = darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        toggleBtn.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px;
            border-radius: 50%; background: #ffcc00; border: 3px solid #2b2b2b;
            cursor: pointer; font-size: 24px; z-index: 999;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 4px 4px 0 #2b2b2b;
        `;
        toggleBtn.onclick = function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            toggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            showNotification(isDark ? '🌙 Mode Gelap Aktif' : '☀️ Mode Terang Aktif');
        };
        document.body.appendChild(toggleBtn);
    }
}

// ============================================
// 13. FOTO PROFIL (UPLOAD FILE + KAMERA)
// ============================================

function loadUserFoto() {
    const avatarContainer = document.querySelector('.avatar-retro');
    if (!avatarContainer) return;
    
    const savedImg = localStorage.getItem(`profile_${currentUser?.id}`);
    if (savedImg) {
        avatarContainer.innerHTML = `<img src="${savedImg}" alt="Profile" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
        avatarContainer.innerHTML = currentUser?.role === 'admin' ? '<i class="fas fa-user-shield"></i>' : '<i class="fas fa-user-graduate"></i>';
    }
    
    const oldBtn = avatarContainer.querySelector('.upload-foto-btn');
    if (oldBtn) oldBtn.remove();
    
    const btnWrapper = document.createElement('div');
    btnWrapper.style.cssText = 'position: absolute; bottom: 0; right: 0; display: flex; gap: 5px;';
    
    // Tombol upload file
    const uploadFileBtn = document.createElement('button');
    uploadFileBtn.className = 'upload-foto-btn';
    uploadFileBtn.innerHTML = '<i class="fas fa-upload"></i>';
    uploadFileBtn.style.cssText = 'background:#3498db; border:2px solid black; border-radius:50%; width:28px; height:28px; cursor:pointer;';
    uploadFileBtn.title = 'Upload dari File';
    uploadFileBtn.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    localStorage.setItem(`profile_${currentUser.id}`, ev.target.result);
                    avatarContainer.innerHTML = `<img src="${ev.target.result}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
                    avatarContainer.appendChild(btnWrapper);
                    showNotification('<i class="fas fa-image"></i> Foto profil berhasil diupload!');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };
    
    // Tombol kamera
    const cameraBtn = document.createElement('button');
    cameraBtn.className = 'upload-foto-btn';
    cameraBtn.innerHTML = '<i class="fas fa-camera"></i>';
    cameraBtn.style.cssText = 'background:#2ecc71; border:2px solid black; border-radius:50%; width:28px; height:28px; cursor:pointer;';
    cameraBtn.title = 'Ambil Foto dengan Kamera';
    cameraBtn.onclick = () => openWebcamModal();
    
    btnWrapper.appendChild(uploadFileBtn);
    btnWrapper.appendChild(cameraBtn);
    avatarContainer.style.position = 'relative';
    avatarContainer.appendChild(btnWrapper);
}

function openWebcamModal() {
    let webcamModal = document.getElementById('webcamModal');
    if (!webcamModal) {
        webcamModal = document.createElement('div');
        webcamModal.id = 'webcamModal';
        webcamModal.className = 'modal';
        webcamModal.style.cssText = 'display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:2000;';
        webcamModal.innerHTML = `
            <div class="modal-content retro-box" style="width: 500px; text-align: center;">
                <h3><i class="fas fa-camera"></i> Ambil Foto</h3>
                <video id="webcamVideo" autoplay playsinline style="width: 100%; max-width: 400px; border: 3px solid black; margin: 10px 0;"></video>
                <canvas id="webcamCanvas" style="display: none;"></canvas>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="captureBtn" class="btn-retro"><i class="fas fa-camera"></i> Jepret</button>
                    <button id="closeWebcamBtn" class="btn-retro btn-cancel"><i class="fas fa-times"></i> Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(webcamModal);
    }
    
    webcamModal.style.display = 'flex';
    const video = document.getElementById('webcamVideo');
    const canvas = document.getElementById('webcamCanvas');
    const captureBtn = document.getElementById('captureBtn');
    const closeBtn = document.getElementById('closeWebcamBtn');
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
                captureBtn.onclick = function() {
                    const context = canvas.getContext('2d');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const fotoData = canvas.toDataURL('image/jpeg', 0.8);
                    localStorage.setItem(`profile_${currentUser.id}`, fotoData);
                    const avatarContainer = document.querySelector('.avatar-retro');
                    if (avatarContainer) {
                        avatarContainer.innerHTML = `<img src="${fotoData}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
                        loadUserFoto();
                    }
                    const tracks = stream.getTracks();
                    tracks.forEach(track => track.stop());
                    video.srcObject = null;
                    webcamModal.style.display = 'none';
                    showNotification('<i class="fas fa-camera"></i> Foto berhasil diambil!');
                };
            })
            .catch(function(err) {
                showNotification('❌ Gagal akses kamera! Pastikan izin diberikan.', 'error');
                webcamModal.style.display = 'none';
            });
    } else {
        showNotification('❌ Browser tidak support akses kamera!', 'error');
        webcamModal.style.display = 'none';
    }
    
    closeBtn.onclick = function() {
        const videoStream = video.srcObject;
        if (videoStream) {
            const tracks = videoStream.getTracks();
            tracks.forEach(track => track.stop());
        }
        webcamModal.style.display = 'none';
    };
}

// ============================================
// 14. EXPORT PDF
// ============================================

function exportToPDF(type) {
    showLoading();
    setTimeout(() => {
        if (typeof window.jspdf === 'undefined') {
            showNotification('❌ Library PDF sedang dimuat, coba lagi!', 'error');
            hideLoading();
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        let data = [];
        let title = '';
        
        if (type === 'books') {
            const books = JSON.parse(localStorage.getItem('lib_books')) || [];
            data = books.map((b, i) => [i + 1, b.title, b.author, b.category]);
            title = 'LAPORAN DATA BUKU';
        } else if (type === 'members') {
            const users = JSON.parse(localStorage.getItem('lib_users')) || [];
            data = users.filter(u => u.id !== 1).map((u, i) => [i + 1, u.username, u.role === 'admin' ? 'Admin' : 'Anggota']);
            title = 'LAPORAN DATA ANGGOTA';
        } else if (type === 'loans') {
            const loans = JSON.parse(localStorage.getItem('lib_loans')) || [];
            data = loans.map((l, i) => [i + 1, l.username, l.bookTitle, l.status, l.tanggalPinjam || '-', l.dueDate || '-', l.denda ? `Rp ${l.denda.toLocaleString()}` : '-']);
            title = 'LAPORAN DATA PEMINJAMAN';
        }
        
        doc.setFontSize(18);
        doc.setTextColor(30, 77, 140);
        doc.text(title, 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 105, 30, { align: 'center' });
        
        if (typeof doc.autoTable === 'function') {
            doc.autoTable({
                startY: 40,
                head: [type === 'books' ? ['No', 'Judul Buku', 'Penulis', 'Kategori'] : 
                       type === 'members' ? ['No', 'Username', 'Role'] :
                       ['No', 'Peminjam', 'Judul Buku', 'Status', 'Tgl Pinjam', 'Due Date', 'Denda']],
                body: data,
                theme: 'striped',
                headStyles: { fillColor: [30, 77, 140], textColor: [255, 255, 255] },
                styles: { fontSize: 8, cellPadding: 3 }
            });
        }
        doc.save(`laporan_${type}_${Date.now()}.pdf`);
        hideLoading();
        showNotification('<i class="fas fa-file-pdf"></i> PDF berhasil diekspor!');
    }, 500);
}

function addExportButtons() {
    const bukuHeader = document.querySelector('#section-buku .section-header');
    const anggotaHeader = document.querySelector('#section-anggota .section-header');
    const peminjamanHeader = document.querySelector('#section-peminjaman .section-header');
    
    if (bukuHeader && !document.querySelector('#exportBooksBtn')) {
        bukuHeader.innerHTML += `<button class="btn-retro btn-export" id="exportBooksBtn" onclick="exportToPDF('books')" style="margin-left:10px;"><i class="fas fa-file-pdf"></i> Export PDF</button>`;
    }
    if (anggotaHeader && !document.querySelector('#exportMembersBtn')) {
        anggotaHeader.innerHTML += `<button class="btn-retro btn-export" id="exportMembersBtn" onclick="exportToPDF('members')" style="margin-left:10px;"><i class="fas fa-file-pdf"></i> Export PDF</button>`;
    }
    if (peminjamanHeader && !document.querySelector('#exportLoansBtn')) {
        peminjamanHeader.innerHTML += `<button class="btn-retro btn-export" id="exportLoansBtn" onclick="exportToPDF('loans')" style="margin-left:10px;"><i class="fas fa-file-pdf"></i> Export PDF</button>`;
    }
    
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (sidebarMenu && !document.querySelector('#changePasswordMenu')) {
        const changePassLi = document.createElement('li');
        changePassLi.id = 'changePasswordMenu';
        changePassLi.innerHTML = '<i class="fas fa-key"></i> Ganti Password';
        changePassLi.onclick = () => openChangePasswordModal();
        const logoutLi = document.getElementById('logoutBtn');
        if (logoutLi) sidebarMenu.insertBefore(changePassLi, logoutLi);
        else sidebarMenu.appendChild(changePassLi);
    }
}

// ============================================
// 15. DASHBOARD USER
// ============================================

if (window.location.pathname.includes('user.html')) {
    initUserDashboard();
}

function initUserDashboard() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'user') {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('displayUser').innerText = currentUser.username;
    renderUserData();
    loadUserFoto();
    initDarkMode();
    
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (sidebarMenu && !document.querySelector('#changePasswordMenu')) {
        const changePassLi = document.createElement('li');
        changePassLi.id = 'changePasswordMenu';
        changePassLi.innerHTML = '<i class="fas fa-key"></i> Ganti Password';
        changePassLi.onclick = () => openChangePasswordModal();
        const logoutLi = document.getElementById('logoutBtn');
        if (logoutLi) sidebarMenu.insertBefore(changePassLi, logoutLi);
        else sidebarMenu.appendChild(changePassLi);
    }
}

function renderUserData() {
    const books = JSON.parse(localStorage.getItem('lib_books')) || [];
    const loans = JSON.parse(localStorage.getItem('lib_loans')) || [];
    const userLoans = loans.filter(l => l.username === currentUser?.username);
    
    const tableBuku = document.getElementById('tableBukuUser');
    if (tableBuku) {
        const searchValue = document.getElementById('searchBukuUser')?.value.toLowerCase() || '';
        const filtered = books.filter(b => b.title.toLowerCase().includes(searchValue) || b.author.toLowerCase().includes(searchValue));
        
        if (filtered.length === 0) {
            tableBuku.innerHTML = '<tr><td colspan="4" style="text-align:center;"><i class="fas fa-search"></i> 📭 Buku tidak ditemukan</td</tr>';
        } else {
            tableBuku.innerHTML = filtered.map(book => `
                <tr>
                    <td><i class="fas fa-book"></i> ${escapeHtml(book.title)}</td>
                    <td><i class="fas fa-user-edit"></i> ${escapeHtml(book.author)}</td>
                    <td><i class="fas fa-tag"></i> ${escapeHtml(book.category)}</td>
                    <td>
                        <button class="btn-retro" style="background:#2ecc71; padding:5px 10px;" onclick="borrowBook('${escapeHtml(book.title)}')">
                            <i class="fas fa-hand-holding-heart"></i> Pinjam
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
    
    const tablePinjam = document.getElementById('tablePeminjamanUser');
    if (tablePinjam) {
        if (userLoans.length === 0) {
            tablePinjam.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="fas fa-history"></i> 📭 Belum ada peminjaman</td</tr>';
        } else {
            tablePinjam.innerHTML = userLoans.map(loan => {
                let denda = loan.denda || 0;
                let dueDateClass = '';
                if (loan.status === 'Dipinjam' && loan.dueDate) {
                    const due = new Date(loan.dueDate.split('/').reverse().join('-'));
                    const now = new Date();
                    if (now > due) dueDateClass = 'style="color:#e74c3c; font-weight:bold;"';
                }
                return `
                    <tr>
                        <td><i class="fas fa-book"></i> ${escapeHtml(loan.bookTitle)}</td>
                        <td><span class="badge-role" style="background:${loan.status === 'Dipinjam' ? '#f39c12' : '#2ecc71'}">
                            <i class="fas ${loan.status === 'Dipinjam' ? 'fa-hand-holding-heart' : 'fa-check-circle'}"></i> ${loan.status === 'Dipinjam' ? 'Dipinjam' : 'Dikembalikan'}
                        </span></td>
                        <td ${dueDateClass}><i class="fas fa-calendar-alt"></i> ${loan.tanggalPinjam || '-'}</td>
                        <td ${dueDateClass}><i class="fas fa-hourglass-end"></i> ${loan.dueDate || '-'}</td>
                        <td>${denda > 0 ? `<span class="denda-badge"><i class="fas fa-money-bill-wave"></i> Rp ${denda.toLocaleString()}</span>` : '<i class="fas fa-check"></i> -'}</td>
                        <td>
                            ${loan.status === 'Dipinjam' ? 
                                `<button class="btn-retro" style="background:#e74c3c; padding:5px 10px;" onclick="returnBookUser('${escapeHtml(loan.bookTitle)}')">
                                    <i class="fas fa-undo"></i> Kembalikan
                                </button>` : '-'
                            }
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
}

function filterBooks() { renderUserData(); }
function filterBooksUser() { renderUserData(); }

// ============================================
// 16. LOGOUT & FUNGSI NAVIGASI
// ============================================

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        askConfirm('🚪 Yakin mau keluar?', 'Logout', () => {
            addActivityLog('LOGOUT', `keluar dari sistem`);
            localStorage.removeItem('currentUser');
            showNotification('✅ Dadah! Sampai jumpa lagi 👋');
            setTimeout(() => window.location.href = 'index.html', 500);
        });
    });
}

function setupConfirmButton() {
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    if (confirmYesBtn) {
        const newBtn = confirmYesBtn.cloneNode(true);
        confirmYesBtn.parentNode.replaceChild(newBtn, confirmYesBtn);
        newBtn.addEventListener('click', function() {
            if (confirmCallback) confirmCallback();
            closeConfirm();
        });
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.style.display = 'block';
    const menu = document.getElementById(`menu-${sectionId}`);
    if (menu) menu.classList.add('active');
    const titles = { 
        dashboard: '📊 DASHBOARD', 
        buku: '📚 KELOLA BUKU', 
        anggota: '👥 KELOLA ANGGOTA', 
        peminjaman: '🔄 DATA PEMINJAMAN',
        aktivitas: '📋 AKTIVITAS'
    };
    const sectionTitle = document.getElementById('sectionTitle');
    if (sectionTitle) sectionTitle.innerHTML = titles[sectionId] || sectionId.toUpperCase();
}

window.onclick = function(event) {
    const modal = document.getElementById('crudModal');
    const confirmModal = document.getElementById('confirmModal');
    const webcamModal = document.getElementById('webcamModal');
    if (event.target === modal) closeModal();
    if (event.target === confirmModal) closeConfirm();
    if (event.target === webcamModal && webcamModal) webcamModal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    setupConfirmButton();
    if (typeof initDarkMode === 'function' && !window.location.pathname.includes('.html')) initDarkMode();
    
    // Load library PDF
    if (typeof window.jspdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            const autoTableScript = document.createElement('script');
            autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
            document.head.appendChild(autoTableScript);
        };
        document.head.appendChild(script);
    }
});
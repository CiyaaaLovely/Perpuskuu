# 📚 SISTEM INFORMASI PERPUSTAKAAN DIGITAL

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg">
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white">
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/LocalStorage-FFCC00?logo=web&logoColor=black">
  
  <br><br>
  <b>Aplikasi Perpustakaan Digital berbasis Web dengan tema Retro</b><br>
  Dibuat untuk memenuhi tugas akhir - by Anak SMK RPL
</div>

---

## 📖 TENTANG APLIKASI

Aplikasi ini adalah **Sistem Informasi Manajemen Perpustakaan Digital** yang bisa digunakan untuk:
- ✅ Manajemen data buku (Tambah, Edit, Hapus, Cari)
- ✅ Manajemen data anggota (Tambah, Edit, Hapus)
- ✅ Manajemen peminjaman buku (Tambah, Edit, Hapus, Kembalikan)
- ✅ Multi role (Admin & User)
- ✅ Laporan PDF
- ✅ Dark Mode
- ✅ Upload/Ambil foto profil
- ✅ Ganti password

**Data disimpan di LocalStorage browser**, jadi ga perlu backend/server!

---

## 🚀 CARA MENJALANKAN APLIKASI

### 1. Persiapan
Pastikan file-file berikut ada di **SATU FOLDER** yang sama:

### 2. Buka Aplikasi
- Double klik file **`index.html`**
- Atau buka dengan browser (Chrome/Edge/Firefox)

### 3. Login ke Sistem

**Akun Default:**

| Role | Username | Password |
|------|----------|----------|
| 👑 Admin | `admin` | `123` |
| 👤 User | `siswa` | `123` |

> 💡 **Kamu juga bisa daftar akun baru sendiri!**

---

## 🎮 PANDUAN PENGGUNAAN

### 🔐 HALAMAN LOGIN (`index.html`)

![Login Page](https://via.placeholder.com/400x300?text=Halaman+Login)

**Langkah-langkah:**
1. Masukkan **Username** dan **Password**
2. Klik tombol **MASUK**
3. Sistem akan otomatis masuk ke dashboard sesuai role:
   - Admin → Dashboard Admin
   - User → Dashboard User

**Belum punya akun?**
- Klik **"Daftar Sekarang"**
- Isi username, password, pilih role
- Klik **DAFTAR**
- Login dengan akun baru

---

### 👑 DASHBOARD ADMIN (`admin.html`)

#### 📊 Menu Dashboard
Menampilkan statistik ringkasan:
- Total Buku
- Total Anggota
- Peminjaman Aktif

#### 📚 Menu Kelola Buku (CRUD Buku)

| Aksi | Cara Melakukan |
|------|----------------|
| **Tambah Buku** | Klik tombol `+ Tambah Buku` → isi form (Judul, Penulis, Kategori) → klik Simpan |
| **Edit Buku** | Klik tombol `Edit` di baris buku yang ingin diubah → ubah data → klik Simpan |
| **Hapus Buku** | Klik tombol `Hapus` → konfirmasi "Ya" → buku terhapus |
| **Cari Buku** | Ketik judul atau penulis di kolom pencarian → hasil otomatis terfilter |

#### 👥 Menu Kelola Anggota (CRUD Anggota)

| Aksi | Cara Melakukan |
|------|----------------|
| **Tambah Anggota** | Klik `+ Tambah Anggota` → isi Username & Password → pilih Role → Simpan |
| **Edit Anggota** | Klik `Edit` → ubah data → Simpan |
| **Hapus Anggota** | Klik `Hapus` → konfirmasi "Ya" |

> ⚠️ **Catatan:** Admin utama (username: `admin`) tidak bisa dihapus!

#### 📋 Menu Kelola Transaksi (CRUD Peminjaman)

| Aksi | Cara Melakukan |
|------|----------------|
| **Tambah Peminjaman** | Klik `+ Tambah Peminjaman` → pilih peminjam & buku → isi tanggal → Simpan |
| **Edit Peminjaman** | Klik `Edit` → ubah data → Simpan |
| **Kembalikan Buku** | Klik tombol `Kembalikan` → konfirmasi "Ya" |
| **Hapus Peminjaman** | Klik `Hapus` → konfirmasi "Ya" |

#### 📋 Menu Log Aktivitas
- Menampilkan semua aktivitas yang dilakukan (tambah/edit/hapus buku, anggota, peminjaman)
- Bisa klik **Hapus Semua** untuk membersihkan log

---

### 👤 DASHBOARD USER (`user.html`)

#### 🏠 Menu Beranda
Menampilkan ucapan selamat datang.

#### 📚 Menu Daftar Buku

| Aksi | Cara Melakukan |
|------|----------------|
| **Lihat Buku** | Semua buku tampil di tabel |
| **Cari Buku** | Ketik judul atau penulis di kolom pencarian |
| **Pinjam Buku** | Klik tombol `Pinjam` → konfirmasi "Ya" → buku masuk ke peminjaman |

> 📅 **Sistem otomatis memberi batas waktu 7 hari!**
> 💰 **Denda keterlambatan: Rp 2.000/hari**

#### 📋 Menu Peminjaman Saya
Menampilkan riwayat peminjaman:
- Buku yang sedang dipinjam (status: Dipinjam)
- Buku yang sudah dikembalikan (status: Dikembalikan)
- Tanggal pinjam
- Batas waktu kembali (Due Date)
- Denda (jika telat)

| Aksi | Cara Melakukan |
|------|----------------|
| **Kembalikan Buku** | Klik tombol `Kembalikan` → konfirmasi "Ya" |

#### 🔑 Menu Ganti Password
- Klik menu **Ganti Password** di sidebar
- Masukkan Password Lama
- Masukkan Password Baru (minimal 3 karakter)
- Konfirmasi Password Baru
- Klik Simpan

---

## ✨ FITUR TAMBAHAN

### 🌙 Dark Mode
- Tombol 🌙/☀️ di pojok kanan bawah layar
- Klik untuk toggle mode gelap/terang
- Pengaturan tersimpan otomatis

### 📸 Foto Profil
- Klik icon 📷 (kamera) atau 📤 (upload) di avatar profil
- **Upload dari file**: Pilih gambar dari komputer
- **Ambil dari kamera**: Bisa pakai webcam laptop/HP
- Foto tersimpan otomatis

### 📄 Export PDF
- Ada di setiap halaman admin (Buku, Anggota, Transaksi)
- Klik tombol **Export PDF**
- File PDF akan otomatis download

### 🔍 Fitur Pencarian
- Tersedia di tabel Buku (Admin & User)
- Tersedia di tabel Peminjaman
- Ketik kata kunci, hasil otomatis terfilter

### 🔔 Notifikasi
- Setiap aksi (tambah, edit, hapus, pinjam) akan muncul notifikasi
- Notifikasi hilang otomatis setelah 3 detik

---

## 🗄️ DATA YANG TERSIMPAN (LocalStorage)

Data tersimpan di browser, bisa dilihat dengan cara:
1. Tekan **F12** → tab **Application** → **Local Storage**

| Key | Isi | Keterangan |
|-----|-----|-------------|
| `lib_users` | Data user (admin & anggota) | Username, password, role |
| `lib_books` | Data buku | Judul, penulis, kategori |
| `lib_loans` | Data peminjaman | Peminjam, buku, tanggal, status, denda |
| `lib_activities` | Log aktivitas | Semua aksi yang dilakukan |
| `currentUser` | Session login | User yang sedang login |
| `darkMode` | Pengaturan dark mode | true/false |
| `profile_{id}` | Foto profil | Base64 image |

---

## 🐛 TROUBLESHOOTING

### ❌ Tombol tidak berfungsi / error
**Solusi:**
1. Buka Console: Tekan **F12** → tab **Console**
2. Refresh halaman, lihat error merah
3. Pastikan semua file (.html, .js, .css) ada di folder yang sama
4. Clear cache browser (Ctrl + Shift + Delete)

### ❌ Login gagal / terus balik ke login
**Solusi:**
1. Buka Console, ketik `localStorage.clear()` lalu Enter
2. Refresh halaman
3. Login dengan `admin` / `123`

### ❌ Data hilang setelah refresh
**Solusi:**
- Data tersimpan di LocalStorage browser
- Jangan hapus data browser (clear cache)
- Jangan buka di mode incognito/private

### ❌ Kamera tidak bisa diakses
**Solusi:**
- Pastikan browser diizinkan akses kamera
- Klik icon kamera di URL bar → Allow
- Untuk laptop tanpa kamera, gunakan tombol upload file

### ❌ Export PDF error
**Solusi:**
- Pastikan koneksi internet stabil
- Tunggu library PDF selesai loading (2-3 detik)
- Coba refresh halaman

---

## 📝 CHEAT SHEET (Ringkasan Cepat)

### Admin:
| Mau Ngapain? | Caranya |
|--------------|---------|
| Tambah Buku | Kelola Buku → + Tambah Buku |
| Hapus Anggota | Kelola Anggota → Hapus |
| Lihat laporan PDF | Klik Export PDF di setiap tabel |
| Ganti Password | Menu Ganti Password di sidebar |

### User:
| Mau Ngapain? | Caranya |
|--------------|---------|
| Pinjam Buku | Daftar Buku → Pinjam |
| Kembalikan Buku | Peminjaman Saya → Kembalikan |
| Cari Buku | Ketik di kolom pencarian |
| Ganti Password | Menu Ganti Password di sidebar |

---

## 👨‍💻 KREDIT

Dibuat oleh:
- **Nama:** [Nama Kamu]
- **Kelas:** [Kelas Kamu]
- **Jurusan:** RPL (Rekayasa Perangkat Lunak)
- **Sekolah:** [Nama Sekolah]

**Teknologi yang digunakan:**
- [FontAwesome](https://fontawesome.com/) - Ikon keren
- [jsPDF](https://github.com/parallax/jsPDF) - Export PDF
- [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) - Tabel di PDF

---

<div align="center">
  <p>Made with Tegar Satia</p>
  <p>Selamat menggunakan</p>
</div>
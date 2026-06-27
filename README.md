# Project Overview
Tolong buatkan aplikasi web pendaftaran Olimpiade Sains Nasional (OSN). Sistem ini memiliki dua jenis pengguna: `Admin Lomba` dan `Pendaftar Lomba`.

# Tech Stack
* **Frontend:** React.js
* **Backend:** .NET Core (Web API)
* **Database:** SQL Server (Gunakan Entity Framework Core)

# User Roles & Features

### 1. Admin Lomba
* **Manajemen Lomba:** Dapat melakukan Create, Read, Update, Delete (CRUD) untuk data perlombaan OSN.
* **Verifikasi Berkas:** Dapat melihat daftar pendaftar di setiap lomba, mengunduh/melihat berkas PDF pendaftar, dan mengubah status verifikasi menjadi `Verified` atau `Rejected`.

### 2. Pendaftar Lomba
* **Dashboard Lomba:** Dapat melihat daftar lomba OSN yang tersedia beserta jadwalnya.
* **Pendaftaran:** Dapat mendaftar lomba dengan batasan validasi ketat: Pendaftaran akan ditutup atau ditolak jika waktu saat ini sudah melewati batas maksimal 1 minggu sebelum tanggal perlombaan dimulai (`EventStartDate`).
* **Upload Berkas:** Saat mendaftar, wajib mengunggah 3 dokumen persyaratan: Kartu Pelajar, Kartu Keluarga (KK), dan Surat Keterangan Sehat.
* **Validasi File:** Sistem harus memvalidasi bahwa file yang diunggah hanya boleh berekstensi `.pdf`.

# Execution Instructions
Tolong eksekusi pembuatan sistem ini dengan urutan berikut:

### Phase 1: Backend (.NET Core Web API)
* Buatkan struktur *project* dengan pola desain *Repository Pattern* atau *Clean Architecture*.
* Buatkan entitas model berdasarkan skema SQL Server yang memiliki tabel: `Users`, `Events`, `Registrations`, dan `Documents`.
* Buatkan API Endpoints untuk *Authentication* (Login/Register menggunakan JWT).
* Buatkan API Endpoints untuk entitas Event, Registration, dan Document.
* Terapkan *business logic* untuk menolak pendaftaran jika kurang dari 7 hari sebelum lomba dimulai.
* Terapkan *middleware* atau *helper* untuk menangani *upload file* dan pastikan hanya menerima format `.pdf`.

### Phase 2: Frontend (React.js)
* Buatkan *routing* dasar (gunakan `react-router-dom`) untuk halaman Login, Dashboard Admin, dan Dashboard Pendaftar.
* Buatkan *state management* sederhana (misalnya menggunakan Context API atau Zustand) untuk menyimpan data user yang sedang *login* beserta token JWT-nya.
* Buatkan komponen halaman untuk Admin: Form pembuatan lomba dan tabel verifikasi berkas pendaftar.
* Buatkan komponen halaman untuk Pendaftar: *List* lomba OSN dan form pendaftaran (termasuk *input file* untuk *upload* 3 jenis dokumen PDF).
* Terapkan *handling error* yang informatif, terutama jika validasi H-7 pendaftaran atau validasi PDF gagal.
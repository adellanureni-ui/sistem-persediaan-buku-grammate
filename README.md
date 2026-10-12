# 📚 Grammate Bookstore

### Sistem Persediaan Buku & Akuntansi

Aplikasi web untuk mengelola stok buku sekaligus pembukuan toko, dari transaksi, jurnal, buku besar, sampai laporan keuangan.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

</div>

---

## 📖 Tentang Proyek

**Grammate Bookstore** adalah sistem **akuntansi persediaan** untuk toko buku. Setiap transaksi yang dicatat langsung memengaruhi dua hal sekaligus: **jumlah stok** dan **pembukuan akuntansi**. Karena itu laporan keuangan selalu bersumber dari data yang sama dengan data persediaan.

---

## 🧾 Alur Akuntansi Persediaan

| Transaksi | Dampak ke Stok | Dampak ke Akuntansi |
|-----------|----------------|---------------------|
| **Pembelian** | Stok bertambah | Membentuk jurnal persediaan |
| **Penjualan** | Stok berkurang | Membukukan jurnal pendapatan **dan** beban pokok penjualan (HPP) |
| **Penyesuaian Stok** | Stok ditambah atau dikurangi sesuai hasil pemeriksaan fisik | Koreksi nilai persediaan |

```
Transaksi → Jurnal Umum → Buku Besar → Laporan Laba Rugi & Neraca
              ↓
        Kartu Persediaan (pergerakan stok per buku)
```

---

## 📝 Modul Akuntansi

### Jurnal Umum
- Mencatat setiap transaksi dalam bentuk **debit** dan **kredit**
- Kolom: tanggal, referensi, keterangan, akun, debit, kredit
- Menampilkan total debit dan kredit untuk memeriksa keseimbangan jurnal

### Buku Besar
- Memuat mutasi setiap akun berdasarkan jurnal umum
- Filter per akun atau semua akun
- Kolom: tanggal, referensi, akun, keterangan, debit, kredit, **saldo berjalan**

### Kartu Persediaan
- Alur stok **masuk**, **keluar**, dan **saldo** per buku
- Filter per buku atau semua buku
- Kolom: tanggal, referensi, buku, jenis, masuk, keluar, saldo

### Laporan Laba Rugi
- Pendapatan penjualan
- Dikurangi beban pokok penjualan (HPP)
- Menghasilkan **laba (rugi) kotor**
- Dilengkapi tabel jurnal pendapatan dan HPP

### Neraca
- Posisi **aset** serta **liabilitas dan ekuitas**
- Menampilkan seluruh akun beserta debit, kredit, dan **saldo normal**
- Total aset dibandingkan dengan total liabilitas dan ekuitas

---

## 🧩 Modul Lainnya

### 🏠 Ringkasan
Ringkasan persediaan, mitra, dan aktivitas usaha, dengan riwayat aktivitas terbaru.

### 📁 Data Master
| Menu | Isi |
|------|-----|
| **Data Buku** | Kode buku, nama, satuan, harga beli, harga jual, stok awal |
| **Data Pelanggan** | Nama, telepon, alamat |
| **Data Supplier** | Nama, telepon, alamat |

### 🧮 Transaksi
| Menu | Isi |
|------|-----|
| **Transaksi Pembelian** | No faktur, supplier, buku, jumlah, harga beli per unit |
| **Transaksi Penjualan** | No nota, pelanggan, buku, jumlah, harga jual per unit |
| **Penyesuaian Stok** | Buku, jenis (Tambah/Kurang), jumlah, keterangan |

### 📊 Laporan Operasional
| Menu | Isi |
|------|-----|
| **Laporan Buku** | Posisi stok dan nilai persediaan saat ini |
| **Laporan Pembelian** | Rekap pembelian beserta total |
| **Laporan Penjualan** | Rekap penjualan beserta total |

### ⚙️ Pengaturan & Antarmuka
- 🌗 Tema gelap/terang
- ☰ Sidebar yang bisa disembunyikan
- 🎮 Tampilan retro / pixel art
- ✏️ Edit data lewat jendela modal

---

## 🛠️ Teknologi

| Bagian | Teknologi |
|--------|-----------|
| Struktur halaman | HTML5 (single page, navigasi berbasis hash) |
| Tampilan | CSS3 |
| Logika aplikasi | JavaScript (vanilla) |
| Basis data & backend | Supabase (`@supabase/supabase-js`) |
| Ikon | Twemoji via jsDelivr CDN |

---

## 📂 Struktur Proyek

```
sistem-persediaan-buku-grammate/
├── frontend/
│   ├── index.html     # Seluruh halaman aplikasi
│   ├── style.css      # Gaya tampilan
│   └── script.js      # Logika antarmuka
├── backend/
│   └── app.js         # Koneksi dan fungsi Supabase
└── README.md
```

---

## 👩‍💻 Pembuat

**Adella Nureni** — [@adellanureni-ui](https://github.com/adellanureni-ui)

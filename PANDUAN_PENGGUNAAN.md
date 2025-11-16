# 📘 Panduan Lengkap Penggunaan MarineEcoPredict

## 📋 Daftar Isi
1. [Pengenalan](#pengenalan)
2. [Target dan Tujuan Website](#target-dan-tujuan-website)
3. [Apa itu HSI (Habitat Suitability Index)?](#apa-itu-hsi-habitat-suitability-index)
4. [Rumus dan Metode Perhitungan HSI](#rumus-dan-metode-perhitungan-hsi)
5. [Arsitektur dan Teknologi Website](#arsitektur-dan-teknologi-website)
6. [Halaman Beranda (Index)](#halaman-beranda-index)
7. [Halaman Analisis (Analysis)](#halaman-analisis-analysis)
8. [Halaman Perbandingan (Comparison)](#halaman-perbandingan-comparison)
9. [Halaman Riwayat (History)](#halaman-riwayat-history)
10. [Halaman Bantuan (Help)](#halaman-bantuan-help)
11. [Halaman Tentang (About)](#halaman-tentang-about)
12. [Fitur Khusus](#fitur-khusus)
13. [Tips dan Trik](#tips-dan-trik)

---

## 🎯 Pengenalan

**MarineEcoPredict** adalah platform web untuk prediksi dan analisis ekosistem laut menggunakan **Habitat Suitability Index (HSI)**. Platform ini dirancang untuk membantu peneliti, pengelola sumber daya, pemerintah, dan komunitas dalam menganalisis kondisi ekosistem laut di Selat Sunda.

### Fitur Utama:
- ✅ Analisis data historis dengan peta interaktif
- ✅ Prediksi HSI untuk masa depan (2025-2028)
- ✅ Perbandingan hingga 3 skenario berbeda
- ✅ Dashboard OLAP untuk analisis mendalam
- ✅ Export data ke Excel
- ✅ Riwayat analisis dan perbandingan
- ✅ Mode gelap/terang
- ✅ Responsif untuk semua perangkat

---

## 🎯 Target dan Tujuan Website

### Tujuan Utama
MarineEcoPredict bertujuan untuk memberikan prediksi akurat tentang daya dukung ekosistem laut di Selat Sunda. Daya dukung ekosistem mengacu pada kemampuan suatu habitat untuk mendukung kehidupan laut dalam jangka panjang tanpa mengalami degradasi.

### Target Pengguna
1. Peneliti & Akademisi
   - Menganalisis data ekosistem laut untuk penelitian
   - Publikasi ilmiah tentang kondisi habitat laut
   - Pengembangan model prediksi yang lebih akurat

2. Pengelola Sumber Daya
   - Pengambilan keputusan dalam pengelolaan perikanan berkelanjutan
   - Penentuan kuota tangkapan berdasarkan daya dukung
   - Zonasi kawasan konservasi laut

3. Pemerintah & Lembaga
   - Monitoring kondisi ekosistem untuk perencanaan kebijakan lingkungan
   - Evaluasi program konservasi
   - Perencanaan pembangunan berkelanjutan

4. Komunitas & Aktivis
   - Memahami kondisi laut untuk kampanye konservasi
   - Edukasi publik tentang kesehatan ekosistem laut
   - Advokasi kebijakan lingkungan yang lebih baik

### Kontribusi terhadap SDGs
Platform ini berkontribusi langsung terhadap:
- **SDG 14 (Life Below Water)**: Konservasi dan pemanfaatan berkelanjutan sumber daya kelautan
- **SDG 13 (Climate Action)**: Mengidentifikasi dampak perubahan iklim terhadap ekosistem laut
- **SDG 15 (Life on Land)**: Memahami interaksi ekosistem darat dan laut
- **SDG 17 (Partnerships)**: Mempromosikan kemitraan melalui aksesibilitas platform

---

## 📐 Apa itu HSI (Habitat Suitability Index)?

### Definisi
**Habitat Suitability Index (HSI)** adalah indeks numerik yang mengukur **tingkat kesesuaian suatu habitat** untuk mendukung kehidupan organisme laut. Nilai HSI berkisar dari **0 hingga 1**, di mana:
- **0**: Habitat tidak sesuai sama sekali
- **1**: Habitat sangat sesuai (optimal)

### Konsep Dasar
HSI mengintegrasikan berbagai parameter lingkungan yang mempengaruhi kesehatan dan produktivitas ekosistem laut. Setiap parameter memiliki pengaruh berbeda terhadap kesesuaian habitat, sehingga diberikan bobot (weight) yang berbeda dalam perhitungan.

### Parameter yang Digunakan
Platform ini menggunakan **4 parameter utama**:

1. **Sea Surface Temperature (SST)** - Suhu Permukaan Laut
   - **Rentang**: 18-32°C
   - **Optimal**: 27-29°C
   - **Pengaruh**: Mempengaruhi metabolisme, reproduksi, dan distribusi spesies

2. **Chlorophyll-a (CHL)** - Konsentrasi Klorofil-a
   - **Rentang**: 0.1-3 mg/m³
   - **Optimal**: ~1.2 mg/m³
   - **Pengaruh**: Indikator produktivitas primer dan ketersediaan makanan

3. **Salinity (SAL)** - Salinitas
   - **Rentang**: 30-37 PSU
   - **Optimal**: ~34 PSU
   - **Pengaruh**: Mempengaruhi osmoregulasi organisme laut

4. **Depth (DEP)** - Kedalaman
   - **Rentang**: 10-150 m
   - **Optimal**: ~60 m
   - **Pengaruh**: Menentukan penetrasi cahaya dan tekanan air

---

## 🧮 Rumus dan Metode Perhitungan HSI

### Metode Perhitungan
Platform ini menggunakan **Weighted Average Method** (Metode Rata-rata Tertimbang) untuk menghitung HSI Score. Metode ini memberikan bobot berbeda untuk setiap parameter berdasarkan pengaruhnya terhadap kesesuaian habitat.

### Bobot Parameter (Weights)
```
- Sea Surface Temperature (SST): 30% (0.30)
- Chlorophyll-a (CHL):          25% (0.25)
- Salinity (SAL):                25% (0.25)
- Depth (DEP):                   20% (0.20)
─────────────────────────────────────────
Total:                           100% (1.00)
```

### Langkah-Langkah Perhitungan

#### **Langkah 1: Normalisasi Parameter**
Setiap parameter dinormalisasi ke skala 0-1 menggunakan metode yang berbeda:

**a. Untuk Parameter dengan Nilai Optimal (Chlorophyll-a, Salinity, Depth)**
```
Jika parameter memiliki nilai optimal:
  optimalRange = (max - min) / 2
  distance = |nilai_aktual - nilai_optimal|
  normalized = max(0, 1 - distance / optimalRange)
```

**Contoh untuk Chlorophyll-a:**
- Nilai optimal: 1.2 mg/m³
- Rentang: 0.1 - 3.0 mg/m³
- Optimal range: (3.0 - 0.1) / 2 = 1.45
- Jika nilai aktual = 1.2 mg/m³ → distance = 0 → normalized = 1.0
- Jika nilai aktual = 2.0 mg/m³ → distance = 0.8 → normalized = 1 - (0.8/1.45) = 0.45

**b. Untuk Parameter Tanpa Nilai Optimal (SST)**
```
normalized = (nilai_aktual - min) / (max - min)
normalized = clamp(normalized, 0, 1)  // Batasi antara 0-1

Jika higherIsBetter = false:
  normalized = 1 - normalized
```

**Contoh untuk SST:**
- Rentang: 18-32°C
- Jika nilai aktual = 28°C (dalam range optimal 27-29°C):
  - normalized = (28 - 18) / (32 - 18) = 10/14 = 0.714
  - Karena higherIsBetter = false (suhu terlalu tinggi/rendah tidak baik):
    - normalized = 1 - 0.714 = 0.286
  - Namun, karena 28°C dalam range optimal, sistem akan memberikan nilai lebih tinggi

**Catatan**: Untuk SST, sistem menggunakan pendekatan khusus dengan range optimal 27-29°C yang memberikan nilai maksimal.

#### **Langkah 2: Perhitungan Weighted Sum**
```
weightedSum = Σ(normalized_i × weight_i)

Dimana:
- normalized_i = nilai normalisasi parameter ke-i
- weight_i = bobot parameter ke-i
```

#### **Langkah 3: Perhitungan HSI Final**
```
HSI = weightedSum / totalWeight

atau jika totalWeight = 1.0:
HSI = weightedSum
```

### Contoh Perhitungan Lengkap

**Skenario:**
- SST: 28°C
- Chlorophyll-a: 1.2 mg/m³
- Salinity: 34 PSU
- Depth: 60 m

**Langkah 1: Normalisasi**

1. **SST (28°C)**
   - Range: 18-32°C, Optimal: 27-29°C
   - Karena 28°C dalam range optimal → normalized ≈ 0.9 (mendekati optimal)

2. **Chlorophyll-a (1.2 mg/m³)**
   - Optimal: 1.2 mg/m³
   - Distance = |1.2 - 1.2| = 0
   - Optimal range = (3.0 - 0.1) / 2 = 1.45
   - normalized = max(0, 1 - 0/1.45) = 1.0

3. **Salinity (34 PSU)**
   - Optimal: 34 PSU
   - Distance = |34 - 34| = 0
   - Optimal range = (37 - 30) / 2 = 3.5
   - normalized = max(0, 1 - 0/3.5) = 1.0

4. **Depth (60 m)**
   - Optimal: 60 m
   - Distance = |60 - 60| = 0
   - Optimal range = (150 - 10) / 2 = 70
   - normalized = max(0, 1 - 0/70) = 1.0

**Langkah 2: Weighted Sum**
```
weightedSum = (0.9 × 0.30) + (1.0 × 0.25) + (1.0 × 0.25) + (1.0 × 0.20)
            = 0.27 + 0.25 + 0.25 + 0.20
            = 0.97
```

**Langkah 3: HSI Final**
```
HSI = 0.97 / 1.0 = 0.97
```

**Interpretasi**: HSI = 0.97 → **High** (≥0.75) → Habitat sangat sesuai

### Kategorisasi HSI Score

Setelah HSI dihitung, nilai dikategorikan menjadi 3 tingkat:

```
HSI ≥ 0.75  → High (Tinggi)
             → Habitat sangat sesuai untuk kehidupan laut
             → Daya dukung tinggi
             → Warna: Hijau 🟢

0.45 ≤ HSI < 0.75  → Medium (Sedang)
                   → Habitat cukup sesuai
                   → Daya dukung sedang
                   → Warna: Kuning 🟡

HSI < 0.45  → Low (Rendah)
            → Habitat kurang sesuai
            → Daya dukung rendah
            → Warna: Merah 🔴
```

### Keunggulan Metode Ini

1. **Fleksibel**: Dapat menyesuaikan bobot berdasarkan penelitian terbaru
2. **Transparan**: Setiap langkah perhitungan dapat ditelusuri
3. **Akurat**: Mempertimbangkan nilai optimal untuk setiap parameter
4. **Interpretable**: Hasil mudah diinterpretasikan (0-1 scale)

### Catatan Penting

1. **Validasi**: Hasil prediksi HSI harus divalidasi dengan data lapangan untuk memastikan akurasi
2. **Kontekstual**: Nilai optimal dapat berbeda untuk spesies atau ekosistem yang berbeda
3. **Dinamis**: Parameter dan bobot dapat disesuaikan berdasarkan penelitian terbaru
4. **Komprehensif**: HSI hanya salah satu indikator; analisis ekosistem memerlukan pendekatan multi-disiplin

---

## 🏗️ Arsitektur dan Teknologi Website

### Frontend
- **Framework**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Tailwind CSS (Utility-first CSS framework)
- **Icons**: Lucide Icons
- **Maps**: Leaflet.js (Open-source mapping library)
- **Charts**: Chart.js (Data visualization)
- **Excel Export**: SheetJS (xlsx.js)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Data Storage**: File system (GeoJSON files)
- **API**: RESTful API untuk data historis

### Data Processing
- **Format Data**: GeoJSON
- **Sumber Data**: 
  - Copernicus Marine Service
  - BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
  - NASA OceanColor
- **Periode Data**: 2021-2024 (data historis)
- **Prediksi**: 2025-2028 (model ARIMA)

### Penyimpanan Data
- **Browser Storage**: localStorage (riwayat, preferensi)
- **Format**: JSON
- **Kapasitas**: Maksimal 100 item riwayat
- **Penyimpanan**: Lokal di browser (tidak tersinkronisasi antar perangkat)

---

## 🏠 Halaman Beranda (Index)

### Deskripsi
Halaman utama website yang menampilkan peta interaktif untuk analisis data historis Selat Sunda.

### Fitur Utama

#### 1. **Peta Interaktif**
- **Lokasi**: Area Selat Sunda
- **Fungsi**: Menampilkan data HSI, SST, Chlorophyll-a, dan Salinity dalam bentuk peta heatmap
- **Interaksi**: 
  - Klik pada titik peta untuk melihat detail data
  - Klik pada area kosong untuk query data pada koordinat tersebut

#### 2. **Kontrol Peta**
Terdapat 4 kontrol utama di atas peta:

**a. Layer Selector**
- **Opsi**: HSI, SST, Chlorophyll-a, Salinity
- **Fungsi**: Mengubah layer yang ditampilkan di peta

**b. Colormap Selector**
- **Opsi**: Viridis, Plasma, Inferno, Magma, Turbo, Jet
- **Fungsi**: Mengubah skema warna untuk visualisasi data

**c. Year Selector**
- **Opsi**: 2021, 2022, 2023, 2024
- **Fungsi**: Memilih tahun data yang ingin ditampilkan

**d. Month Selector**
- **Opsi**: Januari - Desember
- **Fungsi**: Memilih bulan data yang ingin ditampilkan

#### 3. **Legend (Legenda)**
- **Lokasi**: Pojok kanan atas peta
- **Fungsi**: 
  - Menampilkan gradient warna sesuai colormap yang dipilih
  - Menampilkan nilai minimum dan maksimum
  - Menampilkan interpretasi kategori (Tinggi/Sedang/Rendah untuk HSI)

#### 4. **Tombol Download Data**
- **Lokasi**: Di area kontrol peta (kanan)
- **Fungsi**: 
  - **Data yang Diklik**: Export semua titik yang pernah diklik pengguna ke Excel
  - **Data Historis Lengkap**: Export semua data dari semua periode ke Excel

#### 5. **Dashboard OLAP**
- **Lokasi**: Di bawah peta
- **Fungsi**: Analisis multi-dimensi data
- **Kontrol**:
  - **Dimensi Waktu**: Bulanan atau Tahunan
  - **Pilih Layer**: HSI, SST, Chlorophyll-a, atau Salinity
  - **Agregasi**: Rata-rata, Minimum, Maksimum, Std Dev
  - **Jenis Visualisasi**: Overview, Time Series, Perbandingan Layer, Statistik

### Langkah-Langkah Penggunaan

1. **Mengubah Layer dan Periode Waktu**
   ```
   - Pilih Layer dari dropdown (misalnya: HSI)
   - Pilih Tahun (misalnya: 2024)
   - Pilih Bulan (misalnya: Januari)
   - Peta akan otomatis update menampilkan data periode tersebut
   ```

2. **Mengubah Colormap**
   ```
   - Pilih Colormap dari dropdown (misalnya: Viridis)
   - Legend dan peta akan otomatis update dengan skema warna baru
   ```

3. **Melihat Detail Data**
   ```
   - Klik pada titik data di peta atau area kosong
   - Popup akan muncul menampilkan:
     * Koordinat (Latitude, Longitude)
     * Periode data
     * Nilai parameter yang dipilih
     * Semua parameter yang tersedia (HSI, SST, CHL, Salinity)
     * Interpretasi nilai
   - Klik tombol "Lihat di Dashboard OLAP ↓" untuk analisis lebih lanjut
   ```

4. **Menggunakan Dashboard OLAP**
   ```
   - Setelah klik titik di peta, scroll ke bawah ke bagian Dashboard OLAP
   - Dashboard akan otomatis terisi dengan data dari titik yang diklik
   - Ubah kontrol untuk melihat analisis berbeda:
     * Ubah dimensi waktu untuk melihat trend
     * Ubah agregasi untuk melihat statistik berbeda
     * Ubah jenis visualisasi untuk perspektif berbeda
   ```

5. **Download Data**
   ```
   - Klik tombol "Download Data" di area kontrol
   - Pilih opsi:
     * "Data yang Diklik": Untuk export titik yang sudah diklik
     * "Data Historis Lengkap": Untuk export semua data (akan memakan waktu)
   - File Excel akan otomatis terdownload
   ```

### Informasi Penting
- Data yang diklik otomatis tersimpan di browser (localStorage)
- Popup menampilkan semua parameter yang tersedia, bukan hanya layer yang dipilih
- Dashboard OLAP hanya aktif setelah klik titik di peta

---

## 📊 Halaman Analisis (Analysis)

### Deskripsi
Halaman untuk melihat prediksi HSI masa depan (2025-2028) menggunakan model time series berbasis data historis.

### Fitur Utama

#### 1. **Kontrol Prediksi**
- **Tahun**: Default 2025 (dapat diubah)
- **Bulan**: Slider untuk memilih bulan (Januari-Desember)
- **Tombol "Muat Prediksi"**: Memuat data prediksi untuk periode yang dipilih

#### 2. **Informasi Model**
Terdapat 3 card informasi:
- **Tipe Model**: ARIMA
- **Data Training**: 48 bulan
- **Total Grid Points**: Jumlah titik data di peta

#### 3. **Peta Prediksi**
- **Ukuran**: Lebih kecil dan kompak dibanding peta di beranda
- **Legend**: Di pojok kanan atas peta
- **Fungsi**: Menampilkan distribusi HSI prediksi untuk periode yang dipilih

#### 4. **Statistik Prediksi**
Terdapat 3 statistik utama:
- **Rata-rata HSI**: Nilai HSI rata-rata di seluruh area
- **HSI Maksimum**: Nilai HSI tertinggi
- **Area Optimal**: Persentase area dengan HSI ≥ 0.75

#### 5. **Visualisasi Trend**
Terdapat 2 chart:

**a. Trend HSI Prediksi 2025-2028**
- **Tipe**: Line chart multi-tahun
- **Fungsi**: Menampilkan trend HSI dari 2025-2028
- **Fitur**: 
  - Tombol "Tampilkan Detail" untuk melihat nilai numerik
  - Chart interaktif dengan hover untuk melihat nilai spesifik

**b. Rata-rata HSI per Tahun**
- **Tipe**: Bar chart
- **Fungsi**: Menampilkan rata-rata HSI per tahun (ringkasan)

### Langkah-Langkah Penggunaan

1. **Memuat Prediksi**
   ```
   - Pastikan tahun sudah dipilih (default: 2025)
   - Gunakan slider untuk memilih bulan (default: Januari)
   - Klik tombol "Muat Prediksi"
   - Tunggu hingga data dimuat (peta, statistik, dan chart akan terisi)
   ```

2. **Melihat Detail Trend**
   ```
   - Scroll ke bawah ke bagian "Visualisasi Trend Prediksi"
   - Chart akan menampilkan trend HSI
   - Klik "Tampilkan Detail" untuk melihat nilai numerik
   - Hover pada chart untuk melihat nilai spesifik
   ```

3. **Menganalisis Statistik**
   ```
   - Lihat card statistik di atas chart
   - Perhatikan:
     * Rata-rata HSI: Nilai keseluruhan
     * HSI Maksimum: Potensi optimal
     * Area Optimal: Persentase area yang sangat sesuai
   ```

### Informasi Penting
- Prediksi menggunakan model ARIMA yang dilatih dengan data 2021-2024
- Data prediksi tersedia untuk tahun 2025-2028
- Chart trend menampilkan prediksi multi-tahun untuk analisis jangka panjang

---

## ⚖️ Halaman Perbandingan (Comparison)

### Deskripsi
Halaman untuk membandingkan hingga 3 skenario berbeda dengan parameter lingkungan yang berbeda.

### Fitur Utama

#### 1. **Card Skenario**
Setiap skenario memiliki card dengan:
- **Nama**: Skenario 1, 2, atau 3
- **Input Parameter**:
  - Sea Surface Temperature (°C): 18-32
  - Chlorophyll-a (mg/m³): 0.1-3
  - Salinity (PSU): 30-37
  - Depth (m): 10-150
- **Dropdown Data Contoh**: 
  - Optimal
  - Normal
  - Suboptimal
- **Tombol Hapus**: Untuk menghapus skenario (kecuali Skenario 1)

#### 2. **Tombol Kontrol**
- **Tambah Skenario**: Menambah skenario baru (maksimal 3)
- **Bandingkan**: Menampilkan hasil perbandingan (muncul setelah minimal 2 skenario)

#### 3. **Hasil Perbandingan**
Setelah klik "Bandingkan", akan muncul:

**a. Statistik Card**
- Menampilkan HSI Score dan kategori untuk setiap skenario

**b. Grafik Perbandingan HSI**
- **Tipe**: Bar chart
- **Fungsi**: Visualisasi perbandingan HSI Score antar skenario
- **Warna**: 
  - Hijau: HSI ≥ 0.75 (High)
  - Kuning: 0.45 ≤ HSI < 0.75 (Medium)
  - Merah: HSI < 0.45 (Low)

**c. Tabel Perbandingan Parameter**
- Menampilkan semua parameter untuk setiap skenario dalam format tabel
- Kolom otomatis tersembunyi jika skenario tidak digunakan

**d. Tombol "Simpan ke Riwayat"**
- Menyimpan hasil perbandingan ke halaman Riwayat

### Langkah-Langkah Penggunaan

1. **Membuat Skenario Pertama**
   ```
   - Halaman akan otomatis menampilkan 2 skenario (Skenario 1 dan 2)
   - Isi parameter untuk Skenario 1:
     * Sea Surface Temperature: misalnya 27.4°C
     * Chlorophyll-a: misalnya 1.2 mg/m³
     * Salinity: misalnya 34.0 PSU
     * Depth: misalnya 60 m
   - Atau gunakan dropdown "Data Contoh" untuk mengisi otomatis
   ```

2. **Menggunakan Data Contoh**
   ```
   - Pilih dari dropdown "Data Contoh" di card skenario
   - Opsi:
     * Optimal: Parameter optimal untuk habitat
     * Normal: Parameter normal/rata-rata
     * Suboptimal: Parameter kurang optimal
   - Parameter akan otomatis terisi
   ```

3. **Menambah Skenario**
   ```
   - Klik tombol "Tambah Skenario" (maksimal 3 skenario)
   - Isi parameter untuk skenario baru
   ```

4. **Membandingkan Skenario**
   ```
   - Pastikan minimal 2 skenario sudah diisi
   - Klik tombol "Bandingkan"
   - Hasil akan muncul di bawah:
     * Statistik card untuk setiap skenario
     * Grafik bar chart perbandingan HSI
     * Tabel perbandingan parameter
   ```

5. **Menyimpan ke Riwayat**
   ```
   - Setelah melihat hasil perbandingan
   - Klik tombol "Simpan ke Riwayat"
   - Data akan tersimpan dan dapat dilihat di halaman Riwayat
   ```

### Informasi Penting
- Minimal 2 skenario diperlukan untuk perbandingan
- Maksimal 3 skenario dapat dibandingkan
- HSI Score dihitung menggunakan weighted average dari semua parameter
- Data contoh dapat digunakan untuk quick start

---

## 📜 Halaman Riwayat (History)

### Deskripsi
Halaman untuk melihat dan mengelola semua prediksi dan perbandingan yang telah dibuat.

### Fitur Utama

#### 1. **Daftar Riwayat**
- **Format**: Grid card (1-3 kolom tergantung ukuran layar)
- **Tipe Item**:
  - **Prediksi Tunggal**: Menampilkan HSI Score, parameter, dan timestamp
  - **Perbandingan**: Menampilkan jumlah skenario, skenario terbaik, dan detail semua skenario

#### 2. **Informasi Item**
Setiap item menampilkan:
- **HSI Score**: Dengan warna sesuai kategori (Hijau/Kuning/Merah)
- **Badge Kategori**: High/Medium/Low
- **Timestamp**: Tanggal dan waktu analisis
- **Parameter**: Nilai semua parameter (SST, Chlorophyll, Salinity, Depth)
- **Tombol Hapus**: Untuk menghapus item tertentu

#### 3. **Kontrol**
- **Tombol "Hapus Semua"**: Menghapus semua riwayat (dengan konfirmasi)
- **Counter**: Menampilkan total item (prediksi + perbandingan)

#### 4. **Tren HSI dari Riwayat**
- **Tipe**: Line chart
- **Fungsi**: Menampilkan trend HSI Score dari waktu ke waktu
- **Kontrol**:
  - Dropdown untuk memilih rentang data:
    * 10 data terakhir
    * 20 data terakhir
    * 50 data terakhir
    * Semua data

#### 5. **Empty State**
- Muncul jika belum ada riwayat
- Tombol "Mulai Bandingkan" untuk langsung ke halaman Perbandingan

### Langkah-Langkah Penggunaan

1. **Melihat Riwayat**
   ```
   - Buka halaman Riwayat
   - Semua prediksi dan perbandingan akan ditampilkan dalam grid
   - Item terbaru berada di atas
   ```

2. **Melihat Detail Item**
   ```
   - Setiap card menampilkan:
     * HSI Score dengan warna kategori
     * Timestamp analisis
     * Semua parameter yang digunakan
   - Untuk perbandingan, akan menampilkan semua skenario
   ```

3. **Menghapus Item**
   ```
   - Klik tombol X di pojok kanan atas card
   - Item akan langsung terhapus
   ```

4. **Menghapus Semua Riwayat**
   ```
   - Klik tombol "Hapus Semua"
   - Konfirmasi penghapusan
   - Semua riwayat akan terhapus
   ```

5. **Melihat Trend HSI**
   ```
   - Scroll ke bawah ke bagian "Tren HSI dari Riwayat"
   - Pilih rentang data dari dropdown
   - Chart akan menampilkan trend HSI Score
   ```

### Informasi Penting
- Data tersimpan di browser (localStorage)
- Maksimal 100 item disimpan (item lama otomatis terhapus)
- Trend chart hanya menampilkan prediksi tunggal (bukan perbandingan)
- Data tidak tersinkronisasi antar perangkat/browser

---

## ❓ Halaman Bantuan (Help)

### Deskripsi
Halaman dokumentasi dan FAQ untuk membantu pengguna memahami platform.

### Konten Utama

#### 1. **Panduan Penggunaan**
- Memulai Analisis
- Memahami Hasil
- Perbandingan Skenario

#### 2. **Parameter Lingkungan**
Penjelasan detail untuk setiap parameter:
- **Sea Surface Temperature (SST)**
  - Rentang: 18-32°C
  - Unit: Derajat Celsius
  - Deskripsi: Pengaruh terhadap metabolisme organisme

- **Chlorophyll-a**
  - Rentang: 0.1-3 mg/m³
  - Optimal: ~1.2 mg/m³
  - Deskripsi: Indikator produktivitas primer

- **Salinity**
  - Rentang: 30-37 PSU
  - Optimal: ~34 PSU
  - Deskripsi: Konsentrasi garam terlarut

- **Depth**
  - Rentang: 10-150 m
  - Optimal: ~60 m
  - Deskripsi: Kedalaman air

#### 3. **FAQ (Frequently Asked Questions)**
Pertanyaan umum dan jawaban:
- Apa itu HSI?
- Bagaimana interpretasi HSI Score?
- Dari mana data parameter diambil?
- Apakah hasil prediksi akurat?
- Bagaimana cara export hasil?
- Apakah data tersimpan?

#### 4. **Tips**
- Gunakan data yang valid
- Bandingkan skenario
- Simpan hasil
- Monitor trend
- Perhatikan rekomendasi

---

## ℹ️ Halaman Tentang (About)

### Deskripsi
Halaman informasi tentang platform, tujuan, dan kontribusi terhadap SDGs.

### Konten Utama

#### 1. **Tujuan Utama**
- Prediksi daya dukung ekosistem laut
- Analisis 4 parameter kunci

#### 2. **Cara Kerja Platform**
- Model machine learning
- Weighted average untuk HSI Score
- Kategorisasi: High/Medium/Low

#### 3. **Target Pengguna**
- Peneliti & Akademisi
- Pengelola Sumber Daya
- Pemerintah & Lembaga
- Komunitas & Aktivis

#### 4. **Kontribusi SDGs**
- SDG 14: Life Below Water
- SDG 13: Climate Action
- SDG 15: Life on Land
- SDG 17: Partnerships

#### 5. **Sumber Data**
- Copernicus
- BMKG
- NASA OceanColor

---

## 🎨 Fitur Khusus

### 1. **Mode Gelap/Terang**
- **Lokasi**: Tombol di header (ikon bulan/matahari)
- **Fungsi**: Mengubah tema website
- **Penyimpanan**: Preference tersimpan di browser
- **Cara**: Klik tombol tema di header

### 2. **Export Data Excel**
- **Lokasi**: Halaman Beranda (tombol Download Data)
- **Format**: File .xlsx
- **Opsi**:
  - Data yang Diklik: Export titik yang pernah diklik
  - Data Historis Lengkap: Export semua data
- **Konten File**:
  - Sheet 1: Data utama dengan semua kolom
  - Format: No, Latitude, Longitude, Tahun, Bulan, Periode, HSI, SST, CHL, Salinity, Layer, Waktu Klik

### 3. **Penyimpanan Lokal**
- **Teknologi**: Browser localStorage
- **Data yang Disimpan**:
  - Riwayat prediksi dan perbandingan
  - Titik peta yang diklik
  - Preference tema (gelap/terang)
- **Keterbatasan**: 
  - Hanya tersimpan di browser yang sama
  - Tidak tersinkronisasi antar perangkat
  - Maksimal 100 item riwayat

### 4. **Responsive Design**
- **Desktop**: Layout penuh dengan semua fitur
- **Tablet**: Layout adaptif dengan grid responsif
- **Mobile**: Layout stack dengan navigasi bottom bar

### 5. **Navigasi**
- **Header**: Menu utama di atas (Desktop)
- **Footer**: Menu tambahan di bawah
- **Active State**: Halaman aktif ditandai dengan highlight
- **Smooth Scroll**: Scroll otomatis ke section tertentu

---

## 💡 Tips dan Trik

### 1. **Mengoptimalkan Analisis**
- Gunakan data contoh untuk quick start
- Bandingkan minimal 2 skenario untuk insight lebih baik
- Simpan hasil penting ke riwayat
- Export data untuk analisis lanjutan di Excel

### 2. **Menggunakan Peta**
- Klik titik data untuk melihat detail lengkap
- Klik area kosong untuk query data pada koordinat tertentu
- Gunakan colormap berbeda untuk visualisasi yang berbeda
- Ubah layer untuk melihat parameter berbeda

### 3. **Menggunakan Dashboard OLAP**
- Klik titik di peta terlebih dahulu
- Ubah dimensi waktu untuk melihat trend
- Coba agregasi berbeda untuk statistik berbeda
- Gunakan visualisasi berbeda untuk perspektif berbeda

### 4. **Mengelola Riwayat**
- Hapus item yang tidak diperlukan untuk performa lebih baik
- Gunakan trend chart untuk melihat pola jangka panjang
- Export data penting sebelum menghapus riwayat

### 5. **Memahami HSI Score**
- **High (≥0.75)**: Habitat sangat sesuai, daya dukung tinggi
- **Medium (0.45-0.75)**: Habitat cukup sesuai, daya dukung sedang
- **Low (<0.45)**: Habitat kurang sesuai, daya dukung rendah

### 6. **Parameter Optimal**
- **SST**: 27-29°C (optimal)
- **Chlorophyll-a**: ~1.2 mg/m³ (optimal)
- **Salinity**: ~34 PSU (optimal)
- **Depth**: ~60 m (optimal)

---

## 🔧 Troubleshooting

### Masalah Umum

1. **Peta tidak muncul**
   - Pastikan koneksi internet aktif
   - Refresh halaman
   - Cek console browser untuk error

2. **Data tidak terload**
   - Pastikan backend API berjalan
   - Cek koneksi ke server
   - Lihat error di console browser

3. **Download Excel tidak bekerja**
   - Pastikan browser mendukung download
   - Cek popup blocker
   - Coba browser lain

4. **Riwayat hilang**
   - Data tersimpan di browser lokal
   - Hapus cache browser akan menghapus riwayat
   - Gunakan browser yang sama untuk akses riwayat

5. **Chart tidak muncul**
   - Pastikan Chart.js library terload
   - Refresh halaman
   - Cek console untuk error JavaScript

---

## 📞 Kontak dan Dukungan

Untuk pertanyaan atau bantuan lebih lanjut:
- Lihat halaman **Bantuan** untuk FAQ lengkap
- Lihat halaman **Tentang** untuk informasi platform
- Gunakan fitur dokumentasi di setiap halaman

---

## 📝 Catatan Penting

1. **Akurasi Data**: Prediksi menggunakan model berbasis data historis. Validasi dengan data lapangan disarankan.

2. **Penyimpanan Data**: Semua data tersimpan lokal di browser. Backup data penting secara berkala.

3. **Kompatibilitas Browser**: 
   - Chrome/Edge: ✅ Full support
   - Firefox: ✅ Full support
   - Safari: ✅ Full support
   - Opera: ✅ Full support

4. **Ukuran Data**: 
   - Export data historis lengkap dapat menghasilkan file besar
   - Pastikan cukup ruang penyimpanan

5. **Privasi**: 
   - Data hanya tersimpan di browser lokal
   - Tidak ada data yang dikirim ke server eksternal
   - Platform dapat digunakan offline (setelah data terload)

---

**Versi Dokumen**: 1.0  
**Terakhir Diupdate**: 2024  
**Platform**: MarineEcoPredict

---

*Dokumen ini dapat di-copy dan digunakan untuk dokumentasi atau presentasi.*


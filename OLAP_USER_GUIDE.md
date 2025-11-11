# 📊 OLAP Dashboard - User Guide

## Apa itu Dashboard OLAP?

**OLAP** (Online Analytical Processing) adalah teknologi yang memungkinkan analisis data multidimensi secara interaktif. Dashboard OLAP kami memungkinkan Anda untuk:

- 🗺️ **Eksplorasi** data berdasarkan lokasi spesifik di peta
- ⏰ **Analisis Temporal** - melihat trend waktu (bulanan/tahunan)
- 📊 **Membandingkan** berbagai parameter (HSI, SST, Chlorophyll-a, Salinity)
- 📈 **Mengagregasi** data dengan berbagai metode (mean, min, max, std)
- 🎯 **Visualisasi** dalam 4 format berbeda (overview, time series, comparison, statistics)

---

## 🎯 Cara Menggunakan Step-by-Step

### **Step 1: Buka Halaman Index.html**

```
Browser → Buka http://localhost:3000 → Muncul halaman utama
```

**Yang Anda lihat:**
- Header dengan navigation
- Banner besar "Predicting the Future of Our Oceans"
- Map controls (Layer, Colormap, Year, Month selectors)
- Peta interaktif Selat Sunda dengan data visualization
- Legend di kanan atas
- Informasi hint di kiri bawah: "💡 Klik pada peta untuk melihat detail data di dashboard"

---

### **Step 2: Pilih Data yang Ingin Dilihat**

Gunakan **Map Controls** di atas peta:

```
┌─────────────────────────────────────────────────────────┐
│ Layer: [HSI ▼]   Colormap: [Viridis ▼]                 │
│ Year: [2024 ▼]   Month: [January ▼]                    │
└─────────────────────────────────────────────────────────┘
```

**Opsi:**
- **Layer**: HSI (default) | SST | Chlorophyll-a | Salinity
- **Colormap**: Viridis | Plasma | Inferno | Magma | Turbo | Jet
- **Year**: 2021 | 2022 | 2023 | 2024
- **Month**: Jan-Dec (12 bulan)

**Contoh:**
Jika ingin lihat data SST untuk April 2023:
1. Pilih "SST" di Layer selector
2. Pilih "2023" di Year selector
3. Pilih "April" di Month selector
4. Peta otomatis update dengan data SST April 2023

---

### **Step 3: Klik pada Peta untuk Pilih Lokasi**

Klik di mana saja pada area peta Selat Sunda.

**Apa yang terjadi:**

1. **Popup muncul** dengan informasi detail:

```
┌──────────────────────────────────────────────┐
│ 🌊 Habitat Suitability Index                 │
│                                              │
│ 📍 Lat: -6.1234                             │
│ 📍 Lon: 105.3456                            │
│ 📅 Periode: 2024-01                         │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ Nilai Saat Ini                          │ │
│ │ 0.654                                   │ │
│ │ (Index 0-1)                             │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ 🟢 Tinggi - Sangat sesuai untuk habitat     │
│                                              │
│ ⏰ 12/11/2025, 15:30:45                     │
│                                              │
│ [📊 Lihat di Dashboard OLAP ↓]            │
└──────────────────────────────────────────────┘
```

2. **Popup berisi:**
   - Nama Layer yang sedang ditampilkan
   - Koordinat (Latitude, Longitude) dari titik yang diklik
   - Periode waktu (year-month)
   - Nilai saat ini dalam format yang sesuai
   - Interpretasi otomatis dari nilai
   - Timestamp kapan data di-generate
   - Tombol untuk buka dashboard

---

### **Step 4: Klik Tombol "Lihat di Dashboard OLAP ↓"**

```
Popup → Klik tombol "📊 Lihat di Dashboard OLAP ↓"
```

**Yang terjadi:**

1. **Halaman otomatis scroll ke bawah** ke Dashboard OLAP section
2. **Dashboard otomatis update** dengan data dari lokasi yang dipilih
3. **Sidebar/popup ditutup** otomatis

---

### **Step 5: Analisis Data di Dashboard OLAP**

Sekarang Anda melihat Dashboard OLAP dengan 4 selector:

```
┌─────────────────────────────────────────────────────────┐
│ 📊 Dashboard Analisis OLAP                              │
│                                                         │
│ [Dimensi Waktu: Bulanan ▼] [Pilih Layer: HSI ▼]      │
│ [Agregasi: Rata-rata ▼]    [Jenis Visualisasi: ... ▼] │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │        VISUALISASI DATA SESUAI PILIHAN             │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎛️ Cara Menggunakan Selector Dashboard

### **1. Dimensi Waktu (Time Dimension)**

```
[Dimensi Waktu: Bulanan ▼]
  ├─ Bulanan (monthly) - Analisis per bulan
  └─ Tahunan (yearly) - Analisis per tahun
```

**Apa bedanya?**

- **Bulanan**: Data dikelompokkan per bulan (Jan, Feb, Mar, dst)
  - Cocok untuk melihat trend musiman dalam setahun
  - Detail data lebih spesifik

- **Tahunan**: Data dikelompokkan per tahun (2021, 2022, 2023, 2024)
  - Cocok untuk melihat trend jangka panjang
  - Data lebih ringkas

**Contoh:**
- Pilih "Bulanan" untuk lihat bagaimana HSI berubah setiap bulan di lokasi Anda
- Pilih "Tahunan" untuk lihat bagaimana HSI berbeda per tahun

---

### **2. Pilih Layer (Data Parameter)**

```
[Pilih Layer: HSI ▼]
  ├─ HSI (Habitat Suitability Index)
  ├─ SST (Sea Surface Temperature)
  ├─ Chlorophyll-a
  └─ Salinity
```

**Penjelasan setiap layer:**

#### **HSI - Habitat Suitability Index**
- **Pengertian**: Indeks kesesuaian habitat untuk kehidupan laut
- **Range**: 0.0 - 1.0
- **Interpretasi**:
  - 🟢 0.75-1.0 = Tinggi (Sangat sesuai untuk habitat)
  - 🟡 0.45-0.75 = Sedang (Cukup sesuai)
  - 🔴 0.0-0.45 = Rendah (Kurang sesuai)
- **Kegunaan**: Menentukan apakah area cocok untuk ikan/organisme laut tertentu

#### **SST - Sea Surface Temperature**
- **Pengertian**: Suhu permukaan air laut
- **Range**: 25°C - 31°C
- **Interpretasi**:
  - ✅ 27-29°C = Optimal (Suhu ideal)
  - ❄️ < 27°C = Dingin
  - 🔥 > 29°C = Hangat
- **Kegunaan**: Memahami kondisi thermal laut dan pengaruhnya pada organisme

#### **Chlorophyll-a**
- **Pengertian**: Konsentrasi klorofil (pigmen pada fitoplankton)
- **Range**: 0.1 - 3.0 mg/m³
- **Interpretasi**:
  - ✅ 0.5-2.0 = Normal (Produktivitas normal)
  - 📉 < 0.5 = Rendah (Produktivitas rendah)
  - 📈 > 2.0 = Tinggi (Area sangat subur)
- **Kegunaan**: Indikator produktivitas primer laut

#### **Salinity**
- **Pengertian**: Kadar garam dalam air laut
- **Range**: 31 - 36 PSU (Practical Salinity Unit)
- **Interpretasi**:
  - ✅ 33-34 = Optimal (Salinitas ideal)
  - 💧 < 33 = Rendah (Pengaruh air tawar)
  - 🧂 > 34 = Tinggi (Area evaporasi tinggi)
- **Kegunaan**: Memahami karakteristik air laut dan habitatnya

---

### **3. Agregasi (Aggregation Method)**

```
[Agregasi: Rata-rata ▼]
  ├─ Rata-rata (Mean) - Nilai rata-rata dari data
  ├─ Minimum - Nilai terendah
  ├─ Maksimum - Nilai tertinggi
  └─ Std Dev - Standar deviasi (variabilitas)
```

**Penjelasan:**

- **Rata-rata (Mean)**
  - Nilai tengah dari semua data point
  - Paling umum digunakan
  - Cocok untuk overview

- **Minimum**
  - Nilai terendah dalam dataset
  - Menunjukkan kondisi terburuk

- **Maksimum**
  - Nilai tertinggi dalam dataset
  - Menunjukkan kondisi terbaik

- **Std Dev (Standard Deviation)**
  - Mengukur variabilitas data
  - Nilai kecil = data konsisten
  - Nilai besar = data bervariasi

---

### **4. Jenis Visualisasi (Visualization Type)**

```
[Jenis Visualisasi: Overview ▼]
  ├─ Overview - Ringkasan statistik
  ├─ Time Series - Grafik trend waktu
  ├─ Perbandingan Layer - Bandingkan semua layer
  └─ Statistik - Analisis statistik mendalam
```

---

## 📊 Mengerti Setiap Visualisasi

### **Tab 1: Overview**

```
┌─────────────────────────────────────────────────────────┐
│                    STATISTIK RINGKAS                    │
├──────────────────┬──────────────────┬──────────────────┤
│  RATA-RATA       │     MEDIAN       │      RANGE       │
│  0.654           │     0.623        │  0.234 - 0.876   │
├──────────────────┴──────────────────┴──────────────────┤
│  STD DEVIASI: 0.145                                     │
├─────────────────────────────────────────────────────────┤
│ INFORMASI LOKASI          │  INTERPRETASI               │
│ ├─ Lat: -6.1234          │  🟢 Tinggi                 │
│ ├─ Lon: 105.3456         │  Sangat sesuai untuk habitat│
│ └─ Layer: HSI             │                             │
└─────────────────────────────────────────────────────────┘
```

**Apa yang Anda lihat:**
- 4 kartu dengan statistik dasar (Mean, Median, Range, Std Dev)
- Informasi lokasi yang sedang dianalisis
- Interpretasi otomatis dari nilai rata-rata

**Kapan gunakan:**
- Ingin overview cepat dari data
- Ingin tahu rata-rata nilai di lokasi tersebut
- Ingin interpretasi instant

---

### **Tab 2: Time Series**

```
TREND GRAFIK:

│0.8  │          ▄█▄
│0.6  │      ▃█▀ █ ██
│0.4  │    ▄█▀█▄█ █ █
│0.2  │  ▄█  █   █
└─────┴───────────────────
      J F M A M J J A S O N D
      
TABEL DATA:
Period  │ Nilai
--------│--------
Jan     │ 0.5234
Feb     │ 0.6456
Mar     │ 0.7123
... (dst)
```

**Apa yang Anda lihat:**
- Bar chart menunjukkan trend nilai per bulan/tahun
- Tabel detail dengan nilai per periode

**Kapan gunakan:**
- Ingin melihat trend musiman
- Ingin tahu bulan dengan nilai tertinggi/terendah
- Ingin analisis temporal

**Cara baca:**
- Bar tinggi = nilai lebih tinggi
- Bar pendek = nilai lebih rendah
- Lihat pola musiman (naik/turun)

---

### **Tab 3: Perbandingan Layer**

```
PERBANDINGAN VISUAL:

HSI:          ████████████ 0.654
SST:          ██████████   28.34°C
Chlorophyll:  █████████    1.23 mg/m³
Salinity:     ███████████  33.45 PSU

STATISTIK PERBANDINGAN:
┌─────────────────┬─────────┐
│ Layer           │ Nilai   │
├─────────────────┼─────────┤
│ ● HSI           │ 0.654   │
│ ● SST           │ 28.34°C │
│ ● Chlorophyll   │ 1.23 mg │
│ ● Salinity      │ 33.45   │
└─────────────────┴─────────┘
```

**Apa yang Anda lihat:**
- Bar chart membandingkan 4 parameter
- Tabel dengan nilai setiap layer

**Kapan gunakan:**
- Ingin lihat kondisi lengkap lokasi (semua parameter)
- Ingin tahu parameter mana yang paling tinggi
- Ingin analisis holistic

**Cara baca:**
- Bandingkan panjang bar untuk melihat relative values
- Lihat warna yang berbeda untuk setiap layer

---

### **Tab 4: Statistik**

```
STATISTIK DESKRIPTIF:
├─ Jumlah Data: 36
├─ Rata-rata: 0.654
├─ Median: 0.623
├─ Minimum: 0.234
├─ Maksimum: 0.876
├─ Range: 0.642
├─ Std Deviasi: 0.145
└─ Varians: 0.021

ANALISIS DISTRIBUSI:
Q1 (25%): 0.545 ████████
Q3 (75%): 0.745 ███████████
IQR: 0.200
Coefficient of Variation: 22.17%
```

**Apa yang Anda lihat:**
- Statistik lengkap (Mean, Median, Min, Max, Range, Std, Variance)
- Quartiles dan IQR
- Coefficient of Variation

**Kapan gunakan:**
- Ingin analisis statistik mendalam
- Ingin tahu distribusi data
- Ingin understand variability

**Cara baca:**
- IQR kecil = data terpusat
- IQR besar = data tersebar
- CV tinggi = data bervariasi banyak

---

## 💡 Tips & Tricks

### **Tip 1: Cepat Ubah Lokasi**
Tidak perlu reload halaman, cukup klik area lain di peta dan popup baru akan muncul dengan data baru.

### **Tip 2: Bandingkan Lokasi**
1. Klik lokasi A → baca dashboard
2. Catat nilai A
3. Klik lokasi B → baca dashboard
4. Bandingkan dengan nilai A

### **Tip 3: Lihat Trend Musiman**
1. Pilih "Time Series" visualization
2. Lihat bar chart
3. Perhatikan pola naik-turun sepanjang tahun
4. Identifikasi bulan dengan nilai tertinggi/terendah

### **Tip 4: Bandingkan Layer**
1. Pilih "Perbandingan Layer"
2. Lihat mana parameter yang paling ekstrem
3. Misalnya SST tinggi + HSI rendah bisa berindikasi stress

### **Tip 5: Analisis Konsistensi**
1. Buka tab "Statistik"
2. Lihat Std Dev
3. Kecil = data konsisten sepanjang periode
4. Besar = data sangat bervariasi

---

## 🎓 Contoh Use Cases

### **Use Case 1: Evaluasi Lokasi Penangkapan Ikan**

```
1. Klik lokasi yang ingin dievaluasi
2. Lihat HSI value di popup
3. Buka dashboard
4. Lihat Overview tab
5. Jika HSI > 0.75 → Area cocok untuk penangkapan
6. Lihat Time Series → bulan-bulan optimal
```

### **Use Case 2: Monitoring Perubahan Iklim**

```
1. Pilih "Tahunan" di Dimensi Waktu
2. Pilih "SST" di Layer
3. Lihat Time Series
4. Bandingkan trend SST per tahun
5. Lihat apakah ada kenaikan suhu konsisten
```

### **Use Case 3: Identifikasi Area Subur**

```
1. Coba beberapa lokasi di berbagai area
2. Bandingkan Chlorophyll-a values
3. Area dengan Chl > 2.0 adalah area sangat subur
4. Area dengan Chl < 0.5 adalah area kurang produktif
```

### **Use Case 4: Analisis Salinitas Lokal**

```
1. Klik lokasi dekat muara sungai
2. Pilih "Salinity" layer
3. Banding dengan area lepas pantai
4. Kli dengan salinitas lebih rendah = pengaruh air tawar
```

---

## ❓ FAQ

### **Q: Data dari mana?**
A: Data di-generate secara deterministik berdasarkan algoritma, cocok untuk demo. Nantinya bisa diganti dengan real data dari API backend.

### **Q: Mengapa nilai selalu sama untuk lokasi yang sama?**
A: Ini intentional - menggunakan algoritma consistent untuk reproducible results. Bagus untuk testing.

### **Q: Bisa export data?**
A: Belum ada fitur export. Bisa ditambah nanti dengan tombol CSV/Excel.

### **Q: Berapa lama data loading?**
A: Sangat cepat (< 200ms) karena offline processing. Jika pakai real API akan tergantung network.

### **Q: Bisa bandingkan 2 lokasi sekaligus?**
A: Belum ada. Feature ini bisa ditambah di fase berikutnya.

### **Q: Dark mode support?**
A: Ya! Otomatis mengikuti system preference atau bisa di-toggle dengan tombol di header.

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check console (F12 → Console tab)
2. Lihat error messages
3. Report dengan screenshot

---

**Last Updated: November 12, 2025**
**Status: ✅ Ready to Use**

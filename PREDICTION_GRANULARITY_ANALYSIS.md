# Analisis Granularitas Prediksi HSI

## 📊 Data yang Tersedia

Berdasarkan analisis NetCDF files:
- **Temporal Coverage**: 1461 hari (2021-01-01 hingga 2024-12-31)
- **Temporal Resolution**: Daily (1 hari per timestep)
- **Spatial Coverage**: Selat Sunda
- **Parameters**: SST (27x29), SO (16x17 dengan 50 depth levels), CHL (32x34)

---

## 🎯 Perbandingan Tiga Opsi Prediksi

### 1. PREDIKSI PER HARI (Daily Prediction)

#### ✅ Keuntungan:
- **Akurasi Tinggi**: Lebih banyak data training (1461 hari)
- **Detail Maksimal**: Menangkap variasi harian yang detail
- **Fleksibel**: Bisa di-aggregate menjadi mingguan/bulanan/tahunan
- **Real-time Monitoring**: Cocok untuk operasional harian
- **Deteksi Anomali**: Bisa mendeteksi perubahan cepat

#### ❌ Kekurangan:
- **Kompleksitas Tinggi**: Model lebih kompleks, training lebih lama
- **Noise Tinggi**: Variasi harian bisa mengandung noise
- **Storage Besar**: 365 file GeoJSON per tahun (berat untuk frontend)
- **Performa Map**: Rendering 365 layer di peta bisa lambat
- **Interpretasi Sulit**: Terlalu banyak data untuk analisis manual

#### 📈 Use Case:
- Monitoring operasional real-time
- Deteksi event/anomali cepat
- Sistem early warning
- Penelitian detail

---

### 2. PREDIKSI PER BULAN (Monthly Prediction) ⭐ RECOMMENDED

#### ✅ Keuntungan:
- **Balance Optimal**: 48 data training (2021-2024), cukup untuk ARIMA
- **Interpretasi Mudah**: 12 bulan per tahun, mudah dipahami
- **Storage Efisien**: Hanya 12 file GeoJSON per tahun
- **Performa Map**: Rendering cepat, tidak membebani browser
- **Trend Jelas**: Menangkap trend musiman dengan baik
- **Praktis untuk Planning**: Cocok untuk perencanaan bulanan
- **Visualisasi Bagus**: Mudah dibuat chart/grafik

#### ❌ Kekurangan:
- **Detail Berkurang**: Tidak menangkap variasi harian
- **Smoothing**: Rata-rata bulanan bisa menyembunyikan event ekstrem
- **Kurang Real-time**: Tidak cocok untuk monitoring harian

#### 📈 Use Case:
- Perencanaan pengelolaan laut
- Analisis trend musiman
- Laporan bulanan
- Dashboard manajemen
- Prediksi daya dukung laut

---

### 3. PREDIKSI PER TAHUN (Yearly Prediction)

#### ✅ Keuntungan:
- **Sangat Sederhana**: Hanya 1 file per tahun
- **Storage Minimal**: Sangat ringan
- **Performa Optimal**: Rendering sangat cepat
- **Interpretasi Mudah**: Satu nilai per tahun

#### ❌ Kekurangan:
- **Data Training Sedikit**: Hanya 4 data points (2021-2024)
- **Akurasi Rendah**: ARIMA membutuhkan minimal 50-100 data points
- **Trend Hilang**: Tidak bisa menangkap variasi musiman
- **Kurang Informatif**: Terlalu banyak informasi yang hilang
- **Prediksi Tidak Reliable**: Confidence interval sangat lebar

#### 📈 Use Case:
- Hanya untuk overview sangat umum
- Tidak cocok untuk decision making

---

## 📊 Perbandingan Teknis

| Aspek | Per Hari | Per Bulan | Per Tahun |
|-------|----------|-----------|-----------|
| **Data Training** | 1461 | 48 | 4 |
| **Akurasi ARIMA** | Sangat Tinggi | Tinggi | Rendah ❌ |
| **Files/Tahun** | 365 | 12 | 1 |
| **Storage** | ~365 MB | ~12 MB | ~1 MB |
| **Rendering Map** | Lambat | Cepat ✅ | Sangat Cepat |
| **Interpretasi** | Kompleks | Mudah ✅ | Terlalu Sederhana |
| **Trend Musiman** | Terlihat | Jelas ✅ | Hilang |
| **Deteksi Anomali** | Baik | Sedang | Buruk |
| **Use Case** | Monitoring | Planning ✅ | Overview |

---

## 🎯 REKOMENDASI

### **PILIH: PREDIKSI PER BULAN** ⭐

### Alasan:

1. **Data Cukup**: 48 bulan (2021-2024) ideal untuk ARIMA
   - ARIMA membutuhkan minimal 50 data points untuk akurasi baik
   - 48 data points sudah cukup dengan seasonal pattern

2. **Akurasi Seimbang**: 
   - Tidak terlalu detail (noise harian)
   - Tidak terlalu general (kehilangan informasi)
   - Menangkap trend musiman dengan baik

3. **Praktis untuk Aplikasi**:
   - 12 file GeoJSON per tahun (manageable)
   - Mudah di-visualisasi di peta
   - Performa browser optimal

4. **Sesuai Use Case**:
   - Perencanaan pengelolaan laut
   - Analisis daya dukung habitat
   - Laporan dan monitoring rutin

5. **Fleksibel**:
   - Bisa di-aggregate ke tahunan jika perlu
   - Bisa di-breakdown ke mingguan dengan interpolasi
   - Mudah dibuat chart trend

---

## 🔄 Strategi Hybrid (Opsional)

Jika ingin lebih komprehensif, bisa kombinasi:

```
Frontend Options:
├── Monthly View (Default) ⭐
│   └── 12 bulan per tahun
│   └── Untuk planning & analysis
│
├── Yearly View (Summary)
│   └── 1 nilai per tahun
│   └── Untuk overview
│
└── Weekly Interpolation (Optional)
    └── Interpolasi dari monthly
    └── Untuk detail lebih
```

---

## 💡 Implementasi Rekomendasi

### Backend:
```
/api/predictions/monthly/:year/:month
/api/predictions/yearly/:year
/api/predictions/stats/monthly/:year
```

### Frontend:
```
- Dropdown: Pilih Tahun (2025, 2026, dst)
- Slider: Pilih Bulan (1-12)
- Map: Tampilkan prediksi bulanan
- Chart: Trend HSI per bulan
- Stats: Mean, Min, Max per bulan
```

### Database:
```
data/predictions/monthly/
├── 2025/
│   ├── hsi_2025_01.geojson
│   ├── hsi_2025_02.geojson
│   ├── ...
│   └── hsi_2025_12.geojson
├── 2026/
│   └── ...
└── metadata.json
```

---

## 📋 Kesimpulan

| Kriteria | Rekomendasi |
|----------|-------------|
| **Granularitas** | **Per Bulan** |
| **Model** | ARIMA (Time Series) |
| **Data Training** | 48 bulan (2021-2024) |
| **Prediksi** | 12 bulan ke depan |
| **Output** | 12 GeoJSON files |
| **Visualisasi** | Peta + Chart + Stats |

---

**Siap untuk implementasi dengan prediksi per bulan?** ✅

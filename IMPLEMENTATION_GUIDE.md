# Panduan Implementasi Model Prediksi HSI Bulanan

## 📋 Ringkasan

Anda telah membuat sistem prediksi HSI (Habitat Suitability Index) yang komprehensif dengan:
- **Model**: ARIMA dengan parameter oceanografi (SST, SO, CHL)
- **Granularitas**: Prediksi per bulan (12 bulan untuk tahun 2025)
- **Data Training**: 48 bulan (2021-2024)
- **Visualisasi**: Peta interaktif di halaman analysis.html

---

## 🚀 Langkah-Langkah Implementasi

### Step 1: Jalankan Jupyter Notebook untuk Training Model

```bash
cd c:\Users\rijla\Asoy\jupyter
jupyter notebook 09_monthly_hsi_prediction_model.ipynb
```

**Apa yang dilakukan:**
- Load data oceanografi harian (SST, SO, CHL) dari NetCDF
- Aggregate ke bulanan (48 bulan dari 2021-2024)
- Align semua data ke grid yang sama
- Build regression model: HSI = f(SST, SO, CHL)
- Train ARIMA per grid point
- Predict 12 bulan untuk 2025
- Export GeoJSON untuk setiap bulan

**Output yang dihasilkan:**
```
data/predictions/monthly_2025/
├── hsi_prediction_2025_01.geojson
├── hsi_prediction_2025_02.geojson
├── ...
├── hsi_prediction_2025_12.geojson
└── metadata.json
```

**Waktu eksekusi**: ~30-60 menit (tergantung CPU)

---

### Step 2: Verifikasi Output

Pastikan semua file sudah dibuat:

```bash
ls -la data/predictions/monthly_2025/
```

Harus ada:
- 12 file GeoJSON (satu per bulan)
- 1 file metadata.json

Cek struktur GeoJSON:
```bash
python -m json.tool data/predictions/monthly_2025/hsi_prediction_2025_01.geojson | head -50
```

---

### Step 3: Jalankan Backend Server

```bash
cd c:\Users\rijla\Asoy\backend
npm install  # Jika belum
npm start
```

**Output yang diharapkan:**
```
✅ Data directory verified
✅ Loaded metadata: 48 months available
   Date range: 2021-01 to 2024-12

🚀 Server running on http://localhost:3000
📊 API endpoints available:
   GET /api/health
   GET /api/hsi/available
   GET /api/hsi?year=2021&month=1
   GET /api/metadata
```

---

### Step 4: Test API Endpoints

Buka browser atau gunakan curl untuk test:

```bash
# Test health check
curl http://localhost:3000/api/monthly-predictions/health

# Get available months
curl http://localhost:3000/api/monthly-predictions/available

# Get prediction untuk Januari 2025
curl http://localhost:3000/api/monthly-predictions/2025/1

# Get statistics untuk Januari 2025
curl http://localhost:3000/api/monthly-predictions/stats/2025/1

# Get prediction di titik tertentu
curl "http://localhost:3000/api/monthly-predictions/point?lat=-6.1&lon=105.3&year=2025&month=1"
```

---

### Step 5: Akses Frontend

Buka browser dan navigasi ke:
```
http://localhost:3000/analysis.html
```

**Fitur yang tersedia:**
- ✅ Slider untuk memilih bulan (1-12)
- ✅ Peta interaktif dengan prediksi HSI
- ✅ Statistik bulanan (mean, min, max, std)
- ✅ Kategori HSI (tinggi, sedang, rendah)
- ✅ Colormap selector (viridis, plasma, inferno, dll)
- ✅ Legend dengan interpretasi

---

## 📊 API Endpoints Reference

### Base URL
```
http://localhost:3000/api/monthly-predictions
```

### 1. Get Metadata
```
GET /metadata
```
Response: Model info, training data, oceanographic parameters

### 2. Get Available Months
```
GET /available
```
Response: List of available months, model info

### 3. Get Prediction for Month
```
GET /:year/:month
```
Example: `GET /2025/1`
Response: GeoJSON dengan prediksi HSI

### 4. Get Statistics
```
GET /stats/:year/:month
```
Example: `GET /stats/2025/1`
Response: Mean, min, max, std, categories (high/medium/low)

### 5. Get Yearly Statistics
```
GET /yearly-stats/:year
```
Example: `GET /yearly-stats/2025`
Response: Statistics untuk semua 12 bulan

### 6. Get Prediction at Point
```
GET /point?lat=X&lon=Y&year=YEAR&month=MONTH
```
Example: `GET /point?lat=-6.1&lon=105.3&year=2025&month=1`
Response: HSI value di titik terdekat

### 7. Get Trend
```
GET /trend?lat=X&lon=Y&year=YEAR
```
Example: `GET /trend?lat=-6.1&lon=105.3&year=2025`
Response: Trend HSI untuk semua 12 bulan di lokasi tertentu

### 8. Get Bounds
```
GET /bounds
```
Response: Spatial bounds (lat/lon range)

### 9. Get Oceanography Info
```
GET /oceanography
```
Response: Info tentang SST, SO, CHL

---

## 🎯 Struktur File

```
c:\Users\rijla\Asoy\
├── jupyter/
│   └── 09_monthly_hsi_prediction_model.ipynb    # Model training
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── api.js                           # HSI API
│   │   │   └── monthlyPredictions.js            # Prediction API ✨ NEW
│   │   ├── services/
│   │   │   ├── geojsonService.js
│   │   │   └── monthlyPredictionService.js      # Prediction service ✨ NEW
│   │   └── server.js                            # Updated
│   └── data/
│       └── predictions/
│           └── monthly_2025/                    # Output dari Jupyter
│               ├���─ hsi_prediction_2025_01.geojson
│               ├── ...
│               └── metadata.json
│
├── js/
│   ├── config.js
│   ├── monthlyPrediction.js                     # API client ✨ NEW
│   └── analysis-prediction.js                   # UI handler ✨ NEW
│
└── analysis.html                                # Updated
```

---

## 🔧 Troubleshooting

### Error: "Prediction service not available"
**Penyebab**: Model belum dijalankan atau output tidak ditemukan

**Solusi**:
1. Jalankan Jupyter notebook terlebih dahulu
2. Verifikasi output di `data/predictions/monthly_2025/`
3. Restart backend server

### Error: "No valid HSI values"
**Penyebab**: Data prediksi kosong atau semua NaN

**Solusi**:
1. Cek data input (NetCDF files)
2. Verifikasi alignment grid
3. Jalankan ulang notebook dengan debug mode

### Map tidak menampilkan data
**Penyebab**: GeoJSON tidak valid atau rendering issue

**Solusi**:
1. Validasi GeoJSON: `python -m json.tool file.geojson`
2. Cek browser console untuk error
3. Pastikan Leaflet library sudah loaded

### Performa lambat
**Penyebab**: Terlalu banyak features atau rendering issue

**Solusi**:
1. Reduce grid resolution di notebook
2. Use clustering untuk map visualization
3. Optimize colormap rendering

---

## 📈 Interpretasi Hasil

### HSI Value Range
```
0.75 - 1.0  : TINGGI (Sangat sesuai untuk habitat)
0.45 - 0.75 : SEDANG (Cukup sesuai untuk habitat)
0.0 - 0.45  : RENDAH (Kurang sesuai untuk habitat)
```

### Model Performance
- **R² Score**: Seberapa baik model fit dengan data
- **MAE**: Mean Absolute Error (rata-rata error)
- **Training Data**: 48 bulan (2021-2024)
- **Grid Points**: Jumlah titik prediksi

### Oceanographic Parameters
- **SST**: Sea Surface Temperature (Kelvin)
- **SO**: Salinity (PSU)
- **CHL**: Chlorophyll-a (mg/m³)

---

## 🎓 Cara Menggunakan di Frontend

### 1. Pilih Bulan
Gunakan slider untuk memilih bulan (1-12)

### 2. Lihat Peta
Peta akan menampilkan prediksi HSI dengan warna berdasarkan colormap

### 3. Baca Statistik
- **Rata-rata HSI**: Mean value untuk bulan tersebut
- **HSI Maksimum**: Nilai tertinggi
- **Area Optimal**: Persentase area dengan HSI tinggi

### 4. Analisis Kategori
- **Tinggi**: Area dengan habitat sangat sesuai
- **Sedang**: Area dengan habitat cukup sesuai
- **Rendah**: Area dengan habitat kurang sesuai

### 5. Ubah Colormap
Pilih colormap berbeda untuk visualisasi yang lebih baik

---

## 📚 Referensi

### Model ARIMA
- Autoregressive Integrated Moving Average
- Cocok untuk time series dengan trend dan seasonality
- Digunakan untuk forecasting

### Oceanographic Parameters
- **SST**: OSTIA L4 (UKMO)
- **SO**: GLORYS12V1 (Mercator Ocean)
- **CHL**: GlobColour (ACRI)

### HSI (Habitat Suitability Index)
- Indeks untuk mengevaluasi kualitas habitat
- Range: 0-1 (0 = tidak sesuai, 1 = sangat sesuai)
- Digunakan untuk perencanaan pengelolaan laut

---

## ✅ Checklist Implementasi

- [ ] Jalankan Jupyter notebook
- [ ] Verifikasi output GeoJSON
- [ ] Jalankan backend server
- [ ] Test API endpoints
- [ ] Akses frontend di browser
- [ ] Verifikasi peta menampilkan data
- [ ] Test slider bulan
- [ ] Test colormap selector
- [ ] Baca statistik
- [ ] Analisis hasil prediksi

---

## 🎉 Selesai!

Sistem prediksi HSI bulanan Anda sudah siap digunakan. Anda dapat:

1. **Memprediksi** HSI untuk setiap bulan tahun 2025
2. **Visualisasi** prediksi di peta interaktif
3. **Analisis** statistik dan trend
4. **Membuat keputusan** berdasarkan prediksi

Untuk pertanyaan atau masalah, silakan refer ke dokumentasi atau troubleshooting section.

---

**Last Updated**: 2024
**Version**: 1.0

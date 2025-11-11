# 🌊 Model Prediksi HSI Bulanan - MarineEcoPredict

## 📌 Ringkasan Proyek

Sistem prediksi **Habitat Suitability Index (HSI)** untuk Selat Sunda menggunakan:
- **Model**: ARIMA (Autoregressive Integrated Moving Average)
- **Parameter Oceanografi**: SST, SO (Salinity), CHL (Chlorophyll-a)
- **Granularitas**: Prediksi per bulan (12 bulan untuk 2025)
- **Data Training**: 48 bulan (2021-2024)
- **Visualisasi**: Peta interaktif dengan Leaflet.js

---

## 🎯 Fitur Utama

### Backend (Node.js + Express)
✅ API REST untuk serve prediksi bulanan
✅ Service layer untuk manage GeoJSON predictions
✅ Endpoints untuk statistics, trends, dan point queries
✅ CORS enabled untuk frontend integration

### Frontend (JavaScript + Leaflet)
✅ Peta interaktif dengan prediksi HSI
✅ Slider untuk memilih bulan (1-12)
✅ Colormap selector (viridis, plasma, inferno, dll)
✅ Statistik real-time (mean, min, max, std)
✅ Kategori HSI (tinggi, sedang, rendah)
✅ Legend dengan interpretasi

### Model (Python + Jupyter)
✅ Load data oceanografi dari NetCDF
✅ Aggregate daily ke monthly
✅ Build regression model: HSI = f(SST, SO, CHL)
✅ Train ARIMA per grid point
✅ Predict 12 bulan ke depan
✅ Export GeoJSON untuk setiap bulan

---

## 📁 Struktur File

```
c:\Users\rijla\Asoy\
├── jupyter/
│   └── 09_monthly_hsi_prediction_model.ipynb    # Model training
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── api.js
│   │   │   └── monthlyPredictions.js            # ✨ NEW
│   │   ├── services/
│   │   │   ├── geojsonService.js
│   │   │   └── monthlyPredictionService.js      # ✨ NEW
│   │   └── server.js
│   └── data/
│       └── predictions/
│           └── monthly_2025/                    # Output
│               ├── hsi_prediction_2025_01.geojson
│               ├── ...
│               └── metadata.json
│
├── js/
│   ├── config.js
│   ├── monthlyPrediction.js                     # ✨ NEW
│   └── analysis-prediction.js                   # ✨ NEW
│
├── analysis.html                                # Updated
├── PREDICTION_GRANULARITY_ANALYSIS.md           # Analysis
└── IMPLEMENTATION_GUIDE.md                      # Guide
```

---

## 🚀 Quick Start

### 1. Train Model (Python)
```bash
cd jupyter
jupyter notebook 09_monthly_hsi_prediction_model.ipynb
# Run all cells
```

### 2. Start Backend (Node.js)
```bash
cd backend
npm install
npm start
```

### 3. Open Frontend
```
http://localhost:3000/analysis.html
```

---

## 📊 API Endpoints

### Monthly Predictions
```
GET /api/monthly-predictions/metadata
GET /api/monthly-predictions/available
GET /api/monthly-predictions/:year/:month
GET /api/monthly-predictions/stats/:year/:month
GET /api/monthly-predictions/yearly-stats/:year
GET /api/monthly-predictions/point?lat=X&lon=Y&year=Y&month=M
GET /api/monthly-predictions/trend?lat=X&lon=Y&year=Y
GET /api/monthly-predictions/bounds
GET /api/monthly-predictions/oceanography
```

---

## 🎨 Visualisasi

### Peta Interaktif
- Menampilkan prediksi HSI dengan circle markers
- Warna berdasarkan colormap yang dipilih
- Popup dengan informasi detail saat diklik

### Statistik
- Mean HSI
- Min/Max HSI
- Standard Deviation
- Kategori (Tinggi/Sedang/Rendah)

### Legend
- Gradient color scale
- Interpretasi nilai HSI
- Kategori habitat suitability

---

## 📈 Model Performance

### Training Data
- **Periode**: 2021-01 hingga 2024-12
- **Total Bulan**: 48
- **Grid Points**: ~800+ (tergantung resolusi)

### Regression Model
- **Type**: Linear Regression / Random Forest
- **Features**: SST, SO, CHL
- **Target**: HSI

### ARIMA Model
- **Per Grid Point**: Individual ARIMA model
- **Order**: Auto-selected (p, d, q)
- **Forecast**: 12 bulan ke depan

---

## 🔍 Interpretasi Hasil

### HSI Value Range
```
0.75 - 1.0  : TINGGI
              Sangat sesuai untuk habitat
              Kondisi optimal untuk organisme laut

0.45 - 0.75 : SEDANG
              Cukup sesuai untuk habitat
              Kondisi moderat untuk organisme laut

0.0 - 0.45  : RENDAH
              Kurang sesuai untuk habitat
              Kondisi tidak optimal untuk organisme laut
```

### Oceanographic Parameters
- **SST**: Suhu permukaan laut (Kelvin)
  - Optimal: 27-29°C
  - Range: 25-31°C

- **SO**: Salinitas (PSU)
  - Optimal: 33-34 PSU
  - Range: 31-36 PSU

- **CHL**: Klorofil-a (mg/m³)
  - Optimal: 0.5-2.0 mg/m³
  - Range: 0.1-3.0 mg/m³

---

## 🛠️ Teknologi Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: File-based (GeoJSON)
- **CORS**: Enabled

### Frontend
- **Library**: Leaflet.js (mapping)
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **Theme**: Light/Dark mode

### Model
- **Language**: Python 3.11+
- **Libraries**: NumPy, Pandas, Scikit-learn, pmdarima
- **Data Format**: NetCDF, GeoJSON, NPZ

---

## 📋 Checklist Implementasi

- [x] Analisis granularitas prediksi
- [x] Buat Jupyter notebook untuk training
- [x] Buat backend service dan routes
- [x] Buat frontend client dan UI handler
- [x] Update halaman analysis.html
- [x] Dokumentasi lengkap
- [ ] Jalankan model training
- [ ] Test API endpoints
- [ ] Verifikasi frontend visualization
- [ ] Deploy ke production

---

## 🐛 Troubleshooting

### Model Training
- **Error**: "File not found"
  - Solusi: Pastikan NetCDF files ada di root directory

- **Error**: "Memory error"
  - Solusi: Reduce grid resolution di notebook

### Backend
- **Error**: "Port already in use"
  - Solusi: `lsof -i :3000` dan kill process

- **Error**: "Predictions not found"
  - Solusi: Jalankan model training terlebih dahulu

### Frontend
- **Error**: "Map not loading"
  - Solusi: Check browser console, pastikan Leaflet loaded

- **Error**: "No data on map"
  - Solusi: Verify GeoJSON files, check API response

---

## 📚 Dokumentasi Lengkap

Lihat file-file berikut untuk dokumentasi detail:

1. **PREDICTION_GRANULARITY_ANALYSIS.md**
   - Analisis perbandingan prediksi per hari/bulan/tahun
   - Rekomendasi granularitas

2. **IMPLEMENTATION_GUIDE.md**
   - Panduan step-by-step implementasi
   - API reference lengkap
   - Troubleshooting guide

3. **jupyter/09_monthly_hsi_prediction_model.ipynb**
   - Notebook dengan penjelasan detail
   - Code comments dan dokumentasi

---

## 🎓 Cara Menggunakan

### Untuk Analyst/Planner
1. Buka halaman analysis.html
2. Pilih bulan menggunakan slider
3. Lihat peta dan statistik
4. Analisis trend dan pattern
5. Buat keputusan berdasarkan prediksi

### Untuk Developer
1. Lihat API endpoints di IMPLEMENTATION_GUIDE.md
2. Integrate dengan aplikasi lain
3. Customize visualization
4. Extend dengan fitur tambahan

### Untuk Researcher
1. Lihat model details di Jupyter notebook
2. Analyze model performance
3. Validate dengan data real
4. Improve model dengan parameter baru

---

## 🔄 Workflow Prediksi

```
1. Load Data Oceanografi (NetCDF)
   ↓
2. Aggregate Daily → Monthly
   ↓
3. Align ke Grid Sama
   ↓
4. Build Regression Model (HSI = f(SST, SO, CHL))
   ↓
5. Train ARIMA per Grid Point
   ↓
6. Predict 12 Bulan ke Depan
   ↓
7. Export GeoJSON
   ↓
8. Serve via API
   ↓
9. Visualize di Frontend
```

---

## 📞 Support

Untuk pertanyaan atau masalah:
1. Cek dokumentasi di IMPLEMENTATION_GUIDE.md
2. Review Jupyter notebook untuk detail model
3. Check browser console untuk error
4. Verify API responses dengan curl

---

## 📄 License

Proyek ini adalah bagian dari MarineEcoPredict.

---

## 🎉 Selesai!

Sistem prediksi HSI bulanan Anda sudah siap digunakan untuk:
- ✅ Prediksi habitat suitability
- ✅ Perencanaan pengelolaan laut
- ✅ Analisis trend oceanografi
- ✅ Decision making berbasis data

**Selamat menggunakan MarineEcoPredict!** 🌊

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: ✅ Ready for Implementation

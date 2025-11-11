# ⚡ Quick Start Guide - HSI Prediction Model

## 🎯 Tujuan
Membuat prediksi HSI bulanan untuk tahun 2025 menggunakan parameter oceanografi (SST, SO, CHL) dan menampilkannya di peta interaktif.

---

## 📋 Prerequisites

- Python 3.11+ dengan libraries: numpy, pandas, scipy, scikit-learn, netCDF4, pmdarima
- Node.js 14+ dengan npm
- Browser modern (Chrome, Firefox, Safari, Edge)

---

## 🚀 3 Langkah Utama

### 1️⃣ TRAIN MODEL (30-60 menit)

```bash
# Buka Jupyter
cd c:\Users\rijla\Asoy\jupyter
jupyter notebook 09_monthly_hsi_prediction_model.ipynb

# Run semua cells (Ctrl+A, Ctrl+Enter)
# Tunggu sampai selesai
```

**Output yang diharapkan:**
```
✅ Monthly HSI prediction model completed successfully!
✅ Exported 12 monthly prediction files!
```

**File yang dihasilkan:**
```
data/predictions/monthly_2025/
├── hsi_prediction_2025_01.geojson
├── hsi_prediction_2025_02.geojson
├── ...
├── hsi_prediction_2025_12.geojson
└── metadata.json
```

---

### 2️⃣ START BACKEND (1 menit)

```bash
# Terminal baru
cd c:\Users\rijla\Asoy\backend
npm install  # Jika belum
npm start
```

**Output yang diharapkan:**
```
🚀 Server running on http://localhost:3000
📊 API endpoints available:
   GET /api/health
   GET /api/hsi/available
   GET /api/monthly-predictions/available
```

---

### 3️⃣ OPEN FRONTEND (instant)

```
Buka browser: http://localhost:3000/analysis.html
```

**Apa yang akan Anda lihat:**
- ✅ Peta interaktif dengan prediksi HSI
- ✅ Slider untuk memilih bulan (1-12)
- ✅ Statistik real-time
- ✅ Legend dengan interpretasi

---

## 🎮 Cara Menggunakan Frontend

### 1. Pilih Bulan
Geser slider dari 1 (Januari) hingga 12 (Desember)

### 2. Lihat Peta
Peta akan menampilkan prediksi HSI dengan warna:
- 🟢 **Hijau** = HSI Tinggi (0.75-1.0)
- 🟡 **Kuning** = HSI Sedang (0.45-0.75)
- 🔴 **Merah** = HSI Rendah (0.0-0.45)

### 3. Baca Statistik
- **Rata-rata HSI**: Mean value untuk bulan
- **HSI Maksimum**: Nilai tertinggi
- **Area Optimal**: % area dengan HSI tinggi

### 4. Ubah Colormap
Pilih colormap berbeda (viridis, plasma, inferno, dll)

### 5. Klik Peta
Klik di peta untuk melihat detail HSI di titik tersebut

---

## 🔍 Test API (Optional)

```bash
# Test health
curl http://localhost:3000/api/monthly-predictions/health

# Get available months
curl http://localhost:3000/api/monthly-predictions/available

# Get prediction Januari 2025
curl http://localhost:3000/api/monthly-predictions/2025/1

# Get statistics Januari 2025
curl http://localhost:3000/api/monthly-predictions/stats/2025/1

# Get prediction di titik tertentu
curl "http://localhost:3000/api/monthly-predictions/point?lat=-6.1&lon=105.3&year=2025&month=1"
```

---

## 📊 Interpretasi Hasil

### HSI Value Range
```
0.75 - 1.0  : TINGGI
              Sangat sesuai untuk habitat
              Kondisi optimal

0.45 - 0.75 : SEDANG
              Cukup sesuai untuk habitat
              Kondisi moderat

0.0 - 0.45  : RENDAH
              Kurang sesuai untuk habitat
              Kondisi tidak optimal
```

### Oceanographic Parameters
- **SST**: Sea Surface Temperature (Kelvin)
- **SO**: Salinity (PSU)
- **CHL**: Chlorophyll-a (mg/m³)

---

## 🐛 Troubleshooting

### Problem: "Prediction service not available"
**Solution**: 
1. Pastikan Jupyter notebook sudah selesai dijalankan
2. Cek folder `data/predictions/monthly_2025/` ada 12 file GeoJSON
3. Restart backend server

### Problem: "Map tidak menampilkan data"
**Solution**:
1. Buka browser console (F12)
2. Cek apakah ada error
3. Pastikan backend server running
4. Refresh halaman (Ctrl+R)

### Problem: "Port 3000 already in use"
**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Problem: "Jupyter kernel error"
**Solution**:
1. Restart kernel (Kernel → Restart)
2. Run cells satu per satu
3. Cek error message di console

---

## 📁 File Penting

| File | Deskripsi |
|------|-----------|
| `jupyter/09_monthly_hsi_prediction_model.ipynb` | Model training |
| `backend/src/services/monthlyPredictionService.js` | Backend service |
| `backend/src/routes/monthlyPredictions.js` | API routes |
| `js/monthlyPrediction.js` | Frontend client |
| `js/analysis-prediction.js` | UI handler |
| `analysis.html` | Frontend page |

---

## 📚 Dokumentasi Lengkap

Untuk informasi lebih detail, lihat:

1. **IMPLEMENTATION_GUIDE.md** - Panduan lengkap step-by-step
2. **HSI_PREDICTION_README.md** - Project overview
3. **PREDICTION_GRANULARITY_ANALYSIS.md** - Analisis granularitas
4. **IMPLEMENTATION_SUMMARY.md** - Ringkasan implementasi

---

## ✅ Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 14+ installed
- [ ] NetCDF files ada (SST, SO, CHL)
- [ ] Jupyter notebook dijalankan
- [ ] Backend server running
- [ ] Frontend dapat diakses
- [ ] Peta menampilkan data
- [ ] Statistik terlihat
- [ ] Slider berfungsi
- [ ] Colormap dapat diubah

---

## 🎉 Selesai!

Anda sekarang memiliki sistem prediksi HSI bulanan yang fully functional!

**Apa yang bisa Anda lakukan:**
- ✅ Prediksi HSI untuk setiap bulan 2025
- ✅ Visualisasi di peta interaktif
- ✅ Analisis statistik dan trend
- ✅ Membuat keputusan berbasis data

---

## 💡 Tips

1. **Untuk Performa Terbaik**
   - Gunakan Chrome atau Firefox
   - Jangan buka terlalu banyak tab
   - Refresh halaman jika lambat

2. **Untuk Analisis Lebih Baik**
   - Bandingkan bulan-bulan berbeda
   - Lihat trend sepanjang tahun
   - Perhatikan kategori HSI

3. **Untuk Debugging**
   - Buka browser console (F12)
   - Check network tab untuk API calls
   - Lihat server logs di terminal

---

## 🔗 Links

- **Frontend**: http://localhost:3000/analysis.html
- **API Base**: http://localhost:3000/api/monthly-predictions
- **Jupyter**: http://localhost:8888

---

## 📞 Need Help?

1. Cek dokumentasi di file-file .md
2. Review Jupyter notebook
3. Check browser console untuk error
4. Verify API responses dengan curl

---

**Happy Predicting!** 🌊

---

**Last Updated**: 2024
**Version**: 1.0

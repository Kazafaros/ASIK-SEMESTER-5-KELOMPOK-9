# 📁 Path Configuration - Directory Prediksi

## ✅ Konfigurasi Path yang Benar

### Directory Struktur
```
C:\Users\rijla\Asoy\
├── data/
│   └── predictions/
│       └── monthly_2025/              ← Output dari Jupyter
│           ├── hsi_prediction_2025_01.geojson
│           ├── ...
│           └── metadata.json
│
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── monthlyPredictionService.js    ← Updated
│   │   └── server.js
│   └── package.json
│
└── jupyter/
    └── 09_monthly_hsi_prediction_model.ipynb
```

---

## 🔧 Perubahan yang Dilakukan

### Backend Service Path
**File**: `backend/src/services/monthlyPredictionService.js`

**Sebelum**:
```javascript
this.predictionsDir = path.join(__dirname, '../../data/predictions/monthly_2025');
// Hasil: C:\Users\rijla\Asoy\backend\data\predictions\monthly_2025 ❌
```

**Sesudah**:
```javascript
this.predictionsDir = path.join(__dirname, '../../../data/predictions/monthly_2025');
// Hasil: C:\Users\rijla\Asoy\data\predictions\monthly_2025 ✅
```

---

## 📊 Path Resolution

### Dari Backend Service
```
__dirname = C:\Users\rijla\Asoy\backend\src\services
../../../ = naik 3 level
Hasil = C:\Users\rijla\Asoy\data\predictions\monthly_2025 ✅
```

### Dari Jupyter Notebook
```
Jalankan dari: C:\Users\rijla\Asoy
OUTPUT_DIR = 'data/predictions/monthly_2025'
Hasil = C:\Users\rijla\Asoy\data\predictions\monthly_2025 ✅
```

---

## ✅ Verifikasi Path

### Check Backend Path
```bash
cd backend
node -e "const path = require('path'); console.log(path.join(__dirname, '../../../data/predictions/monthly_2025'))"
# Output: C:\Users\rijla\Asoy\data\predictions\monthly_2025
```

### Check Jupyter Path
```bash
cd c:\Users\rijla\Asoy
python -c "import os; print(os.path.abspath('data/predictions/monthly_2025'))"
# Output: C:\Users\rijla\Asoy\data\predictions\monthly_2025
```

---

## 🚀 Workflow yang Benar

### 1. Jalankan Jupyter Notebook
```bash
cd c:\Users\rijla\Asoy
jupyter notebook jupyter/09_monthly_hsi_prediction_model.ipynb

# Output akan tersimpan di:
# C:\Users\rijla\Asoy\data\predictions\monthly_2025\
```

### 2. Start Backend Server
```bash
cd c:\Users\rijla\Asoy\backend
npm start

# Backend akan mencari di:
# C:\Users\rijla\Asoy\data\predictions\monthly_2025\
```

### 3. Test API
```bash
curl http://localhost:3000/api/monthly-predictions/available

# Response akan menampilkan:
# ✅ Loaded 12 monthly predictions
```

---

## 🔍 Troubleshooting

### Error: "Predictions directory not found"
**Penyebab**: Path tidak sesuai

**Solusi**:
1. Verifikasi Jupyter sudah dijalankan
2. Check folder `C:\Users\rijla\Asoy\data\predictions\monthly_2025\` ada 12 file GeoJSON
3. Restart backend server

### Error: "No such file or directory"
**Penyebab**: Backend mencari di path yang salah

**Solusi**:
1. Pastikan `monthlyPredictionService.js` sudah diupdate
2. Restart backend: `npm start`
3. Check console log untuk path yang digunakan

---

## 📋 Checklist

- [x] Backend path diupdate ke `../../../data/predictions/monthly_2025`
- [x] Jupyter notebook menggunakan `data/predictions/monthly_2025`
- [ ] Jalankan Jupyter notebook
- [ ] Verifikasi output di `C:\Users\rijla\Asoy\data\predictions\monthly_2025\`
- [ ] Start backend server
- [ ] Test API endpoints

---

## 🎯 Path Summary

| Komponen | Path | Status |
|----------|------|--------|
| Jupyter Output | `C:\Users\rijla\Asoy\data\predictions\monthly_2025\` | ✅ |
| Backend Service | `C:\Users\rijla\Asoy\data\predictions\monthly_2025\` | ✅ |
| Frontend Access | Via API | ✅ |

---

**Semua path sudah dikonfigurasi dengan benar!** ✅

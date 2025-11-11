# ⚡ QUICK FIX - Scipy Loading Issue

## 🎯 Masalah
Jupyter notebook hang saat import scipy (KeyboardInterrupt)

## ✅ Solusi Cepat (2 menit)

### Step 1: Restart Kernel
```
Jupyter Menu → Kernel → Restart Kernel
```

### Step 2: Tunggu Scipy Loading
- Jangan tekan Ctrl+C
- Tunggu 30-60 detik
- Biarkan loading selesai

### Step 3: Run Cell Lagi
- Klik cell pertama
- Tekan Ctrl+Enter
- Tunggu sampai selesai

---

## 🔧 Jika Masih Error

### Update Scipy
```bash
pip install --upgrade scipy scikit-learn
```

### Atau Reinstall
```bash
pip uninstall scipy -y
pip install scipy
```

### Atau Gunakan Conda (Best)
```bash
conda create -n hsi python=3.11 -y
conda activate hsi
conda install numpy pandas scipy scikit-learn netCDF4 -y
pip install pmdarima
jupyter notebook
```

---

## ⏱️ Waktu yang Normal

- First scipy import: **30-60 detik** ✅
- Subsequent imports: **1-2 detik** ✅
- Total notebook run: **30-60 menit** ✅

---

## 💡 Tips Penting

✅ **Jangan tekan Ctrl+C** saat loading
✅ **Tunggu sampai selesai** (bisa terlihat hang tapi sebenarnya loading)
✅ **Gunakan Conda** untuk performa terbaik
✅ **Restart kernel** jika ada error

---

## 🚀 Lanjut Setelah Scipy OK

Setelah scipy berhasil diimport, notebook akan berjalan normal dan menghasilkan:

```
data/predictions/monthly_2025/
├── hsi_prediction_2025_01.geojson
├── ...
└── metadata.json
```

---

**Coba solusi di atas dan laporkan hasilnya!**

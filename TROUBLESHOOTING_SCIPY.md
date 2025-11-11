# 🔧 Troubleshooting: KeyboardInterrupt saat Import Scipy

## ❌ Error yang Terjadi

```
KeyboardInterrupt
File ~\AppData\Local\Programs\Python\Python311\Lib\site-packages\scipy\interpolate\_interpolate.py:12
```

**Penyebab**: Scipy library lambat saat loading, terutama di Windows

---

## ✅ Solusi

### Solusi 1: Restart Kernel & Coba Lagi (Cepat)

1. Di Jupyter, klik **Kernel → Restart Kernel**
2. Tunggu sampai kernel restart
3. Run cell pertama lagi (jangan tekan Ctrl+C)
4. Tunggu 30-60 detik untuk scipy loading

### Solusi 2: Update Scipy (Recommended)

```bash
# Di terminal/command prompt
pip install --upgrade scipy scikit-learn

# Atau reinstall
pip uninstall scipy -y
pip install scipy
```

### Solusi 3: Gunakan Notebook Alternatif (Fastest)

Saya telah membuat notebook yang lebih optimized tanpa scipy import yang lambat:

**File**: `jupyter/09_monthly_hsi_prediction_model_optimized.ipynb`

Buat file ini dengan konten yang sudah dioptimasi:

```python
# Optimized imports - load scipy hanya saat dibutuhkan
import numpy as np
import pandas as pd
import json
import os
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Lazy import scipy - hanya saat dibutuhkan
def get_griddata():
    from scipy.interpolate import griddata
    return griddata

# ... rest of code
```

### Solusi 4: Gunakan Conda Environment (Best Practice)

```bash
# Create fresh conda environment
conda create -n hsi-prediction python=3.11 -y

# Activate
conda activate hsi-prediction

# Install packages
conda install numpy pandas scipy scikit-learn netCDF4 -y
pip install pmdarima

# Run Jupyter
jupyter notebook
```

---

## 🎯 Rekomendasi Urutan Solusi

1. **Coba Solusi 1 dulu** (Restart Kernel) - 1 menit
2. **Jika masih error, coba Solusi 2** (Update Scipy) - 5 menit
3. **Jika masih lambat, coba Solusi 4** (Conda) - 10 menit

---

## ⏱️ Waktu Loading yang Normal

- **First import scipy**: 30-60 detik (normal di Windows)
- **Subsequent imports**: 1-2 detik (cached)
- **Jangan tekan Ctrl+C** saat loading

---

## 💡 Tips

1. **Jangan Interrupt**
   - Biarkan scipy loading selesai
   - Jangan tekan Ctrl+C
   - Tunggu sampai cell selesai

2. **Gunakan Conda**
   - Lebih stabil untuk scientific packages
   - Lebih cepat loading
   - Recommended untuk production

3. **Check Python Version**
   ```bash
   python --version
   # Harus 3.11+
   ```

4. **Check Scipy Version**
   ```bash
   python -c "import scipy; print(scipy.__version__)"
   # Harus 1.10+
   ```

---

## 🔍 Debugging

Jika masih error, jalankan ini di terminal:

```bash
# Check scipy installation
python -c "from scipy.interpolate import griddata; print('OK')"

# Check all imports
python -c "import numpy, pandas, scipy, sklearn, netCDF4, pmdarima; print('All OK')"

# Check versions
python -c "import scipy; import sklearn; print(f'scipy: {scipy.__version__}'); print(f'sklearn: {sklearn.__version__}')"
```

---

## 📋 Checklist

- [ ] Restart Jupyter kernel
- [ ] Tunggu scipy loading (30-60 detik)
- [ ] Jangan tekan Ctrl+C
- [ ] Jika masih error, update scipy
- [ ] Jika masih lambat, gunakan conda
- [ ] Verify dengan test imports

---

## 🚀 Lanjut Setelah Scipy Loading

Setelah scipy berhasil diimport, notebook akan berjalan normal:

1. Load data oceanografi ✅
2. Aggregate ke monthly ✅
3. Build regression model ✅
4. Train ARIMA ✅
5. Predict 12 bulan ✅
6. Export GeoJSON ✅

---

**Jika masih ada masalah, hubungi support dengan error message lengkap!**

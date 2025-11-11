# Analisis Data NetCDF - Rekomendasi Implementasi

## 📊 Hasil Analisis File NetCDF

### **1. CHL 21-24.nc (Chlorophyll-a)**
- **Dimensi:** 1461 time × 32 lat × 34 lon
- **Bounding Box:**
  - Latitude: -6.7708° to -5.4792°
  - Longitude: 104.5625° to 105.9375°
- **Resolusi:** ~0.0417° (~4.6 km)
- **Nilai CHL:** 0.1089 to 0.6592 mg/m³
  - Mean: 0.2632 mg/m³
  - Median: 0.2349 mg/m³
  - Std: 0.0921 mg/m³
- **Variable name:** `CHL`
- **Units:** milligram m-3

### **2. SST 21-24.nc (Sea Surface Temperature)**
- **Dimensi:** 1461 time × 27 lat × 29 lon
- **Bounding Box:**
  - Latitude: -6.7750° to -5.4750°
  - Longitude: 104.5750° to 105.9750°
- **Resolusi:** ~0.05° (~5.5 km)
- **Nilai SST (Kelvin):** 301.72 to 302.27 K
  - Mean: 301.94 K
  - **Setelah konversi ke Celcius:** 28.57°C to 29.12°C
  - Mean: ~28.79°C
- **Variable name:** `analysed_sst`
- **Units:** kelvin ⚠️ **PERLU KONVERSI**

### **3. SO 21-24.nc (Salinity)**
- **Dimensi:** 1461 time × 50 depth × 16 lat × 17 lon
- **Bounding Box:**
  - Latitude: -6.7500° to -5.5000°
  - Longitude: 104.5834° to 105.9167°
- **Resolusi:** ~0.0833° (~9.2 km)
- **Variable name:** `so`
- **Units:** 1e-3 (per mille, PSU)
- ⚠️ **PERHATIAN:** Data 3D dengan 50 depth levels! Perlu ekstrak surface layer.

### **4. BatimetriSelatSunda.nc (Bathymetry)**
- **Dimensi:** 588 lat × 725 lon (static, no time)
- **Bounding Box:**
  - Latitude: -8.0021° to -5.5563°
  - Longitude: 104.0979° to 107.1146°
- **Resolusi:** ~0.0042° (~0.46 km) - sangat detail!
- **Variable name:** `elevation`
- **Units:** meters (negatif = kedalaman)
- **Range:** -6746 m to 2946 m

---

## 🎯 Rekomendasi untuk Implementasi

### **1. Bounding Box Selat Sunda**

**Rekomendasi: Gunakan intersection dari semua dataset**

```python
# Bounding box yang mencakup semua data
bbox = {
    'lat_min': -6.7750,   # dari SST (paling luas)
    'lat_max': -5.4750,   # dari SST
    'lon_min': 104.5625,  # dari CHL
    'lon_max': 105.9375   # dari CHL
}
```

**Atau gunakan area yang lebih spesifik jika perlu:**
- Latitude: -6.5° to -5.5° (area inti Selat Sunda)
- Longitude: 105.0° to 106.0°

---

### **2. Suitability Index Functions**

Berdasarkan analisis data, berikut rekomendasi:

#### **HSI_CHL (Chlorophyll-a)**
```python
# Data range: 0.11 - 0.66 mg/m³ (mean: 0.26)
# Optimal untuk ekosistem laut: ~0.5-1.5 mg/m³ (mesotrophic)
# Rekomendasi: Bell curve dengan optimal di 1.0 mg/m³

def calculate_HSI_CHL(chl_value):
    optimal = 1.0  # mg/m³
    tolerance = 0.5  # range optimal ±0.5
    
    if chl_value < 0.1 or chl_value > 3.0:
        return 0.0  # Out of range
    
    # Bell curve: max at optimal, decreases with distance
    distance = abs(chl_value - optimal)
    if distance <= tolerance:
        return 1.0 - (distance / tolerance) * 0.3  # 0.7-1.0 in optimal range
    else:
        return max(0.0, 0.7 - (distance - tolerance) / 2.0)
```

#### **HSI_SST (Sea Surface Temperature)**
```python
# Data range: 28.57°C - 29.12°C (mean: 28.79°C)
# Optimal untuk ekosistem tropis: 26-30°C
# Rekomendasi: Optimal range 27-29°C

def calculate_HSI_SST(sst_celcius):
    optimal_min = 27.0  # °C
    optimal_max = 29.0  # °C
    min_acceptable = 25.0
    max_acceptable = 31.0
    
    if sst_celcius < min_acceptable or sst_celcius > max_acceptable:
        return 0.0
    
    if optimal_min <= sst_celcius <= optimal_max:
        return 1.0  # Optimal range
    elif sst_celcius < optimal_min:
        # Linear decrease below optimal
        return (sst_celcius - min_acceptable) / (optimal_min - min_acceptable)
    else:
        # Linear decrease above optimal
        return (max_acceptable - sst_celcius) / (max_acceptable - optimal_max)
```

#### **HSI_SO (Salinity)**
```python
# Data: Surface salinity di Selat Sunda biasanya 32-35 PSU
# Optimal untuk ekosistem laut: 33-35 PSU
# Rekomendasi: Optimal range 33-34 PSU

def calculate_HSI_SO(salinity_psu):
    optimal_min = 33.0  # PSU
    optimal_max = 34.0  # PSU
    min_acceptable = 31.0
    max_acceptable = 36.0
    
    if salinity_psu < min_acceptable or salinity_psu > max_acceptable:
        return 0.0
    
    if optimal_min <= salinity_psu <= optimal_max:
        return 1.0  # Optimal range
    elif salinity_psu < optimal_min:
        return (salinity_psu - min_acceptable) / (optimal_min - min_acceptable)
    else:
        return (max_acceptable - salinity_psu) / (max_acceptable - optimal_max)
```

---

### **3. Handling Data Issues**

#### **A. Resolusi Spasial Berbeda**
- CHL: 0.0417° (~4.6 km)
- SST: 0.05° (~5.5 km)
- Salinity: 0.0833° (~9.2 km)

**Solusi:**
1. **Resample ke grid seragam** (misal: 0.05° atau 0.1°)
2. **Interpolasi** menggunakan bilinear atau nearest neighbor
3. **Gunakan grid dengan resolusi terbesar** (0.0833°) untuk konsistensi

#### **B. Salinity 3D Data**
- Data memiliki 50 depth levels
- **Perlu ekstrak surface layer** (depth level pertama atau depth ≈ 0)

**Solusi:**
```python
# Ekstrak surface salinity (depth index 0 atau depth < 1m)
surface_salinity = salinity_data[:, 0, :, :]  # [time, depth=0, lat, lon]
```

#### **C. Missing Values**
- CHL: ~74% valid data (807/1088 per time step)
- SST: ~79% valid data (616/783 per time step)
- Perlu handle NaN dengan interpolasi atau masking

---

### **4. Agregasi Bulanan**

**Rekomendasi: Gunakan MEAN (bukan median)**

**Alasan:**
- Mean lebih representatif untuk trend temporal
- Data sudah cukup smooth (daily data)
- Mean lebih mudah diinterpretasi untuk HSI

**Implementasi:**
```python
# Group by year-month
monthly_mean = daily_data.groupby(['year', 'month']).mean()
```

---

### **5. GeoJSON Format**

**Rekomendasi: Point Geometry (bukan Polygon)**

**Alasan:**
- Grid points lebih ringan
- Mudah di-render sebagai heatmap di Leaflet
- File size lebih kecil

**Struktur:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [lon, lat]
      },
      "properties": {
        "hsi": 0.75,
        "chl": 0.26,
        "sst": 28.79,
        "salinity": 33.5
      }
    }
  ]
}
```

---

### **6. Workflow yang Disarankan**

#### **Step 1: Preprocessing (Jupyter)**
1. Baca semua file NetCDF
2. Konversi SST: Kelvin → Celcius
3. Ekstrak surface salinity (depth=0)
4. Resample semua data ke grid seragam (0.05° atau 0.1°)
5. Crop ke bounding box yang sama

#### **Step 2: HSI Calculation**
1. Hitung HSI_CHL, HSI_SST, HSI_SO per grid point per hari
2. Hitung HSI_total = (HSI_CHL × HSI_SST × HSI_SO)^(1/3)
3. Handle edge cases (missing values, zero values)

#### **Step 3: Monthly Aggregation**
1. Group by year-month
2. Calculate mean untuk HSI, CHL, SST, Salinity
3. Hasil: 36 dataset bulanan

#### **Step 4: GeoJSON Export**
1. Convert ke GeoJSON dengan Point geometry
2. Save 36 files: `hsi_YYYY_MM.geojson`
3. Generate metadata.json

---

## ✅ Checklist Sebelum Implementasi

- [x] Bounding box ditentukan: **-6.775° to -5.475° lat, 104.5625° to 105.9375° lon**
- [x] SST conversion: **Kelvin - 273.15**
- [x] Salinity extraction: **Surface layer (depth=0)**
- [x] Resolusi grid: **0.05° atau 0.1° (seragam)**
- [x] Suitability functions: **Rekomendasi di atas**
- [x] Agregasi: **MEAN (bukan median)**
- [x] GeoJSON format: **Point geometry**

---

## 📝 Catatan Tambahan

1. **Data Quality:** Ada missing values yang cukup banyak (~20-25%), perlu strategi handling yang baik
2. **Spatial Alignment:** Perlu resampling karena resolusi berbeda
3. **Temporal Coverage:** 1461 hari = ~4 tahun (2021-2024), tapi perlu verifikasi tanggal sebenarnya
4. **Performance:** Processing 1461 time steps bisa memakan waktu, pertimbangkan batch processing

---

**Siap untuk implementasi!** 🚀


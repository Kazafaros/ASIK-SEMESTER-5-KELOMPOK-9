# Rencana Implementasi: Sistem Analisis HSI Selat Sunda

## 📋 Overview
Proyek ini akan memproses data NetCDF (CHL, SST, Salinity) menjadi peta HSI bulanan dalam format GeoJSON, dengan backend Node.js untuk serve data dan frontend Leaflet untuk visualisasi.

---

## 🎯 Fase Implementasi

### **FASE 1: Setup & Exploration (Jupyter)**
**Tujuan:** Memahami struktur data dan setup environment

#### Step 1.1: Setup Project Structure
- Buat folder `jupyter/` untuk notebook processing
- Buat folder `backend/` untuk Node.js API
- Buat folder `data/geojson/` untuk output GeoJSON
- Setup virtual environment Python (jika perlu)

#### Step 1.2: Data Exploration
- Baca file NetCDF menggunakan `xarray` atau `netCDF4`
- Inspect struktur: dimensions (time, lat, lon), variables, attributes
- Cek date range, spatial extent, resolution
- Identifikasi missing values dan fill values
- Dokumentasikan struktur data

**Output:** Notebook dengan exploration results

---

### **FASE 2: Data Preprocessing (Jupyter)**
**Tujuan:** Membersihkan dan mempersiapkan data untuk perhitungan HSI

#### Step 2.1: Define Bounding Box Selat Sunda
- Tentukan koordinat bounding box:
  - Latitude: [min_lat, max_lat]
  - Longitude: [min_lon, max_lon]
- Crop data NetCDF ke area Selat Sunda
- Verifikasi hasil cropping

#### Step 2.2: Data Cleaning
- **SST Conversion:** Kelvin → Celcius (SST_C = SST_K - 273.15)
- **Handle Missing Values:**
  - Identifikasi NaN, fill values, invalid data
  - Interpolasi atau masking (sesuai kebutuhan)
- **Data Validation:**
  - Range check: CHL (0.1-3 mg/m³), SST (18-32°C), Salinity (30-37 PSU)
  - Flag outliers jika ada

**Output:** Cleaned dataset untuk 3 file (CHL, SST, SO)

---

### **FASE 3: HSI Calculation (Jupyter)**
**Tujuan:** Menghitung HSI per grid point per hari

#### Step 3.1: Define Suitability Index Functions
Buat fungsi untuk menghitung suitability index (0-1) untuk setiap parameter:

**HSI_CHL (Chlorophyll-a):**
- Tentukan nilai optimal (misal: 1.2 mg/m³)
- Fungsi: bell curve atau linear dengan optimal point
- Normalisasi ke range 0-1

**HSI_SST (Sea Surface Temperature):**
- Tentukan range optimal (misal: 25-30°C)
- Fungsi: linear atau optimal range
- Normalisasi ke range 0-1

**HSI_SO (Salinity):**
- Tentukan range optimal (misal: 33-35 PSU)
- Fungsi: linear atau optimal range
- Normalisasi ke range 0-1

#### Step 3.2: Calculate HSI Total
Implementasi formula:
```python
HSI_total = (HSI_CHL × HSI_SST × HSI_SO)^(1/3)
```

- Loop untuk setiap hari
- Loop untuk setiap grid point (lat, lon)
- Hitung HSI_CHL, HSI_SST, HSI_SO
- Hitung HSI_total
- Handle edge cases (missing values, zero values)

**Output:** Dataset HSI harian untuk semua grid points

---

### **FASE 4: Monthly Aggregation (Jupyter)**
**Tujuan:** Agregasi data harian menjadi bulanan

#### Step 4.1: Group by Month
- Group data harian berdasarkan tahun dan bulan
- Untuk setiap bulan (36 bulan total):
  - Agregasi: mean atau median HSI, CHL, SST, Salinity
  - Pilih metode: mean (smooth) atau median (robust)

#### Step 4.2: Prepare Monthly Data
- Struktur data per bulan:
  - lat, lon, hsi_mean, chl_mean, sst_mean, salinity_mean
  - Atau simpan semua statistik (min, max, std) jika diperlukan

**Output:** 36 dataset bulanan (2021-01 hingga 2023-12)

---

### **FASE 5: GeoJSON Conversion (Jupyter)**
**Tujuan:** Convert data bulanan ke format GeoJSON

#### Step 5.1: Create GeoJSON Structure
Untuk setiap bulan, buat GeoJSON dengan format:
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
        "chl": 1.2,
        "sst": 28.5,
        "salinity": 34.2,
        "year": 2021,
        "month": 1
      }
    }
  ]
}
```

#### Step 5.2: Export GeoJSON Files
- Generate 36 file GeoJSON
- Naming convention: `hsi_YYYY_MM.geojson` (contoh: `hsi_2021_01.geojson`)
- Save ke folder `data/geojson/`

#### Step 5.3: Generate Metadata
Buat file `metadata.json`:
```json
{
  "available_data": [
    {"year": 2021, "month": 1, "file": "hsi_2021_01.geojson"},
    ...
  ],
  "bounds": {
    "min_lat": -6.5,
    "max_lat": -5.5,
    "min_lon": 105.0,
    "max_lon": 106.5
  },
  "date_range": {
    "start": "2021-01",
    "end": "2023-12"
  }
}
```

**Output:** 36 file GeoJSON + 1 file metadata.json

---

### **FASE 6: Backend Setup (Node.js)**
**Tujuan:** Setup backend untuk serve GeoJSON files

#### Step 6.1: Initialize Node.js Project
- Buat folder `backend/`
- `npm init`
- Install dependencies:
  - `express` - Web framework
  - `cors` - CORS middleware
  - `fs-extra` - File operations
  - `path` - Path utilities

#### Step 6.2: Project Structure
```
backend/
├── src/
│   ├── routes/
│   │   └── api.js          # API routes
│   ├── services/
│   │   └── geojsonService.js # GeoJSON file handler
│   └── server.js            # Express app entry point
├── data/
│   └── geojson/             # GeoJSON files (from Jupyter)
└── package.json
```

#### Step 6.3: Create API Endpoints

**GET /api/hsi/available**
- Return list tahun & bulan yang tersedia
- Baca dari metadata.json

**GET /api/hsi?year=2021&month=1**
- Return GeoJSON untuk bulan tertentu
- Load file `hsi_YYYY_MM.geojson`
- Error handling jika file tidak ada

**GET /api/metadata**
- Return metadata.json

#### Step 6.4: Test Backend
- Start server
- Test semua endpoints
- Verify GeoJSON response

**Output:** Backend API yang berjalan dan serve GeoJSON

---

### **FASE 7: Frontend Integration**
**Tujuan:** Update frontend untuk load data dari backend

#### Step 7.1: Update API Client (`js/api.js`)
- Update `HSIApiClient` class
- Method `getHSIData(year, month)` → fetch dari `/api/hsi?year=...&month=...`
- Method `getAvailableData()` → fetch dari `/api/hsi/available`

#### Step 7.2: Update Map Manager (`js/map.js`)
- Update `HSIMapManager` class
- Method untuk load GeoJSON dari API
- Render GeoJSON sebagai heatmap atau point layer di Leaflet
- Update time selector: dari date picker → year-month selector

#### Step 7.3: Update UI Controls
- Update `analysis.html`:
  - Time selector: dropdown year + month (bukan date picker)
  - Layer selector: tetap sama (HSI, CHL, SST, Salinity)
  - Colormap selector: tetap sama

**Output:** Frontend yang terintegrasi dengan backend

---

### **FASE 8: Testing & Validation**
**Tujuan:** Memastikan semua komponen bekerja dengan baik

#### Step 8.1: Data Validation
- Verify HSI values dalam range 0-1
- Check GeoJSON format valid
- Verify semua 36 file ter-generate

#### Step 8.2: API Testing
- Test semua endpoints
- Test error handling
- Test dengan parameter invalid

#### Step 8.3: End-to-End Testing
- Jupyter processing → GeoJSON files
- Backend serve GeoJSON
- Frontend load & visualize
- Test semua layer (HSI, CHL, SST, Salinity)
- Test time navigation (bulanan)

#### Step 8.4: Performance Check
- File size GeoJSON
- API response time
- Frontend rendering performance

**Output:** Sistem yang fully functional dan tested

---

## 📦 Dependencies

### Python (Jupyter):
- `xarray` atau `netCDF4` - Baca NetCDF
- `numpy` - Array operations
- `pandas` - Data manipulation
- `geopandas` atau `geojson` - GeoJSON creation

### Node.js (Backend):
- `express` - Web framework
- `cors` - CORS middleware
- `fs-extra` - File operations

### Frontend (Sudah ada):
- `leaflet` - Map library
- Existing API client

---

## 🎯 Deliverables

1. **Jupyter Notebook:** Complete processing pipeline
2. **36 GeoJSON Files:** Monthly HSI data (2021-2023)
3. **Metadata File:** Information about available data
4. **Backend API:** Node.js server dengan endpoints
5. **Updated Frontend:** Integrated dengan backend
6. **Documentation:** README dengan instruksi setup

---

## ⚠️ Catatan Penting

1. **Suitability Index Functions:** Perlu ditentukan nilai optimal/range untuk CHL, SST, Salinity
2. **Bounding Box:** Perlu koordinat pasti Selat Sunda
3. **Agregasi Method:** Pilih mean atau median untuk monthly aggregation
4. **GeoJSON Format:** Point atau Polygon? (Saat ini rencana Point)
5. **Error Handling:** Pastikan handle missing data dengan baik

---

## 📝 Next Steps

Setelah plan ini disetujui, kita akan mulai implementasi dari Fase 1 secara bertahap.


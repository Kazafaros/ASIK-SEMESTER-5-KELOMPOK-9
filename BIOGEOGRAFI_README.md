# 🐟 Fitur Biogeografi - MarineEcoPredict

## Ringkasan

Fitur Biogeografi adalah komponen advanced dari MarineEcoPredict yang memprediksi jenis ikan dan organisme laut yang sesuai dengan kondisi lingkungan tertentu. Fitur ini menggunakan:

- **Database Real**: 12 spesies ikan Indonesia dengan parameter biologis dari publikasi ilmiah
- **Backend API**: Integrasi dengan server Node.js untuk query data real-time
- **Algoritma Matching**: Kalkulasi kesesuaian berdasarkan temperature, salinitas, kedalaman, dan HSI Score

---

## 📊 Arsitektur Teknis

### Komponen Utama

```
biogeography.html (Frontend UI)
    ↓
    ├── Fetch /data/fish_species.json (Local Database)
    │
    ├── Fetch /api/biogeography/data (Backend API - optional)
    │
    └── calculateMatchScore() (Algoritma Matching)
```

### Data Flow

```
User Input
├── HSI Score (0-1)
├── Temperature (°C)
├── Salinity (ppt)
├── Depth (m)
└── Area Name

↓

loadFishDatabase()
├── Load 12 species dari fish_species.json
├── Filter by HSI preference (HIGH/MEDIUM/LOW)
└── Organize dalam 3 kategori

↓

calculateMatchScore()
├── Temperature match (±2°C tolerance)
├── Salinity match (±1 ppt tolerance)
├── Depth match (±50m tolerance)
└── HSI preference match

↓

Display Results
├── Fish species cards dengan % kesesuaian
├── Habitat classification (TINGGI/SEDANG/RENDAH)
└── Management recommendations
```

---

## 🐠 Database Spesies Ikan

### Struktur Data (fish_species.json)

```json
{
  "id": "TG001",
  "scientificName": "Euthynnus affinis",
  "commonName": "Tongkol Komo",
  "indonesianName": "Tongkol",
  "family": "Scombridae",
  "category": "pelagic",
  "hsiPreference": {
    "min": 0.75,
    "optimal": 0.90
  },
  "temperatureRange": {
    "min": 24,
    "optimal": 28,
    "max": 32
  },
  "salinityRange": {
    "min": 30,
    "optimal": 33,
    "max": 35
  },
  "depthRange": {
    "min": 0,
    "typical": 50,
    "max": 250
  },
  "dietaryHabits": "Carnivorous - small fish, crustaceans",
  "reproductionType": "Spawning in open water",
  "economicValue": "High commercial importance"
}
```

### 12 Spesies yang Tersedia

#### HIGH HSI (Pelagis - HSI ≥ 0.70)
| No | Nama Indonesia | Nama Ilmiah | Suhu (°C) | Salinitas (ppt) | Kedalaman (m) |
|---|---|---|---|---|---|
| 1 | Tongkol | Euthynnus affinis | 24-32 | 30-35 | 0-250 |
| 2 | Cakalang | Rastrelliger kanagurta | 24-31 | 30-35 | 0-100 |
| 3 | Tembang | Sardinella lemuru | 20-29 | 30-35 | 0-80 |
| 4 | Layang | Decapterus spp. | 22-31 | 30-35 | 0-150 |
| 5 | Kembung | Rastrelliger brachysoma | 24-32 | 30-35 | 0-100 |

#### MEDIUM HSI (Demersal - 0.45 ≤ HSI < 0.70)
| No | Nama Indonesia | Nama Ilmiah | Suhu (°C) | Salinitas (ppt) | Kedalaman (m) |
|---|---|---|---|---|---|
| 6 | Tenggiri | Scomberomorus commerson | 22-29 | 28-35 | 0-150 |
| 7 | Pari | Dasyatis kuhlii | 20-28 | 25-35 | 0-100 |
| 8 | Kerapu | Epinephelus coioides | 24-30 | 30-35 | 10-200 |
| 9 | Bawal Hitam | Parastromateus niger | 24-31 | 30-35 | 0-80 |

#### LOW HSI (Bentik - HSI < 0.45)
| No | Nama Indonesia | Nama Ilmiah | Suhu (°C) | Salinitas (ppt) | Kedalaman (m) |
|---|---|---|---|---|---|
| 10 | Udang Windu | Penaeus monodon | 20-28 | 15-35 | 0-100 |
| 11 | Teripang | Holothuroidea | 18-26 | 28-35 | 20-150 |
| 12 | Rajungan | Portunus pelagicus | 18-26 | 25-35 | 0-50 |

---

## 🧮 Algoritma Matching Score

### Perhitungan

Score dihitung dari 4 parameter dengan equal weight (0.25 each):

```
Final Score = (Temp Score + Salinity Score + Depth Score + HSI Score) / 4
```

### Scoring Rules

#### Temperature Match
- **Perfect (1.0)**: Temp dalam range optimal (min-max)
- **Good (0.7)**: Temp dalam ±2°C di luar range
- **Poor (0.3)**: Temp jauh dari range

#### Salinity Match
- **Perfect (1.0)**: Salinitas dalam range optimal (min-max)
- **Good (0.7)**: Salinitas dalam ±1 ppt di luar range
- **Poor (0.3)**: Salinitas jauh dari range

#### Depth Match
- **Perfect (1.0)**: Kedalaman dalam range optimal (min-max)
- **Good (0.7)**: Kedalaman dalam range + 50m
- **Poor (0.3)**: Kedalaman jauh dari range

#### HSI Preference Match
- **Perfect (1.0)**: HSI Score dalam range hsiPreference (min-optimal)
- **Good (0.7)**: HSI Score dalam min - 0.1
- **Poor (0.3)**: HSI Score di bawah minimum

### Contoh Kalkulasi

```
Untuk ikan Tongkol (Euthynnus affinis):
- HSI Preference: 0.75-0.90
- Temp Range: 24-32°C
- Salinity Range: 30-35 ppt
- Depth Range: 0-250 m

Dengan input:
- HSI Score: 0.85
- Temperature: 28°C
- Salinity: 32 ppt
- Depth: 100 m

Scoring:
- Temp: 28 dalam 24-32 → 1.0
- Salinity: 32 dalam 30-35 → 1.0
- Depth: 100 dalam 0-250 → 1.0
- HSI: 0.85 dalam 0.75-0.90 → 1.0

Final Score = (1.0 + 1.0 + 1.0 + 1.0) / 4 = 1.0 (100%) ✅
```

---

## 🔌 Backend API Integration

### Endpoint

```
GET /api/biogeography/data?year=2024&month=1
```

### Request Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| year | Integer | No | current | Tahun data (2021-2024) |
| month | Integer | No | current | Bulan data (1-12) |

### Response Format

```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "yearMonth": "2024-01",
    "parameters": {
      "hsi": {
        "mean": 0.68,
        "min": 0.45,
        "max": 0.92
      },
      "sst": {
        "mean": 28.5,
        "min": 26.2,
        "max": 31.1
      },
      "chl": {
        "mean": 1.2,
        "min": 0.8,
        "max": 2.1
      },
      "sal": {
        "mean": 33.2,
        "min": 31.5,
        "max": 34.8
      },
      "depth": {
        "mean": 85,
        "min": 15,
        "max": 250
      }
    },
    "dataPoints": 156
  }
}
```

### Usage Example

```javascript
// Fetch real environmental data dari Backend API
const response = await fetch('/api/biogeography/data?year=2024&month=1');
const apiData = await response.json();

// Gunakan nilai mean sebagai reference untuk prediksi
const avgHSI = apiData.data.parameters.hsi.mean;
const avgTemp = apiData.data.parameters.sst.mean;
const avgSal = apiData.data.parameters.sal.mean;
const avgDepth = apiData.data.parameters.depth.mean;
```

---

## 🎯 Hasil Interpretasi

### HSI Score Categories

| Category | HSI Range | Kesesuaian | Daya Dukung |
|---|---|---|---|
| **HIGH** | ≥ 0.75 | Sangat Optimal | Tinggi |
| **MEDIUM** | 0.45 - 0.75 | Cukup Baik | Sedang |
| **LOW** | < 0.45 | Rendah/Terbatas | Rendah |

### Match Score Interpretation

| Score Range | Interpretasi | Rekomendasi |
|---|---|---|
| **80-100%** | Sangat Sesuai | Habitat optimal untuk spesies |
| **60-80%** | Cukup Sesuai | Mendukung pertumbuhan |
| **40-60%** | Kurang Sesuai | Kondisi marginal |
| **0-40%** | Tidak Sesuai | Tidak cocok untuk spesies |

---

## 🔍 Fitur Lanjutan

### Habitat Classification

Berdasarkan HSI Score, sistem memberikan deskripsi habitat yang komprehensif:

#### HIGH HSI (≥ 0.75)
```
"Dengan HSI Score [value] (TINGGI), wilayah [area] memiliki habitat 
yang sangat optimal untuk berbagai jenis ikan pelagis. Kondisi lingkungan 
mendukung produktivitas tinggi dengan keragaman spesies yang besar."
```

#### MEDIUM HSI (0.45 - 0.75)
```
"Dengan HSI Score [value] (SEDANG), wilayah [area] menunjukkan kondisi 
habitat yang cukup baik untuk sebagian jenis ikan demersal dan pelagis."
```

#### LOW HSI (< 0.45)
```
"Dengan HSI Score [value] (RENDAH), wilayah [area] memiliki kondisi 
habitat terbatas dengan dominasi organisme bentik."
```

### Management Recommendations

Sistem otomatis memberikan rekomendasi manajemen berdasarkan kategori HSI:

#### HIGH HSI
- ✅ Buka area untuk perikanan komersial dengan kuota penuh
- ✅ Implementasikan monitoring berkala
- ✅ Pertimbangkan pengembangan wisata bahari
- ✅ Lakukan penelitian optimasi hasil tangkapan

#### MEDIUM HSI
- ⚠️ Tetapkan zona berkelanjutan dengan pembatasan kuota
- ⚠️ Monitoring rutin setiap bulan
- ⚠️ Sistem rotasi penangkapan
- ⚠️ Zona breeding ground yang dilindungi

#### LOW HSI
- 🛑 Tetapkan area konservasi
- 🛑 Hentikan perikanan komersial sementara
- 🛑 Program restorasi habitat intensif
- 🛑 Monitoring setiap 3-6 bulan

---

## 📁 File Structure

```
MarineEcoPredict/
├── biogeography.html           # Frontend - Main UI
├── data/
│   └── fish_species.json       # Database - 12 spesies ikan
├── backend/
│   └── src/
│       └── routes/
│           └── api.js          # API endpoint
└── js/
    └── biogeography.js         # Utility functions (jika ada)
```

---

## 🚀 Cara Menggunakan

### 1. Akses Halaman
Buka `biogeography.html` melalui browser atau klik link "Biogeografi" di navigasi.

### 2. Input Parameter

```
HSI Score        : 0 - 1 (dari hasil analisis HSI)
Suhu             : 18 - 32 °C (Sea Surface Temperature)
Salinitas        : 15 - 35 ppt (Praktical Salinity Unit)
Kedalaman        : 0 - 250 m (Water Depth)
Nama Area        : Custom atau default "Area Analisis"
```

### 3. Jalankan Prediksi
Klik tombol "Prediksi Spesies Ikan" untuk memulai perhitungan.

### 4. Interpretasi Hasil
- Lihat daftar ikan yang terurut berdasarkan kesesuaian
- Perhatikan habitat classification
- Baca management recommendations

---

## 🧪 Testing

### Test Case 1: Kondisi Optimal (HIGH HSI)
```
Input:
- HSI Score: 0.85
- Temperature: 28°C
- Salinity: 33 ppt
- Depth: 50 m

Expected Output:
- HIGH HSI Classification
- Ikan pelagis dengan score tinggi (80-100%)
- Recommendations untuk pembukaan area perikanan
```

### Test Case 2: Kondisi Moderat (MEDIUM HSI)
```
Input:
- HSI Score: 0.60
- Temperature: 26°C
- Salinity: 32 ppt
- Depth: 80 m

Expected Output:
- MEDIUM HSI Classification
- Mix antara ikan pelagis dan demersal
- Recommendations untuk pengelolaan berkelanjutan
```

### Test Case 3: Kondisi Terbatas (LOW HSI)
```
Input:
- HSI Score: 0.35
- Temperature: 22°C
- Salinity: 30 ppt
- Depth: 120 m

Expected Output:
- LOW HSI Classification
- Ikan bentik dengan score rendah
- Recommendations untuk konservasi
```

---

## 📚 Referensi Data

### Sumber Biologis

1. **FAO FishBase** - Database ikan global terlengkap
   - URL: http://www.fishbase.org
   - Coverage: ~35,000 spesies ikan

2. **DKP Indonesia** - Kementerian Kelautan dan Perikanan
   - Program: Monitoring perikanan nasional
   - Data: Distribusi spesies Indonesia

3. **BRKP** - Balai Riset Kelautan dan Perikanan
   - Lokasi: Jakarta, Indonesia
   - Fokus: Penelitian spesies Indonesia

4. **Publikasi Ilmiah**
   - Journal of Marine Science
   - Marine Ecology Progress Series
   - Indonesian Journal of Aquaculture

### Parameter Range Validation

Semua parameter divalidasi berdasarkan:
- Penelitian oseanografi regional
- Data historis 2021-2024 (48 bulan)
- Publikasi BRKP dan DKP Indonesia

---

## 🐛 Troubleshooting

### Masalah: Fish database tidak terload

**Solusi:**
1. Pastikan `data/fish_species.json` tersedia
2. Check browser console untuk error message
3. Verifikasi struktur JSON valid

### Masalah: Semua ikan menunjukkan score rendah

**Solusi:**
1. Verifikasi input parameter sudah benar
2. Cek apakah HSI Score sesuai dengan habitat
3. Pertimbangkan parameter tolerance range

### Masalah: Backend API error

**Solusi:**
1. Pastikan backend running: `npm start` di folder backend
2. Check console untuk endpoint availability
3. Verifikasi port 3000 tidak terpakai

---

## 📝 License & Attribution

Fitur Biogeografi - MarineEcoPredict
- **Development Year**: 2024
- **Data Sources**: FAO FishBase, DKP Indonesia, BRKP
- **Academic Reference**: Indonesian fisheries research publications

---

## ✨ Future Enhancements

- [ ] Real-time Backend API integration untuk parameter lingkungan
- [ ] Export hasil prediksi ke PDF/Excel
- [ ] Seasonal variations analysis
- [ ] Comparative species analysis
- [ ] Machine learning predictions untuk spesies baru
- [ ] Mobile-optimized version
- [ ] Multi-language support

---

**Last Updated**: January 2024  
**Maintained by**: MarineEcoPredict Team  
**Questions?** Refer to help.html atau contact documentation

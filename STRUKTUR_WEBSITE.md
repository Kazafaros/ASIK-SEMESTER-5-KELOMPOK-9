# 🏗️ Struktur Website MarineEcoPredict

## 📋 Gambaran Umum

Website MarineEcoPredict terdiri dari:
- **Backend**: Node.js/Express API (port 3000) - Menghasilkan & melayani data
- **Frontend**: HTML5/CSS/JavaScript vanilla - Interface untuk user

---

## 🔧 BACKEND STRUCTURE

### Lokasi: `backend/`

```
backend/
├── package.json                 # Dependencies & scripts
├── node_modules/               # Installed packages
├── src/
│   ├── server.js              # Main Express server
│   ├── routes/
│   │   ├── api.js             # Main API routes (/api/*)
│   │   └── monthlyPredictions.js
│   ├── services/
│   │   ├── geojsonService.js  # Handle GeoJSON files
│   │   └── monthlyPredictionService.js
│   └── data/
│       └── geojson/           # GeoJSON files storage
├── data/
│   ├── geojson/               # 48 GeoJSON files (2021-2024)
│   ├── predictions/           # Monthly predictions
│   └── processed/             # Processed NPZ files
└── README.md
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                    │
│                                                              │
│  HTML5/CSS/JS → fetch() calls → http://localhost:3000/api  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ HTTP Requests
┌─────────────────────────────────────────────────────────────┐
│                      Express Server                          │
│                    (server.js:3000)                          │
├─────────────────────────────────────────────────────────────┤
│ Middleware Layer                                             │
│  • CORS (allow cross-origin requests)                       │
│  • express.json() (parse JSON)                              │
│  • express.urlencoded() (parse forms)                       │
│  • Request logging                                          │
├─────────────────────────────────────────────────────────────┤
│ Routes (Router Layer)                                        │
│  /api/hsi/available      ──→ api.js                         │
│  /api/hsi?year=...       ──→ api.js                         │
│  /api/metadata           ──→ api.js                         │
│  /api/health             ──→ api.js                         │
│  /api/biogeography/data  ──→ api.js                         │
│  /api/monthly-predictions ──→ monthlyPredictions.js         │
├─────────────────────────────────────────────────────────────┤
│ Services (Business Logic Layer)                              │
│  • GeoJSONService        (read/parse GeoJSON files)         │
│  • MonthlyPredictionService (handle predictions)            │
├─────────────────────────────────────────────────────────────┤
│ Data Layer                                                   │
│  data/geojson/          (48 GeoJSON files)                  │
│  data/predictions/      (prediction files)                  │
│  data/fish_species.json (fish data)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### 1️⃣ Health Check
```
GET /api/health
Response: { success: true, status: "OK" }
```

### 2️⃣ Get Available Data (Year-Month combinations)
```
GET /api/hsi/available
Response: {
  success: true,
  data: [
    { year: 2021, months: [1, 2, 3, ...] },
    { year: 2022, months: [1, 2, 3, ...] },
    ...
  ]
}
```

### 3️⃣ Get HSI GeoJSON Data
```
GET /api/hsi?year=2021&month=1
Response: {
  success: true,
  data: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { HSI_index: 0.65, ... },
        geometry: { type: "Point", coordinates: [...] }
      },
      ...
    ]
  }
}
```

### 4️⃣ Get Metadata
```
GET /api/metadata
Response: {
  success: true,
  data: {
    total_months: 48,
    data_range: { start: "2021-01", end: "2024-12" },
    available_years: [2021, 2022, 2023, 2024]
  }
}
```

### 5️⃣ Get Biogeography Fish Data
```
GET /api/biogeography/data
Response: {
  success: true,
  data: [
    {
      id: 1,
      name: "Teri (Anchovy)",
      scientificName: "Stolephorus spp.",
      hsiRange: { min: 0.5, max: 0.95 },
      ...
    },
    ...
  ]
}
```

### 6️⃣ Monthly Predictions
```
GET /api/monthly-predictions/:year/:month
Response: { predictions data }
```

---

## 📁 Frontend Structure

### Lokasi: Root directory

```
root/
├── index.html              # 🏠 Beranda (Homepage)
├── analysis.html           # 📊 Analisis HSI
├── comparison.html         # 📈 Perbandingan Data
├── history.html           # 📜 Riwayat
├── biogeography.html      # 🐠 Biogeografi Ikan
├── help.html              # ❓ Bantuan
├── about.html             # ℹ️ Tentang Website
├── css/
│   └── styles.css         # Custom CSS styles
├── js/
│   ├── config.js          # Configuration & constants
│   ├── api.js             # API client functions
│   ├── map.js             # Leaflet map functionality
│   ├── index-interactive.js   # Homepage logic
│   ├── analysis-prediction.js  # Analysis page logic
│   ├── monthlyPrediction.js    # Monthly prediction logic
│   ├── data-export.js     # Export functionality
│   └── olap-dashboard.js  # OLAP dashboard
├── data/
│   ├── geojson/           # GeoJSON files (from backend)
│   ├── predictions/       # Prediction data
│   ├── processed/         # Processed data files
│   ├── fish_species.json  # 🐠 Fish species database
│   └── metadata.json      # Metadata
├── PANDUAN_PENGGUNAAN.md  # User guide
└── README.md
```

### Frontend Page Structure

#### 1️⃣ **index.html** (Beranda)
```html
├── Header (Navigation + Dark Mode Toggle)
├── Hero Section (Background image, title, description)
├── Statistics Cards (4 stat boxes with API data)
├── Interactive Map (Leaflet map - latest HSI data)
├── Features Grid (3 feature descriptions)
└── Footer
```

#### 2️⃣ **analysis.html** (Analisis)
```html
├── Header
├── Title & Description
├── Input Form
│   ├── Year selector
│   ├── Month selector
│   └── Parameter inputs
├── Interactive Map (Display HSI data for selected period)
├── Statistics Panel (Analysis results)
├── Chart Container (Chart.js visualization)
└── Footer
```

#### 3️⃣ **comparison.html** (Perbandingan)
```html
├── Header
├── Select Multiple Periods
├── Comparison Cards (Side-by-side comparison)
├── Data Table (Sortable, filterable)
├── Comparative Charts
└── Footer
```

#### 4️⃣ **biogeography.html** (Biogeografi) ⭐ NEW
```html
├── Header
├── Input Form (HSI Score, Temperature, etc.)
├── Fish Species Cards
│   ├── Fish Image/Icon
│   ├── Fish Name & Scientific Name
│   ├── Habitat Parameters
│   ├── Match Score (Progress bar)
│   └── Description
└── Footer
```

#### 5️⃣ **history.html** (Riwayat)
```html
├── Header
├── Timeline View
├── Historical Events/Changes
├── Pagination
└── Footer
```

#### 6️⃣ **help.html** (Bantuan)
```html
├── Header
├── Documentation Sections
│   ├── Getting Started
│   ├── Parameters Explanation
│   ├── HSI Formula
│   ├── How to Use Each Page
│   └── FAQ
└── Footer
```

#### 7️⃣ **about.html** (Tentang)
```html
├── Header
├── Project Overview
├── Team Information
├── Technology Stack
├── Marine Conservation Info
└── Footer
```

---

## 🔄 Frontend-Backend Communication

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (Frontend)                      │
│                                                              │
│  HTML/CSS/JavaScript loaded (static files)                  │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          │ 1. User opens index.html
                          ↓
                 ┌────────────────────┐
                 │  Page Ready        │
                 │  (HTML rendered)   │
                 └────────────────────┘
                          │
                          │ 2. JavaScript runs
                          │    (js/index-interactive.js)
                          ↓
        ┌──────────────────────────────────────┐
        │ fetch("http://localhost:3000/api/...") │
        └───────────────┬──────────────────────┘
                        │
                        │ HTTP GET
                        ↓
        ┌──────────────────────────────────────┐
        │  Backend (Express Server)            │
        │  • Process request                   │
        │  • Query services                    │
        │  • Get data from files               │
        │  • Return JSON response              │
        └───────────────┬──────────────────────┘
                        │
                        │ JSON Response
                        ↓
        ┌──────────────────────────────────────┐
        │  Browser receives data               │
        │  • Parse JSON                        │
        │  • Update DOM                        │
        │  • Render map/charts                 │
        └──────────────────────────────────────┘
```

### Example: Load Homepage
```javascript
// 1. Page loads (index.html)
// 2. JavaScript executes (index-interactive.js)
// 3. On page load:

fetch('http://localhost:3000/api/hsi/available')
  .then(res => res.json())
  .then(data => {
    // Update statistics cards
    updateStatsCard('total_months', data.data.total_months);
  });

fetch('http://localhost:3000/api/hsi?year=2024&month=12')
  .then(res => res.json())
  .then(data => {
    // Draw map with latest data
    drawMap(data.data);
  });
```

---

## 📊 Data Flow Example: Biogeography

```
1. User selects parameters:
   - HSI Score: 0.75
   - Temperature: 28°C
   - Salinity: 32 ppt

                    ↓
2. Frontend sends data to backend:
   fetch('/api/biogeography/data')

                    ↓
3. Backend responds with fish species:
   [
     {
       name: "Teri (Anchovy)",
       hsiRange: { min: 0.5, max: 0.95 },
       tempRange: { min: 20, max: 32 },
       match: 0.92  // 92% match
     },
     ...
   ]

                    ↓
4. Frontend calculates match score:
   matchScore = (userHSI within hsiRange) * 0.4
              + (userTemp within tempRange) * 0.3
              + (userSalinity within salinityRange) * 0.3

                    ↓
5. Display fish cards sorted by match score
```

---

## 🔗 Key Files & Functions

### Backend

| File | Purpose | Key Functions |
|------|---------|---------------|
| `server.js` | Main app entry | `startServer()`, middleware setup |
| `routes/api.js` | API endpoints | `/hsi/available`, `/hsi`, `/metadata`, `/biogeography/data` |
| `routes/monthlyPredictions.js` | Predictions | `/api/monthly-predictions/:year/:month` |
| `services/geojsonService.js` | Data handling | `getAvailableData()`, `getHSIData()`, `verifyDataDirectory()` |
| `services/monthlyPredictionService.js` | Predictions | `getPredictions()` |

### Frontend

| File | Purpose | Key Functions |
|------|---------|---------------|
| `js/config.js` | Constants | API endpoint, color scheme, etc. |
| `js/api.js` | API client | `fetch()` wrappers for all endpoints |
| `js/map.js` | Map logic | `initMap()`, `drawGeoJSON()`, `updateMap()` |
| `js/index-interactive.js` | Homepage | Load statistics, render map |
| `js/analysis-prediction.js` | Analysis page | Filter data, analyze HSI |
| `js/monthlyPrediction.js` | Predictions | Fetch & display predictions |
| `js/data-export.js` | Export | Export to CSV/JSON |
| `js/olap-dashboard.js` | Dashboard | OLAP analysis |

---

## 💾 Data Files

### Backend Data

```
backend/data/
├── geojson/
│   ├── hsi_2021_01.geojson  (Point features with HSI values)
│   ├── hsi_2021_02.geojson
│   ├── ...
│   ├── hsi_2024_12.geojson
│   └── metadata.json         (Metadata about all files)
├── predictions/
│   ├── monthly_2025/         (2025 predictions)
│   ├── monthly_2026/         (2026 predictions)
│   └── monthly_2027/
└── processed/
    ├── hsi_data.npz          (NumPy format)
    └── processed_data.npz
```

### Frontend Data

```
data/
├── fish_species.json
│  {
│    "species": [
│      {
│        "id": 1,
│        "name": "Teri (Anchovy)",
│        "scientificName": "Stolephorus spp.",
│        "hsiRange": { "min": 0.5, "max": 0.95 },
│        "temperatureRange": { "min": 20, "max": 32 },
│        ...
│      }
│    ]
│  }
└── metadata.json
   (Contains info about available datasets)
```

---

## 🚀 How It Works: Step by Step

### Step 1: Start Backend
```bash
cd backend
npm start
# Output: ✅ Server running on http://localhost:3000
```

### Step 2: Open Frontend
```bash
# Option 1: Open in browser
Open file:///d:/Semester%205%20Faiq/ASIK%2025/index.html

# Option 2: Use Live Server VS Code extension
```

### Step 3: User Interaction
```
User clicks on "Analisis" page
    ↓
Loads analysis.html (HTML/CSS/JS)
    ↓
JavaScript runs (analysis-prediction.js)
    ↓
Calls fetch('http://localhost:3000/api/hsi/available')
    ↓
Backend processes request → Returns available data
    ↓
Frontend receives → Updates dropdown menus
    ↓
User selects year/month
    ↓
Calls fetch('http://localhost:3000/api/hsi?year=2021&month=1')
    ↓
Backend reads GeoJSON file → Returns data
    ↓
Frontend renders map with Leaflet
    ↓
User sees interactive map with HSI visualization
```

---

## 📋 Summary Table

| Aspect | Backend | Frontend |
|--------|---------|----------|
| **Technology** | Node.js/Express | HTML5/CSS/JavaScript |
| **Port** | 3000 | N/A (file:// or http://) |
| **Data Source** | GeoJSON files, fish_species.json | API calls to backend |
| **Main Logic** | Route handlers, Services | Event listeners, fetch calls |
| **Database** | File-based (JSON/GeoJSON) | Browser LocalStorage |
| **Deployment** | npm start | Static file serving |

---

## 🔐 CORS & Security

Backend has CORS enabled:
```javascript
app.use(cors());  // Allow requests from any origin
```

This allows:
- Frontend (any domain) → Backend (localhost:3000)
- fetch() calls work across origins
- In production, should restrict to specific domains

---

## 📝 Key Points

✅ **Separation of Concerns**
- Backend: Data processing & APIs
- Frontend: UI/UX & visualization

✅ **Scalability**
- Easy to add new API endpoints
- Easy to add new frontend pages

✅ **Maintainability**
- Services handle business logic
- Routes define API structure
- Frontend is modular with separate JS files

✅ **Data Flow**
- User → Frontend → Backend → Data Files
- Backend → JSON Response → Frontend → Visualization

---

**Last Updated:** November 16, 2025

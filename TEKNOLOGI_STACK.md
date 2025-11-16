# 🛠️ Technology Stack - MarineEcoPredict

## 📊 Ringkasan Teknologi

Website **MarineEcoPredict** menggunakan kombinasi teknologi modern untuk data processing, API serving, dan interactive frontend visualization.

---

## 🔷 BACKEND TECHNOLOGIES

### **1. Runtime & Server Framework**
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Node.js** | v16+ | JavaScript runtime - menjalankan server |
| **Express.js** | ^5.1.0 | Web framework - membuat REST API |

**Apa itu Node.js?**
- Runtime JavaScript untuk backend (tidak hanya browser lagi)
- Server-side JavaScript execution
- Non-blocking, event-driven I/O
- Perfect untuk API server, data processing

**Express.js:**
- Lightweight web framework untuk Node.js
- Routing, middleware, error handling
- Built on top of Node.js HTTP module

### **2. Backend Dependencies**

```json
{
  "cors": "^2.8.5",              // Cross-Origin Resource Sharing
  "express": "^5.1.0",           // Web framework
  "fs-extra": "^11.3.2",         // File system utilities
  "json": "^11.0.0",             // JSON handling
  "package": "^1.0.1"            // Package utilities
}
```

**Penjelasan:**
- **cors**: Izinkan frontend (di domain berbeda) mengakses API backend
- **express**: Framework utama API
- **fs-extra**: Helper untuk membaca/menulis file GeoJSON
- **json**: Parsing & stringify JSON data
- **package**: Utility functions

### **3. Data Storage**

| Format | Lokasi | Isi |
|--------|--------|-----|
| **GeoJSON** | `backend/data/geojson/` | 48 file (2021-2024), point features dengan HSI values |
| **JSON** | `data/fish_species.json` | 12 spesies ikan, parameter habitat |
| **JSON** | `backend/data/geojson/metadata.json` | Info tentang semua file GeoJSON |
| **NPZ** | `backend/data/processed/` | NumPy format (dari Jupyter) |

### **4. Port & Endpoints**

```
Backend Server: http://localhost:3000

API Endpoints:
├── GET /api/health                   (status check)
├── GET /api/hsi/available           (list available data)
├── GET /api/hsi?year=2021&month=1   (get GeoJSON data)
├── GET /api/metadata                (get metadata)
├── GET /api/biogeography/data       (get fish species)
└── GET /api/monthly-predictions/:year/:month (predictions)
```

---

## 🔷 DATA PROCESSING (Jupyter/Python)

### **Python Libraries untuk Data Processing**

```pip
netCDF4>=1.6.0           # NetCDF file format handling
numpy>=1.24.0            # Numerical computing
pandas>=2.0.0            # Data manipulation & analysis
scikit-learn>=1.3.0      # Machine learning
geopandas>=0.13.0        # Geographic data handling
geojson>=3.0.0           # GeoJSON conversion
matplotlib>=3.7.0        # Data visualization
xarray>=2023.0.0         # Multi-dimensional data
scipy>=1.10.0            # Scientific computing
pmdarima>=2.0.0          # Auto ARIMA for predictions
```

### **What They Do:**

1. **netCDF4**: Baca data satelit NetCDF format
2. **numpy**: Array operations, numerical calculations
3. **pandas**: DataFrame manipulation untuk tabular data
4. **scikit-learn**: Machine learning algorithms
5. **geopandas**: Spatial data processing
6. **geojson**: Convert data ke GeoJSON format
7. **matplotlib**: Generate charts & visualizations
8. **xarray**: Handle multi-dimensional arrays
9. **scipy**: Scientific functions (statistics, optimization)
10. **pmdarima**: ARIMA time-series forecasting

### **Workflow:**

```
Raw Data (NetCDF, CSV, etc.)
    ↓
Load with netCDF4/pandas
    ↓
Process with numpy/pandas/geopandas
    ↓
Calculate HSI Index
    ↓
Generate predictions with scikit-learn/pmdarima
    ↓
Convert to GeoJSON
    ↓
Export to backend/data/geojson/
    ↓
Backend serves via API
```

---

## 🔷 FRONTEND TECHNOLOGIES

### **1. Core HTML/CSS Framework**

| Teknologi | Fungsi |
|-----------|--------|
| **HTML5** | Semantic markup, forms, media |
| **CSS3** | Styling, animations, responsive |
| **Tailwind CSS** | Utility-first CSS framework |
| **Dark Mode** | Built-in dark mode support |

### **2. Tailwind CSS**

**Link:**
```html
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
```

**Fitur:**
- Utility-first CSS (className based styling)
- Responsive breakpoints (sm, md, lg, xl, 2xl)
- Dark mode support (`dark:` prefix)
- Container queries plugin
- Form styling plugin

**Contoh:**
```html
<!-- Responsive grid: 1 col mobile, 2 md, 4 lg -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Content -->
</div>

<!-- Dark mode -->
<div class="bg-white dark:bg-background-dark text-black dark:text-white">
  <!-- Content -->
</div>
```

### **3. Icons & UI Libraries**

| Library | Fungsi | Link |
|---------|--------|------|
| **Lucide Icons** | SVG icons | `https://unpkg.com/lucide@latest` |
| **Google Fonts (Poppins)** | Typography | `fonts.googleapis.com` |
| **Leaflet.js** | Interactive maps | `https://unpkg.com/leaflet@1.9.4` |

**Lucide Icons:**
```html
<i data-lucide="map-pin"></i>      <!-- Map pin icon -->
<i data-lucide="bar-chart-2"></i>  <!-- Chart icon -->
<i data-lucide="fish"></i>         <!-- Fish icon -->
```

### **4. Map Visualization**

**Leaflet.js v1.9.4**
- Open-source JavaScript library
- Interactive maps
- Support for GeoJSON layers
- Touch-friendly on mobile
- Plugin ecosystem

**Features:**
- Draw point/polygon features
- Layer toggling
- Zoom/pan controls
- Popup information
- Custom tile layers

**Data Format:**
```javascript
// GeoJSON Point Feature
{
  type: "Feature",
  properties: {
    HSI_index: 0.75,
    location: "Example Point"
  },
  geometry: {
    type: "Point",
    coordinates: [107.5, -6.5]  // [lon, lat]
  }
}
```

### **5. JavaScript (Vanilla - No Frameworks)**

**File-file JS:**
```
js/
├── config.js                  // Constants & configuration
├── api.js                     // API client (fetch wrappers)
├── map.js                     // Leaflet map functions
├── index-interactive.js       // Homepage logic
├── analysis-prediction.js     // Analysis page
├── monthlyPrediction.js       // Predictions
├── data-export.js             // Export functionality
└── olap-dashboard.js          // OLAP dashboard
```

**No Framework Artinya:**
- Tidak pakai React, Vue, Angular
- Pure JavaScript (ES6+)
- Event listeners & DOM manipulation
- fetch API untuk HTTP requests
- Lebih simple, lebih ringan

**Contoh Fetch:**
```javascript
// Get data dari backend
fetch('http://localhost:3000/api/hsi?year=2021&month=1')
  .then(response => response.json())
  .then(data => {
    // Process & display data
    drawMap(data);
  })
  .catch(error => console.error('Error:', error));
```

### **6. Data Visualization**

**Chart.js** (jika digunakan di analysis/comparison)
- JavaScript charting library
- Line charts, bar charts, pie charts
- Responsive & interactive
- CDN available

---

## 📊 TECH STACK VISUALIZATION

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Browser)                     │
├─────────────────────────────────────────────────────────┤
│ HTML5 + CSS3 + Tailwind CSS                             │
│ + Lucide Icons + Google Fonts (Poppins)                │
│ + Leaflet.js (Maps)                                     │
│ + Chart.js (Charts)                                     │
│ + Vanilla JavaScript (ES6+)                             │
│ ├── config.js (constants)                               │
│ ├── api.js (fetch calls)                                │
│ ├── map.js (map functions)                              │
│ ├── index-interactive.js                                │
│ ├── analysis-prediction.js                              │
│ ├── monthlyPrediction.js                                │
│ ├── data-export.js                                      │
│ └── olap-dashboard.js                                   │
└─────────────────────────────────────────────────────────┘
          ↓ (HTTP/fetch calls)
┌─────────────────────────────────────────────────────────┐
│            BACKEND (Node.js/Express)                     │
├─────────────────────────────────────────────────────────┤
│ Node.js Runtime + Express.js Framework                   │
│ Dependencies:                                            │
│ ├── cors (enable cross-origin)                          │
│ ├── express (routing, middleware)                       │
│ ├── fs-extra (file operations)                          │
│ ├── json (data handling)                                │
│ └── package (utilities)                                 │
│                                                          │
│ Routes & Services:                                       │
│ ├── /api/hsi/available                                  │
│ ├── /api/hsi?year=...&month=...                        │
│ ├── /api/metadata                                       │
│ ├── /api/biogeography/data                              │
│ └── /api/monthly-predictions/:year/:month               │
└─────────────────────────────────────────────────────────┘
          ↓ (Read files)
┌─────────────────────────────────────────────────────────┐
│              DATA FILES (File System)                     │
├─────────────────────────────────────────────────────────┤
│ GeoJSON Files:                                           │
│ ├── backend/data/geojson/hsi_2021_01.geojson           │
│ ├── backend/data/geojson/hsi_2021_02.geojson           │
│ ├── ... (48 files total)                                │
│ └── backend/data/geojson/hsi_2024_12.geojson           │
│                                                          │
│ JSON Data:                                               │
│ ├── data/fish_species.json                              │
│ ├── data/metadata.json                                  │
│ └── backend/data/geojson/metadata.json                  │
│                                                          │
│ Processed Data:                                          │
│ └── backend/data/processed/*.npz (NumPy format)         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔷 DATA PROCESSING PIPELINE (Jupyter)

### **Files:**
```
jupyter/
├── 01_data_exploration.ipynb
├── 02_data_preprocessing.ipynb
├── 03_hsi_calculation.ipynb
├── 04_monthly_aggregation.ipynb
├── 05_geojson_export.ipynb
├── 06_filter_land_points.ipynb
├── 07_prediction_model.ipynb
└── 09_monthly_hsi_prediction_model.ipynb
```

### **Typical Flow:**

```python
# 1. Load data
import netCDF4, numpy as np, pandas as pd
data = netCDF4.Dataset('satellite_data.nc')

# 2. Process with numpy/pandas
HSI_data = np.array(data.variables['HSI'][:])
df = pd.DataFrame(HSI_data)

# 3. Spatial operations with geopandas
import geopandas as gpd
gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.lon, df.lat))

# 4. Convert to GeoJSON
geojson = gdf.to_json()

# 5. Predictions with scikit-learn
from sklearn.ensemble import RandomForestRegressor
model = RandomForestRegressor()
predictions = model.predict(X_test)

# 6. Export results
geojson_file.write(geojson)
np.savez('processed_data.npz', HSI=HSI_data)
```

---

## 🚀 HOW TO RUN

### **Backend (Node.js)**
```bash
cd backend
npm install          # Install dependencies
npm start           # Start server on port 3000

Output:
✅ Data directory verified
✅ Loaded metadata: 48 months available
🚀 Server running on http://localhost:3000
```

### **Frontend (HTML/CSS/JS)**
```bash
# Option 1: Open file directly
Open file:///D:/Semester%205%20Faiq/ASIK%2025/index.html

# Option 2: Use Live Server (VS Code extension)
Right-click index.html → Open with Live Server

# Option 3: Python HTTP server
python -m http.server 8000
# Access: http://localhost:8000
```

### **Jupyter (Data Processing)**
```bash
cd jupyter
jupyter notebook
# Open notebook files to process data
```

---

## 📋 REQUIREMENTS

### **System Requirements**
| Komponen | Requirement |
|----------|-------------|
| **Node.js** | v16 or higher |
| **npm** | v7 or higher (comes with Node.js) |
| **Python** | v3.8+ (untuk Jupyter) |
| **Browser** | Modern browser (Chrome, Firefox, Safari, Edge) |

### **Browser Compatibility**
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

### **Node.js Packages**
```bash
cd backend
npm install
# Installs:
# - cors@2.8.5
# - express@5.1.0
# - fs-extra@11.3.2
# - json@11.0.0
# - package@1.0.1
```

### **Python Packages**
```bash
cd jupyter
pip install -r requirements.txt
# Installs all data processing libraries
```

---

## 🔄 ARCHITECTURE SUMMARY

```
DATA LAYER (Files)
↓
PYTHON/JUPYTER (Process & analyze)
↓
BACKEND: Node.js/Express API (Serve data)
↓
HTTP/JSON Responses
↓
FRONTEND: HTML/CSS/JS (Display & interact)
↓
User sees: Interactive maps, charts, statistics
```

---

## ✨ KEY TECHNOLOGIES

### **Why Node.js?**
✅ Fast I/O operations (reading GeoJSON files)  
✅ Non-blocking event-driven model  
✅ Easy to build REST APIs  
✅ Large ecosystem (npm packages)  
✅ Same language (JavaScript) for frontend & backend  

### **Why Express?**
✅ Minimal & flexible  
✅ Great routing system  
✅ Middleware support  
✅ Built-in error handling  
✅ Perfect for REST APIs  

### **Why Tailwind CSS?**
✅ Utility-first (faster development)  
✅ Responsive by default  
✅ Dark mode support  
✅ Smaller CSS bundle than traditional frameworks  
✅ Easy customization  

### **Why Leaflet.js?**
✅ Lightweight (38KB gzipped)  
✅ Easy to learn & use  
✅ GeoJSON support out of the box  
✅ Mobile-friendly  
✅ Great documentation  

### **Why Vanilla JavaScript?**
✅ No framework overhead  
✅ Smaller bundle size  
✅ Better performance  
✅ Easier to maintain for small projects  
✅ Modern ES6+ features available  

---

## 📊 Performance Characteristics

| Metric | Value | Note |
|--------|-------|------|
| **Backend startup** | ~2-3 seconds | GeoJSON verification |
| **API response time** | ~200-500ms | Depends on file size |
| **Frontend load** | ~1-2 seconds | HTML/CSS/JS parsing |
| **Map render** | ~500ms-1s | GeoJSON features rendering |
| **Browser support** | 95%+ | All modern browsers |

---

## 🔐 Security Considerations

### **Current Setup**
- ✅ CORS enabled (allow cross-origin)
- ✅ Input validation on API
- ⚠️ No authentication (open access)
- ⚠️ No HTTPS (localhost only)

### **Production Considerations**
- 🔒 Add HTTPS/SSL certificates
- 🔒 Implement authentication (JWT, OAuth)
- 🔒 Add rate limiting
- 🔒 Validate all inputs
- 🔒 Use environment variables for secrets
- 🔒 Restrict CORS to specific domains

---

## 📚 References

**Backend:**
- Express.js: https://expressjs.com/
- Node.js: https://nodejs.org/

**Frontend:**
- Tailwind CSS: https://tailwindcss.com/
- Leaflet.js: https://leafletjs.com/
- Lucide Icons: https://lucide.dev/

**Data Processing:**
- GeoPandas: https://geopandas.org/
- NumPy: https://numpy.org/
- Pandas: https://pandas.pydata.org/
- Scikit-learn: https://scikit-learn.org/

---

## 🎯 Summary

**MarineEcoPredict** adalah aplikasi web full-stack yang menggunakan:
- **Backend**: Node.js/Express untuk API
- **Frontend**: HTML/CSS/JavaScript dengan Tailwind & Leaflet
- **Data**: GeoJSON files & JSON data
- **Processing**: Python/Jupyter untuk analisis

Semua teknologi dipilih untuk:
✅ Performance & scalability  
✅ Ease of development & maintenance  
✅ Modern standards & best practices  
✅ Mobile-friendly & responsive  
✅ Open-source & well-documented  

---

**Last Updated:** November 16, 2025

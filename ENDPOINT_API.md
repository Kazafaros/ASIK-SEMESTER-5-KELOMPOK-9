# 🔌 ENDPOINT UTAMA - MarineEcoPredict API

## 🚀 Base URL
```
http://localhost:3000
```

---

## 📋 DAFTAR SEMUA ENDPOINT

### **1️⃣ HEALTH CHECK**

#### GET `/api/health`
Check if API is running

**Request:**
```
GET http://localhost:3000/api/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-11-16T10:30:45.123Z"
}
```

---

### **2️⃣ HSI DATA ENDPOINTS**

#### GET `/api/hsi/available`
Get list of available HSI data (year-month combinations)

**Request:**
```
GET http://localhost:3000/api/hsi/available
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_months": 48,
    "data_range": {
      "start": "2021-01",
      "end": "2024-12"
    },
    "available_years": [2021, 2022, 2023, 2024],
    "months_per_year": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }
}
```

---

#### GET `/api/hsi?year=YYYY&month=M`
Get HSI GeoJSON data untuk tahun dan bulan tertentu

**Parameters:**
| Parameter | Type | Required | Range |
|-----------|------|----------|-------|
| `year` | Integer | ✅ Yes | 2021-2024 |
| `month` | Integer | ✅ Yes | 1-12 |

**Request Examples:**
```
GET http://localhost:3000/api/hsi?year=2021&month=1
GET http://localhost:3000/api/hsi?year=2024&month=12
GET http://localhost:3000/api/hsi?year=2023&month=6
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "hsi": 0.75,
          "sst": 28.5,
          "chlor_a": 1.2,
          "salinity": 32.0,
          "depth": 100
        },
        "geometry": {
          "type": "Point",
          "coordinates": [107.5, -6.5]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "hsi": 0.82,
          "sst": 29.1,
          "chlor_a": 1.5,
          "salinity": 31.8,
          "depth": 120
        },
        "geometry": {
          "type": "Point",
          "coordinates": [108.0, -6.2]
        }
      }
    ]
  },
  "metadata": {
    "year": 2021,
    "month": 1,
    "yearMonth": "2021-01"
  }
}
```

**Error Responses:**

**Missing Parameters (400):**
```json
{
  "success": false,
  "error": "Missing required parameters: year and month"
}
```

**Invalid Year (400):**
```json
{
  "success": false,
  "error": "Invalid year. Must be between 2021 and 2024"
}
```

**Invalid Month (400):**
```json
{
  "success": false,
  "error": "Invalid month. Must be between 1 and 12"
}
```

**File Not Found (404):**
```json
{
  "success": false,
  "error": "GeoJSON file not found"
}
```

---

### **3️⃣ METADATA ENDPOINT**

#### GET `/api/metadata`
Get metadata tentang semua available data

**Request:**
```
GET http://localhost:3000/api/metadata
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_months": 48,
    "data_range": {
      "start": "2021-01",
      "end": "2024-12"
    },
    "available_years": [2021, 2022, 2023, 2024],
    "data_directory": "data/geojson",
    "file_format": "GeoJSON",
    "projection": "EPSG:4326",
    "bbox": [95.0, -11.0, 141.0, -6.0],
    "features_per_file": 2500
  }
}
```

---

### **4️⃣ BIOGEOGRAPHY ENDPOINT** ⭐ NEW

#### GET `/api/biogeography/data?year=YYYY&month=M`
Get environmental parameters untuk biogeography prediction

**Parameters:**
| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `year` | Integer | ❌ No | 2024 |
| `month` | Integer | ❌ No | 1 |
| `lat` | Float | ❌ No | - |
| `lon` | Float | ❌ No | - |
| `radius` | Float | ❌ No | 0.5 |

**Request Examples:**
```
GET http://localhost:3000/api/biogeography/data
GET http://localhost:3000/api/biogeography/data?year=2024&month=1
GET http://localhost:3000/api/biogeography/data?year=2023&month=6&lat=-6.2&lon=107.5&radius=1.0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-11-16T10:30:45.123Z",
    "yearMonth": "2024-01",
    "parameters": {
      "hsi": {
        "mean": 0.65,
        "min": 0.10,
        "max": 0.95
      },
      "sst": {
        "mean": 27.8,
        "min": 22.5,
        "max": 31.2
      },
      "chlor_a": {
        "mean": 1.35,
        "min": 0.05,
        "max": 3.20
      },
      "salinity": {
        "mean": 31.9,
        "min": 30.5,
        "max": 33.2
      },
      "depth": {
        "mean": 125.5,
        "min": 20.0,
        "max": 500.0
      }
    },
    "dataPoints": 2500
  }
}
```

---

## 📊 MONTHLY PREDICTIONS ENDPOINTS

### **5️⃣ METADATA PREDIKSI**

#### GET `/api/monthly-predictions/metadata`
Get metadata tentang prediction model

**Request:**
```
GET http://localhost:3000/api/monthly-predictions/metadata
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "model_type": "ARIMA",
    "training_data": "2021-2024",
    "prediction_period": "2025-2028",
    "parameters": {
      "order": "(1,1,1)",
      "seasonal": "(1,1,1,12)"
    },
    "accuracy": "RMSE: 0.15",
    "created_at": "2025-11-01"
  }
}
```

---

### **6️⃣ AVAILABLE PREDICTIONS**

#### GET `/api/monthly-predictions/available`
Get daftar bulan-bulan yang tersedia untuk prediksi

**Request:**
```
GET http://localhost:3000/api/monthly-predictions/available
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "years": [2025, 2026, 2027, 2028],
    "months": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "total_periods": 48
  }
}
```

---

### **7️⃣ GET PREDICTION (Specific Month)**

#### GET `/api/monthly-predictions/:year/:month`
Get prediction untuk bulan tertentu

**Parameters:**
| Parameter | Type | Required | Range |
|-----------|------|----------|-------|
| `year` | Integer | ✅ Yes | 2025-2028 |
| `month` | Integer | ✅ Yes | 1-12 |

**Request Examples:**
```
GET http://localhost:3000/api/monthly-predictions/2025/1
GET http://localhost:3000/api/monthly-predictions/2026/6
GET http://localhost:3000/api/monthly-predictions/2028/12
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "2025-01",
    "year": 2025,
    "month": 1,
    "prediction": {
      "hsi_mean": 0.68,
      "hsi_std": 0.12,
      "hsi_min": 0.15,
      "hsi_max": 0.92,
      "confidence_interval_lower": 0.65,
      "confidence_interval_upper": 0.71
    },
    "environmental_forecast": {
      "sst_mean": 28.2,
      "chlor_a_mean": 1.42,
      "salinity_mean": 31.95
    },
    "status": "PREDICTED"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Prediction not found for 2025-13"
}
```

---

### **8️⃣ PREDICTION STATISTICS**

#### GET `/api/monthly-predictions/stats/:year/:month`
Get detailed statistics untuk prediction bulan tertentu

**Request:**
```
GET http://localhost:3000/api/monthly-predictions/stats/2025/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "2025-01",
    "statistics": {
      "mean": 0.68,
      "median": 0.69,
      "std_dev": 0.12,
      "variance": 0.0144,
      "skewness": -0.15,
      "kurtosis": 2.8,
      "min": 0.15,
      "max": 0.92,
      "quantile_25": 0.60,
      "quantile_50": 0.69,
      "quantile_75": 0.77
    }
  }
}
```

---

### **9️⃣ YEARLY STATISTICS**

#### GET `/api/monthly-predictions/yearly-stats/:year`
Get semua statistik untuk satu tahun penuh

**Request:**
```
GET http://localhost:3000/api/monthly-predictions/yearly-stats/2025
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "year": 2025,
    "total_months": 12,
    "monthly_predictions": [
      {
        "month": 1,
        "hsi_mean": 0.68,
        "hsi_std": 0.12
      },
      {
        "month": 2,
        "hsi_mean": 0.70,
        "hsi_std": 0.13
      }
    ],
    "yearly_mean": 0.69,
    "yearly_min": 0.60,
    "yearly_max": 0.76
  }
}
```

---

### **🔟 PREDICTION AT POINT**

#### GET `/api/monthly-predictions/point?lat=X&lon=Y&year=YYYY&month=M`
Get prediction untuk koordinat spesifik

**Parameters:**
| Parameter | Type | Required | Note |
|-----------|------|----------|------|
| `lat` | Float | ✅ Yes | Latitude (-11 to -6) |
| `lon` | Float | ✅ Yes | Longitude (95 to 141) |
| `year` | Integer | ✅ Yes | 2025-2028 |
| `month` | Integer | ✅ Yes | 1-12 |

**Request:**
```
GET http://localhost:3000/api/monthly-predictions/point?lat=-6.2&lon=107.5&year=2025&month=1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "coordinates": {
      "latitude": -6.2,
      "longitude": 107.5
    },
    "period": "2025-01",
    "prediction": {
      "hsi": 0.72,
      "confidence": 0.95,
      "status": "HIGH_PRODUCTIVITY"
    }
  }
}
```

---

### **1️⃣1️⃣ TREND AT POINT**

#### GET `/api/monthly-predictions/trend?lat=X&lon=Y&year=YYYY`
Get trend untuk lokasi tertentu sepanjang tahun

**Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `lat` | Float | ✅ Yes |
| `lon` | Float | ✅ Yes |
| `year` | Integer | ✅ Yes |

**Request:**
```
GET http://localhost:3000/api/monthly-predictions/trend?lat=-6.2&lon=107.5&year=2025
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "coordinates": {
      "latitude": -6.2,
      "longitude": 107.5
    },
    "year": 2025,
    "monthly_values": [
      { "month": 1, "hsi": 0.72 },
      { "month": 2, "hsi": 0.74 },
      { "month": 3, "hsi": 0.70 },
      { "month": 4, "hsi": 0.68 },
      { "month": 5, "hsi": 0.65 },
      { "month": 6, "hsi": 0.62 },
      { "month": 7, "hsi": 0.64 },
      { "month": 8, "hsi": 0.67 },
      { "month": 9, "hsi": 0.70 },
      { "month": 10, "hsi": 0.73 },
      { "month": 11, "hsi": 0.75 },
      { "month": 12, "hsi": 0.76 }
    ],
    "trend": "INCREASING",
    "seasonal_pattern": "HIGH_IN_SEASON_11_12"
  }
}
```

---

### **1️⃣2️⃣ SPATIAL BOUNDS**

#### GET `/api/monthly-predictions/bounds`
Get spatial bounds dari prediction data

**Request:**
```
GET http://localhost:3000/api/monthly-predictions/bounds
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "bounds": {
      "north": -6.0,
      "south": -11.0,
      "east": 141.0,
      "west": 95.0
    },
    "projection": "EPSG:4326",
    "area": "Indonesian Waters"
  }
}
```

---

### **1️⃣3️⃣ OCEANOGRAPHIC PARAMETERS**

#### GET `/api/monthly-predictions/oceanography`
Get info tentang oceanographic parameters

**Request:**
```
GET http://localhost:3000/api/monthly-predictions/oceanography
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "parameters": {
      "hsi": {
        "name": "Habitat Suitability Index",
        "unit": "0-1",
        "description": "Overall suitability for fish species",
        "optimal_range": [0.6, 0.95]
      },
      "sst": {
        "name": "Sea Surface Temperature",
        "unit": "°C",
        "description": "Water surface temperature",
        "typical_range": [22, 31]
      },
      "chlor_a": {
        "name": "Chlorophyll-a",
        "unit": "mg/m³",
        "description": "Primary productivity indicator",
        "optimal_range": [1.0, 2.5]
      },
      "salinity": {
        "name": "Salinity",
        "unit": "PSU",
        "description": "Water saltiness",
        "optimal_range": [31.5, 32.5]
      }
    }
  }
}
```

---

### **1️⃣4️⃣ PREDICTIONS HEALTH CHECK**

#### GET `/api/monthly-predictions/health`
Health check untuk prediction service

**Request:**
```
GET http://localhost:3000/api/monthly-predictions/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Monthly prediction service is running",
  "timestamp": "2025-11-16T10:30:45.123Z"
}
```

---

## 📊 QUICK REFERENCE TABLE

| No | Endpoint | Method | Purpose |
|---|---|---|---|
| 1 | `/api/health` | GET | Check API status |
| 2 | `/api/hsi/available` | GET | List available HSI data |
| 3 | `/api/hsi` | GET | Get HSI GeoJSON (year/month) |
| 4 | `/api/metadata` | GET | Get data metadata |
| 5 | `/api/biogeography/data` | GET | Get environment params |
| 6 | `/api/monthly-predictions/metadata` | GET | Model metadata |
| 7 | `/api/monthly-predictions/available` | GET | Available predictions |
| 8 | `/api/monthly-predictions/:year/:month` | GET | Single prediction |
| 9 | `/api/monthly-predictions/stats/:year/:month` | GET | Prediction stats |
| 10 | `/api/monthly-predictions/yearly-stats/:year` | GET | Yearly stats |
| 11 | `/api/monthly-predictions/point` | GET | Prediction at point |
| 12 | `/api/monthly-predictions/trend` | GET | Yearly trend |
| 13 | `/api/monthly-predictions/bounds` | GET | Spatial bounds |
| 14 | `/api/monthly-predictions/oceanography` | GET | Ocean parameters |
| 15 | `/api/monthly-predictions/health` | GET | Service health |

---

## 🧪 TESTING ENDPOINTS (dengan cURL)

### Test Health Check
```bash
curl http://localhost:3000/api/health
```

### Test Available Data
```bash
curl http://localhost:3000/api/hsi/available
```

### Test Get HSI Data
```bash
curl "http://localhost:3000/api/hsi?year=2024&month=1"
```

### Test Biogeography
```bash
curl "http://localhost:3000/api/biogeography/data?year=2024&month=1"
```

### Test Monthly Prediction
```bash
curl http://localhost:3000/api/monthly-predictions/2025/1
```

### Test Point Prediction
```bash
curl "http://localhost:3000/api/monthly-predictions/point?lat=-6.2&lon=107.5&year=2025&month=1"
```

---

## 📝 GENERAL RESPONSE FORMAT

### Success Response (200/201)
```json
{
  "success": true,
  "data": { /* actual data */ },
  "metadata": { /* optional metadata */ }
}
```

### Error Response (400/404/500)
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## 🔐 CORS & Authentication

### Current Setup
- ✅ CORS enabled (all origins)
- ✅ No authentication required
- ✅ No API keys needed
- ✅ No rate limiting

### Usage
```javascript
// JavaScript fetch example
fetch('http://localhost:3000/api/hsi?year=2024&month=1')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

---

## 📍 GEOGRAPHIC COVERAGE

**Area:** Indonesian Waters  
**Bounds:**
- **North:** -6.0°S
- **South:** -11.0°S
- **East:** 141.0°E
- **West:** 95.0°E

**Resolution:** ~1-2 km per point

---

## ⏱️ DATA AVAILABILITY

| Type | Years | Months | Total |
|------|-------|--------|-------|
| **Historical HSI** | 2021-2024 | All (1-12) | 48 months |
| **Predictions** | 2025-2028 | All (1-12) | 48 months |

---

**Last Updated:** November 16, 2025  
**Status:** ✅ All endpoints operational  
**Server:** http://localhost:3000

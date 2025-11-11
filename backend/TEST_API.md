# Testing API Endpoints

Setelah server berjalan, test endpoints berikut:

## 1. Health Check
```bash
curl http://localhost:3000/api/health
```

## 2. Get Available Data
```bash
curl http://localhost:3000/api/hsi/available
```

## 3. Get HSI Data (Example: January 2021)
```bash
curl http://localhost:3000/api/hsi?year=2021&month=1
```

## 4. Get Metadata
```bash
curl http://localhost:3000/api/metadata
```

## Expected Responses

### Health Check
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-11-11T..."
}
```

### Available Data
```json
{
  "success": true,
  "data": {
    "available": [...],
    "total": 48,
    "dateRange": {"start": "2021-01", "end": "2024-12"},
    "bounds": {...}
  }
}
```

### HSI Data
```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [...]
  },
  "metadata": {
    "year": 2021,
    "month": 1,
    "yearMonth": "2021-01"
  }
}
```


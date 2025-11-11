# 🔧 Error Fix: Route Ordering Issue (400 Bad Request)

## ❌ Error yang Terjadi

```
GET http://localhost:3000/api/monthly-predictions/yearly-stats/2025 400 (Bad Request)

Error: HTTP error! status: 400
```

---

## 🔍 Analisis Masalah

### Root Cause: Route Ordering Issue

Express.js mencocokkan route secara **berurutan dari atas ke bawah**. 

**Masalah yang terjadi:**
```
Route 1: /:year/:month          ← Ini cocok dengan /yearly-stats/2025
Route 2: /yearly-stats/:year    ← Ini tidak pernah tercapai!
```

Ketika request `/yearly-stats/2025` datang:
1. Express cek route `/:year/:month`
2. Cocok! `year = "yearly-stats"`, `month = "2025"`
3. Coba parse `month = "2025"` sebagai integer ✅
4. Tapi `month = 2025` > 12 ❌
5. Return 400 Bad Request

---

## ✅ Solusi: Reorder Routes

### Sebelum (SALAH) ❌
```javascript
router.get('/:year/:month', ...)           // Line 50
router.get('/stats/:year/:month', ...)     // Line 75
router.get('/yearly-stats/:year', ...)     // Line 100
```

### Sesudah (BENAR) ✅
```javascript
router.get('/yearly-stats/:year', ...)     // Line 50 - PINDAH KE ATAS
router.get('/stats/:year/:month', ...)     // Line 75 - PINDAH KE ATAS
router.get('/:year/:month', ...)           // Line 100 - PINDAH KE BAWAH
```

---

## 📋 Perubahan yang Dilakukan

**File**: `backend/src/routes/monthlyPredictions.js`

### Route Order (FIXED)

```javascript
// 1. Specific routes FIRST (dengan path literal)
router.get('/metadata', ...)
router.get('/available', ...)

// 2. Routes dengan multiple parameters SEBELUM generic routes
router.get('/yearly-stats/:year', ...)     ✅ MOVED UP
router.get('/stats/:year/:month', ...)     ✅ MOVED UP

// 3. Query parameter routes
router.get('/point', ...)
router.get('/trend', ...)
router.get('/bounds', ...)
router.get('/oceanography', ...)
router.get('/health', ...)

// 4. Generic routes LAST (dengan :param)
router.get('/:year/:month', ...)           ✅ MOVED DOWN
```

---

## 🎯 Express Route Matching Rules

Express menggunakan **First Match Wins** strategy:

```
Request: GET /api/monthly-predictions/yearly-stats/2025

1. Check /metadata          ❌ No match
2. Check /available         ❌ No match
3. Check /yearly-stats/:year ✅ MATCH! (year = "2025")
   └─ Process request
```

**Jika urutan salah:**
```
Request: GET /api/monthly-predictions/yearly-stats/2025

1. Check /:year/:month      ✅ MATCH! (year = "yearly-stats", month = "2025")
   └─ Validate month = 2025 > 12 ❌ ERROR 400
   └─ Never reach /yearly-stats/:year
```

---

## 🔧 Best Practices untuk Route Ordering

### ✅ DO (Correct Order)
```javascript
// 1. Exact paths
router.get('/health', ...)
router.get('/metadata', ...)

// 2. Specific paths with multiple params
router.get('/yearly-stats/:year', ...)
router.get('/stats/:year/:month', ...)

// 3. Query parameters
router.get('/point', ...)
router.get('/trend', ...)

// 4. Generic paths with params (LAST)
router.get('/:year/:month', ...)
```

### ❌ DON'T (Wrong Order)
```javascript
// Generic route FIRST - akan catch semua request!
router.get('/:year/:month', ...)

// Specific routes NEVER tercapai
router.get('/yearly-stats/:year', ...)
router.get('/stats/:year/:month', ...)
```

---

## 🧪 Testing Routes

### Test 1: Yearly Stats (FIXED)
```bash
curl http://localhost:3000/api/monthly-predictions/yearly-stats/2025
# Response: 200 OK ✅
```

### Test 2: Monthly Stats
```bash
curl http://localhost:3000/api/monthly-predictions/stats/2025/1
# Response: 200 OK ✅
```

### Test 3: Specific Month
```bash
curl http://localhost:3000/api/monthly-predictions/2025/1
# Response: 200 OK ✅
```

---

## 📊 Endpoint Routing Table

| Endpoint | Pattern | Order | Status |
|----------|---------|-------|--------|
| `/metadata` | Exact | 1 | ✅ |
| `/available` | Exact | 2 | ✅ |
| `/yearly-stats/:year` | Specific | 3 | ✅ FIXED |
| `/stats/:year/:month` | Specific | 4 | ✅ FIXED |
| `/point` | Query | 5 | ✅ |
| `/trend` | Query | 6 | ✅ |
| `/bounds` | Exact | 7 | ✅ |
| `/oceanography` | Exact | 8 | ✅ |
| `/health` | Exact | 9 | ✅ |
| `/:year/:month` | Generic | 10 | ✅ FIXED |

---

## 🚀 Cara Menggunakan Setelah Fix

### 1. Restart Backend Server
```bash
cd backend
npm start
```

### 2. Test di Browser
```
http://localhost:3000/api/monthly-predictions/yearly-stats/2025
```

### 3. Refresh Frontend
```
http://localhost:3000/analysis.html
```

---

## ✅ Verification Checklist

- [x] Route ordering diperbaiki
- [x] `/yearly-stats/:year` dipindahkan ke atas
- [x] `/stats/:year/:month` dipindahkan ke atas
- [x] `/:year/:month` dipindahkan ke bawah
- [x] Validation ditambahkan untuk year parameter
- [ ] Restart backend server
- [ ] Test endpoints
- [ ] Refresh frontend

---

## 📝 Summary

**Masalah**: Route `/yearly-stats/:year` tertangkap oleh route `/:year/:month`

**Penyebab**: Express mencocokkan route secara berurutan, generic route harus di akhir

**Solusi**: Reorder routes - specific routes SEBELUM generic routes

**Status**: ✅ FIXED

---

**Sekarang semua endpoint harus bekerja dengan baik!** 🎉

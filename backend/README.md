# Backend Node.js - API Server

Backend untuk serve GeoJSON files yang dihasilkan dari Jupyter processing.

## Setup

### Install Dependencies

```bash
npm install
```

### Required Packages:
- `express` - Web framework
- `cors` - CORS middleware
- `fs-extra` - File operations

## Project Structure

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
├── package.json
└── README.md
```

## API Endpoints

### `GET /api/health`
Health check endpoint

### `GET /api/hsi/available`
Get list of available HSI data (year-month combinations)

**Response:**
```json
{
  "success": true,
  "data": {
    "available": [
      {"year": 2021, "month": 1, "file": "hsi_2021_01.geojson", "features": 812},
      ...
    ],
    "total": 48,
    "dateRange": {"start": "2021-01", "end": "2024-12"},
    "bounds": {...}
  }
}
```

### `GET /api/hsi?year=2021&month=1`
Get HSI GeoJSON for specific year and month

**Parameters:**
- `year` (required): Year (2021-2024)
- `month` (required): Month (1-12)

**Response:**
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

### `GET /api/metadata`
Get full metadata.json

## Usage

```bash
npm start
```

Server will run on `http://localhost:3000`

## Environment Variables

- `PORT`: Server port (default: 3000)


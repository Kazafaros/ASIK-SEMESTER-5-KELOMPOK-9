# Jupyter Notebooks - Data Processing

Folder ini berisi notebook Jupyter untuk processing data NetCDF menjadi GeoJSON.

## Setup Environment

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Required Libraries:
- `netCDF4` - Untuk membaca file NetCDF
- `numpy` - Array operations
- `pandas` - Data manipulation
- `matplotlib` - Visualization
- `xarray` - Advanced NetCDF handling (optional)
- `geopandas` - GeoJSON creation
- `geojson` - GeoJSON format
- `scipy` - Scientific computing (interpolation, etc)

## Notebooks

### 01_data_exploration.ipynb
- Eksplorasi struktur file NetCDF
- Analisis dimensi, variabel, dan range data
- Visualisasi sample data
- Menentukan bounding box

### (Coming Soon)
- 02_data_preprocessing.ipynb - Preprocessing data
- 03_hsi_calculation.ipynb - Perhitungan HSI
- 04_monthly_aggregation.ipynb - Agregasi bulanan
- 05_geojson_export.ipynb - Export ke GeoJSON

## File Structure

```
jupyter/
├── 01_data_exploration.ipynb
├── requirements.txt
└── README.md
```

## Usage

1. Buka Jupyter Notebook:
```bash
jupyter notebook
```

2. Buka `01_data_exploration.ipynb`

3. Jalankan semua cells untuk eksplorasi data

## Notes

- File NetCDF harus berada di parent directory (`../`)
- Output akan disimpan di `../data/geojson/`


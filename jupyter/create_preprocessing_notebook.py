import json

# Create preprocessing notebook
notebook = {
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# Fase 2: Data Preprocessing\n",
                "\n",
                "Notebook ini untuk preprocessing data NetCDF sebelum perhitungan HSI.\n",
                "\n",
                "## Langkah-langkah:\n",
                "1. Load data NetCDF\n",
                "2. Konversi SST: Kelvin → Celcius\n",
                "3. Ekstrak surface salinity (depth=0)\n",
                "4. Resample ke grid seragam\n",
                "5. Crop ke bounding box Selat Sunda\n",
                "6. Handle missing values\n",
                "7. Save processed data"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 1. Import Libraries & Setup"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "import netCDF4\n",
                "import numpy as np\n",
                "import pandas as pd\n",
                "from scipy.interpolate import griddata\n",
                "from datetime import datetime\n",
                "import os\n",
                "import warnings\n",
                "warnings.filterwarnings('ignore')\n",
                "\n",
                "print(\"Libraries imported successfully!\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 2. Define Configuration"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Bounding Box Selat Sunda (dari eksplorasi)\n",
                "# Akan diupdate setelah menjalankan notebook eksplorasi\n",
                "BBOX = {\n",
                "    'lat_min': -6.7750,   # dari SST (paling luas)\n",
                "    'lat_max': -5.4750,   # dari SST\n",
                "    'lon_min': 104.5625,  # dari CHL\n",
                "    'lon_max': 105.9375   # dari CHL\n",
                "}\n",
                "\n",
                "# Target grid resolution (derajat)\n",
                "# Pilih resolusi yang sesuai (0.05° ~ 5.5 km atau 0.1° ~ 11 km)\n",
                "TARGET_RESOLUTION = 0.05  # derajat\n",
                "\n",
                "# File paths\n",
                "CHL_FILE = '../CHL 21-24.nc'\n",
                "SST_FILE = '../SST 21-24.nc'\n",
                "SO_FILE = '../SO 21-24.nc'\n",
                "\n",
                "# Output directory\n",
                "OUTPUT_DIR = '../data/processed'\n",
                "os.makedirs(OUTPUT_DIR, exist_ok=True)\n",
                "\n",
                "print(f\"Bounding Box: {BBOX}\")\n",
                "print(f\"Target Resolution: {TARGET_RESOLUTION}° (~{TARGET_RESOLUTION*111:.1f} km)\")\n",
                "print(f\"Output directory: {OUTPUT_DIR}\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 3. Create Target Grid"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Create uniform grid untuk target resolution\n",
                "lat_grid = np.arange(BBOX['lat_min'], BBOX['lat_max'] + TARGET_RESOLUTION, TARGET_RESOLUTION)\n",
                "lon_grid = np.arange(BBOX['lon_min'], BBOX['lon_max'] + TARGET_RESOLUTION, TARGET_RESOLUTION)\n",
                "\n",
                "# Create meshgrid\n",
                "lon_mesh, lat_mesh = np.meshgrid(lon_grid, lat_grid)\n",
                "\n",
                "print(f\"Target grid size: {len(lat_grid)} x {len(lon_grid)} = {len(lat_grid) * len(lon_grid)} points\")\n",
                "print(f\"Latitude range: {lat_grid.min():.4f} to {lat_grid.max():.4f}\")\n",
                "print(f\"Longitude range: {lon_grid.min():.4f} to {lon_grid.max():.4f}\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 4. Load & Preprocess CHL Data"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "print(\"=== Processing CHL Data ===\")\n",
                "nc_chl = netCDF4.Dataset(CHL_FILE, 'r')\n",
                "\n",
                "# Get coordinates\n",
                "lat_chl = nc_chl.variables['latitude'][:]\n",
                "lon_chl = nc_chl.variables['longitude'][:]\n",
                "time_chl = nc_chl.variables['time'][:]\n",
                "chl_data = nc_chl.variables['CHL']\n",
                "\n",
                "print(f\"Original CHL shape: {chl_data.shape}\")\n",
                "print(f\"Time steps: {len(time_chl)}\")\n",
                "\n",
                "# Get time units for date conversion\n",
                "time_units = nc_chl.variables['time'].units\n",
                "print(f\"Time units: {time_units}\")\n",
                "\n",
                "# Create meshgrid for original data\n",
                "lon_chl_2d, lat_chl_2d = np.meshgrid(lon_chl, lat_chl)\n",
                "\n",
                "# Flatten for interpolation\n",
                "points_chl = np.column_stack((lon_chl_2d.ravel(), lat_chl_2d.ravel()))\n",
                "\n",
                "print(f\"CHL data loaded. Ready for resampling.\")\n",
                "nc_chl.close()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 5. Load & Preprocess SST Data (Convert Kelvin to Celcius)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "print(\"=== Processing SST Data ===\")\n",
                "nc_sst = netCDF4.Dataset(SST_FILE, 'r')\n",
                "\n",
                "# Get coordinates\n",
                "lat_sst = nc_sst.variables['latitude'][:]\n",
                "lon_sst = nc_sst.variables['longitude'][:]\n",
                "time_sst = nc_sst.variables['time'][:]\n",
                "sst_data_k = nc_sst.variables['analysed_sst']  # in Kelvin\n",
                "\n",
                "print(f\"Original SST shape: {sst_data_k.shape}\")\n",
                "print(f\"Time steps: {len(time_sst)}\")\n",
                "\n",
                "# Create meshgrid for original data\n",
                "lon_sst_2d, lat_sst_2d = np.meshgrid(lon_sst, lat_sst)\n",
                "\n",
                "# Flatten for interpolation\n",
                "points_sst = np.column_stack((lon_sst_2d.ravel(), lat_sst_2d.ravel()))\n",
                "\n",
                "print(f\"SST data loaded. Will convert Kelvin → Celcius during resampling.\")\n",
                "nc_sst.close()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 6. Load & Preprocess Salinity Data (Extract Surface Layer)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "print(\"=== Processing Salinity Data ===\")\n",
                "nc_so = netCDF4.Dataset(SO_FILE, 'r')\n",
                "\n",
                "# Get coordinates\n",
                "lat_so = nc_so.variables['latitude'][:]\n",
                "lon_so = nc_so.variables['longitude'][:]\n",
                "time_so = nc_so.variables['time'][:]\n",
                "depth_so = nc_so.variables['depth'][:]\n",
                "so_data = nc_so.variables['so']  # [time, depth, lat, lon]\n",
                "\n",
                "print(f\"Original Salinity shape: {so_data.shape}\")\n",
                "print(f\"Depth levels: {len(depth_so)}\")\n",
                "print(f\"Surface depth (first level): {depth_so[0]:.2f} m\")\n",
                "\n",
                "# Extract surface salinity (depth index 0)\n",
                "surface_so = so_data[:, 0, :, :]  # [time, lat, lon]\n",
                "print(f\"Surface salinity shape: {surface_so.shape}\")\n",
                "\n",
                "# Create meshgrid for original data\n",
                "lon_so_2d, lat_so_2d = np.meshgrid(lon_so, lat_so)\n",
                "\n",
                "# Flatten for interpolation\n",
                "points_so = np.column_stack((lon_so_2d.ravel(), lat_so_2d.ravel()))\n",
                "\n",
                "print(f\"Surface salinity extracted. Ready for resampling.\")\n",
                "nc_so.close()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 7. Resample & Interpolate Data to Target Grid"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "def resample_to_grid(data_2d, points_orig, lon_target, lat_target, method='linear'):\n",
                "    \"\"\"\n",
                "    Resample 2D data to target grid using interpolation\n",
                "    \n",
                "    Parameters:\n",
                "    - data_2d: 2D array [lat, lon] dari data original\n",
                "    - points_orig: array [N, 2] dengan (lon, lat) dari data original\n",
                "    - lon_target, lat_target: target grid coordinates\n",
                "    - method: interpolation method ('linear', 'nearest', 'cubic')\n",
                "    \n",
                "    Returns:\n",
                "    - resampled_data: 2D array dengan shape sesuai target grid\n",
                "    \"\"\"\n",
                "    # Flatten target grid\n",
                "    points_target = np.column_stack((lon_target.ravel(), lat_target.ravel()))\n",
                "    \n",
                "    # Flatten original data\n",
                "    values_orig = data_2d.ravel()\n",
                "    \n",
                "    # Remove NaN values\n",
                "    valid_mask = ~np.isnan(values_orig)\n",
                "    if np.sum(valid_mask) == 0:\n",
                "        return np.full(lon_target.shape, np.nan)\n",
                "    \n",
                "    points_valid = points_orig[valid_mask]\n",
                "    values_valid = values_orig[valid_mask]\n",
                "    \n",
                "    # Interpolate\n",
                "    values_interp = griddata(\n",
                "        points_valid,\n",
                "        values_valid,\n",
                "        points_target,\n",
                "        method=method,\n",
                "        fill_value=np.nan\n",
                "    )\n",
                "    \n",
                "    # Reshape to target grid\n",
                "    resampled = values_interp.reshape(lon_target.shape)\n",
                "    \n",
                "    return resampled\n",
                "\n",
                "print(\"Resampling function defined.\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 8. Process All Time Steps (Sample: First 10 Days)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Process sample (first 10 days) untuk testing\n",
                "# Setelah berhasil, bisa diubah ke semua time steps\n",
                "SAMPLE_SIZE = 10  # Ubah ke None untuk process semua\n",
                "\n",
                "# Reopen files\n",
                "nc_chl = netCDF4.Dataset(CHL_FILE, 'r')\n",
                "nc_sst = netCDF4.Dataset(SST_FILE, 'r')\n",
                "nc_so = netCDF4.Dataset(SO_FILE, 'r')\n",
                "\n",
                "chl_data = nc_chl.variables['CHL']\n",
                "sst_data_k = nc_sst.variables['analysed_sst']\n",
                "so_data = nc_so.variables['so']\n",
                "\n",
                "# Get number of time steps\n",
                "n_times = len(time_chl)\n",
                "if SAMPLE_SIZE:\n",
                "    n_times = min(SAMPLE_SIZE, n_times)\n",
                "\n",
                "print(f\"Processing {n_times} time steps...\")\n",
                "\n",
                "# Initialize arrays untuk processed data\n",
                "processed_chl = np.full((n_times, len(lat_grid), len(lon_grid)), np.nan)\n",
                "processed_sst = np.full((n_times, len(lat_grid), len(lon_grid)), np.nan)\n",
                "processed_so = np.full((n_times, len(lat_grid), len(lon_grid)), np.nan)\n",
                "\n",
                "# Process each time step\n",
                "for t in range(n_times):\n",
                "    if (t + 1) % 10 == 0 or t == 0:\n",
                "        print(f\"Processing time step {t+1}/{n_times}...\")\n",
                "    \n",
                "    # CHL\n",
                "    chl_2d = chl_data[t, :, :]\n",
                "    processed_chl[t, :, :] = resample_to_grid(chl_2d, points_chl, lon_mesh, lat_mesh)\n",
                "    \n",
                "    # SST (convert Kelvin to Celcius)\n",
                "    sst_2d_k = sst_data_k[t, :, :]\n",
                "    sst_2d_c = sst_2d_k - 273.15  # Convert to Celcius\n",
                "    processed_sst[t, :, :] = resample_to_grid(sst_2d_c, points_sst, lon_mesh, lat_mesh)\n",
                "    \n",
                "    # Salinity (surface)\n",
                "    so_2d = so_data[t, 0, :, :]  # surface layer\n",
                "    processed_so[t, :, :] = resample_to_grid(so_2d, points_so, lon_mesh, lat_mesh)\n",
                "\n",
                "print(f\"\\nProcessing complete!\")\n",
                "print(f\"Processed data shape: {processed_chl.shape}\")\n",
                "\n",
                "# Close files\n",
                "nc_chl.close()\n",
                "nc_sst.close()\n",
                "nc_so.close()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 9. Data Quality Check"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Check data quality\n",
                "print(\"=== Data Quality Check ===\")\n",
                "\n",
                "# CHL\n",
                "valid_chl = ~np.isnan(processed_chl)\n",
                "chl_valid_pct = np.sum(valid_chl) / processed_chl.size * 100\n",
                "print(f\"\\nCHL:\")\n",
                "print(f\"  Valid data: {chl_valid_pct:.1f}%\")\n",
                "if np.any(valid_chl):\n",
                "    print(f\"  Range: {np.nanmin(processed_chl):.4f} to {np.nanmax(processed_chl):.4f} mg/m³\")\n",
                "    print(f\"  Mean: {np.nanmean(processed_chl):.4f} mg/m³\")\n",
                "\n",
                "# SST\n",
                "valid_sst = ~np.isnan(processed_sst)\n",
                "sst_valid_pct = np.sum(valid_sst) / processed_sst.size * 100\n",
                "print(f\"\\nSST:\")\n",
                "print(f\"  Valid data: {sst_valid_pct:.1f}%\")\n",
                "if np.any(valid_sst):\n",
                "    print(f\"  Range: {np.nanmin(processed_sst):.2f} to {np.nanmax(processed_sst):.2f} °C\")\n",
                "    print(f\"  Mean: {np.nanmean(processed_sst):.2f} °C\")\n",
                "\n",
                "# Salinity\n",
                "valid_so = ~np.isnan(processed_so)\n",
                "so_valid_pct = np.sum(valid_so) / processed_so.size * 100\n",
                "print(f\"\\nSalinity:\")\n",
                "print(f\"  Valid data: {so_valid_pct:.1f}%\")\n",
                "if np.any(valid_so):\n",
                "    print(f\"  Range: {np.nanmin(processed_so):.2f} to {np.nanmax(processed_so):.2f} PSU\")\n",
                "    print(f\"  Mean: {np.nanmean(processed_so):.2f} PSU\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 10. Save Processed Data"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Save processed data as numpy arrays\n",
                "# Format: [time, lat, lon]\n",
                "\n",
                "np.savez_compressed(\n",
                "    f\"{OUTPUT_DIR}/processed_data_sample.npz\",\n",
                "    chl=processed_chl,\n",
                "    sst=processed_sst,\n",
                "    salinity=processed_so,\n",
                "    lat_grid=lat_grid,\n",
                "    lon_grid=lon_grid,\n",
                "    time_indices=np.arange(n_times)\n",
                ")\n",
                "\n",
                "print(f\"Processed data saved to {OUTPUT_DIR}/processed_data_sample.npz\")\n",
                "print(f\"\\nData shape: {processed_chl.shape}\")\n",
                "print(f\"Grid size: {len(lat_grid)} x {len(lon_grid)}\")\n",
                "print(f\"Time steps: {n_times}\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 11. Summary & Next Steps"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "print(\"=== PREPROCESSING SUMMARY ===\")\n",
                "print(\"\\n✅ Data preprocessing completed!\")\n",
                "print(\"\\nWhat was done:\")\n",
                "print(\"1. ✅ SST converted: Kelvin → Celcius\")\n",
                "print(\"2. ✅ Surface salinity extracted (depth=0)\")\n",
                "print(\"3. ✅ All data resampled to uniform grid ({TARGET_RESOLUTION}°)\")\n",
                "print(\"4. ✅ Data cropped to bounding box\")\n",
                "print(\"5. ✅ Missing values handled (NaN)\")\n",
                "print(\"\\nNext Steps:\")\n",
                "print(\"- Fase 3: HSI Calculation\")\n",
                "print(\"  - Calculate HSI_CHL, HSI_SST, HSI_SO\")\n",
                "print(\"  - Calculate HSI_total = (HSI_CHL × HSI_SST × HSI_SO)^(1/3)\")\n",
                "print(\"\\nNote: This was a sample run ({n_times} time steps).\")\n",
                "print(\"To process all data, set SAMPLE_SIZE = None in cell 8.\")"
            ]
        }
    ],
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "name": "python",
            "version": "3.11.0"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 4
}

# Write notebook to file
with open('02_data_preprocessing.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1, ensure_ascii=False)

print("Preprocessing notebook created successfully!")


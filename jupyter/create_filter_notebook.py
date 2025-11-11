import json

# Create filter land points notebook
notebook = {
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# Filter Daratan dari GeoJSON\n",
                "\n",
                "Notebook ini untuk filter titik-titik daratan dari GeoJSON menggunakan data batimetri.\n",
                "\n",
                "## Langkah-langkah:\n",
                "1. Load data batimetri\n",
                "2. Resample batimetri ke grid yang sama dengan HSI data\n",
                "3. Filter GeoJSON: hanya export points dengan elevation <= 0 (lautan)\n",
                "4. Re-export GeoJSON tanpa daratan"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 1. Import Libraries & Load Data"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "import numpy as np\n",
                "import netCDF4\n",
                "import json\n",
                "import os\n",
                "from scipy.interpolate import griddata\n",
                "import warnings\n",
                "warnings.filterwarnings('ignore')\n",
                "\n",
                "print(\"Libraries imported successfully!\")"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# File paths\n",
                "BATIMETRI_FILE = '../BatimetriSelatSunda.nc'\n",
                "MONTHLY_DATA_FILE = '../data/processed/monthly_hsi_data.npz'\n",
                "GEOJSON_DIR = '../data/geojson'\n",
                "\n",
                "# Load monthly data untuk mendapatkan grid coordinates\n",
                "monthly_data = np.load(MONTHLY_DATA_FILE)\n",
                "lat_grid = monthly_data['lat_grid']\n",
                "lon_grid = monthly_data['lon_grid']\n",
                "months = monthly_data['months']\n",
                "\n",
                "if isinstance(months, np.ndarray):\n",
                "    months = months.tolist()\n",
                "\n",
                "print(f\"✅ Monthly data loaded!\")\n",
                "print(f\"Grid: {len(lat_grid)} x {len(lon_grid)}\")\n",
                "print(f\"Months: {len(months)}\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 2. Load & Resample Batimetri Data"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Load batimetri data\n",
                "nc_batimetri = netCDF4.Dataset(BATIMETRI_FILE, 'r')\n",
                "\n",
                "# Get variables\n",
                "lat_bat = nc_batimetri.variables['lat'][:]\n",
                "lon_bat = nc_batimetri.variables['lon'][:]\n",
                "elevation = nc_batimetri.variables['elevation'][:]\n",
                "\n",
                "print(f\"✅ Batimetri data loaded!\")\n",
                "print(f\"Original grid: {len(lat_bat)} x {len(lon_bat)}\")\n",
                "print(f\"Elevation range: {np.nanmin(elevation):.1f} to {np.nanmax(elevation):.1f} m\")\n",
                "print(f\"  (Negative = lautan, Positive = daratan)\")\n",
                "\n",
                "# Create meshgrid for original batimetri\n",
                "lon_bat_mesh, lat_bat_mesh = np.meshgrid(lon_bat, lat_bat)\n",
                "\n",
                "# Flatten for interpolation\n",
                "points_bat = np.column_stack((lon_bat_mesh.ravel(), lat_bat_mesh.ravel()))\n",
                "values_bat = elevation.ravel()\n",
                "\n",
                "# Create target grid (same as HSI data)\n",
                "lon_target_mesh, lat_target_mesh = np.meshgrid(lon_grid, lat_grid)\n",
                "points_target = np.column_stack((lon_target_mesh.ravel(), lat_target_mesh.ravel()))\n",
                "\n",
                "# Interpolate batimetri to target grid\n",
                "print(f\"\\nInterpolating batimetri to target grid...\")\n",
                "elevation_resampled = griddata(\n",
                "    points_bat,\n",
                "    values_bat,\n",
                "    points_target,\n",
                "    method='linear',\n",
                "    fill_value=np.nan\n",
                ")\n",
                "\n",
                "elevation_resampled = elevation_resampled.reshape(lon_target_mesh.shape)\n",
                "\n",
                "print(f\"✅ Batimetri resampled!\")\n",
                "print(f\"Resampled elevation range: {np.nanmin(elevation_resampled):.1f} to {np.nanmax(elevation_resampled):.1f} m\")\n",
                "print(f\"Points in ocean (elevation <= 0): {np.sum(elevation_resampled <= 0)} / {elevation_resampled.size}\")\n",
                "print(f\"Points on land (elevation > 0): {np.sum(elevation_resampled > 0)} / {elevation_resampled.size}\")\n",
                "\n",
                "nc_batimetri.close()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 3. Filter GeoJSON Files (Remove Land Points)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "import time\n",
                "\n",
                "# Create mask: True for ocean points (elevation <= 0), False for land\n",
                "ocean_mask = elevation_resampled <= 0\n",
                "\n",
                "print(f\"=== Filtering GeoJSON Files ===\")\n",
                "print(f\"Ocean mask: {np.sum(ocean_mask)} ocean points, {np.sum(~ocean_mask)} land points\")\n",
                "\n",
                "# Create meshgrid for coordinates\n",
                "lon_mesh, lat_mesh = np.meshgrid(lon_grid, lat_grid)\n",
                "\n",
                "start_time = time.time()\n",
                "filtered_files = []\n",
                "\n",
                "for i, month_str in enumerate(months):\n",
                "    # Load original GeoJSON\n",
                "    filename = f\"hsi_{month_str.replace('-', '_')}.geojson\"\n",
                "    filepath = os.path.join(GEOJSON_DIR, filename)\n",
                "    \n",
                "    if not os.path.exists(filepath):\n",
                "        print(f\"⚠️  File not found: {filename}\")\n",
                "        continue\n",
                "    \n",
                "    with open(filepath, 'r', encoding='utf-8') as f:\n",
                "        geojson = json.load(f)\n",
                "    \n",
                "    # Filter features: only keep ocean points\n",
                "    filtered_features = []\n",
                "    \n",
                "    for feature in geojson['features']:\n",
                "        coords = feature['geometry']['coordinates']\n",
                "        lon = coords[0]\n",
                "        lat = coords[1]\n",
                "        \n",
                "        # Find closest grid point\n",
                "        lat_idx = np.argmin(np.abs(lat_grid - lat))\n",
                "        lon_idx = np.argmin(np.abs(lon_grid - lon))\n",
                "        \n",
                "        # Check if point is in ocean\n",
                "        if ocean_mask[lat_idx, lon_idx]:\n",
                "            filtered_features.append(feature)\n",
                "    \n",
                "    # Create filtered GeoJSON\n",
                "    filtered_geojson = {\n",
                "        \"type\": \"FeatureCollection\",\n",
                "        \"features\": filtered_features\n",
                "    }\n",
                "    \n",
                "    # Save filtered GeoJSON (overwrite original)\n",
                "    with open(filepath, 'w', encoding='utf-8') as f:\n",
                "        json.dump(filtered_geojson, f, indent=2, ensure_ascii=False)\n",
                "    \n",
                "    filtered_files.append({\n",
                "        'month': month_str,\n",
                "        'original_features': len(geojson['features']),\n",
                "        'filtered_features': len(filtered_features),\n",
                "        'removed': len(geojson['features']) - len(filtered_features)\n",
                "    })\n",
                "    \n",
                "    if (i + 1) % 6 == 0 or i == 0:\n",
                "        print(f\"  Filtered {i+1}/{len(months)}: {month_str} ({len(filtered_features)}/{len(geojson['features'])} features)\")\n",
                "\n",
                "elapsed = time.time() - start_time\n",
                "print(f\"\\n✅ Filtering complete in {elapsed:.1f}s!\")\n",
                "print(f\"\\nSummary:\")\n",
                "total_original = sum(f['original_features'] for f in filtered_files)\n",
                "total_filtered = sum(f['filtered_features'] for f in filtered_files)\n",
                "total_removed = sum(f['removed'] for f in filtered_files)\n",
                "print(f\"  Total original features: {total_original:,}\")\n",
                "print(f\"  Total filtered features: {total_filtered:,}\")\n",
                "print(f\"  Total removed (land): {total_removed:,} ({100*total_removed/total_original:.1f}%)\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 4. Update Metadata"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Update metadata\n",
                "metadata_file = os.path.join(GEOJSON_DIR, 'metadata.json')\n",
                "\n",
                "with open(metadata_file, 'r', encoding='utf-8') as f:\n",
                "    metadata = json.load(f)\n",
                "\n",
                "# Update available_data with filtered feature counts\n",
                "for item in metadata['available_data']:\n",
                "    month_str = f\"{item['year']}-{str(item['month']).zfill(2)}\"\n",
                "    filtered_info = next((f for f in filtered_files if f['month'] == month_str), None)\n",
                "    if filtered_info:\n",
                "        item['features'] = filtered_info['filtered_features']\n",
                "        item['original_features'] = filtered_info['original_features']\n",
                "        item['land_points_removed'] = filtered_info['removed']\n",
                "\n",
                "# Add filter info to metadata\n",
                "metadata['filter_applied'] = {\n",
                "    'description': 'Land points filtered using bathymetry data',\n",
                "    'threshold': 'elevation <= 0 (ocean only)',\n",
                "    'total_land_points_removed': int(total_removed)\n",
                "}\n",
                "\n",
                "# Save updated metadata\n",
                "with open(metadata_file, 'w', encoding='utf-8') as f:\n",
                "    json.dump(metadata, f, indent=2, ensure_ascii=False)\n",
                "\n",
                "print(f\"✅ Metadata updated!\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 5. Summary"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "print(\"=== FILTERING SUMMARY ===\")\n",
                "print(\"\\n✅ Land points filtered successfully!\")\n",
                "print(\"\\nWhat was done:\")\n",
                "print(\"1. ✅ Loaded batimetri data\")\n",
                "print(\"2. ✅ Resampled batimetri to HSI grid\")\n",
                "print(\"3. ✅ Filtered all GeoJSON files (removed land points)\")\n",
                "print(\"4. ✅ Updated metadata\")\n",
                "print(\"\\nResult:\")\n",
                "print(f\"  - {len(filtered_files)} GeoJSON files filtered\")\n",
                "print(f\"  - {total_removed:,} land points removed\")\n",
                "print(f\"  - {total_filtered:,} ocean points remaining\")\n",
                "print(\"\\nNext Steps:\")\n",
                "print(\"- Refresh frontend to see filtered data\")\n",
                "print(\"- Map will now only show ocean points\")"
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
with open('06_filter_land_points.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1, ensure_ascii=False)

print("Filter notebook created successfully!")


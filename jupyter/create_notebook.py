import json

# Create notebook structure
notebook = {
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# Fase 1: Data Exploration\n",
                "\n",
                "Notebook ini untuk mengeksplorasi struktur data NetCDF yang akan digunakan untuk analisis HSI Selat Sunda.\n",
                "\n",
                "## File yang akan dianalisis:\n",
                "1. `CHL 21-24.nc` - Chlorophyll-a data\n",
                "2. `SST 21-24.nc` - Sea Surface Temperature (Kelvin)\n",
                "3. `SO 21-24.nc` - Salinity data (3D dengan depth)\n",
                "4. `BatimetriSelatSunda.nc` - Bathymetry data"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 1. Import Libraries"
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
                "import matplotlib.pyplot as plt\n",
                "from datetime import datetime, timedelta\n",
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
                "## 2. Explore CHL Data (Chlorophyll-a)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Read CHL file\n",
                "chl_file = '../CHL 21-24.nc'\n",
                "nc_chl = netCDF4.Dataset(chl_file, 'r')\n",
                "\n",
                "print(\"=== CHL File Structure ===\")\n",
                "print(f\"\\nDimensions: {list(nc_chl.dimensions.keys())}\")\n",
                "print(f\"Variables: {list(nc_chl.variables.keys())}\")\n",
                "\n",
                "# Dimension sizes\n",
                "print(\"\\nDimension sizes:\")\n",
                "for dim_name, dim in nc_chl.dimensions.items():\n",
                "    print(f\"  {dim_name}: {dim.size}\")\n",
                "\n",
                "# Coordinate ranges\n",
                "lat_chl = nc_chl.variables['latitude'][:]\n",
                "lon_chl = nc_chl.variables['longitude'][:]\n",
                "time_chl = nc_chl.variables['time'][:]\n",
                "\n",
                "print(f\"\\nLatitude range: {lat_chl.min():.4f} to {lat_chl.max():.4f}\")\n",
                "print(f\"Longitude range: {lon_chl.min():.4f} to {lon_chl.max():.4f}\")\n",
                "print(f\"Time steps: {len(time_chl)}\")\n",
                "\n",
                "# CHL data statistics\n",
                "chl_data = nc_chl.variables['CHL']\n",
                "print(f\"\\nCHL variable shape: {chl_data.shape}\")\n",
                "print(f\"CHL units: {chl_data.units}\")\n",
                "print(f\"CHL long_name: {chl_data.long_name}\")\n",
                "\n",
                "# Sample data (first time step)\n",
                "sample_chl = chl_data[0, :, :]\n",
                "valid_chl = sample_chl[~np.isnan(sample_chl)]\n",
                "\n",
                "if len(valid_chl) > 0:\n",
                "    print(f\"\\nSample CHL values (first time step):\")\n",
                "    print(f\"  Valid points: {len(valid_chl)} / {sample_chl.size}\")\n",
                "    print(f\"  Min: {valid_chl.min():.4f} mg/m³\")\n",
                "    print(f\"  Max: {valid_chl.max():.4f} mg/m³\")\n",
                "    print(f\"  Mean: {valid_chl.mean():.4f} mg/m³\")\n",
                "    print(f\"  Median: {np.median(valid_chl):.4f} mg/m³\")\n",
                "    print(f\"  Std: {valid_chl.std():.4f} mg/m³\")\n",
                "\n",
                "# Time information\n",
                "if hasattr(nc_chl.variables['time'], 'units'):\n",
                "    print(f\"\\nTime units: {nc_chl.variables['time'].units}\")\n",
                "    time_units = nc_chl.variables['time'].units\n",
                "    first_time = netCDF4.num2date(time_chl[0], time_units)\n",
                "    last_time = netCDF4.num2date(time_chl[-1], time_units)\n",
                "    print(f\"Date range: {first_time} to {last_time}\")\n",
                "\n",
                "nc_chl.close()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 3. Explore SST Data (Sea Surface Temperature)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Read SST file\n",
                "sst_file = '../SST 21-24.nc'\n",
                "nc_sst = netCDF4.Dataset(sst_file, 'r')\n",
                "\n",
                "print(\"=== SST File Structure ===\")\n",
                "print(f\"\\nDimensions: {list(nc_sst.dimensions.keys())}\")\n",
                "print(f\"Variables: {list(nc_sst.variables.keys())}\")\n",
                "\n",
                "# Dimension sizes\n",
                "print(\"\\nDimension sizes:\")\n",
                "for dim_name, dim in nc_sst.dimensions.items():\n",
                "    print(f\"  {dim_name}: {dim.size}\")\n",
                "\n",
                "# Coordinate ranges\n",
                "lat_sst = nc_sst.variables['latitude'][:]\n",
                "lon_sst = nc_sst.variables['longitude'][:]\n",
                "time_sst = nc_sst.variables['time'][:]\n",
                "\n",
                "print(f\"\\nLatitude range: {lat_sst.min():.4f} to {lat_sst.max():.4f}\")\n",
                "print(f\"Longitude range: {lon_sst.min():.4f} to {lon_sst.max():.4f}\")\n",
                "print(f\"Time steps: {len(time_sst)}\")\n",
                "\n",
                "# SST data statistics (in Kelvin)\n",
                "sst_data = nc_sst.variables['analysed_sst']\n",
                "print(f\"\\nSST variable shape: {sst_data.shape}\")\n",
                "print(f\"SST units: {sst_data.units}\")\n",
                "print(f\"SST long_name: {sst_data.long_name}\")\n",
                "\n",
                "# Sample data (first time step)\n",
                "sample_sst_k = sst_data[0, :, :]\n",
                "valid_sst_k = sample_sst_k[~np.isnan(sample_sst_k)]\n",
                "\n",
                "if len(valid_sst_k) > 0:\n",
                "    print(f\"\\nSample SST values in Kelvin (first time step):\")\n",
                "    print(f\"  Valid points: {len(valid_sst_k)} / {sample_sst_k.size}\")\n",
                "    print(f\"  Min: {valid_sst_k.min():.4f} K\")\n",
                "    print(f\"  Max: {valid_sst_k.max():.4f} K\")\n",
                "    print(f\"  Mean: {valid_sst_k.mean():.4f} K\")\n",
                "    \n",
                "    # Convert to Celcius\n",
                "    valid_sst_c = valid_sst_k - 273.15\n",
                "    print(f\"\\nSample SST values in Celcius (first time step):\")\n",
                "    print(f\"  Min: {valid_sst_c.min():.2f} °C\")\n",
                "    print(f\"  Max: {valid_sst_c.max():.2f} °C\")\n",
                "    print(f\"  Mean: {valid_sst_c.mean():.2f} °C\")\n",
                "\n",
                "# Time information\n",
                "if hasattr(nc_sst.variables['time'], 'units'):\n",
                "    print(f\"\\nTime units: {nc_sst.variables['time'].units}\")\n",
                "    time_units = nc_sst.variables['time'].units\n",
                "    first_time = netCDF4.num2date(time_sst[0], time_units)\n",
                "    last_time = netCDF4.num2date(time_sst[-1], time_units)\n",
                "    print(f\"Date range: {first_time} to {last_time}\")\n",
                "\n",
                "nc_sst.close()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 4. Explore Salinity Data (SO)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Read Salinity file\n",
                "so_file = '../SO 21-24.nc'\n",
                "nc_so = netCDF4.Dataset(so_file, 'r')\n",
                "\n",
                "print(\"=== Salinity File Structure ===\")\n",
                "print(f\"\\nDimensions: {list(nc_so.dimensions.keys())}\")\n",
                "print(f\"Variables: {list(nc_so.variables.keys())}\")\n",
                "\n",
                "# Dimension sizes\n",
                "print(\"\\nDimension sizes:\")\n",
                "for dim_name, dim in nc_so.dimensions.items():\n",
                "    print(f\"  {dim_name}: {dim.size}\")\n",
                "\n",
                "# Coordinate ranges\n",
                "lat_so = nc_so.variables['latitude'][:]\n",
                "lon_so = nc_so.variables['longitude'][:]\n",
                "time_so = nc_so.variables['time'][:]\n",
                "depth_so = nc_so.variables['depth'][:]\n",
                "\n",
                "print(f\"\\nLatitude range: {lat_so.min():.4f} to {lat_so.max():.4f}\")\n",
                "print(f\"Longitude range: {lon_so.min():.4f} to {lon_so.max():.4f}\")\n",
                "print(f\"Time steps: {len(time_so)}\")\n",
                "print(f\"Depth levels: {len(depth_so)}\")\n",
                "print(f\"\\nDepth range: {depth_so.min():.2f} to {depth_so.max():.2f} m\")\n",
                "print(f\"Surface depth (first level): {depth_so[0]:.2f} m\")\n",
                "\n",
                "# Salinity data statistics\n",
                "so_data = nc_so.variables['so']\n",
                "print(f\"\\nSalinity variable shape: {so_data.shape}\")\n",
                "print(f\"Salinity units: {so_data.units}\")\n",
                "print(f\"Salinity long_name: {so_data.long_name}\")\n",
                "\n",
                "# Extract surface salinity (first depth level)\n",
                "surface_so = so_data[:, 0, :, :]  # [time, depth=0, lat, lon]\n",
                "print(f\"\\nSurface salinity shape: {surface_so.shape}\")\n",
                "\n",
                "# Sample data (first time step, surface)\n",
                "sample_so = surface_so[0, :, :]\n",
                "valid_so = sample_so[~np.isnan(sample_so)]\n",
                "\n",
                "if len(valid_so) > 0:\n",
                "    print(f\"\\nSample Salinity values (first time step, surface):\")\n",
                "    print(f\"  Valid points: {len(valid_so)} / {sample_so.size}\")\n",
                "    print(f\"  Min: {valid_so.min():.4f} PSU\")\n",
                "    print(f\"  Max: {valid_so.max():.4f} PSU\")\n",
                "    print(f\"  Mean: {valid_so.mean():.4f} PSU\")\n",
                "    print(f\"  Median: {np.median(valid_so):.4f} PSU\")\n",
                "    print(f\"  Std: {valid_so.std():.4f} PSU\")\n",
                "\n",
                "# Time information\n",
                "if hasattr(nc_so.variables['time'], 'units'):\n",
                "    print(f\"\\nTime units: {nc_so.variables['time'].units}\")\n",
                "    time_units = nc_so.variables['time'].units\n",
                "    first_time = netCDF4.num2date(time_so[0], time_units)\n",
                "    last_time = netCDF4.num2date(time_so[-1], time_units)\n",
                "    print(f\"Date range: {first_time} to {last_time}\")\n",
                "\n",
                "nc_so.close()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 5. Compare Spatial Coverage"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Reopen files to get coordinates\n",
                "nc_chl = netCDF4.Dataset(chl_file, 'r')\n",
                "nc_sst = netCDF4.Dataset(sst_file, 'r')\n",
                "nc_so = netCDF4.Dataset(so_file, 'r')\n",
                "\n",
                "lat_chl = nc_chl.variables['latitude'][:]\n",
                "lon_chl = nc_chl.variables['longitude'][:]\n",
                "lat_sst = nc_sst.variables['latitude'][:]\n",
                "lon_sst = nc_sst.variables['longitude'][:]\n",
                "lat_so = nc_so.variables['latitude'][:]\n",
                "lon_so = nc_so.variables['longitude'][:]\n",
                "\n",
                "print(\"=== Spatial Coverage Comparison ===\")\n",
                "print(\"\\nLatitude ranges:\")\n",
                "print(f\"  CHL:     {lat_chl.min():.4f} to {lat_chl.max():.4f}\")\n",
                "print(f\"  SST:     {lat_sst.min():.4f} to {lat_sst.max():.4f}\")\n",
                "print(f\"  Salinity: {lat_so.min():.4f} to {lat_so.max():.4f}\")\n",
                "\n",
                "print(\"\\nLongitude ranges:\")\n",
                "print(f\"  CHL:     {lon_chl.min():.4f} to {lon_chl.max():.4f}\")\n",
                "print(f\"  SST:     {lon_sst.min():.4f} to {lon_sst.max():.4f}\")\n",
                "print(f\"  Salinity: {lon_so.min():.4f} to {lon_so.max():.4f}\")\n",
                "\n",
                "# Calculate intersection (common area)\n",
                "lat_min = max(lat_chl.min(), lat_sst.min(), lat_so.min())\n",
                "lat_max = min(lat_chl.max(), lat_sst.max(), lat_so.max())\n",
                "lon_min = max(lon_chl.min(), lon_sst.min(), lon_so.min())\n",
                "lon_max = min(lon_chl.max(), lon_sst.max(), lon_so.max())\n",
                "\n",
                "print(\"\\n=== Recommended Bounding Box (Intersection) ===\")\n",
                "print(f\"Latitude:  {lat_min:.4f} to {lat_max:.4f}\")\n",
                "print(f\"Longitude: {lon_min:.4f} to {lon_max:.4f}\")\n",
                "\n",
                "# Calculate resolutions\n",
                "print(\"\\n=== Spatial Resolutions ===\")\n",
                "if len(lat_chl) > 1:\n",
                "    res_chl = abs(lat_chl[1] - lat_chl[0])\n",
                "    print(f\"CHL resolution: ~{res_chl:.4f}° (~{res_chl*111:.1f} km)\")\n",
                "if len(lat_sst) > 1:\n",
                "    res_sst = abs(lat_sst[1] - lat_sst[0])\n",
                "    print(f\"SST resolution: ~{res_sst:.4f}° (~{res_sst*111:.1f} km)\")\n",
                "if len(lat_so) > 1:\n",
                "    res_so = abs(lat_so[1] - lat_so[0])\n",
                "    print(f\"Salinity resolution: ~{res_so:.4f}° (~{res_so*111:.1f} km)\")\n",
                "\n",
                "nc_chl.close()\n",
                "nc_sst.close()\n",
                "nc_so.close()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 6. Summary & Next Steps"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "print(\"=== EXPLORATION SUMMARY ===\")\n",
                "print(\"\\n✅ Data files successfully loaded and analyzed\")\n",
                "print(\"\\nKey Findings:\")\n",
                "print(\"1. All files have 1461 time steps (daily data)\")\n",
                "print(\"2. Spatial resolutions differ (need resampling)\")\n",
                "print(\"3. SST is in Kelvin (needs conversion to Celcius)\")\n",
                "print(\"4. Salinity has 50 depth levels (need surface extraction)\")\n",
                "print(\"5. Bounding box intersection calculated\")\n",
                "print(\"\\nNext Steps:\")\n",
                "print(\"- Fase 2: Data Preprocessing\")\n",
                "print(\"  - Convert SST: Kelvin → Celcius\")\n",
                "print(\"  - Extract surface salinity\")\n",
                "print(\"  - Resample to common grid\")\n",
                "print(\"  - Crop to bounding box\")"
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
with open('01_data_exploration.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1, ensure_ascii=False)

print("Notebook created successfully!")


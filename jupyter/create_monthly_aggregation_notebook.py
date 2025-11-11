import json

# Create monthly aggregation notebook
notebook = {
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# Fase 4: Monthly Aggregation\n",
                "\n",
                "Notebook ini untuk agregasi data HSI harian menjadi bulanan.\n",
                "\n",
                "## Langkah-langkah:\n",
                "1. Load HSI data\n",
                "2. Convert time indices ke dates\n",
                "3. Group data by year-month\n",
                "4. Calculate monthly mean untuk HSI dan parameter\n",
                "5. Generate 36 dataset bulanan (2021-2023)\n",
                "6. Save monthly aggregated data"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 1. Import Libraries & Load HSI Data"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "import numpy as np\n",
                "import pandas as pd\n",
                "from datetime import datetime, timedelta\n",
                "import os\n",
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
                "# Load HSI data\n",
                "HSI_DATA_FILE = '../data/processed/hsi_data.npz'\n",
                "\n",
                "if not os.path.exists(HSI_DATA_FILE):\n",
                "    raise FileNotFoundError(f\"HSI data file not found! Please run HSI calculation notebook first.\")\n",
                "\n",
                "data = np.load(HSI_DATA_FILE)\n",
                "\n",
                "hsi_total = data['hsi_total']\n",
                "hsi_chl = data['hsi_chl']\n",
                "hsi_sst = data['hsi_sst']\n",
                "hsi_so = data['hsi_so']\n",
                "chl = data['chl']\n",
                "sst = data['sst']\n",
                "salinity = data['salinity']\n",
                "lat_grid = data['lat_grid']\n",
                "lon_grid = data['lon_grid']\n",
                "\n",
                "print(f\"✅ HSI data loaded successfully!\")\n",
                "print(f\"\\nData shapes:\")\n",
                "print(f\"  HSI_total: {hsi_total.shape}\")\n",
                "print(f\"  Grid: {len(lat_grid)} x {len(lon_grid)}\")\n",
                "print(f\"  Time steps: {hsi_total.shape[0]}\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 2. Create Date Range"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Create date range (2021-01-01 to 2023-12-31)\n",
                "# Assuming daily data starting from 2021-01-01\n",
                "start_date = datetime(2021, 1, 1)\n",
                "n_days = hsi_total.shape[0]\n",
                "\n",
                "# Generate dates\n",
                "dates = [start_date + timedelta(days=i) for i in range(n_days)]\n",
                "\n",
                "# Create DataFrame untuk easier grouping\n",
                "df_dates = pd.DataFrame({\n",
                "    'date': dates,\n",
                "    'year': [d.year for d in dates],\n",
                "    'month': [d.month for d in dates],\n",
                "    'year_month': [f\"{d.year}-{d.month:02d}\" for d in dates]\n",
                "})\n",
                "\n",
                "print(f\"Date range: {dates[0].strftime('%Y-%m-%d')} to {dates[-1].strftime('%Y-%m-%d')}\")\n",
                "print(f\"Total days: {len(dates)}\")\n",
                "print(f\"\\nUnique year-months: {df_dates['year_month'].nunique()}\")\n",
                "print(f\"Year range: {df_dates['year'].min()} - {df_dates['year'].max()}\")\n",
                "\n",
                "# Show unique year-months\n",
                "unique_months = sorted(df_dates['year_month'].unique())\n",
                "print(f\"\\nMonths to process: {len(unique_months)}\")\n",
                "print(f\"First 5: {unique_months[:5]}\")\n",
                "print(f\"Last 5: {unique_months[-5:]}\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 3. Monthly Aggregation Function"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "def aggregate_monthly(data_array, year_month_list, method='mean'):\n",
                "    \"\"\"\n",
                "    Aggregate daily data to monthly\n",
                "    \n",
                "    Parameters:\n",
                "    - data_array: 3D array [time, lat, lon]\n",
                "    - year_month_list: list of year-month strings (e.g., '2021-01')\n",
                "    - method: 'mean' or 'median'\n",
                "    \n",
                "    Returns:\n",
                "    - monthly_data: dict dengan key year_month, value: 2D array [lat, lon]\n",
                "    \"\"\"\n",
                "    monthly_data = {}\n",
                "    \n",
                "    unique_months = sorted(set(year_month_list))\n",
                "    \n",
                "    for ym in unique_months:\n",
                "        # Get indices for this month\n",
                "        month_mask = np.array([ym_str == ym for ym_str in year_month_list])\n",
                "        month_indices = np.where(month_mask)[0]\n",
                "        \n",
                "        if len(month_indices) > 0:\n",
                "            # Extract data for this month\n",
                "            month_data = data_array[month_indices, :, :]\n",
                "            \n",
                "            # Aggregate (mean or median)\n",
                "            if method == 'mean':\n",
                "                aggregated = np.nanmean(month_data, axis=0)\n",
                "            elif method == 'median':\n",
                "                aggregated = np.nanmedian(month_data, axis=0)\n",
                "            else:\n",
                "                raise ValueError(f\"Unknown method: {method}\")\n",
                "            \n",
                "            monthly_data[ym] = aggregated\n",
                "    \n",
                "    return monthly_data\n",
                "\n",
                "print(\"✅ Aggregation function defined!\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 4. Aggregate All Data to Monthly"
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
                "print(\"=== Aggregating data to monthly ===\")\n",
                "print(f\"Processing {len(unique_months)} months...\")\n",
                "\n",
                "start_time = time.time()\n",
                "\n",
                "# Aggregate HSI\n",
                "print(\"\\nAggregating HSI_total...\")\n",
                "monthly_hsi = aggregate_monthly(hsi_total, df_dates['year_month'].values, method='mean')\n",
                "print(f\"  ✓ HSI_total: {len(monthly_hsi)} months\")\n",
                "\n",
                "print(\"Aggregating HSI_CHL...\")\n",
                "monthly_hsi_chl = aggregate_monthly(hsi_chl, df_dates['year_month'].values, method='mean')\n",
                "print(f\"  ✓ HSI_CHL: {len(monthly_hsi_chl)} months\")\n",
                "\n",
                "print(\"Aggregating HSI_SST...\")\n",
                "monthly_hsi_sst = aggregate_monthly(hsi_sst, df_dates['year_month'].values, method='mean')\n",
                "print(f\"  ✓ HSI_SST: {len(monthly_hsi_sst)} months\")\n",
                "\n",
                "print(\"Aggregating HSI_SO...\")\n",
                "monthly_hsi_so = aggregate_monthly(hsi_so, df_dates['year_month'].values, method='mean')\n",
                "print(f\"  ✓ HSI_SO: {len(monthly_hsi_so)} months\")\n",
                "\n",
                "# Aggregate original parameters\n",
                "print(\"\\nAggregating CHL...\")\n",
                "monthly_chl = aggregate_monthly(chl, df_dates['year_month'].values, method='mean')\n",
                "print(f\"  ✓ CHL: {len(monthly_chl)} months\")\n",
                "\n",
                "print(\"Aggregating SST...\")\n",
                "monthly_sst = aggregate_monthly(sst, df_dates['year_month'].values, method='mean')\n",
                "print(f\"  ✓ SST: {len(monthly_sst)} months\")\n",
                "\n",
                "print(\"Aggregating Salinity...\")\n",
                "monthly_salinity = aggregate_monthly(salinity, df_dates['year_month'].values, method='mean')\n",
                "print(f\"  ✓ Salinity: {len(monthly_salinity)} months\")\n",
                "\n",
                "elapsed = time.time() - start_time\n",
                "print(f\"\\n✅ Aggregation complete in {elapsed:.1f}s!\")\n",
                "print(f\"\\nTotal months processed: {len(monthly_hsi)}\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 5. Verify Monthly Data"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Check data quality\n",
                "print(\"=== Monthly Data Verification ===\")\n",
                "\n",
                "# Check all months are present\n",
                "expected_months = 36  # 3 years × 12 months\n",
                "actual_months = len(monthly_hsi)\n",
                "\n",
                "print(f\"\\nExpected months: {expected_months}\")\n",
                "print(f\"Actual months: {actual_months}\")\n",
                "\n",
                "if actual_months == expected_months:\n",
                "    print(\"✅ All months present!\")\n",
                "else:\n",
                "    print(f\"⚠️  Missing {expected_months - actual_months} months\")\n",
                "\n",
                "# Show sample month\n",
                "sample_month = list(monthly_hsi.keys())[0]\n",
                "print(f\"\\nSample month: {sample_month}\")\n",
                "print(f\"  HSI shape: {monthly_hsi[sample_month].shape}\")\n",
                "print(f\"  HSI range: {np.nanmin(monthly_hsi[sample_month]):.4f} to {np.nanmax(monthly_hsi[sample_month]):.4f}\")\n",
                "print(f\"  Valid points: {np.sum(~np.isnan(monthly_hsi[sample_month]))} / {monthly_hsi[sample_month].size}\")\n",
                "\n",
                "# List all months\n",
                "print(f\"\\nAll months:\")\n",
                "for i, ym in enumerate(sorted(monthly_hsi.keys()), 1):\n",
                "    print(f\"  {i:2d}. {ym}\", end=\"  \")\n",
                "    if i % 6 == 0:\n",
                "        print()  # New line every 6 months"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 6. Save Monthly Aggregated Data"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Save monthly data\n",
                "OUTPUT_DIR = '../data/processed'\n",
                "os.makedirs(OUTPUT_DIR, exist_ok=True)\n",
                "\n",
                "# Convert dict to arrays for easier saving\n",
                "# Create arrays: [n_months, lat, lon]\n",
                "sorted_months = sorted(monthly_hsi.keys())\n",
                "n_months = len(sorted_months)\n",
                "n_lat, n_lon = lat_grid.shape[0], lon_grid.shape[0]\n",
                "\n",
                "# Initialize arrays\n",
                "monthly_hsi_array = np.full((n_months, n_lat, n_lon), np.nan)\n",
                "monthly_hsi_chl_array = np.full((n_months, n_lat, n_lon), np.nan)\n",
                "monthly_hsi_sst_array = np.full((n_months, n_lat, n_lon), np.nan)\n",
                "monthly_hsi_so_array = np.full((n_months, n_lat, n_lon), np.nan)\n",
                "monthly_chl_array = np.full((n_months, n_lat, n_lon), np.nan)\n",
                "monthly_sst_array = np.full((n_months, n_lat, n_lon), np.nan)\n",
                "monthly_salinity_array = np.full((n_months, n_lat, n_lon), np.nan)\n",
                "\n",
                "# Fill arrays\n",
                "for i, ym in enumerate(sorted_months):\n",
                "    monthly_hsi_array[i, :, :] = monthly_hsi[ym]\n",
                "    monthly_hsi_chl_array[i, :, :] = monthly_hsi_chl[ym]\n",
                "    monthly_hsi_sst_array[i, :, :] = monthly_hsi_sst[ym]\n",
                "    monthly_hsi_so_array[i, :, :] = monthly_hsi_so[ym]\n",
                "    monthly_chl_array[i, :, :] = monthly_chl[ym]\n",
                "    monthly_sst_array[i, :, :] = monthly_sst[ym]\n",
                "    monthly_salinity_array[i, :, :] = monthly_salinity[ym]\n",
                "\n",
                "# Save\n",
                "np.savez_compressed(\n",
                "    f\"{OUTPUT_DIR}/monthly_hsi_data.npz\",\n",
                "    hsi_total=monthly_hsi_array,\n",
                "    hsi_chl=monthly_hsi_chl_array,\n",
                "    hsi_sst=monthly_hsi_sst_array,\n",
                "    hsi_so=monthly_hsi_so_array,\n",
                "    chl=monthly_chl_array,\n",
                "    sst=monthly_sst_array,\n",
                "    salinity=monthly_salinity_array,\n",
                "    lat_grid=lat_grid,\n",
                "    lon_grid=lon_grid,\n",
                "    months=sorted_months\n",
                ")\n",
                "\n",
                "print(f\"✅ Monthly data saved to {OUTPUT_DIR}/monthly_hsi_data.npz\")\n",
                "print(f\"\\nFile contains:\")\n",
                "print(f\"  - hsi_total: {monthly_hsi_array.shape} ({n_months} months)\")\n",
                "print(f\"  - hsi_chl, hsi_sst, hsi_so: {monthly_hsi_array.shape}\")\n",
                "print(f\"  - chl, sst, salinity: {monthly_hsi_array.shape}\")\n",
                "print(f\"  - Grid coordinates (lat_grid, lon_grid)\")\n",
                "print(f\"  - months: list of year-month strings\")\n",
                "print(f\"\\nMonths: {sorted_months[0]} to {sorted_months[-1]}\")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 7. Summary & Next Steps"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "print(\"=== MONTHLY AGGREGATION SUMMARY ===\")\n",
                "print(\"\\n✅ Monthly aggregation completed successfully!\")\n",
                "print(\"\\nWhat was done:\")\n",
                "print(\"1. ✅ Loaded HSI data\")\n",
                "print(\"2. ✅ Created date range (2021-2023)\")\n",
                "3. ✅ Aggregated daily data to monthly (mean)\")\n",
                "print(\"4. ✅ Generated 36 monthly datasets\")\n",
                "print(\"5. ✅ Saved monthly aggregated data\")\n",
                "print(\"\\nNext Steps:\")\n",
                "print(\"- Fase 5: GeoJSON Export\")\n",
                "print(\"  - Convert monthly data to GeoJSON format\")\n",
                "print(\"  - Generate 36 GeoJSON files (one per month)\")\n",
                "print(\"  - Save to data/geojson/ folder\")\n",
                "print(\"\\nOutput file: data/processed/monthly_hsi_data.npz\")"
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
with open('04_monthly_aggregation.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1, ensure_ascii=False)

print("Monthly aggregation notebook created successfully!")


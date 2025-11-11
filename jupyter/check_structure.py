import numpy as np
import os
import json

print("=== Checking File Structure ===\n")

# Check processed data
files_to_check = {
    'processed_data.npz': '../data/processed/processed_data.npz',
    'processed_data_sample.npz': '../data/processed/processed_data_sample.npz',
    'hsi_data.npz': '../data/processed/hsi_data.npz',
    'monthly_hsi_data.npz': '../data/processed/monthly_hsi_data.npz'
}

for name, path in files_to_check.items():
    if os.path.exists(path):
        data = np.load(path)
        print(f"✅ {name}:")
        for key in data.keys():
            arr = data[key]
            if isinstance(arr, np.ndarray):
                print(f"   {key}: shape={arr.shape}")
            elif isinstance(arr, list):
                print(f"   {key}: list with {len(arr)} items")
                if len(arr) > 0 and len(arr) <= 5:
                    print(f"      First items: {arr[:5]}")
            else:
                print(f"   {key}: {type(arr)}")
        print()
    else:
        print(f"❌ {name}: NOT FOUND\n")

# Check GeoJSON files
geojson_dir = '../data/geojson'
if os.path.exists(geojson_dir):
    geojson_files = [f for f in os.listdir(geojson_dir) if f.endswith('.geojson')]
    geojson_files.sort()
    
    print(f"=== GeoJSON Files ===")
    print(f"Total files: {len(geojson_files)}")
    
    if len(geojson_files) > 0:
        print(f"\nFirst 5: {geojson_files[:5]}")
        print(f"Last 5: {geojson_files[-5:]}")
        
        # Check metadata
        metadata_file = os.path.join(geojson_dir, 'metadata.json')
        if os.path.exists(metadata_file):
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            print(f"\n✅ metadata.json:")
            print(f"   Total months: {metadata.get('total_months', 'N/A')}")
            print(f"   Date range: {metadata.get('data_range', {}).get('start', 'N/A')} to {metadata.get('data_range', {}).get('end', 'N/A')}")
            print(f"   Available data: {len(metadata.get('available_data', []))} months")

print("\n=== Summary ===")
if os.path.exists('../data/processed/processed_data.npz'):
    data = np.load('../data/processed/processed_data.npz')
    if 'chl' in data:
        n_days = data['chl'].shape[0]
        print(f"✅ Processed data: {n_days} days")
        if n_days >= 1461:
            print("   ✅ Data lengkap (2021-2024)")
        else:
            print(f"   ⚠️  Data tidak lengkap (hanya {n_days} hari)")

if os.path.exists('../data/processed/monthly_hsi_data.npz'):
    data = np.load('../data/processed/monthly_hsi_data.npz')
    if 'hsi_total' in data:
        n_months = data['hsi_total'].shape[0]
        print(f"✅ Monthly data: {n_months} months")
        if n_months == 36:
            print("   ✅ 36 bulan (3 tahun)")
        elif n_months == 48:
            print("   ✅ 48 bulan (4 tahun - termasuk 2024)")
        else:
            print(f"   ⚠️  Jumlah bulan tidak sesuai: {n_months}")

if os.path.exists('../data/geojson'):
    geojson_files = [f for f in os.listdir('../data/geojson') if f.endswith('.geojson')]
    print(f"✅ GeoJSON files: {len(geojson_files)} files")
    if len(geojson_files) == 36:
        print("   ✅ 36 files (3 tahun)")
    elif len(geojson_files) == 48:
        print("   ✅ 48 files (4 tahun - termasuk 2024)")
    else:
        print(f"   ⚠️  Jumlah file tidak sesuai: {len(geojson_files)}")


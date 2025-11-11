"""
Update notebook dengan versi fixed dari vectorized functions
"""
import json

# Read existing notebook
with open('03_hsi_calculation.ipynb', 'r', encoding='utf-8') as f:
    notebook = json.load(f)

# Find Cell 4 (vectorized functions) and replace
for i, cell in enumerate(notebook['cells']):
    if cell.get('source') and len(cell['source']) > 0:
        source_text = ''.join(cell['source'])
        if 'Vectorized HSI Calculation Functions' in source_text or 'def calculate_HSI_CHL_vectorized' in source_text:
            # Replace with fixed version
            fixed_code = """# Vectorized versions untuk array operations (lebih cepat) - FIXED
def calculate_HSI_CHL_vectorized(chl_array):
    \"\"\"Vectorized version untuk array - FIXED\"\"\"
    hsi = np.zeros_like(chl_array)
    
    optimal = 1.0
    tolerance = 0.5
    
    # Valid range mask
    valid_mask = (~np.isnan(chl_array)) & (chl_array >= 0.1) & (chl_array <= 3.0)
    
    if np.any(valid_mask):
        # Flatten untuk perhitungan
        chl_flat = chl_array.flatten()
        valid_flat = valid_mask.flatten()
        hsi_flat = hsi.flatten()
        
        # Calculate distance untuk valid values
        chl_valid = chl_flat[valid_flat]
        distance = np.abs(chl_valid - optimal)
        
        # Optimal range
        optimal_mask = distance <= tolerance
        hsi_flat[valid_flat] = np.where(
            optimal_mask,
            1.0 - (distance / tolerance) * 0.3,
            0.7 - (distance - tolerance) / 2.0
        )
        
        # Clip to [0, 1]
        hsi_flat[valid_flat] = np.clip(hsi_flat[valid_flat], 0.0, 1.0)
        
        # Reshape back
        hsi = hsi_flat.reshape(chl_array.shape)
    
    return hsi

def calculate_HSI_SST_vectorized(sst_array):
    \"\"\"Vectorized version untuk array - FIXED\"\"\"
    hsi = np.zeros_like(sst_array)
    
    optimal_min = 27.0
    optimal_max = 29.0
    min_acceptable = 25.0
    max_acceptable = 31.0
    
    # Valid range mask
    valid_mask = (~np.isnan(sst_array)) & (sst_array >= min_acceptable) & (sst_array <= max_acceptable)
    
    if np.any(valid_mask):
        # Flatten untuk perhitungan
        sst_flat = sst_array.flatten()
        valid_flat = valid_mask.flatten()
        hsi_flat = hsi.flatten()
        
        sst_valid = sst_flat[valid_flat]
        
        # Optimal range
        optimal_mask = (sst_valid >= optimal_min) & (sst_valid <= optimal_max)
        below_mask = sst_valid < optimal_min
        above_mask = sst_valid > optimal_max
        
        # Calculate HSI
        hsi_flat[valid_flat] = np.where(
            optimal_mask, 1.0,
            np.where(
                below_mask,
                (sst_valid - min_acceptable) / (optimal_min - min_acceptable),
                (max_acceptable - sst_valid) / (max_acceptable - optimal_max)
            )
        )
        
        # Clip to [0, 1]
        hsi_flat[valid_flat] = np.clip(hsi_flat[valid_flat], 0.0, 1.0)
        
        # Reshape back
        hsi = hsi_flat.reshape(sst_array.shape)
    
    return hsi

def calculate_HSI_SO_vectorized(salinity_array):
    \"\"\"Vectorized version untuk array - FIXED\"\"\"
    hsi = np.zeros_like(salinity_array)
    
    optimal_min = 33.0
    optimal_max = 34.0
    min_acceptable = 31.0
    max_acceptable = 36.0
    
    # Valid range mask
    valid_mask = (~np.isnan(salinity_array)) & (salinity_array >= min_acceptable) & (salinity_array <= max_acceptable)
    
    if np.any(valid_mask):
        # Flatten untuk perhitungan
        so_flat = salinity_array.flatten()
        valid_flat = valid_mask.flatten()
        hsi_flat = hsi.flatten()
        
        so_valid = so_flat[valid_flat]
        
        # Optimal range
        optimal_mask = (so_valid >= optimal_min) & (so_valid <= optimal_max)
        below_mask = so_valid < optimal_min
        above_mask = so_valid > optimal_max
        
        # Calculate HSI
        hsi_flat[valid_flat] = np.where(
            optimal_mask, 1.0,
            np.where(
                below_mask,
                (so_valid - min_acceptable) / (optimal_min - min_acceptable),
                (max_acceptable - so_valid) / (max_acceptable - optimal_max)
            )
        )
        
        # Clip to [0, 1]
        hsi_flat[valid_flat] = np.clip(hsi_flat[valid_flat], 0.0, 1.0)
        
        # Reshape back
        hsi = hsi_flat.reshape(salinity_array.shape)
    
    return hsi

print(\"✅ Vectorized functions fixed!\")"""
            
            # Split into lines
            notebook['cells'][i]['source'] = [line + '\n' for line in fixed_code.split('\n')]
            print(f"Updated Cell {i}: Fixed vectorized functions")
            break

# Save updated notebook
with open('03_hsi_calculation.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1, ensure_ascii=False)

print("\n✅ Notebook updated successfully!")
print("Fixed: Vectorized functions now use flatten/reshape approach to avoid broadcasting errors")


"""
Script untuk update notebook dengan versi optimized
"""
import json

# Read existing notebook
with open('02_data_preprocessing.ipynb', 'r', encoding='utf-8') as f:
    notebook = json.load(f)

# Find and update Cell 7 (resample function) - change default method to 'nearest'
for i, cell in enumerate(notebook['cells']):
    if cell.get('source') and len(cell['source']) > 0:
        source_text = ''.join(cell['source'])
        if 'def resample_to_grid' in source_text and 'method=\'linear\'' in source_text:
            # Update method default to 'nearest'
            new_source = []
            for line in cell['source']:
                if "method='linear'" in line:
                    new_source.append(line.replace("method='linear'", "method='nearest'"))
                else:
                    new_source.append(line)
            notebook['cells'][i]['source'] = new_source
            print(f"Updated Cell {i}: Changed default method to 'nearest'")
            break

# Find and replace Cell 8 (processing loop)
for i, cell in enumerate(notebook['cells']):
    if cell.get('source') and len(cell['source']) > 0:
        source_text = ''.join(cell['source'])
        if 'Process All Time Steps' in source_text or 'SAMPLE_SIZE = 10' in source_text:
            # Replace with optimized version
            optimized_code = """# ============================================
# OPTIMIZED VERSION - Process All Time Steps
# ============================================

import time
from multiprocessing import Pool, cpu_count
from functools import partial

# ===== Optimization Settings =====
INTERP_METHOD = 'nearest'  # 'nearest' (fastest, 3-5x), 'linear' (accurate), 'cubic' (slowest)
USE_PARALLEL = True  # Set False jika ada masalah dengan multiprocessing
N_WORKERS = min(4, cpu_count())  # Jumlah CPU cores
CHUNK_SIZE = 100  # Process 100 time steps per batch

print(f"🚀 Optimization settings:")
print(f"  Interpolation method: {INTERP_METHOD} (3-5x faster)")
print(f"  Parallel processing: {USE_PARALLEL} ({N_WORKERS} workers)")
print(f"  Chunk size: {CHUNK_SIZE}")

# ===== Optimized Resampling Function =====
def resample_to_grid_fast(data_2d, points_orig, lon_target, lat_target, method=INTERP_METHOD):
    \"\"\"Optimized resampling dengan method yang lebih cepat\"\"\"
    points_target = np.column_stack((lon_target.ravel(), lat_target.ravel()))
    values_orig = data_2d.ravel()
    
    valid_mask = ~np.isnan(values_orig)
    if np.sum(valid_mask) == 0:
        return np.full(lon_target.shape, np.nan)
    
    points_valid = points_orig[valid_mask]
    values_valid = values_orig[valid_mask]
    
    values_interp = griddata(
        points_valid,
        values_valid,
        points_target,
        method=method,
        fill_value=np.nan
    )
    
    return values_interp.reshape(lon_target.shape)

# ===== Process Single Time Step (for parallel) =====
def process_time_step(t, chl_data, sst_data_k, so_data, 
                     points_chl, points_sst, points_so,
                     lon_mesh, lat_mesh):
    \"\"\"Process satu time step - untuk parallel processing\"\"\"
    try:
        # CHL
        chl_2d = chl_data[t, :, :]
        chl_resampled = resample_to_grid_fast(chl_2d, points_chl, lon_mesh, lat_mesh)
        
        # SST (convert Kelvin to Celcius)
        sst_2d_k = sst_data_k[t, :, :]
        sst_2d_c = sst_2d_k - 273.15
        sst_resampled = resample_to_grid_fast(sst_2d_c, points_sst, lon_mesh, lat_mesh)
        
        # Salinity (surface)
        so_2d = so_data[t, 0, :, :]
        so_resampled = resample_to_grid_fast(so_2d, points_so, lon_mesh, lat_mesh)
        
        return t, chl_resampled, sst_resampled, so_resampled
    except Exception as e:
        print(f"Error processing time step {t}: {e}")
        return t, None, None, None

# ===== Main Processing =====
SAMPLE_SIZE = None  # Set None untuk process semua, atau angka untuk sample

# Reopen files
nc_chl = netCDF4.Dataset(CHL_FILE, 'r')
nc_sst = netCDF4.Dataset(SST_FILE, 'r')
nc_so = netCDF4.Dataset(SO_FILE, 'r')

chl_data = nc_chl.variables['CHL']
sst_data_k = nc_sst.variables['analysed_sst']
so_data = nc_so.variables['so']

# Get number of time steps
n_times = len(time_chl)
if SAMPLE_SIZE:
    n_times = min(SAMPLE_SIZE, n_times)

print(f"\\nProcessing {n_times} time steps with optimizations...")
start_time = time.time()

# Initialize arrays
processed_chl = np.full((n_times, len(lat_grid), len(lon_grid)), np.nan)
processed_sst = np.full((n_times, len(lat_grid), len(lon_grid)), np.nan)
processed_so = np.full((n_times, len(lat_grid), len(lon_grid)), np.nan)

time_indices = list(range(n_times))

if USE_PARALLEL and N_WORKERS > 1:
    # ===== PARALLEL PROCESSING =====
    print(f"Using parallel processing with {N_WORKERS} workers...")
    
    process_func = partial(
        process_time_step,
        chl_data=chl_data,
        sst_data_k=sst_data_k,
        so_data=so_data,
        points_chl=points_chl,
        points_sst=points_sst,
        points_so=points_so,
        lon_mesh=lon_mesh,
        lat_mesh=lat_mesh
    )
    
    # Process in chunks
    for chunk_start in range(0, n_times, CHUNK_SIZE):
        chunk_end = min(chunk_start + CHUNK_SIZE, n_times)
        chunk_indices = time_indices[chunk_start:chunk_end]
        
        chunk_num = chunk_start//CHUNK_SIZE + 1
        total_chunks = (n_times-1)//CHUNK_SIZE + 1
        print(f"Processing chunk {chunk_num}/{total_chunks} (time steps {chunk_start+1}-{chunk_end})...")
        
        with Pool(processes=N_WORKERS) as pool:
            results = pool.map(process_func, chunk_indices)
        
        # Store results
        for t, chl_res, sst_res, so_res in results:
            if chl_res is not None:
                processed_chl[t, :, :] = chl_res
                processed_sst[t, :, :] = sst_res
                processed_so[t, :, :] = so_res
        
        elapsed = time.time() - start_time
        print(f"  ✓ Chunk {chunk_num} completed in {elapsed:.1f}s")
    
else:
    # ===== SEQUENTIAL PROCESSING (Optimized) =====
    print("Using sequential processing (optimized with 'nearest' method)...")
    
    for t in range(n_times):
        if (t + 1) % 50 == 0 or t == 0:
            elapsed = time.time() - start_time
            rate = (t + 1) / elapsed if elapsed > 0 else 0
            remaining = (n_times - t - 1) / rate if rate > 0 else 0
            print(f"Progress: {t+1}/{n_times} ({100*(t+1)/n_times:.1f}%) | "
                  f"Elapsed: {elapsed:.1f}s | ETA: {remaining:.1f}s")
        
        # CHL
        chl_2d = chl_data[t, :, :]
        processed_chl[t, :, :] = resample_to_grid_fast(chl_2d, points_chl, lon_mesh, lat_mesh)
        
        # SST (convert Kelvin to Celcius)
        sst_2d_k = sst_data_k[t, :, :]
        sst_2d_c = sst_2d_k - 273.15
        processed_sst[t, :, :] = resample_to_grid_fast(sst_2d_c, points_sst, lon_mesh, lat_mesh)
        
        # Salinity (surface)
        so_2d = so_data[t, 0, :, :]
        processed_so[t, :, :] = resample_to_grid_fast(so_2d, points_so, lon_mesh, lat_mesh)

total_time = time.time() - start_time
print(f"\\n{'='*60}")
print(f"✅ Processing complete!")
print(f"Total time: {total_time:.1f}s ({total_time/60:.1f} minutes)")
print(f"Average: {total_time/n_times:.2f}s per time step")
print(f"Processed data shape: {processed_chl.shape}")
print(f"{'='*60}")

# Close files
nc_chl.close()
nc_sst.close()
nc_so.close()"""
            
            # Split into lines
            notebook['cells'][i]['source'] = optimized_code.split('\n')
            # Add newline to each line except last
            notebook['cells'][i]['source'] = [line + '\n' if i < len(optimized_code.split('\n'))-1 else line 
                                             for i, line in enumerate(optimized_code.split('\n'))]
            print(f"Updated Cell {i}: Replaced with optimized version")
            break

# Save updated notebook
with open('02_data_preprocessing.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1, ensure_ascii=False)

print("\n✅ Notebook updated successfully!")
print("Changes made:")
print("  1. Cell 7: Changed default interpolation method to 'nearest'")
print("  2. Cell 8: Replaced with optimized version (parallel processing + nearest method)")


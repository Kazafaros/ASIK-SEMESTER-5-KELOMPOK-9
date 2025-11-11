import netCDF4
import numpy as np

def inspect_netcdf(filename):
    """Inspect NetCDF file structure"""
    print(f"\n{'='*60}")
    print(f"Inspecting: {filename}")
    print('='*60)
    
    try:
        nc = netCDF4.Dataset(filename, 'r')
        
        # Dimensions
        print("\nDimensions:")
        for dim_name, dim in nc.dimensions.items():
            print(f"  {dim_name}: {dim.size}")
        
        # Variables
        print("\nVariables:")
        for var_name, var in nc.variables.items():
            print(f"  {var_name}: shape={var.shape}, dtype={var.dtype}")
            # Print attributes if available
            if hasattr(var, 'long_name'):
                print(f"    long_name: {var.long_name}")
            if hasattr(var, 'units'):
                print(f"    units: {var.units}")
        
        # Find coordinate variables
        lat_var = None
        lon_var = None
        time_var = None
        
        for var_name in ['latitude', 'lat', 'Latitude', 'LAT']:
            if var_name in nc.variables:
                lat_var = var_name
                break
        
        for var_name in ['longitude', 'lon', 'Longitude', 'LON']:
            if var_name in nc.variables:
                lon_var = var_name
                break
        
        for var_name in ['time', 'Time', 'TIME']:
            if var_name in nc.variables:
                time_var = var_name
                break
        
        # Print coordinate ranges
        if lat_var:
            lat_data = nc.variables[lat_var][:]
            print(f"\n{lat_var} range: {lat_data.min():.4f} to {lat_data.max():.4f}")
            print(f"  Resolution: ~{abs(lat_data[1] - lat_data[0]):.4f} degrees")
        
        if lon_var:
            lon_data = nc.variables[lon_var][:]
            print(f"{lon_var} range: {lon_data.min():.4f} to {lon_data.max():.4f}")
            print(f"  Resolution: ~{abs(lon_data[1] - lon_data[0]):.4f} degrees")
        
        if time_var:
            time_data = nc.variables[time_var]
            print(f"\n{time_var}: {len(time_data)} time steps")
            if hasattr(time_data, 'units'):
                print(f"  units: {time_data.units}")
        
        # Find data variable (not coordinate)
        coord_vars = [lat_var, lon_var, time_var]
        data_vars = [v for v in nc.variables.keys() if v not in coord_vars]
        
        if data_vars:
            data_var = data_vars[0]
            print(f"\nData variable: {data_var}")
            
            # Get sample data (first time step if 3D, or full if 2D)
            if len(nc.variables[data_var].shape) == 3:
                sample = nc.variables[data_var][0, :, :]
            elif len(nc.variables[data_var].shape) == 2:
                sample = nc.variables[data_var][:, :]
            else:
                sample = nc.variables[data_var][:]
            
            # Calculate statistics on valid data
            valid_mask = ~np.isnan(sample)
            if np.any(valid_mask):
                valid_data = sample[valid_mask]
                print(f"  Valid data points: {np.sum(valid_mask)} / {sample.size}")
                print(f"  Min: {valid_data.min():.4f}")
                print(f"  Max: {valid_data.max():.4f}")
                print(f"  Mean: {valid_data.mean():.4f}")
                print(f"  Median: {np.median(valid_data):.4f}")
                print(f"  Std: {valid_data.std():.4f}")
            else:
                print("  No valid data found in sample")
        
        # Global attributes
        if len(nc.ncattrs()) > 0:
            print("\nGlobal attributes:")
            for attr in nc.ncattrs():
                print(f"  {attr}: {getattr(nc, attr)}")
        
        nc.close()
        
    except Exception as e:
        print(f"Error reading file: {e}")

# Inspect all NetCDF files
files = [
    'CHL 21-24.nc',
    'SST 21-24.nc',
    'SO 21-24.nc',
    'BatimetriSelatSunda.nc'
]

for filename in files:
    try:
        inspect_netcdf(filename)
    except FileNotFoundError:
        print(f"\nFile not found: {filename}")
    except Exception as e:
        print(f"\nError with {filename}: {e}")

print("\n" + "="*60)
print("Inspection complete!")
print("="*60)


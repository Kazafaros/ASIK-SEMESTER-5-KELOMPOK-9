// Map Manager for HSI Visualization
class HSIMapManager {
    constructor(mapId, options = {}) {
        this.mapId = mapId;
        this.defaultLayer = options.defaultLayer || 'hsi';
        this.defaultColormap = options.defaultColormap || 'viridis';
        
        // Initialize map
        this.map = L.map(mapId, {
            center: MAP_CONFIG.center,
            zoom: MAP_CONFIG.zoom,
            minZoom: 7,
            maxZoom: 13
        });

        // Add base tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Current state
        this.currentLayer = this.defaultLayer;
        this.currentColormap = this.defaultColormap;
        this.currentYear = null;
        this.currentMonth = null;
        this.currentTime = null;
        this.currentGeoJSONLayer = null;

        // API client
        this.apiClient = new HSIApiClient();
    }

    /**
     * Load HSI layer for specific year and month
     * @param {string} layer - Layer name ('hsi', 'sst', 'chlor_a', 'salinity')
     * @param {string} time - Time string in format 'YYYYMM' (e.g., '202101')
     */
    async loadLayer(layer = 'hsi', time = null) {
        try {
            // Parse time if provided
            let year, month;
            if (time) {
                // Format: YYYYMM
                year = parseInt(time.substring(0, 4));
                month = parseInt(time.substring(4, 6));
            } else if (this.currentYear && this.currentMonth) {
                year = this.currentYear;
                month = this.currentMonth;
            } else {
                throw new Error('Time not specified');
            }

            // Remove existing layer
            if (this.currentGeoJSONLayer) {
                this.map.removeLayer(this.currentGeoJSONLayer);
                this.currentGeoJSONLayer = null;
            }

            // Get GeoJSON data
            const geojson = await this.apiClient.getHSIData(year, month);

            // Determine property to display based on layer
            const propertyMap = {
                'hsi': 'hsi',
                'sst': 'sst',
                'chlor_a': 'chl',
                'salinity': 'salinity'
            };

            const property = propertyMap[layer] || 'hsi';
            const layerName = layer.toUpperCase(); // Store layer name for popup

            // Create smooth heatmap with larger, overlapping circles
            // Use closure to capture layer, property, and layerName
            const self = this;
            const layerGroup = L.layerGroup();
            
            geojson.features.forEach(feature => {
                const value = feature.properties[property];
                if (value === null || value === undefined || isNaN(value)) {
                    return; // Skip invalid points
                }

                const coords = feature.geometry.coordinates;
                const latlng = [coords[1], coords[0]];
                
                // Get color based on value and colormap
                const color = self.getValueColor(value, layer);
                
                // Create larger circle with smooth gradient effect
                // Radius based on zoom level for better visibility
                const zoom = self.map.getZoom();
                const baseRadius = Math.max(8, Math.min(20, 12 + (zoom - 9) * 2));
                
                // Create circle with CSS filter for blur effect (smooth heatmap)
                const circle = L.circleMarker(latlng, {
                    radius: baseRadius,
                    fillColor: color,
                    color: color,
                    weight: 0,
                    opacity: 0,
                    fillOpacity: 0.6
                });
                
                // Add CSS filter for smooth blur effect
                circle.on('add', function() {
                    const element = this.getElement();
                    if (element) {
                        element.style.filter = 'blur(3px)';
                        element.style.mixBlendMode = 'multiply';
                    }
                });
                
                // Add popup with data
                const props = feature.properties;
                const content = `
                    <div style="min-width: 150px;">
                        <strong>${layerName}</strong><br>
                        ${property === 'hsi' ? `HSI: ${props.hsi !== null ? props.hsi.toFixed(3) : 'N/A'}<br>` : ''}
                        ${property === 'sst' ? `SST: ${props.sst !== null ? props.sst.toFixed(2) + '°C' : 'N/A'}<br>` : ''}
                        ${property === 'chl' ? `CHL: ${props.chl !== null ? props.chl.toFixed(3) + ' mg/m³' : 'N/A'}<br>` : ''}
                        ${property === 'salinity' ? `Salinity: ${props.salinity !== null ? props.salinity.toFixed(2) + ' PSU' : 'N/A'}<br>` : ''}
                        <small>${props.year}-${String(props.month).padStart(2, '0')}</small>
                    </div>
                `;
                circle.bindPopup(content);
                
                layerGroup.addLayer(circle);
            });
            
            this.currentGeoJSONLayer = layerGroup;
            layerGroup.addTo(this.map);

            // Fit bounds to data
            if (geojson.features && geojson.features.length > 0) {
                // Calculate bounds from features
                let minLat = Infinity, maxLat = -Infinity;
                let minLng = Infinity, maxLng = -Infinity;
                
                geojson.features.forEach(feature => {
                    const coords = feature.geometry.coordinates;
                    minLat = Math.min(minLat, coords[1]);
                    maxLat = Math.max(maxLat, coords[1]);
                    minLng = Math.min(minLng, coords[0]);
                    maxLng = Math.max(maxLng, coords[0]);
                });
                
                if (isFinite(minLat)) {
                    this.map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [20, 20] });
                }
            }

            // Update state
            this.currentLayer = layer;
            this.currentYear = year;
            this.currentMonth = month;
            this.currentTime = time || `${year}${String(month).padStart(2, '0')}`;

            return geojson;
        } catch (error) {
            console.error('Error loading layer:', error);
            throw error;
        }
    }

    /**
     * Get color for value based on layer type and colormap
     * Uses fixed ranges for consistent color mapping across all months
     */
    getValueColor(value, layer) {
        if (value === null || value === undefined || isNaN(value)) {
            return '#cccccc'; // Gray for invalid
        }

        // Get fixed range for this layer
        const range = VALUE_RANGES[layer] || VALUE_RANGES.hsi;
        
        // Normalize value to 0-1 range using fixed min/max
        // Clamp values outside range to 0 or 1
        let normalized = (value - range.min) / (range.max - range.min);
        normalized = Math.max(0, Math.min(1, normalized));

        // Get color from colormap
        return this.getColormapColor(normalized, this.currentColormap);
    }

    /**
     * Get color from colormap
     */
    getColormapColor(value, colormapName) {
        const colormap = COLORMAPS[colormapName] || COLORMAPS.viridis;
        const colors = colormap.colors;

        if (value <= 0) return colors[0];
        if (value >= 1) return colors[colors.length - 1];

        const index = value * (colors.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const fraction = index - lower;

        // Interpolate between colors
        return this.interpolateColor(colors[lower], colors[upper], fraction);
    }

    /**
     * Interpolate between two hex colors
     */
    interpolateColor(color1, color2, fraction) {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substring(0, 2), 16);
        const g1 = parseInt(hex1.substring(2, 4), 16);
        const b1 = parseInt(hex1.substring(4, 6), 16);
        
        const r2 = parseInt(hex2.substring(0, 2), 16);
        const g2 = parseInt(hex2.substring(2, 4), 16);
        const b2 = parseInt(hex2.substring(4, 6), 16);
        
        const r = Math.round(r1 + (r2 - r1) * fraction);
        const g = Math.round(g1 + (g2 - g1) * fraction);
        const b = Math.round(b1 + (b2 - b1) * fraction);
        
        return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    }

    /**
     * Set colormap
     */
    setColormap(colormapName) {
        this.currentColormap = colormapName;
        // Reload current layer with new colormap
        if (this.currentYear && this.currentMonth) {
            this.loadLayer(this.currentLayer, this.currentTime);
        }
    }

    /**
     * Set time (year-month)
     * @param {string} time - Format: 'YYYYMM' (e.g., '202101')
     */
    setTime(time) {
        this.currentTime = time;
        const year = parseInt(time.substring(0, 4));
        const month = parseInt(time.substring(4, 6));
        this.currentYear = year;
        this.currentMonth = month;
        this.loadLayer(this.currentLayer, time);
    }

}


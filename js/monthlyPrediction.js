/**
 * Monthly Prediction API Client
 * Menangani komunikasi dengan backend untuk prediksi HSI bulanan
 */
class MonthlyPredictionClient {
    constructor(baseURL = API_CONFIG.baseURL) {
        this.baseURL = baseURL;
        this.predictionBaseURL = `${baseURL}/monthly-predictions`;
    }

    /**
     * Get prediction metadata
     */
    async getMetadata() {
        try {
            const response = await fetch(`${this.predictionBaseURL}/metadata`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.success) return data.data;
            throw new Error(data.error || 'Failed to get metadata');
        } catch (error) {
            console.error('Error fetching metadata:', error);
            throw error;
        }
    }

    /**
     * Get available months
     */
    async getAvailableMonths() {
        try {
            const response = await fetch(`${this.predictionBaseURL}/available`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.success) return data.data;
            throw new Error(data.error || 'Failed to get available months');
        } catch (error) {
            console.error('Error fetching available months:', error);
            throw error;
        }
    }

    /**
     * Get prediction for specific month
     */
    async getPrediction(year, month) {
        try {
            const response = await fetch(`${this.predictionBaseURL}/${year}/${month}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.success) return data.data;
            throw new Error(data.error || 'Failed to get prediction');
        } catch (error) {
            console.error(`Error fetching prediction for ${year}-${month}:`, error);
            throw error;
        }
    }

    /**
     * Get statistics for a month
     */
    async getMonthStats(year, month) {
        try {
            const response = await fetch(`${this.predictionBaseURL}/stats/${year}/${month}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.success) return data.data;
            throw new Error(data.error || 'Failed to get stats');
        } catch (error) {
            console.error(`Error fetching stats for ${year}-${month}:`, error);
            throw error;
        }
    }

    /**
     * Get yearly statistics
     */
    async getYearlyStats(year) {
        try {
            const response = await fetch(`${this.predictionBaseURL}/yearly-stats/${year}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.success) return data.data;
            throw new Error(data.error || 'Failed to get yearly stats');
        } catch (error) {
            console.error(`Error fetching yearly stats for ${year}:`, error);
            throw error;
        }
    }

    /**
     * Get prediction at specific point
     */
    async getPredictionAtPoint(lat, lon, year, month) {
        try {
            const url = `${this.predictionBaseURL}/point?lat=${lat}&lon=${lon}&year=${year}&month=${month}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.success) return data.data;
            throw new Error(data.error || 'Failed to get point prediction');
        } catch (error) {
            console.error('Error fetching point prediction:', error);
            throw error;
        }
    }

    /**
     * Get trend for a location
     */
    async getTrend(lat, lon, year) {
        try {
            const url = `${this.predictionBaseURL}/trend?lat=${lat}&lon=${lon}&year=${year}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.success) return data.data;
            throw new Error(data.error || 'Failed to get trend');
        } catch (error) {
            console.error('Error fetching trend:', error);
            throw error;
        }
    }

    /**
     * Get spatial bounds
     */
    async getSpatialBounds() {
        try {
            const response = await fetch(`${this.predictionBaseURL}/bounds`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.success) return data.data;
            throw new Error(data.error || 'Failed to get bounds');
        } catch (error) {
            console.error('Error fetching bounds:', error);
            throw error;
        }
    }

    /**
     * Get oceanographic parameters info
     */
    async getOceanographyInfo() {
        try {
            const response = await fetch(`${this.predictionBaseURL}/oceanography`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.success) return data.data;
            throw new Error(data.error || 'Failed to get oceanography info');
        } catch (error) {
            console.error('Error fetching oceanography info:', error);
            throw error;
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.predictionBaseURL}/health`);
            if (!response.ok) return false;
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}

/**
 * Monthly Prediction Map Manager
 * Mengelola visualisasi prediksi di peta
 */
class MonthlyPredictionMapManager {
    constructor(mapId, options = {}) {
        this.mapId = mapId;
        this.map = null;
        this.currentLayer = null;
        this.currentYear = null;
        this.currentMonth = null;
        this.currentColormap = options.defaultColormap || 'viridis';
        this.geoJsonLayer = null;
        this.apiClient = new MonthlyPredictionClient();
        this.options = options;
    }

    /**
     * Initialize map
     */
    initMap() {
        this.map = L.map(this.mapId).setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
        
        // Add base layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        return this.map;
    }

    /**
     * Load prediction layer for specific month
     */
    async loadPredictionLayer(year, month) {
        try {
            const prediction = await this.apiClient.getPrediction(year, month);
            this.currentYear = year;
            this.currentMonth = month;
            this.currentLayer = prediction.data;

            // Remove existing layer
            if (this.geoJsonLayer) {
                this.map.removeLayer(this.geoJsonLayer);
            }

            // Add new layer
            this.geoJsonLayer = L.geoJSON(this.currentLayer, {
                pointToLayer: (feature, latlng) => {
                    const hsi = feature.properties.hsi;
                    const color = this.getColormapColor(hsi);
                    
                    return L.circleMarker(latlng, {
                        radius: 4,
                        fillColor: color,
                        color: color,
                        weight: 1,
                        opacity: 0.8,
                        fillOpacity: 0.7
                    });
                },
                onEachFeature: (feature, layer) => {
                    const hsi = feature.properties.hsi;
                    const popup = `
                        <div class="prediction-popup">
                            <strong>Bulan:</strong> ${month}/${year}<br>
                            <strong>HSI:</strong> ${hsi.toFixed(4)}<br>
                            <strong>Lat:</strong> ${feature.geometry.coordinates[1].toFixed(4)}<br>
                            <strong>Lon:</strong> ${feature.geometry.coordinates[0].toFixed(4)}
                        </div>
                    `;
                    layer.bindPopup(popup);
                }
            }).addTo(this.map);

            return this.geoJsonLayer;
        } catch (error) {
            console.error('Error loading prediction layer:', error);
            throw error;
        }
    }

    /**
     * Get color from colormap
     */
    getColormapColor(value) {
        const colormap = COLORMAPS[this.currentColormap] || COLORMAPS.viridis;
        const colors = colormap.colors;
        
        // Normalize value to 0-1
        let normalized = value;
        if (value < 0) normalized = 0;
        if (value > 1) normalized = 1;
        
        const index = normalized * (colors.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const fraction = index - lower;
        
        if (lower === upper) {
            return colors[lower];
        }
        
        return this.interpolateColor(colors[lower], colors[upper], fraction);
    }

    /**
     * Interpolate between two colors
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
        
        // Reload layer with new colormap
        if (this.currentYear && this.currentMonth && this.currentLayer) {
            if (this.geoJsonLayer) {
                this.map.removeLayer(this.geoJsonLayer);
            }
            
            this.geoJsonLayer = L.geoJSON(this.currentLayer, {
                pointToLayer: (feature, latlng) => {
                    const hsi = feature.properties.hsi;
                    const color = this.getColormapColor(hsi);
                    
                    return L.circleMarker(latlng, {
                        radius: 4,
                        fillColor: color,
                        color: color,
                        weight: 1,
                        opacity: 0.8,
                        fillOpacity: 0.7
                    });
                }
            }).addTo(this.map);
        }
    }

    /**
     * Get prediction at clicked point
     */
    async getPredictionAtPoint(lat, lon) {
        try {
            const prediction = await this.apiClient.getPredictionAtPoint(lat, lon, this.currentYear, this.currentMonth);
            return prediction;
        } catch (error) {
            console.error('Error getting prediction at point:', error);
            throw error;
        }
    }
}

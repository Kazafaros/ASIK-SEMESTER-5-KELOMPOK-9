// API Client for HSI Backend
class HSIApiClient {
    constructor(baseURL = API_CONFIG.baseURL) {
        this.baseURL = baseURL;
    }

    /**
     * Get available HSI data (list of year-month)
     */
    async getAvailableData() {
        try {
            const response = await fetch(`${this.baseURL}${API_CONFIG.endpoints.available}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to get available data');
            }
        } catch (error) {
            console.error('Error fetching available data:', error);
            throw error;
        }
    }

    /**
     * Get HSI GeoJSON for specific year and month
     * @param {number} year - Year (e.g., 2021)
     * @param {number} month - Month (1-12)
     */
    async getHSIData(year, month) {
        try {
            const url = `${this.baseURL}${API_CONFIG.endpoints.hsi}?year=${year}&month=${month}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                return data.data; // GeoJSON FeatureCollection
            } else {
                throw new Error(data.error || 'Failed to get HSI data');
            }
        } catch (error) {
            console.error(`Error fetching HSI data for ${year}-${month}:`, error);
            throw error;
        }
    }

    /**
     * Get metadata
     */
    async getMetadata() {
        try {
            const response = await fetch(`${this.baseURL}${API_CONFIG.endpoints.metadata}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to get metadata');
            }
        } catch (error) {
            console.error('Error fetching metadata:', error);
            throw error;
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}${API_CONFIG.endpoints.health}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }

    /**
     * Legacy method for compatibility (returns available data as layers)
     */
    async getLayers() {
        try {
            const available = await this.getAvailableData();
            // Group by layer type (for now, only HSI)
            return [{
                name: 'hsi',
                label: 'HSI',
                times: available.available.map(item => ({
                    year: item.year,
                    month: item.month,
                    date: `${item.year}-${String(item.month).padStart(2, '0')}-01`,
                    timestamp: `${item.year}${String(item.month).padStart(2, '0')}`
                }))
            }];
        } catch (error) {
            console.error('Error getting layers:', error);
            return [];
        }
    }
}


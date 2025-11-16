const fs = require('fs-extra');
const path = require('path');

class GeoJSONService {
    constructor(dataDir = 'data/geojson') {
        // Resolve path relative to project root
        // __dirname is backend/src/services/ (e.g., D:\...\backend\src\services)
        // Go up 3 levels: services -> src -> backend -> root/
        // Then to data/geojson
        const projectRoot = path.resolve(__dirname, '../../..');
        this.dataDir = path.join(projectRoot, 'data', 'geojson');
        this.metadataPath = path.join(this.dataDir, 'metadata.json');
        
        console.log(`📁 Data directory: ${this.dataDir}`);
    }

    /**
     * Load metadata.json
     */
    async getMetadata() {
        try {
            const metadata = await fs.readJson(this.metadataPath);
            return metadata;
        } catch (error) {
            throw new Error(`Failed to load metadata: ${error.message}`);
        }
    }

    /**
     * Get list of available data (year-month combinations)
     */
    async getAvailableData() {
        try {
            const metadata = await this.getMetadata();
            return {
                available: metadata.available_data || [],
                total: metadata.total_months || 0,
                dateRange: metadata.data_range || {},
                bounds: metadata.spatial_bounds || {}
            };
        } catch (error) {
            throw new Error(`Failed to get available data: ${error.message}`);
        }
    }

    /**
     * Get GeoJSON for specific year and month
     * @param {number} year - Year (e.g., 2021)
     * @param {number} month - Month (1-12)
     */
    async getHSIData(year, month) {
        try {
            // Format: hsi_YYYY_MM.geojson
            const monthStr = String(month).padStart(2, '0');
            const filename = `hsi_${year}_${monthStr}.geojson`;
            const filepath = path.join(this.dataDir, filename);

            // Check if file exists
            const exists = await fs.pathExists(filepath);
            if (!exists) {
                throw new Error(`GeoJSON file not found for ${year}-${monthStr}`);
            }

            // Read and return GeoJSON
            const geojson = await fs.readJson(filepath);
            return geojson;
        } catch (error) {
            throw new Error(`Failed to load GeoJSON: ${error.message}`);
        }
    }

    /**
     * Get GeoJSON by year-month string (e.g., "2021-01")
     */
    async getHSIDataByString(yearMonth) {
        try {
            const [year, month] = yearMonth.split('-').map(Number);
            return await this.getHSIData(year, month);
        } catch (error) {
            throw new Error(`Invalid year-month format: ${yearMonth}`);
        }
    }

    /**
     * Verify data directory exists
     */
    async verifyDataDirectory() {
        const exists = await fs.pathExists(this.dataDir);
        if (!exists) {
            throw new Error(`Data directory not found: ${this.dataDir}`);
        }
        return true;
    }
}

module.exports = GeoJSONService;


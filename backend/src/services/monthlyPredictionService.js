const fs = require('fs-extra');
const path = require('path');

/**
 * Service untuk mengelola prediksi HSI bulanan
 */
class MonthlyPredictionService {
    constructor() {
        this.predictionsDir = path.join(__dirname, '../../../data/predictions/monthly_2025');
        this.metadataFile = path.join(this.predictionsDir, 'metadata.json');
        this.metadata = null;
        this.predictions = {};
    }

    /**
     * Initialize service - load metadata dan predictions
     */
    async initialize() {
        try {
            // Check if predictions directory exists
            if (!await fs.pathExists(this.predictionsDir)) {
                console.warn(`⚠️  Predictions directory not found: ${this.predictionsDir}`);
                return false;
            }

            // Load metadata
            if (await fs.pathExists(this.metadataFile)) {
                this.metadata = await fs.readJson(this.metadataFile);
                console.log(`✅ Monthly prediction metadata loaded`);
            }

            // Load available predictions
            const files = await fs.readdir(this.predictionsDir);
            const geojsonFiles = files.filter(f => f.endsWith('.geojson'));
            
            for (const file of geojsonFiles) {
                const match = file.match(/hsi_prediction_(\d{4})_(\d{2})\.geojson/);
                if (match) {
                    const year = parseInt(match[1]);
                    const month = parseInt(match[2]);
                    const key = `${year}-${String(month).padStart(2, '0')}`;
                    const filePath = path.join(this.predictionsDir, file);
                    this.predictions[key] = filePath;
                }
            }

            console.log(`✅ Loaded ${Object.keys(this.predictions).length} monthly predictions`);
            return true;
        } catch (error) {
            console.error('Error initializing MonthlyPredictionService:', error);
            return false;
        }
    }

    /**
     * Get metadata
     */
    async getMetadata() {
        if (!this.metadata) {
            throw new Error('Monthly predictions not initialized');
        }
        return this.metadata;
    }

    /**
     * Get available months
     */
    async getAvailableMonths() {
        if (!this.metadata) {
            throw new Error('Monthly predictions not initialized');
        }

        return {
            year: this.metadata.prediction_year,
            months: Object.keys(this.predictions).map(key => {
                const [year, month] = key.split('-');
                return {
                    year: parseInt(year),
                    month: parseInt(month),
                    key: key
                };
            }).sort((a, b) => a.month - b.month),
            total: Object.keys(this.predictions).length,
            model_info: {
                type: this.metadata.model_type,
                r2_score: this.metadata.regression_model?.r2_score,
                training_months: this.metadata.training_data?.total_months
            }
        };
    }

    /**
     * Get prediction for specific month
     */
    async getPrediction(year, month) {
        const key = `${year}-${String(month).padStart(2, '0')}`;
        
        if (!this.predictions[key]) {
            throw new Error(`Prediction not found for ${key}`);
        }

        const filePath = this.predictions[key];
        const geojson = await fs.readJson(filePath);
        
        return {
            year: year,
            month: month,
            date: `${year}-${String(month).padStart(2, '0')}`,
            data: geojson,
            metadata: {
                features_count: geojson.features.length,
                model_type: this.metadata.model_type
            }
        };
    }

    /**
     * Get prediction statistics for a month
     */
    async getPredictionStats(year, month) {
        const prediction = await this.getPrediction(year, month);
        const features = prediction.data.features;

        if (features.length === 0) {
            return {
                year: year,
                month: month,
                error: 'No features in prediction'
            };
        }

        // Extract HSI values
        const hsiValues = features
            .map(f => f.properties.hsi)
            .filter(v => v !== null && v !== undefined);

        if (hsiValues.length === 0) {
            return {
                year: year,
                month: month,
                error: 'No valid HSI values'
            };
        }

        // Calculate statistics
        const sorted = hsiValues.sort((a, b) => a - b);
        const mean = hsiValues.reduce((a, b) => a + b, 0) / hsiValues.length;
        const median = sorted[Math.floor(sorted.length / 2)];
        const std = Math.sqrt(
            hsiValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / hsiValues.length
        );

        // Count by category
        const high = hsiValues.filter(v => v >= 0.75).length;
        const medium = hsiValues.filter(v => v >= 0.45 && v < 0.75).length;
        const low = hsiValues.filter(v => v < 0.45).length;

        return {
            year: year,
            month: month,
            date: `${year}-${String(month).padStart(2, '0')}`,
            statistics: {
                count: hsiValues.length,
                min: sorted[0],
                max: sorted[sorted.length - 1],
                mean: mean,
                median: median,
                std: std,
                q25: sorted[Math.floor(sorted.length * 0.25)],
                q75: sorted[Math.floor(sorted.length * 0.75)]
            },
            categories: {
                high: { count: high, percentage: (high / hsiValues.length * 100).toFixed(2) },
                medium: { count: medium, percentage: (medium / hsiValues.length * 100).toFixed(2) },
                low: { count: low, percentage: (low / hsiValues.length * 100).toFixed(2) }
            }
        };
    }

    /**
     * Get all statistics for a year
     */
    async getYearlyStats(year) {
        const months = await this.getAvailableMonths();
        const yearMonths = months.months.filter(m => m.year === year);
        
        const stats = {};
        for (const m of yearMonths) {
            stats[m.month] = await this.getPredictionStats(year, m.month);
        }

        return {
            year: year,
            total_months: yearMonths.length,
            monthly_stats: stats
        };
    }

    /**
     * Get prediction at specific coordinates
     */
    async getPredictionAtPoint(lat, lon, year, month) {
        const prediction = await this.getPrediction(year, month);
        const features = prediction.data.features;

        // Find closest point
        let closestFeature = null;
        let minDistance = Infinity;

        for (const feature of features) {
            const [fLon, fLat] = feature.geometry.coordinates;
            const distance = Math.sqrt(Math.pow(fLat - lat, 2) + Math.pow(fLon - lon, 2));

            if (distance < minDistance) {
                minDistance = distance;
                closestFeature = feature;
            }
        }

        if (!closestFeature) {
            throw new Error('No prediction found near coordinates');
        }

        return {
            year: year,
            month: month,
            requested_coordinates: { lat, lon },
            closest_point: {
                coordinates: closestFeature.geometry.coordinates,
                distance_degrees: minDistance,
                hsi: closestFeature.properties.hsi
            }
        };
    }

    /**
     * Get trend for a location across all months
     */
    async getTrendAtPoint(lat, lon, year) {
        const months = await this.getAvailableMonths();
        const yearMonths = months.months.filter(m => m.year === year);
        
        const trend = [];
        for (const m of yearMonths) {
            try {
                const point = await this.getPredictionAtPoint(lat, lon, year, m.month);
                trend.push({
                    month: m.month,
                    hsi: point.closest_point.hsi,
                    coordinates: point.closest_point.coordinates
                });
            } catch (error) {
                continue;
            }
        }

        return {
            year: year,
            coordinates: { lat, lon },
            trend: trend,
            summary: {
                mean: trend.length > 0 ? trend.reduce((a, b) => a + b.hsi, 0) / trend.length : null,
                min: trend.length > 0 ? Math.min(...trend.map(t => t.hsi)) : null,
                max: trend.length > 0 ? Math.max(...trend.map(t => t.hsi)) : null
            }
        };
    }

    /**
     * Get spatial bounds
     */
    async getSpatialBounds() {
        if (!this.metadata) {
            throw new Error('Monthly predictions not initialized');
        }

        return this.metadata.grid_info || {};
    }

    /**
     * Get oceanographic parameters info
     */
    async getOceanographicInfo() {
        if (!this.metadata) {
            throw new Error('Monthly predictions not initialized');
        }

        return this.metadata.oceanographic_parameters || {};
    }
}

module.exports = MonthlyPredictionService;

const fs = require('fs-extra');
const path = require('path');

/**
 * Service untuk mengelola prediksi HSI bulanan
 */
class MonthlyPredictionService {
    constructor() {
        this.basePredictionsDir = path.join(__dirname, '../../../data/predictions');
        this.metadata = null;
        this.predictions = {}; // {year: {month: filepath}}
        this.allMetadata = {}; // {year: metadata}
        this.availableYears = [];
    }

    /**
     * Initialize service - load metadata dan predictions for all available years
     */
    async initialize() {
        try {
            // Check if predictions directory exists
            if (!await fs.pathExists(this.basePredictionsDir)) {
                console.warn(`⚠️  Predictions directory not found: ${this.basePredictionsDir}`);
                return false;
            }

            // Find all monthly_YYYY directories
            const dirs = await fs.readdir(this.basePredictionsDir);
            const monthlyDirs = dirs.filter(d => d.match(/^monthly_\d{4}$/));
            
            if (monthlyDirs.length === 0) {
                console.warn(`⚠️  No monthly prediction directories found in ${this.basePredictionsDir}`);
                return false;
            }

            // Load each year's predictions
            for (const dir of monthlyDirs) {
                const yearMatch = dir.match(/monthly_(\d{4})/);
                if (!yearMatch) continue;

                const year = parseInt(yearMatch[1]);
                const yearDir = path.join(this.basePredictionsDir, dir);
                const metadataFile = path.join(yearDir, 'metadata.json');

                // Load metadata if available
                if (await fs.pathExists(metadataFile)) {
                    const metadata = await fs.readJson(metadataFile);
                    this.allMetadata[year] = metadata;
                }

                // Load available predictions for this year
                const yearPredictions = {};
                const files = await fs.readdir(yearDir);
                const geojsonFiles = files.filter(f => f.endsWith('.geojson'));

                for (const file of geojsonFiles) {
                    const match = file.match(/hsi_prediction_(\d{4})_(\d{2})\.geojson/);
                    if (match) {
                        const predictYear = parseInt(match[1]);
                        const month = parseInt(match[2]);
                        
                        if (predictYear === year) {
                            yearPredictions[month] = path.join(yearDir, file);
                        }
                    }
                }

                if (Object.keys(yearPredictions).length > 0) {
                    this.predictions[year] = yearPredictions;
                    this.availableYears.push(year);
                }
            }

            this.availableYears.sort((a, b) => a - b);

            // Set metadata to the first available year (or latest)
            if (this.availableYears.length > 0) {
                const lastYear = this.availableYears[this.availableYears.length - 1];
                this.metadata = this.allMetadata[lastYear] || {};
            }

            console.log(`✅ Monthly prediction service initialized`);
            console.log(`   Available years: ${this.availableYears.join(', ')}`);
            
            for (const year of this.availableYears) {
                const monthCount = Object.keys(this.predictions[year]).length;
                console.log(`   ${year}: ${monthCount} months loaded`);
            }

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
        if (this.availableYears.length === 0) {
            throw new Error('Monthly predictions not initialized');
        }

        // Return months for all available years
        const monthsByYear = {};
        
        for (const year of this.availableYears) {
            const yearMonths = [];
            const monthPaths = this.predictions[year] || {};
            
            for (const month of Object.keys(monthPaths).map(Number).sort((a, b) => a - b)) {
                yearMonths.push({
                    year: year,
                    month: month,
                    key: `${year}-${String(month).padStart(2, '0')}`
                });
            }
            
            monthsByYear[year] = yearMonths;
        }

        // For backward compatibility, also return old format
        const firstYear = this.availableYears[0];
        const oldFormatMonths = monthsByYear[firstYear] || [];

        return {
            // New format for multi-year
            available_years: this.availableYears,
            months_by_year: monthsByYear,
            total_months: Object.values(this.predictions).reduce((sum, months) => sum + Object.keys(months).length, 0),
            // Old format for backward compatibility
            year: firstYear,
            months: oldFormatMonths,
            total: oldFormatMonths.length,
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
        if (!this.predictions[year]) {
            throw new Error(`No predictions available for year ${year}`);
        }

        const monthPath = this.predictions[year][month];
        if (!monthPath) {
            throw new Error(`Prediction not found for ${year}-${String(month).padStart(2, '0')}`);
        }

        const geojson = await fs.readJson(monthPath);
        const yearMetadata = this.allMetadata[year] || {};
        
        return {
            year: year,
            month: month,
            date: `${year}-${String(month).padStart(2, '0')}`,
            data: geojson,
            metadata: {
                features_count: geojson.features.length,
                model_type: yearMetadata.model_type
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
        if (!this.predictions[year]) {
            throw new Error(`No predictions available for year ${year}`);
        }

        const months = await this.getAvailableMonths();
        const yearMonths = months.months_by_year[year] || [];
        
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
        if (!this.predictions[year]) {
            throw new Error(`No predictions available for year ${year}`);
        }

        const months = await this.getAvailableMonths();
        const yearMonths = months.months_by_year[year] || [];
        
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

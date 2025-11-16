const express = require('express');
const router = express.Router();
const GeoJSONService = require('../services/geojsonService');

// Initialize service
const geojsonService = new GeoJSONService();

/**
 * GET /api/hsi/available
 * Get list of available HSI data (year-month combinations)
 */
router.get('/hsi/available', async (req, res) => {
    try {
        const available = await geojsonService.getAvailableData();
        res.json({
            success: true,
            data: available
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/hsi?year=2021&month=1
 * Get HSI GeoJSON for specific year and month
 */
router.get('/hsi', async (req, res) => {
    try {
        const { year, month } = req.query;

        // Validate parameters
        if (!year || !month) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: year and month'
            });
        }

        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);

        // Validate year and month
        if (isNaN(yearNum) || yearNum < 2021 || yearNum > 2024) {
            return res.status(400).json({
                success: false,
                error: 'Invalid year. Must be between 2021 and 2024'
            });
        }

        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                success: false,
                error: 'Invalid month. Must be between 1 and 12'
            });
        }

        // Get GeoJSON data
        const geojson = await geojsonService.getHSIData(yearNum, monthNum);

        res.json({
            success: true,
            data: geojson,
            metadata: {
                year: yearNum,
                month: monthNum,
                yearMonth: `${yearNum}-${String(monthNum).padStart(2, '0')}`
            }
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/metadata
 * Get full metadata.json
 */
router.get('/metadata', async (req, res) => {
    try {
        const metadata = await geojsonService.getMetadata();
        res.json({
            success: true,
            data: metadata
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/biogeography/data?year=2024&month=1
 * Get environmental parameters for biogeography prediction
 * Returns: HSI, SST, CHL, SAL from real GeoJSON data
 */
router.get('/biogeography/data', async (req, res) => {
    try {
        const { year = 2024, month = 1, lat, lon, radius = 0.5 } = req.query;

        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);

        // Get GeoJSON data
        const geojson = await geojsonService.getHSIData(yearNum, monthNum);

        if (!geojson || !geojson.features) {
            return res.status(404).json({
                success: false,
                error: 'Data not found'
            });
        }

        // Calculate statistics from all features
        const stats = {
            hsi: [],
            sst: [],
            chlor_a: [],
            salinity: [],
            depth: []
        };

        geojson.features.forEach(feature => {
            if (feature.properties) {
                if (feature.properties.hsi !== undefined) stats.hsi.push(feature.properties.hsi);
                if (feature.properties.sst !== undefined) stats.sst.push(feature.properties.sst);
                if (feature.properties.chlor_a !== undefined) stats.chlor_a.push(feature.properties.chlor_a);
                if (feature.properties.salinity !== undefined) stats.salinity.push(feature.properties.salinity);
                if (feature.properties.depth !== undefined) stats.depth.push(feature.properties.depth);
            }
        });

        // Calculate averages
        const calculateStats = (arr) => {
            if (arr.length === 0) return { mean: 0, min: 0, max: 0 };
            const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
            const min = Math.min(...arr);
            const max = Math.max(...arr);
            return { mean: parseFloat(mean.toFixed(2)), min: parseFloat(min.toFixed(2)), max: parseFloat(max.toFixed(2)) };
        };

        res.json({
            success: true,
            data: {
                timestamp: new Date().toISOString(),
                yearMonth: `${yearNum}-${String(monthNum).padStart(2, '0')}`,
                parameters: {
                    hsi: calculateStats(stats.hsi),
                    sst: calculateStats(stats.sst),
                    chlor_a: calculateStats(stats.chlor_a),
                    salinity: calculateStats(stats.salinity),
                    depth: calculateStats(stats.depth)
                },
                dataPoints: geojson.features.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;


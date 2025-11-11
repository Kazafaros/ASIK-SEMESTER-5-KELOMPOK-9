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

module.exports = router;


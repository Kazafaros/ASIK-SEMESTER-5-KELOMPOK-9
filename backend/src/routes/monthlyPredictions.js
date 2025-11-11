const express = require('express');
const router = express.Router();
const MonthlyPredictionService = require('../services/monthlyPredictionService');

// Initialize prediction service
const predictionService = new MonthlyPredictionService();
let serviceInitialized = false;

// Initialize service on first request
async function ensureInitialized(req, res, next) {
    if (!serviceInitialized) {
        const initialized = await predictionService.initialize();
        if (!initialized) {
            return res.status(503).json({
                success: false,
                error: 'Monthly prediction service not available. Please run the prediction model first.'
            });
        }
        serviceInitialized = true;
    }
    next();
}

/**
 * GET /api/monthly-predictions/metadata
 * Get prediction model metadata
 */
router.get('/metadata', ensureInitialized, async (req, res) => {
    try {
        const metadata = await predictionService.getMetadata();
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
 * GET /api/monthly-predictions/available
 * Get available months
 */
router.get('/available', ensureInitialized, async (req, res) => {
    try {
        const available = await predictionService.getAvailableMonths();
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
 * GET /api/monthly-predictions/yearly-stats/:year
 * Get all statistics for a year
 * MUST BE BEFORE /:year/:month to avoid route conflict
 */
router.get('/yearly-stats/:year', ensureInitialized, async (req, res) => {
    try {
        const { year } = req.params;
        const yearNum = parseInt(year, 10);

        if (isNaN(yearNum)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid year'
            });
        }

        const stats = await predictionService.getYearlyStats(yearNum);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/monthly-predictions/stats/:year/:month
 * Get statistics for a prediction month
 * MUST BE BEFORE /:year/:month to avoid route conflict
 */
router.get('/stats/:year/:month', ensureInitialized, async (req, res) => {
    try {
        const { year, month } = req.params;
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);

        if (isNaN(yearNum) || isNaN(monthNum)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid year or month'
            });
        }

        const stats = await predictionService.getPredictionStats(yearNum, monthNum);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/monthly-predictions/:year/:month
 * Get prediction for specific month
 * MUST BE LAST to avoid catching other routes
 */
router.get('/:year/:month', ensureInitialized, async (req, res) => {
    try {
        const { year, month } = req.params;
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);

        if (isNaN(yearNum) || isNaN(monthNum)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid year or month'
            });
        }

        if (monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                success: false,
                error: 'Month must be between 1 and 12'
            });
        }

        const prediction = await predictionService.getPrediction(yearNum, monthNum);
        
        res.json({
            success: true,
            data: prediction
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/monthly-predictions/point?lat=X&lon=Y&year=YEAR&month=MONTH
 * Get prediction at specific coordinates
 */
router.get('/point', ensureInitialized, async (req, res) => {
    try {
        const { lat, lon, year, month } = req.query;

        if (!lat || !lon || !year || !month) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: lat, lon, year, month'
            });
        }

        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);

        if (isNaN(latNum) || isNaN(lonNum) || isNaN(yearNum) || isNaN(monthNum)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates or date'
            });
        }

        const prediction = await predictionService.getPredictionAtPoint(latNum, lonNum, yearNum, monthNum);
        
        res.json({
            success: true,
            data: prediction
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/monthly-predictions/trend?lat=X&lon=Y&year=YEAR
 * Get trend for a location across all months
 */
router.get('/trend', ensureInitialized, async (req, res) => {
    try {
        const { lat, lon, year } = req.query;

        if (!lat || !lon || !year) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: lat, lon, year'
            });
        }

        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        const yearNum = parseInt(year, 10);

        if (isNaN(latNum) || isNaN(lonNum) || isNaN(yearNum)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates or year'
            });
        }

        const trend = await predictionService.getTrendAtPoint(latNum, lonNum, yearNum);
        
        res.json({
            success: true,
            data: trend
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/monthly-predictions/bounds
 * Get spatial bounds
 */
router.get('/bounds', ensureInitialized, async (req, res) => {
    try {
        const bounds = await predictionService.getSpatialBounds();
        
        res.json({
            success: true,
            data: bounds
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/monthly-predictions/oceanography
 * Get oceanographic parameters info
 */
router.get('/oceanography', ensureInitialized, async (req, res) => {
    try {
        const info = await predictionService.getOceanographicInfo();
        
        res.json({
            success: true,
            data: info
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/monthly-predictions/health
 * Health check
 */
router.get('/health', ensureInitialized, (req, res) => {
    res.json({
        success: true,
        message: 'Monthly prediction service is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;

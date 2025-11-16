const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const monthlyPredictionsRoutes = require('./routes/monthlyPredictions');
const GeoJSONService = require('./services/geojsonService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from parent directory (frontend)
app.use(express.static(path.join(__dirname, '../../')));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/monthly-predictions', monthlyPredictionsRoutes);

// Root endpoint - serve index.html for SPA routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

// SPA fallback - serve HTML files
app.get(/^\/[a-zA-Z0-9\-_]+\.html$/, (req, res) => {
    const filePath = path.join(__dirname, '../../', req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({
                success: false,
                error: 'Page not found'
            });
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Verify data directory on startup
async function startServer() {
    try {
        const geojsonService = new GeoJSONService();
        await geojsonService.verifyDataDirectory();
        
        const metadata = await geojsonService.getMetadata();
        console.log('✅ Data directory verified');
        console.log(`✅ Loaded metadata: ${metadata.total_months} months available`);
        console.log(`   Date range: ${metadata.data_range.start} to ${metadata.data_range.end}`);

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`🌐 Website: http://localhost:${PORT}/index.html`);
            console.log(`📊 API endpoints available:`);
            console.log(`   GET /api/health`);
            console.log(`   GET /api/hsi/available`);
            console.log(`   GET /api/hsi?year=2021&month=1`);
            console.log(`   GET /api/metadata`);
            console.log(`\n✅ Static files being served from frontend directory`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.error('   Please ensure GeoJSON files are in data/geojson/ directory');
        process.exit(1);
    }
}

// Start server
startServer();

module.exports = app;


/**
 * Analysis Prediction UI Handler
 * Mengelola interaksi UI untuk prediksi di halaman analysis.html
 */

let predictionClient = null;
let mapManager = null;
let currentYear = 2025;
let currentMonth = 1;
let allMonths = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize clients
    predictionClient = new MonthlyPredictionClient();
    mapManager = new MonthlyPredictionMapManager('prediction-map', {
        defaultColormap: 'viridis'
    });

    // Initialize map
    mapManager.initMap();

    // Load initial data
    try {
        console.log('Loading prediction data...');
        
        // Check service health
        const isHealthy = await predictionClient.healthCheck();
        if (!isHealthy) {
            showError('Layanan prediksi tidak tersedia. Jalankan model prediksi terlebih dahulu.');
            return;
        }

        // Load available months
        const available = await predictionClient.getAvailableMonths();
        allMonths = available.months || [];
        currentYear = available.year || 2025;

        // Populate year selector
        const yearSelect = document.getElementById('prediction-year');
        if (yearSelect) {
            yearSelect.value = currentYear;
        }

        // Populate month slider
        const monthSlider = document.getElementById('month-slider');
        if (monthSlider) {
            monthSlider.max = 12;
            monthSlider.value = 1;
        }

        // Load metadata
        const metadata = await predictionClient.getMetadata();
        displayModelInfo(metadata);

        // Load initial prediction
        await loadPrediction(currentYear, 1);

        // Load yearly statistics
        await loadYearlyStats(currentYear);

    } catch (error) {
        console.error('Error initializing prediction UI:', error);
        showError('Gagal memuat data prediksi: ' + error.message);
    }

    // Event listeners
    const predictBtn = document.getElementById('predict-btn');
    if (predictBtn) {
        predictBtn.addEventListener('click', async () => {
            try {
                const year = parseInt(document.getElementById('prediction-year').value);
                const month = parseInt(document.getElementById('month-slider').value);
                await loadPrediction(year, month);
            } catch (error) {
                showError('Gagal memuat prediksi: ' + error.message);
            }
        });
    }

    const monthSlider = document.getElementById('month-slider');
    if (monthSlider) {
        monthSlider.addEventListener('input', async (e) => {
            const month = parseInt(e.target.value);
            const year = parseInt(document.getElementById('prediction-year').value);
            
            // Update month display
            const monthDisplay = document.getElementById('month-display');
            if (monthDisplay) {
                const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                monthDisplay.textContent = `${monthNames[month]} ${year}`;
            }
            
            await loadPrediction(year, month);
        });
    }

    const colormapSelect = document.getElementById('colormap-select');
    if (colormapSelect) {
        colormapSelect.addEventListener('change', (e) => {
            mapManager.setColormap(e.target.value);
            updateLegendGradient();
        });
    }

    // Initialize legend
    updateLegendGradient();
});

/**
 * Display model information
 */
function displayModelInfo(metadata) {
    const modelTypeEl = document.getElementById('model-type');
    const trainingDataEl = document.getElementById('training-data');
    const gridPointsEl = document.getElementById('grid-points');

    if (modelTypeEl) {
        modelTypeEl.textContent = metadata.model_type || 'ARIMA';
    }

    if (trainingDataEl) {
        const training = metadata.training_data || {};
        trainingDataEl.textContent = `${training.total_months || 48} bulan (${training.start} - ${training.end})`;
    }

    if (gridPointsEl) {
        const grid = metadata.grid_info || {};
        gridPointsEl.textContent = `${grid.total_points || 'N/A'} titik`;
    }
}

/**
 * Load prediction for specific month
 */
async function loadPrediction(year, month) {
    try {
        currentYear = year;
        currentMonth = month;

        // Load prediction data
        const prediction = await predictionClient.getPrediction(year, month);
        
        // Load on map
        await mapManager.loadPredictionLayer(year, month);

        // Load statistics
        const stats = await predictionClient.getMonthStats(year, month);
        displayStatistics(stats);

        // Update month display
        const monthDisplay = document.getElementById('month-display');
        if (monthDisplay) {
            const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                               'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            monthDisplay.textContent = `${monthNames[month]} ${year}`;
        }

        // Update legend
        updateLegendGradient();

    } catch (error) {
        console.error('Error loading prediction:', error);
        showError('Gagal memuat prediksi untuk bulan ini');
    }
}

/**
 * Display statistics
 */
function displayStatistics(stats) {
    if (stats.error) {
        console.error('Stats error:', stats.error);
        return;
    }

    const statistics = stats.statistics || {};
    const categories = stats.categories || {};

    // Update statistics cards
    const avgHsiEl = document.getElementById('avg-hsi');
    const maxHsiEl = document.getElementById('max-hsi');
    const optimalAreaEl = document.getElementById('optimal-area');

    if (avgHsiEl) {
        avgHsiEl.textContent = (statistics.mean || 0).toFixed(4);
    }

    if (maxHsiEl) {
        maxHsiEl.textContent = (statistics.max || 0).toFixed(4);
    }

    if (optimalAreaEl) {
        const highPercentage = categories.high?.percentage || 0;
        optimalAreaEl.textContent = `${highPercentage}%`;
    }

    // Display detailed statistics
    const statsDiv = document.getElementById('detailed-stats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <div class="text-xs text-gray-600 dark:text-gray-400">Min HSI</div>
                    <div class="text-lg font-bold">${(statistics.min || 0).toFixed(4)}</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <div class="text-xs text-gray-600 dark:text-gray-400">Median HSI</div>
                    <div class="text-lg font-bold">${(statistics.median || 0).toFixed(4)}</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <div class="text-xs text-gray-600 dark:text-gray-400">Std Dev</div>
                    <div class="text-lg font-bold">${(statistics.std || 0).toFixed(4)}</div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <div class="text-xs text-gray-600 dark:text-gray-400">Total Titik</div>
                    <div class="text-lg font-bold">${statistics.count || 0}</div>
                </div>
            </div>
            
            <div class="mt-4 grid grid-cols-3 gap-3">
                <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                    <div class="text-xs text-green-700 dark:text-green-300">Tinggi (0.75-1.0)</div>
                    <div class="text-lg font-bold text-green-600 dark:text-green-400">${categories.high?.count || 0}</div>
                    <div class="text-xs text-green-600 dark:text-green-400">${categories.high?.percentage || 0}%</div>
                </div>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                    <div class="text-xs text-yellow-700 dark:text-yellow-300">Sedang (0.45-0.75)</div>
                    <div class="text-lg font-bold text-yellow-600 dark:text-yellow-400">${categories.medium?.count || 0}</div>
                    <div class="text-xs text-yellow-600 dark:text-yellow-400">${categories.medium?.percentage || 0}%</div>
                </div>
                <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
                    <div class="text-xs text-red-700 dark:text-red-300">Rendah (0.0-0.45)</div>
                    <div class="text-lg font-bold text-red-600 dark:text-red-400">${categories.low?.count || 0}</div>
                    <div class="text-xs text-red-600 dark:text-red-400">${categories.low?.percentage || 0}%</div>
                </div>
            </div>
        `;
    }
}

/**
 * Load yearly statistics
 */
async function loadYearlyStats(year) {
    try {
        const yearlyStats = await predictionClient.getYearlyStats(year);
        const monthlyStats = yearlyStats.monthly_stats || {};

        // Create trend chart data
        const months = [];
        const means = [];
        const maxs = [];
        const mins = [];

        for (let m = 1; m <= 12; m++) {
            const stats = monthlyStats[m];
            if (stats && stats.statistics) {
                months.push(m);
                means.push(stats.statistics.mean);
                maxs.push(stats.statistics.max);
                mins.push(stats.statistics.min);
            }
        }

        // Display trend chart
        displayTrendChart(months, means, maxs, mins);

    } catch (error) {
        console.error('Error loading yearly stats:', error);
    }
}

/**
 * Display trend chart
 */
function displayTrendChart(months, means, maxs, mins) {
    const chartDiv = document.getElementById('trend-chart');
    if (!chartDiv) return;

    // Simple ASCII chart or use Chart.js if available
    let html = '<div class="text-sm font-mono">';
    html += '<div class="mb-2">Trend HSI Bulanan 2025</div>';
    
    for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const mean = means[i];
        const barLength = Math.round(mean * 50);
        const bar = '█'.repeat(barLength);
        
        html += `<div class="flex items-center gap-2">
            <span class="w-8">${String(month).padStart(2, '0')}</span>
            <span class="flex-1">${bar}</span>
            <span class="w-12 text-right">${mean.toFixed(3)}</span>
        </div>`;
    }
    
    html += '</div>';
    chartDiv.innerHTML = html;
}

/**
 * Update legend gradient
 */
function updateLegendGradient() {
    const gradientEl = document.getElementById('prediction-legend-gradient');
    if (!gradientEl) return;

    const colormapName = mapManager.currentColormap;
    const colormap = COLORMAPS[colormapName] || COLORMAPS.viridis;
    const colors = colormap.colors;

    const steps = 100;
    let gradientStops = '';
    for (let i = 0; i <= steps; i++) {
        const value = i / steps;
        const color = mapManager.getColormapColor(value);
        gradientStops += `${color} ${(i / steps) * 100}%, `;
    }

    gradientEl.style.background = `linear-gradient(to top, ${gradientStops.slice(0, -2)})`;
}

/**
 * Show error message
 */
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-[9999]';
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

/**
 * Analysis Prediction UI Handler
 * Mengelola interaksi UI untuk prediksi di halaman analysis.html
 */

let predictionClient = null;
let mapManager = null;
let currentYear = 2025;
let currentMonth = 1;
let allMonths = [];
let trendChart = null;
let allYearsData = {}; // Store data for all years: { year: { month: stats } }
let yearlyTrendChart = null;

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

        // Load available months and years
        const availableResponse = await predictionClient.getAvailableMonths();
        const available = availableResponse.data || availableResponse;
        
        // Handle both old format (single year) and new format (multiple years)
        if (available.available_years) {
            // New format with multiple years
            const availableYears = available.available_years || [];
            currentYear = availableYears[availableYears.length - 1] || 2025; // Default to latest year
            
            // Populate year selector with all available years
            const yearSelect = document.getElementById('prediction-year');
            if (yearSelect) {
                yearSelect.innerHTML = ''; // Clear existing options
                for (const year of availableYears) {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                }
                yearSelect.value = currentYear;
            }
        } else {
            // Old format with single year
            allMonths = available.months || [];
            currentYear = available.year || 2025;
            
            const yearSelect = document.getElementById('prediction-year');
            if (yearSelect) {
                yearSelect.value = currentYear;
            }
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

        // Load yearly statistics for all available years
        const availableYearsEl = document.getElementById('prediction-year');
        if (availableYearsEl) {
            const years = Array.from(availableYearsEl.options).map(opt => parseInt(opt.value));
            for (const year of years) {
                await loadAllYearsData(year);
            }
        }

        // Display combined trend chart with all years (if needed)
        displayCombinedTrendChart();
        // Also render a compact yearly-average chart
        displayYearlyAverageChart();

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

    // Year selector change handler
    const yearSelect = document.getElementById('prediction-year');
    if (yearSelect) {
        yearSelect.addEventListener('change', async (e) => {
            try {
                const year = parseInt(e.target.value);
                currentYear = year;
                currentMonth = 1;
                
                // Reset month slider to 1
                const monthSlider = document.getElementById('month-slider');
                if (monthSlider) {
                    monthSlider.value = 1;
                }
                
                // Load prediction for first month of selected year
                await loadPrediction(year, 1);
                
                // Load yearly statistics for the selected year
                await loadYearlyStats(year);
                
                console.log(`Switched to year ${year}`);
            } catch (error) {
                showError('Gagal memuat data untuk tahun ini: ' + error.message);
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

        // Update trend chart highlight for the selected month/year
        try {
            displayCombinedTrendChart();
        } catch (err) {
            // Non-fatal: chart update failed
            console.warn('Failed to refresh trend chart:', err);
        }

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
 * Load and store yearly statistics for a specific year
 */
async function loadAllYearsData(year) {
    try {
        const yearlyStatsResponse = await predictionClient.getYearlyStats(year);
        const yearlyStats = yearlyStatsResponse.data || yearlyStatsResponse;
        const monthlyStats = yearlyStats.monthly_stats || {};

        allYearsData[year] = {};

        for (let m = 1; m <= 12; m++) {
            const stats = monthlyStats[m];
            if (stats && stats.statistics) {
                allYearsData[year][m] = {
                    mean: stats.statistics.mean,
                    max: stats.statistics.max,
                    min: stats.statistics.min,
                    count: stats.statistics.count,
                    median: stats.statistics.median || stats.statistics.mean,
                    std: stats.statistics.std || 0
                };
            }
        }

        console.log(`Loaded yearly data for ${year}`);
    } catch (error) {
        console.error(`Error loading yearly stats for ${year}:`, error);
    }
}

/**
 * Display combined trend chart for all years (2025-2028)
 */
function displayCombinedTrendChart() {
    const chartDiv = document.getElementById("trend-chart");
    if (!chartDiv) return;

    // Find or create canvas container
    let chartContainer = chartDiv.querySelector('.chart-container');
    if (!chartContainer) {
        chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartDiv.appendChild(chartContainer);
    }

    // Ensure a canvas exists inside chart-container
    let canvas = document.getElementById("trend-canvas");
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'trend-canvas';
        chartContainer.appendChild(canvas);
    }

    // Attach toggle handler for the values panel (only once)
    const toggleBtn = document.getElementById("trend-toggle");
    if (toggleBtn && !toggleBtn.dataset.bound) {
        toggleBtn.addEventListener('click', () => {
            const vals = document.getElementById("trend-values");
            if (!vals) return;
            vals.classList.toggle('hidden');
            toggleBtn.textContent = vals.classList.contains('hidden') ? 'Tampilkan' : 'Sembunyikan';
        });
        toggleBtn.dataset.bound = '1';
    }

    // Build timeline data for all years
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    const means = [];
    const maxs = [];
    const mins = [];
    const yearMonthPairs = []; // Store year/month for reference

    const years = Object.keys(allYearsData).map(Number).sort((a, b) => a - b);

    for (const year of years) {
        for (let m = 1; m <= 12; m++) {
            const data = allYearsData[year]?.[m];
            if (data) {
                labels.push(`${monthNames[m]}'${String(year).slice(2)}`); // "Jan'25"
                means.push(data.mean);
                maxs.push(data.max);
                mins.push(data.min);
                yearMonthPairs.push({ year, month: m });
            }
        }
    }

    // Prepare dataset arrays
    const meanData = means.map(v => (v === undefined || v === null) ? null : Number(v));
    const maxData = maxs.map(v => (v === undefined || v === null) ? null : Number(v));
    const minData = mins.map(v => (v === undefined || v === null) ? null : Number(v));

    // Build point radius array to highlight the currentMonth of currentYear
        // micro point radii to reduce overall chart height (small radii)
        const pointRadii = meanData.map((_, idx) => {
        const pair = yearMonthPairs[idx];
        return (pair.year === currentYear && pair.month === currentMonth) ? 4 : 1.5;
    });

    // Build point colors: highlight current selection
    const pointColors = meanData.map((_, idx) => {
        const pair = yearMonthPairs[idx];
        return (pair.year === currentYear && pair.month === currentMonth) 
            ? 'rgba(255, 193, 7, 1)' // Yellow highlight
            : 'rgba(0, 119, 182, 1)'; // Normal blue
    });

    // If chart exists, update its data
    if (trendChart) {
        trendChart.data.labels = labels;
        trendChart.data.datasets[0].data = maxData;
        trendChart.data.datasets[1].data = minData;
        trendChart.data.datasets[2].data = meanData;
        trendChart.data.datasets[2].pointRadius = pointRadii;
        trendChart.data.datasets[2].pointBackgroundColor = pointColors;
        trendChart.update();
        updateTrendValues(yearMonthPairs);
        return;
    }

    // Create new Chart.js chart
    const ctx = canvas.getContext("2d");
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Max HSI',
                    data: maxData,
                    borderColor: 'rgba(0,123,255,0.0)',
                    backgroundColor: 'rgba(0,0,0,0)',
                    pointRadius: 0,
                    tension: 0.3,
                    fill: false,
                },
                {
                    label: 'Min HSI',
                    data: minData,
                    borderColor: 'rgba(0,0,0,0)',
                    backgroundColor: 'rgba(0,123,255,0.15)',
                    fill: '-1', // fill to previous dataset (max)
                    pointRadius: 0,
                    tension: 0.3,
                },
                {
                    label: 'Mean HSI',
                    data: meanData,
                    borderColor: 'rgba(0,119,182,1)',
                    backgroundColor: 'rgba(0,119,182,0.08)',
                    pointBackgroundColor: pointColors,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: pointRadii,
                    showLine: true,
                    tension: 0.3,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
                plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 3,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderWidth: 1,
                    titleFont: { size: 9 },
                    bodyFont: { size: 8 },
                    callbacks: {
                        title: function(context) {
                            if (context.length === 0) return '';
                            const idx = context[0].dataIndex;
                            const pair = yearMonthPairs[idx];
                            const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                                               'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                            return `${monthNames[pair.month]} ${pair.year}`;
                        },
                        label: function(context) {
                            const v = context.raw;
                            if (v === null) return 'N/A';
                            const idx = context.dataIndex;
                            const pair = yearMonthPairs[idx];
                            const data = allYearsData[pair.year]?.[pair.month];
                            
                            if (context.datasetIndex === 2) { // Mean line
                                return [
                                    `Mean: ${Number(v).toFixed(4)}`,
                                    `Max: ${data?.max?.toFixed(4) || 'N/A'}`,
                                    `Min: ${data?.min?.toFixed(4) || 'N/A'}`,
                                ];
                            }
                            return '';
                        }
                    }
                }
            },
            layout: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
            scales: {
                    x: {
                    grid: { 
                        display: true,
                        drawBorder: true,
                        color: 'rgba(0,0,0,0.02)',
                        drawTicks: false
                    },
                    ticks: {
                        font: { size: 8 },
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        padding: 2
                    }
                },
                y: {
                    min: 0,
                    max: 1,
                    grid: {
                        color: 'rgba(0,0,0,0.03)'
                    },
                    ticks: {
                        stepSize: 0.2,
                        font: { size: 7 },
                        callback: function(v) {
                            return v.toFixed(1);
                        }
                    }
                }
            }
        }
    });

    updateTrendValues(yearMonthPairs);
}

/**
 * Display a compact chart that shows average HSI per available year
 */
function displayYearlyAverageChart() {
    const container = document.getElementById('yearly-trend-chart');
    if (!container) return;

    const canvas = document.getElementById('yearly-trend-canvas');
    if (!canvas) return;

    const years = Object.keys(allYearsData).map(Number).sort((a, b) => a - b);
    if (years.length === 0) return;

    const labels = [];
    const averages = [];

    for (const y of years) {
        const months = allYearsData[y] || {};
        const vals = Object.keys(months).map(m => months[m]?.mean).filter(v => v !== undefined && v !== null);
        if (vals.length === 0) continue;
        const sum = vals.reduce((s, v) => s + Number(v), 0);
        const avg = sum / vals.length;
        labels.push(String(y));
        averages.push(Number(avg.toFixed(4)));
    }

    if (labels.length === 0) return;

    // If existing chart, update
    if (yearlyTrendChart) {
        yearlyTrendChart.data.labels = labels;
        yearlyTrendChart.data.datasets[0].data = averages;
        yearlyTrendChart.update();
        return;
    }

    const ctx = canvas.getContext('2d');
    yearlyTrendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rata-rata HSI',
                data: averages,
                backgroundColor: 'rgba(3,169,244,0.85)',
                borderColor: 'rgba(3,169,244,1)',
                borderWidth: 1,
                barThickness: 18,
                maxBarThickness: 24,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { font: { size: 11 } }, grid: { display: false } },
                y: { min: 0, max: 1, ticks: { stepSize: 0.2, font: { size: 10 }, callback: v => v.toFixed(1) }, grid: { color: 'rgba(0,0,0,0.03)' } }
            }
        }
    });
}

/**
 * Display detailed values table below the chart
 */
function updateTrendValues(yearMonthPairs) {
    const valuesDiv = document.getElementById("trend-values");
    if (!valuesDiv) return;

    // Build a micro HTML table for current year (compact)
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let html = '<div class="font-semibold mb-1 text-gray-800 dark:text-gray-200 text-xs">Nilai Bulan ' + currentYear + ':</div>';
    html += '<div class="grid grid-cols-6 gap-1">';

    for (let m = 1; m <= 12; m++) {
        const data = allYearsData[currentYear]?.[m];
        if (data) {
            const isHighlighted = m === currentMonth;
            const bgClass = isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400' : 'bg-gray-50 dark:bg-gray-800/50';
            html += `
                <div class="p-0.5 rounded border text-center ${bgClass} cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" 
                     onclick="setMonth(${m})" title="${monthNames[m]} - Mean: ${data.mean.toFixed(3)}, Max: ${data.max.toFixed(3)}, Min: ${data.min.toFixed(3)}">
                    <div class="text-xs font-bold text-gray-700 dark:text-gray-300">${monthNames[m]}</div>
                    <div class="text-xs font-bold text-primary">${data.mean.toFixed(3)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        <span class="text-green-600 dark:text-green-400">${data.max.toFixed(2)}</span>/<span class="text-red-600 dark:text-red-400">${data.min.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }
    }

    html += '</div>';
    valuesDiv.innerHTML = html;
}

/**
 * Helper to set current month
 */
function setMonth(month) {
    currentMonth = month;
    const monthSlider = document.getElementById('month-slider');
    if (monthSlider) {
        monthSlider.value = month;
        // Trigger change event
        monthSlider.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

/**
 * Load yearly statistics (kept for backward compatibility)
 */
async function loadYearlyStats(year) {
    // This is now handled by loadAllYearsData during initialization
    // But kept for compatibility if needed elsewhere
    return;
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

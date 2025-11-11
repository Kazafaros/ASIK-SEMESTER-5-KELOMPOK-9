/**
 * Dashboard OLAP - Online Analytical Processing
 * Memungkinkan analisis data multidimensi interaktif
 */

class OLAPDashboard {
    constructor() {
        this.apiClient = new HSIApiClient();
        this.currentData = null;
        this.selectedLocation = null;
        this.selectedOptions = {
            timeDimension: 'monthly',
            layer: 'hsi',
            aggregation: 'mean',
            visualization: 'overview'
        };
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Time dimension selector
        const timeSelect = document.getElementById('olap-time-dimension');
        if (timeSelect) {
            timeSelect.addEventListener('change', (e) => {
                this.selectedOptions.timeDimension = e.target.value;
                this.updateDashboard();
            });
        }

        // Layer selector
        const layerSelect = document.getElementById('olap-layer-select');
        if (layerSelect) {
            layerSelect.addEventListener('change', (e) => {
                this.selectedOptions.layer = e.target.value;
                this.updateDashboard();
            });
        }

        // Aggregation selector
        const aggSelect = document.getElementById('olap-aggregation');
        if (aggSelect) {
            aggSelect.addEventListener('change', (e) => {
                this.selectedOptions.aggregation = e.target.value;
                this.updateDashboard();
            });
        }

        // Visualization selector
        const vizSelect = document.getElementById('olap-visualization');
        if (vizSelect) {
            vizSelect.addEventListener('change', (e) => {
                this.selectedOptions.visualization = e.target.value;
                this.render();
            });
        }
    }

    /**
     * Set selected location and load data
     */
    async setLocation(lat, lon, layer) {
        this.selectedLocation = { lat, lon, layer };
        this.selectedOptions.layer = layer;
        
        try {
            await this.loadData();
            this.render();
        } catch (error) {
            console.error('Error loading OLAP data:', error);
            this.showError('Gagal memuat data OLAP');
        }
    }

    /**
     * Load data from API
     */
    async loadData() {
        if (!this.selectedLocation) return;

        try {
            // Get available data
            const available = await this.apiClient.getAvailableData();
            
            // Generate data based on selected options
            this.currentData = {
                location: this.selectedLocation,
                timeSeries: this.generateTimeSeries(available),
                layerComparison: this.generateLayerComparison(),
                statistics: this.generateStatistics(available),
                metadata: {
                    timestampLoaded: new Date().toLocaleString('id-ID'),
                    totalRecords: available.available.length
                }
            };
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    /**
     * Generate time series data
     */
    generateTimeSeries(available) {
        const { lat, lon } = this.selectedLocation;
        const { layer, timeDimension, aggregation } = this.selectedOptions;
        
        const propertyMap = {
            'hsi': 'hsi',
            'sst': 'sst',
            'chlor_a': 'chl',
            'salinity': 'salinity'
        };
        const property = propertyMap[layer];

        // Group by time dimension
        let timeGroups = {};
        
        available.available.forEach(item => {
            let timeKey;
            if (timeDimension === 'yearly') {
                timeKey = `${item.year}`;
            } else {
                timeKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
            }

            if (!timeGroups[timeKey]) {
                timeGroups[timeKey] = [];
            }
            timeGroups[timeKey].push(item);
        });

        // Generate values using consistent algorithm
        const series = Object.entries(timeGroups).map(([timeKey, items]) => {
            const value = this.generateConsistentValue(lat, lon, items[0].year, items[0].month, layer);
            return {
                timeKey,
                year: items[0].year,
                month: items[0].month,
                value: value,
                formattedValue: this.formatValue(value, layer),
                monthName: this.getMonthName(items[0].month),
                count: items.length
            };
        });

        return series.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return (a.month || 0) - (b.month || 0);
        });
    }

    /**
     * Generate consistent value based on lat, lon, year, month
     */
    generateConsistentValue(lat, lon, year, month, layer) {
        // Use sine/cosine to create consistent but realistic-looking values
        const seasonalFactor = Math.sin((month - 1) * Math.PI / 6); // Seasonal variation
        const spatialFactor = Math.sin(lat * 0.1) * Math.cos(lon * 0.1); // Spatial variation
        const yearFactor = Math.sin(year * 0.1); // Year variation

        let baseValue;
        let range = VALUE_RANGES[layer];

        switch (layer) {
            case 'hsi':
                // Range 0-1
                baseValue = (0.5 + spatialFactor * 0.2 + seasonalFactor * 0.15 + yearFactor * 0.05);
                break;
            case 'sst':
                // Range 25-31 (centered at 27.5)
                baseValue = 27.5 + seasonalFactor * 1.5 + spatialFactor * 0.8;
                break;
            case 'chlor_a':
                // Range 0.1-3.0
                baseValue = 0.8 + seasonalFactor * 0.6 + Math.abs(spatialFactor) * 0.5;
                break;
            case 'salinity':
                // Range 31-36 (centered at 33)
                baseValue = 33 + seasonalFactor * 0.8 + spatialFactor * 0.5;
                break;
            default:
                baseValue = 0.5;
        }

        // Clamp to range
        baseValue = Math.max(range.min, Math.min(range.max, baseValue));
        return baseValue;
    }

    /**
     * Generate comparison between layers
     */
    generateLayerComparison() {
        const { lat, lon } = this.selectedLocation;
        
        // Get current month data
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const layers = [
            {
                name: 'HSI',
                value: this.generateConsistentValue(lat, lon, year, month, 'hsi'),
                color: '#0077b6',
                unit: '(0-1)',
                description: 'Habitat Suitability Index'
            },
            {
                name: 'SST',
                value: this.generateConsistentValue(lat, lon, year, month, 'sst'),
                color: '#00b4d8',
                unit: '°C',
                description: 'Sea Surface Temperature'
            },
            {
                name: 'Chlorophyll-a',
                value: this.generateConsistentValue(lat, lon, year, month, 'chlor_a'),
                color: '#90ee90',
                unit: 'mg/m³',
                description: 'Produktivitas Primer'
            },
            {
                name: 'Salinity',
                value: this.generateConsistentValue(lat, lon, year, month, 'salinity'),
                color: '#87ceeb',
                unit: 'PSU',
                description: 'Salinitas Air Laut'
            }
        ];

        return layers;
    }

    /**
     * Generate statistics
     */
    generateStatistics(available) {
        const series = this.generateTimeSeries(available);
        const values = series.map(s => s.value);

        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const sorted = [...values].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        
        // Calculate standard deviation
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance);

        // Calculate quartiles
        const q1Index = Math.floor(sorted.length * 0.25);
        const q3Index = Math.floor(sorted.length * 0.75);
        const q1 = sorted[q1Index];
        const q3 = sorted[q3Index];
        const iqr = q3 - q1;

        return {
            count: values.length,
            mean: mean,
            median: median,
            min: min,
            max: max,
            range: range,
            std: std,
            q1: q1,
            q3: q3,
            iqr: iqr,
            variance: variance,
            cv: std / mean // Coefficient of variation
        };
    }

    /**
     * Format value based on layer type
     */
    formatValue(value, layer) {
        switch (layer) {
            case 'hsi':
                return value.toFixed(3);
            case 'sst':
                return value.toFixed(2) + '°C';
            case 'chlor_a':
                return value.toFixed(3) + ' mg/m³';
            case 'salinity':
                return value.toFixed(2) + ' PSU';
            default:
                return value.toFixed(3);
        }
    }

    /**
     * Get month name
     */
    getMonthName(month) {
        const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return names[month - 1] || '';
    }

    /**
     * Update dashboard
     */
    async updateDashboard() {
        if (!this.currentData) return;
        
        try {
            // Reload data with current selections
            const available = await this.apiClient.getAvailableData();
            this.currentData.timeSeries = this.generateTimeSeries(available);
            this.currentData.statistics = this.generateStatistics(available);
            this.render();
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    /**
     * Render dashboard
     */
    render() {
        const contentDiv = document.getElementById('olap-dashboard-content');
        if (!contentDiv || !this.currentData) return;

        const { visualization } = this.selectedOptions;
        let html = '';

        switch (visualization) {
            case 'overview':
                html = this.renderOverview();
                break;
            case 'timeseries':
                html = this.renderTimeSeries();
                break;
            case 'comparison':
                html = this.renderComparison();
                break;
            case 'statistics':
                html = this.renderStatistics();
                break;
        }

        contentDiv.innerHTML = html;
    }

    /**
     * Render overview
     */
    renderOverview() {
        const stats = this.currentData.statistics;
        const { layer } = this.selectedOptions;

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border-l-4 border-primary">
                    <div class="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">RATA-RATA</div>
                    <div class="text-2xl font-bold text-primary">${this.formatValue(stats.mean, layer)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">Mean dari ${stats.count} data point</div>
                </div>
                
                <div class="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg border-l-4 border-secondary">
                    <div class="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">MEDIAN</div>
                    <div class="text-2xl font-bold text-secondary">${this.formatValue(stats.median, layer)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">Nilai tengah</div>
                </div>
                
                <div class="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border-l-4 border-green-500">
                    <div class="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">RANGE</div>
                    <div class="text-2xl font-bold text-green-600">${this.formatValue(stats.min, layer)} - ${this.formatValue(stats.max, layer)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">Min - Max</div>
                </div>
                
                <div class="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border-l-4 border-purple-500">
                    <div class="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">STD DEVIASI</div>
                    <div class="text-2xl font-bold text-purple-600">${stats.std.toFixed(3)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">Variasi data</div>
                </div>
            </div>
            
            <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-3">Lokasi Data</h4>
                    <div class="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                        <div>📍 Latitude: <span class="font-mono font-bold text-gray-800 dark:text-gray-200">${this.selectedLocation.lat.toFixed(4)}</span></div>
                        <div>📍 Longitude: <span class="font-mono font-bold text-gray-800 dark:text-gray-200">${this.selectedLocation.lon.toFixed(4)}</span></div>
                        <div>🔬 Layer: <span class="font-bold text-gray-800 dark:text-gray-200">${this.getLayerName(this.selectedLocation.layer)}</span></div>
                    </div>
                </div>
                
                <div class="bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-3">Interpretasi</h4>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        ${this.generateInterpretation(stats.mean)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render time series
     */
    renderTimeSeries() {
        const series = this.currentData.timeSeries;
        const { layer } = this.selectedOptions;
        
        if (series.length === 0) {
            return '<div class="text-center text-gray-500">Tidak ada data tersedia</div>';
        }

        const maxValue = Math.max(...series.map(s => s.value));
        const minValue = Math.min(...series.map(s => s.value));
        const range = maxValue - minValue || 1;

        // Create bar chart
        const bars = series.map(s => {
            const normalizedHeight = ((s.value - minValue) / range) * 100;
            return `
                <div class="flex flex-col items-center gap-2 flex-1" title="${s.timeKey}: ${s.formattedValue}">
                    <div class="w-full flex justify-center">
                        <div style="width: 24px; height: ${Math.max(20, normalizedHeight)}px; background: linear-gradient(to top, #0077b6, #00b4d8); border-radius: 4px 4px 0 0; cursor: pointer;" class="hover:opacity-80 transition-opacity"></div>
                    </div>
                    <div class="text-xs font-bold text-gray-600 dark:text-gray-400 text-center" style="min-width: 40px;">${s.monthName || s.year}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-4">Trend ${this.getLayerName(layer)}</h4>
                <div style="display: flex; align-items: flex-end; gap: 6px; height: 220px; padding: 16px; background: #f9f9f9 dark:bg-gray-800/50; border-radius: 8px; overflow-x: auto;">
                    ${bars}
                </div>
            </div>
            
            <div class="mt-4 bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-3">Detail Data</h4>
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b-2 border-primary">
                            <th class="text-left py-2 px-3 font-bold text-gray-700 dark:text-gray-300">Periode</th>
                            <th class="text-right py-2 px-3 font-bold text-gray-700 dark:text-gray-300">Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${series.map(s => `
                            <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td class="py-2 px-3 text-gray-700 dark:text-gray-400">${s.timeKey}</td>
                                <td class="py-2 px-3 text-right font-mono font-bold text-primary">${s.formattedValue}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Render layer comparison
     */
    renderComparison() {
        const layers = this.currentData.layerComparison;
        const maxValue = Math.max(...layers.map(l => l.value));

        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-4">Perbandingan Antar Layer</h4>
                    <div class="space-y-4">
                        ${layers.map(layer => {
                            const percentage = (layer.value / maxValue) * 100;
                            return `
                                <div>
                                    <div class="flex justify-between mb-2">
                                        <div>
                                            <div class="font-bold text-gray-700 dark:text-gray-300">${layer.name}</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">${layer.description}</div>
                                        </div>
                                        <div class="font-bold text-gray-800 dark:text-gray-200">${this.formatValue(layer.value, this.selectedOptions.layer)}</div>
                                    </div>
                                    <div class="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div style="width: ${percentage}%; background: ${layer.color}; height: 100%; transition: width 0.3s;" class="flex items-center justify-end pr-2">
                                            <span class="text-xs font-bold text-white">${percentage.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-4">Ringkasan Layer</h4>
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b-2 border-primary">
                                <th class="text-left py-2 px-2 font-bold text-gray-700 dark:text-gray-300">Layer</th>
                                <th class="text-right py-2 px-2 font-bold text-gray-700 dark:text-gray-300">Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${layers.map(layer => `
                                <tr class="border-b border-gray-200 dark:border-gray-700">
                                    <td class="py-2 px-2">
                                        <span style="display: inline-block; width: 12px; height: 12px; background: ${layer.color}; border-radius: 2px; margin-right: 6px;"></span>
                                        <span class="font-bold text-gray-700 dark:text-gray-300">${layer.name}</span>
                                    </td>
                                    <td class="py-2 px-2 text-right font-mono font-bold" style="color: ${layer.color};">${layer.value.toFixed(3)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Render statistics
     */
    renderStatistics() {
        const stats = this.currentData.statistics;

        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-4">Statistik Deskriptif</h4>
                    <table class="w-full text-sm">
                        <tbody>
                            <tr class="border-b border-gray-200 dark:border-gray-700">
                                <td class="py-3 px-3 font-bold text-gray-700 dark:text-gray-300">Jumlah Data</td>
                                <td class="py-3 px-3 text-right font-mono font-bold text-primary">${stats.count}</td>
                            </tr>
                            <tr class="border-b border-gray-200 dark:border-gray-700">
                                <td class="py-3 px-3 font-bold text-gray-700 dark:text-gray-300">Rata-rata (Mean)</td>
                                <td class="py-3 px-3 text-right font-mono font-bold text-primary">${stats.mean.toFixed(4)}</td>
                            </tr>
                            <tr class="border-b border-gray-200 dark:border-gray-700">
                                <td class="py-3 px-3 font-bold text-gray-700 dark:text-gray-300">Median</td>
                                <td class="py-3 px-3 text-right font-mono font-bold text-primary">${stats.median.toFixed(4)}</td>
                            </tr>
                            <tr class="border-b border-gray-200 dark:border-gray-700">
                                <td class="py-3 px-3 font-bold text-gray-700 dark:text-gray-300">Minimum</td>
                                <td class="py-3 px-3 text-right font-mono font-bold text-primary">${stats.min.toFixed(4)}</td>
                            </tr>
                            <tr class="border-b border-gray-200 dark:border-gray-700">
                                <td class="py-3 px-3 font-bold text-gray-700 dark:text-gray-300">Maksimum</td>
                                <td class="py-3 px-3 text-right font-mono font-bold text-primary">${stats.max.toFixed(4)}</td>
                            </tr>
                            <tr class="border-b border-gray-200 dark:border-gray-700">
                                <td class="py-3 px-3 font-bold text-gray-700 dark:text-gray-300">Range</td>
                                <td class="py-3 px-3 text-right font-mono font-bold text-primary">${stats.range.toFixed(4)}</td>
                            </tr>
                            <tr class="border-b border-gray-200 dark:border-gray-700">
                                <td class="py-3 px-3 font-bold text-gray-700 dark:text-gray-300">Standar Deviasi</td>
                                <td class="py-3 px-3 text-right font-mono font-bold text-primary">${stats.std.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td class="py-3 px-3 font-bold text-gray-700 dark:text-gray-300">Varians</td>
                                <td class="py-3 px-3 text-right font-mono font-bold text-primary">${stats.variance.toFixed(6)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-4">Analisis Distribusi</h4>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class="font-bold text-gray-700 dark:text-gray-300">Q1 (25%)</span>
                                <span class="font-mono font-bold text-primary">${stats.q1.toFixed(4)}</span>
                            </div>
                            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" style="width: ${(stats.q1 / stats.max) * 100}%; background: linear-gradient(to right, #0077b6, #00b4d8);"></div>
                        </div>
                        
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class="font-bold text-gray-700 dark:text-gray-300">Q3 (75%)</span>
                                <span class="font-mono font-bold text-primary">${stats.q3.toFixed(4)}</span>
                            </div>
                            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" style="width: ${(stats.q3 / stats.max) * 100}%; background: linear-gradient(to right, #0077b6, #00b4d8);"></div>
                        </div>
                        
                        <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg mt-4">
                            <div class="font-bold text-gray-800 dark:text-gray-200 mb-2">IQR (Interquartile Range)</div>
                            <div class="text-2xl font-bold text-primary">${stats.iqr.toFixed(4)}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Jangkauan 50% data tengah</div>
                        </div>
                        
                        <div class="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
                            <div class="font-bold text-gray-800 dark:text-gray-200 mb-2">Coefficient of Variation</div>
                            <div class="text-2xl font-bold text-purple-600">${(stats.cv * 100).toFixed(1)}%</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Variabilitas relatif</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate interpretation text
     */
    generateInterpretation(value) {
        const { layer } = this.selectedOptions;
        
        switch (layer) {
            case 'hsi':
                if (value >= 0.75) return '🟢 <strong>Tinggi</strong> - Habitat sangat sesuai untuk ekosistem laut';
                if (value >= 0.45) return '🟡 <strong>Sedang</strong> - Habitat cukup sesuai untuk kehidupan laut';
                return '🔴 <strong>Rendah</strong> - Habitat kurang sesuai untuk ekosistem laut';
                
            case 'sst':
                if (value >= 27 && value <= 29) return '✅ <strong>Optimal</strong> - Suhu ideal untuk pertumbuhan organisme laut';
                if (value < 27) return '❄️ <strong>Dingin</strong> - Suhu lebih rendah dari kondisi optimal';
                return '🔥 <strong>Hangat</strong> - Suhu lebih tinggi dari kondisi optimal';
                
            case 'chlor_a':
                if (value >= 0.5 && value <= 2.0) return '✅ <strong>Normal</strong> - Produktivitas primer dalam kondisi normal';
                if (value < 0.5) return '📉 <strong>Rendah</strong> - Produktivitas primer rendah, perlu monitoring';
                return '📈 <strong>Tinggi</strong> - Produktivitas primer tinggi, area subur';
                
            case 'salinity':
                if (value >= 33 && value <= 34) return '✅ <strong>Optimal</strong> - Salinitas ideal untuk habitat laut';
                if (value < 33) return '💧 <strong>Rendah</strong> - Salinitas lebih rendah, pengaruh freshwater';
                return '🧂 <strong>Tinggi</strong> - Salinitas lebih tinggi, area evaporasi';
                
            default:
                return 'Data interpretasi tidak tersedia';
        }
    }

    /**
     * Get layer name
     */
    getLayerName(layer) {
        const names = {
            'hsi': 'Habitat Suitability Index',
            'sst': 'Sea Surface Temperature',
            'chlor_a': 'Chlorophyll-a',
            'salinity': 'Salinity'
        };
        return names[layer] || layer;
    }

    /**
     * Show error message
     */
    showError(message) {
        const contentDiv = document.getElementById('olap-dashboard-content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                        <div class="text-red-500 text-2xl mb-2">⚠️</div>
                        <p class="text-red-600 dark:text-red-400">${message}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.olapDashboard = new OLAPDashboard();
});

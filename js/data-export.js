/**
 * Data Export Module
 * Handles exporting map data to Excel format
 */

class DataExporter {
    constructor() {
        this.clickedPointsHistory = this.loadClickedPointsHistory();
    }

    /**
     * Load clicked points history from localStorage
     */
    loadClickedPointsHistory() {
        try {
            const stored = localStorage.getItem('mapClickedPoints');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading clicked points history:', error);
            return [];
        }
    }

    /**
     * Save clicked point to history
     */
    saveClickedPoint(pointData) {
        try {
            // Check if point already exists (same lat/lon within tolerance)
            const exists = this.clickedPointsHistory.some(p => 
                Math.abs(p.lat - pointData.lat) < 0.0001 && 
                Math.abs(p.lon - pointData.lon) < 0.0001
            );

            if (!exists) {
                this.clickedPointsHistory.push({
                    ...pointData,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('mapClickedPoints', JSON.stringify(this.clickedPointsHistory));
            }
        } catch (error) {
            console.error('Error saving clicked point:', error);
        }
    }

    /**
     * Export clicked points to Excel
     */
    async exportClickedPoints() {
        if (this.clickedPointsHistory.length === 0) {
            alert('Belum ada data yang diklik. Silakan klik beberapa titik pada peta terlebih dahulu.');
            return;
        }

        try {
            // Prepare data for Excel
            const worksheetData = this.clickedPointsHistory.map((point, index) => ({
                'No': index + 1,
                'Latitude': point.lat,
                'Longitude': point.lon,
                'Tahun': point.year || '',
                'Bulan': point.month || '',
                'Periode': point.date || '',
                'HSI': point.hsi !== null && point.hsi !== undefined ? point.hsi.toFixed(4) : '',
                'SST (°C)': point.sst !== null && point.sst !== undefined ? point.sst.toFixed(2) : '',
                'Chlorophyll-a (mg/m³)': point.chl !== null && point.chl !== undefined ? point.chl.toFixed(3) : '',
                'Salinity (PSU)': point.salinity !== null && point.salinity !== undefined ? point.salinity.toFixed(2) : '',
                'Layer': point.layer || '',
                'Waktu Klik': point.timestamp ? new Date(point.timestamp).toLocaleString('id-ID') : ''
            }));

            // Create workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(worksheetData);

            // Set column widths
            const colWidths = [
                { wch: 5 },   // No
                { wch: 12 },  // Latitude
                { wch: 12 },  // Longitude
                { wch: 8 },   // Tahun
                { wch: 8 },   // Bulan
                { wch: 12 },  // Periode
                { wch: 10 },  // HSI
                { wch: 12 },  // SST
                { wch: 18 },  // Chlorophyll-a
                { wch: 15 },  // Salinity
                { wch: 10 },  // Layer
                { wch: 20 }   // Waktu Klik
            ];
            ws['!cols'] = colWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Data Titik yang Diklik');

            // Generate filename
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `Data_Titik_Diklik_${dateStr}.xlsx`;

            // Download
            XLSX.writeFile(wb, filename);
            
            alert(`Berhasil mengexport ${this.clickedPointsHistory.length} titik data ke Excel!`);
        } catch (error) {
            console.error('Error exporting clicked points:', error);
            alert('Gagal mengexport data. Silakan coba lagi.');
        }
    }

    /**
     * Export all historical data from API
     */
    async exportAllHistoricalData() {
        try {
            // Show loading indicator
            const btn = document.getElementById('download-data-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="loader-2" class="size-4 animate-spin"></i> <span>Mengunduh...</span>';
            btn.disabled = true;
            lucide.createIcons();

            const apiClient = new HSIApiClient();
            
            // Get available data
            const available = await apiClient.getAvailableData();
            const availableData = available.available || [];

            if (availableData.length === 0) {
                alert('Tidak ada data historis yang tersedia.');
                btn.innerHTML = originalText;
                btn.disabled = false;
                lucide.createIcons();
                return;
            }

            // Confirm with user
            const confirmMsg = `Akan mengunduh data historis lengkap untuk ${availableData.length} periode.\nIni mungkin memakan waktu beberapa saat. Lanjutkan?`;
            if (!confirm(confirmMsg)) {
                btn.innerHTML = originalText;
                btn.disabled = false;
                lucide.createIcons();
                return;
            }

            // Fetch all data
            const allData = [];
            let processed = 0;

            for (const item of availableData) {
                try {
                    const geojson = await apiClient.getHSIData(item.year, item.month);
                    
                    // Convert GeoJSON features to rows
                    geojson.features.forEach(feature => {
                        const props = feature.properties;
                        const coords = feature.geometry.coordinates;
                        
                        allData.push({
                            'Latitude': coords[1],
                            'Longitude': coords[0],
                            'Tahun': item.year,
                            'Bulan': item.month,
                            'Periode': `${item.year}-${String(item.month).padStart(2, '0')}`,
                            'HSI': props.hsi !== null && props.hsi !== undefined ? props.hsi.toFixed(4) : '',
                            'SST (°C)': props.sst !== null && props.sst !== undefined ? props.sst.toFixed(2) : '',
                            'Chlorophyll-a (mg/m³)': props.chl !== null && props.chl !== undefined ? props.chl.toFixed(3) : '',
                            'Salinity (PSU)': props.salinity !== null && props.salinity !== undefined ? props.salinity.toFixed(2) : ''
                        });
                    });

                    processed++;
                    // Update progress (optional - can be enhanced with progress bar)
                    if (processed % 5 === 0) {
                        console.log(`Memproses ${processed}/${availableData.length} periode...`);
                    }
                } catch (error) {
                    console.error(`Error fetching data for ${item.year}-${item.month}:`, error);
                    // Continue with next item
                }
            }

            if (allData.length === 0) {
                alert('Tidak ada data yang berhasil diunduh.');
                btn.innerHTML = originalText;
                btn.disabled = false;
                lucide.createIcons();
                return;
            }

            // Create workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(allData);

            // Set column widths
            const colWidths = [
                { wch: 12 },  // Latitude
                { wch: 12 },  // Longitude
                { wch: 8 },   // Tahun
                { wch: 8 },   // Bulan
                { wch: 12 },  // Periode
                { wch: 10 },  // HSI
                { wch: 12 },  // SST
                { wch: 18 },  // Chlorophyll-a
                { wch: 15 }   // Salinity
            ];
            ws['!cols'] = colWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Data Historis Lengkap');

            // Generate filename
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `Data_Historis_Lengkap_${dateStr}.xlsx`;

            // Download
            XLSX.writeFile(wb, filename);

            alert(`Berhasil mengexport ${allData.length} titik data dari ${processed} periode ke Excel!`);
            
            // Reset button
            btn.innerHTML = originalText;
            btn.disabled = false;
            lucide.createIcons();
        } catch (error) {
            console.error('Error exporting all historical data:', error);
            alert('Gagal mengexport data historis. Silakan coba lagi.');
            
            // Reset button
            const btn = document.getElementById('download-data-btn');
            btn.innerHTML = '<i data-lucide="download" class="size-4"></i> <span>Download Data</span>';
            btn.disabled = false;
            lucide.createIcons();
        }
    }
}

// Global instance
let dataExporter = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        dataExporter = new DataExporter();
        window.dataExporter = dataExporter; // Make globally available

        // Setup download button dropdown
        const downloadBtn = document.getElementById('download-data-btn');
        const downloadDropdown = document.getElementById('download-dropdown');

        if (downloadBtn && downloadDropdown) {
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                downloadDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!downloadBtn.contains(e.target) && !downloadDropdown.contains(e.target)) {
                    downloadDropdown.classList.add('hidden');
                }
            });
        }

        // Recreate icons after DOM manipulation
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 500);
});

// Global functions for onclick handlers
function downloadClickedData() {
    if (dataExporter) {
        dataExporter.exportClickedPoints();
    }
    // Close dropdown
    const dropdown = document.getElementById('download-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
}

function downloadAllHistoricalData() {
    if (dataExporter) {
        dataExporter.exportAllHistoricalData();
    }
    // Close dropdown
    const dropdown = document.getElementById('download-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
}


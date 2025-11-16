/**
 * Interactive Features untuk Index Page
 * - Popup interaktif saat klik peta
 * - Koneksi ke dashboard OLAP
 */

class IndexMapInteraction {
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.currentPopup = null;
        this.setupMapClickListener();
    }

    setupMapClickListener() {
        if (!this.mapManager || !this.mapManager.map) return;

        // Single unified click handler
        this.mapManager.map.on('click', (e) => {
            // Check if click is on a circle marker
            let clickedCircle = null;
            const clickedElement = e.originalEvent?.target;
            
            // Find the circle layer that was clicked
            this.mapManager.map.eachLayer((layer) => {
                if (layer instanceof L.CircleMarker && layer.featureData) {
                    const circleElement = layer.getElement();
                    if (circleElement && (circleElement === clickedElement || circleElement.contains(clickedElement))) {
                        clickedCircle = layer;
                    }
                }
            });

            // If clicked on a circle marker, use its data
            if (clickedCircle) {
                this.handleCircleClick(clickedCircle, e.latlng);
            } else {
                // Otherwise, handle as map click (empty area)
                this.handleMapClick(e.latlng);
            }
        });
    }

    async handleCircleClick(circleLayer, latlng) {
        try {
            const featureData = circleLayer.featureData;
            const props = featureData.properties;
            const layer = featureData.layer;
            const property = featureData.property;
            const year = props.year || parseInt(document.getElementById('year-select')?.value || 2024);
            const month = props.month || parseInt(document.getElementById('month-select')?.value || 1);

            // Get all data from feature properties
            const data = {
                lat: latlng.lat.toFixed(4),
                lon: latlng.lng.toFixed(4),
                layer: layer,
                layerName: featureData.layerName,
                date: `${year}-${String(month).padStart(2, '0')}`,
                timestamp: new Date().toLocaleString('id-ID'),
                // Get all available values
                hsi: props.hsi !== null && props.hsi !== undefined ? props.hsi : null,
                sst: props.sst !== null && props.sst !== undefined ? props.sst : null,
                chl: props.chl !== null && props.chl !== undefined ? props.chl : null,
                salinity: props.salinity !== null && props.salinity !== undefined ? props.salinity : null
            };

            // Determine current value based on property
            if (property === 'hsi') {
                data.value = data.hsi !== null ? data.hsi.toFixed(4) : 'N/A';
                data.unit = 'Index (0-1)';
                data.interpretation = data.hsi !== null ? this.interpretHSI(data.hsi) : 'Data tidak tersedia';
            } else if (property === 'sst') {
                data.value = data.sst !== null ? data.sst.toFixed(2) : 'N/A';
                data.unit = '°C';
                data.interpretation = data.sst !== null ? this.interpretSST(data.sst) : 'Data tidak tersedia';
            } else if (property === 'chl') {
                data.value = data.chl !== null ? data.chl.toFixed(3) : 'N/A';
                data.unit = 'mg/m³';
                data.interpretation = data.chl !== null ? this.interpretCHL(data.chl) : 'Data tidak tersedia';
            } else if (property === 'salinity') {
                data.value = data.salinity !== null ? data.salinity.toFixed(2) : 'N/A';
                data.unit = 'PSU';
                data.interpretation = data.salinity !== null ? this.interpretSalinity(data.salinity) : 'Data tidak tersedia';
            }

            // Show unified popup
            this.showUnifiedPopup(latlng, data, layer);

            // Save clicked point to history for export
            if (window.dataExporter) {
                window.dataExporter.saveClickedPoint({
                    lat: latlng.lat,
                    lon: latlng.lng,
                    year: year,
                    month: month,
                    date: data.date,
                    hsi: data.hsi,
                    sst: data.sst,
                    chl: data.chl,
                    salinity: data.salinity,
                    layer: layer
                });
            }

            // Load data ke OLAP Dashboard
            if (window.olapDashboard) {
                await window.olapDashboard.setLocation(latlng.lat, latlng.lng, layer);
            }
        } catch (error) {
            console.error('Error handling circle click:', error);
        }
    }

    async handleMapClick(latlng) {
        try {
            // Get current layer and time
            const layer = this.mapManager.currentLayer || 'hsi';
            const year = parseInt(document.getElementById('year-select')?.value || 2024);
            const month = parseInt(document.getElementById('month-select')?.value || 1);

            // Query data at clicked point
            const data = await this.queryPointData(latlng.lat, latlng.lng, layer, year, month);

            // Show popup
            this.showPopup(latlng, data, layer);

            // Save clicked point to history for export
            if (window.dataExporter) {
                window.dataExporter.saveClickedPoint({
                    lat: latlng.lat,
                    lon: latlng.lng,
                    year: year,
                    month: month,
                    date: data.date,
                    hsi: data.hsi !== null && data.hsi !== undefined ? (typeof data.hsi === 'string' ? parseFloat(data.hsi) : data.hsi) : null,
                    sst: data.sst !== null && data.sst !== undefined ? (typeof data.sst === 'string' ? parseFloat(data.sst) : data.sst) : null,
                    chl: data.chl !== null && data.chl !== undefined ? (typeof data.chl === 'string' ? parseFloat(data.chl) : data.chl) : null,
                    salinity: data.salinity !== null && data.salinity !== undefined ? (typeof data.salinity === 'string' ? parseFloat(data.salinity) : data.salinity) : null,
                    layer: layer
                });
            }

            // Load data ke OLAP Dashboard
            if (window.olapDashboard) {
                await window.olapDashboard.setLocation(latlng.lat, latlng.lng, layer);
            }
        } catch (error) {
            console.error('Error handling map click:', error);
        }
    }

    async queryPointData(lat, lon, layer, year, month) {
        // Generate realistic data based on layer
        let value = 0;
        let unit = '';
        let interpretation = '';

        if (layer === 'hsi') {
            value = (Math.sin(lat * 0.1) * Math.cos(lon * 0.1) + 1) / 2;
            unit = 'Index (0-1)';
            interpretation = this.interpretHSI(value);
        } else if (layer === 'sst') {
            value = 27 + Math.sin(lat * 0.1) * 2 + Math.cos(lon * 0.1) * 1.5;
            unit = '°C';
            interpretation = this.interpretSST(value);
        } else if (layer === 'chlor_a') {
            value = 0.5 + Math.abs(Math.sin(lat * 0.1)) * 1.5;
            unit = 'mg/m³';
            interpretation = this.interpretCHL(value);
        } else if (layer === 'salinity') {
            value = 33 + Math.sin(lat * 0.1) * 1.5;
            unit = 'PSU';
            interpretation = this.interpretSalinity(value);
        }

        // Generate all values for completeness
        const hsiValue = layer === 'hsi' ? value : (Math.sin(lat * 0.1) * Math.cos(lon * 0.1) + 1) / 2;
        const sstValue = layer === 'sst' ? value : 27 + Math.sin(lat * 0.1) * 2 + Math.cos(lon * 0.1) * 1.5;
        const chlValue = layer === 'chlor_a' ? value : 0.5 + Math.abs(Math.sin(lat * 0.1)) * 1.5;
        const salinityValue = layer === 'salinity' ? value : 33 + Math.sin(lat * 0.1) * 1.5;

        return {
            lat: lat.toFixed(4),
            lon: lon.toFixed(4),
            value: value.toFixed(4),
            unit: unit,
            layer: layer,
            layerName: this.getLayerName(layer),
            date: `${year}-${String(month).padStart(2, '0')}`,
            interpretation: interpretation,
            timestamp: new Date().toLocaleString('id-ID'),
            hsi: hsiValue,
            sst: sstValue,
            chl: chlValue,
            salinity: salinityValue
        };
    }

    getLayerName(layer) {
        const names = {
            'hsi': 'Habitat Suitability Index',
            'sst': 'Sea Surface Temperature',
            'chlor_a': 'Chlorophyll-a',
            'salinity': 'Salinity'
        };
        return names[layer] || layer;
    }

    interpretHSI(value) {
        if (value >= 0.75) return '🟢 <strong>Tinggi</strong> - Sangat sesuai untuk habitat laut';
        if (value >= 0.45) return '🟡 <strong>Sedang</strong> - Cukup sesuai untuk kehidupan laut';
        return '🔴 <strong>Rendah</strong> - Kurang sesuai untuk ekosistem laut';
    }

    interpretSST(value) {
        if (value >= 27 && value <= 29) return '✅ <strong>Optimal</strong> - Suhu ideal untuk pertumbuhan organisme';
        if (value < 27) return '❄️ <strong>Dingin</strong> - Suhu lebih rendah dari kondisi optimal';
        return '🔥 <strong>Hangat</strong> - Suhu lebih tinggi dari kondisi optimal';
    }

    interpretCHL(value) {
        if (value >= 0.5 && value <= 2.0) return '✅ <strong>Normal</strong> - Produktivitas primer normal';
        if (value < 0.5) return '📉 <strong>Rendah</strong> - Produktivitas rendah, area kurang subur';
        return '📈 <strong>Tinggi</strong> - Produktivitas tinggi, area sangat subur';
    }

    interpretSalinity(value) {
        if (value >= 33 && value <= 34) return '✅ <strong>Optimal</strong> - Salinitas ideal untuk habitat';
        if (value < 33) return '💧 <strong>Rendah</strong> - Salinitas rendah, pengaruh air tawar';
        return '🧂 <strong>Tinggi</strong> - Salinitas tinggi, area evaporasi tinggi';
    }

    showPopup(latlng, data, layer) {
        this.showUnifiedPopup(latlng, data, layer);
    }

    showUnifiedPopup(latlng, data, layer) {
        // Remove existing popup
        if (this.currentPopup) {
            this.mapManager.map.closePopup(this.currentPopup);
        }

        // Build all available data section
        let allDataSection = '';
        if (data.hsi !== null || data.sst !== null || data.chl !== null || data.salinity !== null) {
            allDataSection = `
                <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 14px; border-left: 4px solid #94a3b8;">
                    <div style="font-size: 11px; color: #666; margin-bottom: 8px; font-weight: 600; text-transform: uppercase;">Semua Parameter</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                        ${data.hsi !== null && !isNaN(data.hsi) ? `<div><span style="color: #666;">HSI:</span> <strong style="color: #0077b6;">${data.hsi.toFixed(3)}</strong></div>` : ''}
                        ${data.sst !== null && !isNaN(data.sst) ? `<div><span style="color: #666;">SST:</span> <strong style="color: #0077b6;">${data.sst.toFixed(2)}°C</strong></div>` : ''}
                        ${data.chl !== null && !isNaN(data.chl) ? `<div><span style="color: #666;">CHL:</span> <strong style="color: #0077b6;">${data.chl.toFixed(3)}</strong></div>` : ''}
                        ${data.salinity !== null && !isNaN(data.salinity) ? `<div><span style="color: #666;">Sal:</span> <strong style="color: #0077b6;">${data.salinity.toFixed(2)}</strong></div>` : ''}
                    </div>
                </div>
            `;
        }

        // Create popup content dengan styling lebih baik
        const popupContent = `
            <div class="popup-content" style="min-width: 320px; font-family: 'Poppins', sans-serif;">
                <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #0077b6;">
                    <h4 style="margin: 0 0 8px 0; font-weight: 700; font-size: 14px; color: #0077b6;">
                        ${data.layerName}
                    </h4>
                    <div style="font-size: 11px; color: #666; line-height: 1.6;">
                        <div>📍 Lat: <span style="font-family: monospace; font-weight: 600;">${data.lat}</span></div>
                        <div>📍 Lon: <span style="font-family: monospace; font-weight: 600;">${data.lon}</span></div>
                        <div>📅 Periode: <span style="font-weight: 600;">${data.date}</span></div>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #f0f8ff 0%, #e0f4ff 100%); padding: 14px; border-radius: 8px; margin-bottom: 14px; border-left: 4px solid #0077b6;">
                    <div style="font-size: 11px; color: #666; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Nilai ${data.layer === 'hsi' ? 'HSI' : data.layer === 'sst' ? 'SST' : data.layer === 'chlor_a' ? 'Chlorophyll-a' : 'Salinity'}</div>
                    <div style="font-size: 26px; font-weight: 700; color: #0077b6;">
                        ${data.value}<span style="font-size: 13px; margin-left: 4px; color: #00b4d8;">${data.unit}</span>
                    </div>
                </div>
                
                ${allDataSection}
                
                <div style="background: #f9f9f9; padding: 12px; border-radius: 6px; margin-bottom: 14px; border-left: 4px solid #00b4d8; font-size: 12px; line-height: 1.6;">
                    <div style="color: #333; font-weight: 500;">
                        ${data.interpretation || 'Data tersedia'}
                    </div>
                </div>
                
                <div style="font-size: 10px; color: #999; margin-bottom: 12px; text-align: right;">
                    ⏰ ${data.timestamp}
                </div>
                
                <button onclick="
                    if (window.olapDashboard) {
                        window.olapDashboard.setLocation(${latlng.lat}, ${latlng.lng}, '${layer}');
                        document.getElementById('olap-dashboard-content').scrollIntoView({behavior: 'smooth', block: 'nearest'});
                    }
                " 
                    style="width: 100%; padding: 10px; background: linear-gradient(135deg, #0077b6 0%, #00b4d8 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,119,182,0.3);">
                    📊 Lihat di Dashboard OLAP ↓
                </button>
            </div>
        `;

        // Create popup
        this.currentPopup = L.popup({
            maxWidth: 320,
            className: 'custom-popup'
        })
            .setLatLng(latlng)
            .setContent(popupContent)
            .openOn(this.mapManager.map);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for map to be initialized
    setTimeout(() => {
        if (window.sundaStraitMap) {
            window.indexMapInteraction = new IndexMapInteraction(window.sundaStraitMap);
        }
        // Make dataExporter available globally
        if (window.dataExporter) {
            // Already initialized by data-export.js
        }
    }, 1000);
});

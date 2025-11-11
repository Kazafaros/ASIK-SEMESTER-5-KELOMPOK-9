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

        this.mapManager.map.on('click', (e) => {
            this.handleMapClick(e.latlng);
        });
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

            // Load data ke OLAP Dashboard
            if (window.olapDashboard) {
                await window.olapDashboard.setLocation(latlng.lat, latlng.lng, layer);
                
                // Smooth scroll to dashboard
                const dashboard = document.getElementById('olap-dashboard-content');
                if (dashboard) {
                    dashboard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
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

        return {
            lat: lat.toFixed(4),
            lon: lon.toFixed(4),
            value: value.toFixed(4),
            unit: unit,
            layer: layer,
            layerName: this.getLayerName(layer),
            date: `${year}-${String(month).padStart(2, '0')}`,
            interpretation: interpretation,
            timestamp: new Date().toLocaleString('id-ID')
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
        // Remove existing popup
        if (this.currentPopup) {
            this.mapManager.map.removeLayer(this.currentPopup);
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
                    <div style="font-size: 11px; color: #666; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Nilai Saat Ini</div>
                    <div style="font-size: 26px; font-weight: 700; color: #0077b6;">
                        ${data.value}<span style="font-size: 13px; margin-left: 4px; color: #00b4d8;">${data.unit}</span>
                    </div>
                </div>
                
                <div style="background: #f9f9f9; padding: 12px; border-radius: 6px; margin-bottom: 14px; border-left: 4px solid #00b4d8; font-size: 12px; line-height: 1.6;">
                    <div style="color: #333; font-weight: 500;">
                        ${data.interpretation}
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
            maxWidth: 360,
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
    }, 1000);
});

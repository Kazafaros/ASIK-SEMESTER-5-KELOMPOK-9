// API Configuration - Dynamically get base URL from current location
const API_CONFIG = {
    baseURL: `${window.location.protocol}//${window.location.host}/api`,
    endpoints: {
        health: '/health',
        available: '/hsi/available',
        hsi: '/hsi',
        metadata: '/metadata'
    }
};

// Default map settings for Selat Sunda
const MAP_CONFIG = {
    center: [-6.1, 105.3], // Center of Selat Sunda
    zoom: 9,
    bounds: {
        south: -6.775,
        north: -5.475,
        west: 104.5625,
        east: 105.9375
    }
};

// Colormap configurations
const COLORMAPS = {
    viridis: {
        name: 'Viridis',
        colors: ['#440154', '#31688e', '#35b779', '#fde725']
    },
    plasma: {
        name: 'Plasma',
        colors: ['#0d0887', '#7e03a8', '#cc4778', '#f89441', '#f0f921']
    },
    inferno: {
        name: 'Inferno',
        colors: ['#000004', '#56106e', '#bb3754', '#f98e09', '#fcffa4']
    },
    magma: {
        name: 'Magma',
        colors: ['#000004', '#4b0c6b', '#932567', '#dc5039', '#fca636', '#fcffa4']
    },
    turbo: {
        name: 'Turbo',
        colors: ['#30123b', '#4662d4', '#36a5ff', '#1ae4b6', '#72fe5e', '#c7ef34', '#f79d19', '#d93806']
    },
    jet: {
        name: 'Jet',
        colors: ['#000080', '#0000ff', '#00ffff', '#ffff00', '#ff0000', '#800000']
    }
};

// Fixed value ranges for consistent color mapping
const VALUE_RANGES = {
    hsi: { min: 0.0, max: 1.0 },
    sst: { min: 25.0, max: 31.0 },
    chlor_a: { min: 0.1, max: 3.0 },
    salinity: { min: 31.0, max: 36.0 }
};

// HSI value ranges for legend
const HSI_RANGES = {
    high: { min: 0.75, max: 1.0, label: 'High', color: '#22c55e' },
    medium: { min: 0.45, max: 0.75, label: 'Medium', color: '#eab308' },
    low: { min: 0.0, max: 0.45, label: 'Low', color: '#ef4444' }
};


// System Configuration
const LOAD_CONFIG = {
    load1a: { power: 50, priority: 1, name: "Load 1A", feeder: 1 },
    load1b: { power: 50, priority: 2, name: "Load 1B", feeder: 1 },
    load2a: { power: 20, priority: 3, name: "Load 2A", feeder: 2 },
    load2b: { power: 20, priority: 4, name: "Load 2B", feeder: 2 }
};

// System State
let systemState = {
    threshold: 120,
    autoMode: true,
    loads: {
        load1a: true,
        load1b: true,
        load2a: true,
        load2b: false
    },
    totalPower: 140,
    alerts: []
};

// DOM Elements
const thresholdSlider = document.getElementById('threshold-slider');
const thresholdDisplay = document.getElementById('threshold-value-display');
const thresholdPower = document.getElementById('threshold-power');
const thresholdSetting = document.getElementById('threshold-setting');
const currentPower = document.getElementById('current-power');
const currentConsumption = document.getElementById('current-consumption');
const availableHeadroom = document.getElementById('available-headroom');
const headroomPower = document.getElementById('headroom-power');
const powerStatusIndicator = document.getElementById('power-status-indicator');
const feeder1Dist = document.getElementById('feeder1-dist');
const feeder2Dist = document.getElementById('feeder2-dist');

// Switch Elements
const load1aSwitch = document.getElementById('load1a-switch');
const load1bSwitch = document.getElementById('load1b-switch');
const load2aSwitch = document.getElementById('load2a-switch');
const load2bSwitch = document.getElementById('load2b-switch');
const autoModeSwitch = document.getElementById('auto-mode-switch');

// Status Elements
const configLoad1a = document.getElementById('config-load1a');
const configLoad1b = document.getElementById('config-load1b');
const configLoad2a = document.getElementById('config-load2a');
const configLoad2b = document.getElementById('config-load2b');
const feeder1Status = document.getElementById('feeder1-status');
const feeder2Status = document.getElementById('feeder2-status');

// Button Elements
const feeder1OnBtn = document.getElementById('feeder1-on-btn');
const feeder1OffBtn = document.getElementById('feeder1-off-btn');
const feeder2OnBtn = document.getElementById('feeder2-on-btn');
const feeder2OffBtn = document.getElementById('feeder2-off-btn');
const allOnBtn = document.getElementById('all-on-btn');
const allOffBtn = document.getElementById('all-off-btn');

// Chart Variables
let powerChart = null;
let timeLabels = [];
let powerData = [];
let thresholdData = [];

// Initialize Dashboard
function initDashboard() {
    console.log("Initializing dashboard...");
    setupEventListeners();
    initPowerChart();
    updateSystemState();
    simulateRealTimeData();
    initMobileMenu();
}

// Initialize Power Chart - FIXED VERSION
function initPowerChart() {
    console.log("Initializing power chart...");
    
    // Clear existing chart if any
    const canvas = document.getElementById('powerChart');
    if (!canvas) {
        console.error("Canvas element 'powerChart' not found!");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get 2D context!");
        return;
    }
    
    // Clear any existing chart
    if (powerChart) {
        powerChart.destroy();
    }
    
    // Initialize data arrays
    const now = new Date();
    timeLabels = [];
    powerData = [];
    thresholdData = [];
    
    for (let i = 11; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        const timeStr = time.getHours().toString().padStart(2, '0') + ':' + 
                       time.getMinutes().toString().padStart(2, '0');
        timeLabels.push(timeStr);
        powerData.push(systemState.totalPower + (Math.random() * 20 - 10)); // Add some variation
        thresholdData.push(systemState.threshold);
    }
    
    console.log("Chart data initialized:", { timeLabels, powerData, thresholdData });
    
    // Create the chart
    try {
        powerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'Power Consumption',
                        data: powerData,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#3498db'
                    },
                    {
                        label: 'Threshold',
                        data: thresholdData,
                        borderColor: '#e74c3c',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#2c3e50',
                            font: {
                                size: 12,
                                family: "'Poppins', sans-serif"
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            family: "'Poppins', sans-serif"
                        },
                        bodyFont: {
                            family: "'Poppins', sans-serif"
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 160,
                        min: 0,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 11
                            },
                            callback: function(value) {
                                return value + 'W';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Power (Watts)',
                            color: '#2c3e50',
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 750,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        console.log("Chart created successfully!");
    } catch (error) {
        console.error("Error creating chart:", error);
        // Fallback: Show error message
        canvas.style.display = 'none';
        const graphContainer = document.querySelector('.graph-container');
        if (graphContainer) {
            graphContainer.innerHTML = `
                <div style="color: #e74c3c; text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                    <h4>Chart Error</h4>
                    <p>Unable to load power consumption graph.</p>
                    <p><small>Please check console for details.</small></p>
                </div>
            `;
        }
    }
}

// Setup Event Listeners
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Threshold Slider
    thresholdSlider.addEventListener('input', function() {
        const newThreshold = parseInt(this.value);
        systemState.threshold = newThreshold;
        thresholdDisplay.textContent = newThreshold;
        thresholdPower.textContent = newThreshold;
        thresholdSetting.textContent = newThreshold + 'W';
        
        // Update threshold line on chart
        updateThresholdLine(newThreshold);
        
        if (systemState.autoMode) {
            applyThresholdLogic();
        }
        addAlert(`Threshold updated to ${newThreshold}W`, 'normal');
    });
    
    // Load Switches
    load1aSwitch.addEventListener('change', function() {
        systemState.loads.load1a = this.checked;
        updateLoadStatus('load1a', this.checked);
        updateSystemState();
    });
    
    load1bSwitch.addEventListener('change', function() {
        systemState.loads.load1b = this.checked;
        updateLoadStatus('load1b', this.checked);
        updateSystemState();
    });
    
    load2aSwitch.addEventListener('change', function() {
        systemState.loads.load2a = this.checked;
        updateLoadStatus('load2a', this.checked);
        updateSystemState();
    });
    
    load2bSwitch.addEventListener('change', function() {
        systemState.loads.load2b = this.checked;
        updateLoadStatus('load2b', this.checked);
        updateSystemState();
    });
    
    // Auto Mode
    autoModeSwitch.addEventListener('change', function() {
        systemState.autoMode = this.checked;
        addAlert(`Auto control mode ${this.checked ? 'enabled' : 'disabled'}`, 'normal');
        if (this.checked) {
            applyThresholdLogic();
        }
    });
    
    // Control Buttons
    feeder1OnBtn.addEventListener('click', () => turnFeederOn(1));
    feeder1OffBtn.addEventListener('click', () => turnFeederOff(1));
    feeder2OnBtn.addEventListener('click', () => turnFeederOn(2));
    feeder2OffBtn.addEventListener('click', () => turnFeederOff(2));
    allOnBtn.addEventListener('click', turnAllOn);
    allOffBtn.addEventListener('click', turnAllOff);
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize Mobile Menu
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', () => {
        const isVisible = navMenu.style.display === 'flex';
        navMenu.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) {
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '70px';
            navMenu.style.left = '0';
            navMenu.style.width = '100%';
            navMenu.style.background = 'white';
            navMenu.style.padding = '20px';
            navMenu.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
        }
    });
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navMenu.style.display = '';
        }
    });
}

// Update Load Status
function updateLoadStatus(loadId, status) {
    const configElement = document.getElementById('config-' + loadId);
    if (configElement) {
        configElement.textContent = status ? 'ON' : 'OFF';
        configElement.className = status ? 'load-status active' : 'load-status';
    }
}

// Update System State
function updateSystemState() {
    console.log("Updating system state...");
    
    // Calculate total power
    let totalPower = 0;
    let feeder1Power = 0;
    let feeder2Power = 0;
    
    if (systemState.loads.load1a) {
        totalPower += LOAD_CONFIG.load1a.power;
        feeder1Power += LOAD_CONFIG.load1a.power;
    }
    if (systemState.loads.load1b) {
        totalPower += LOAD_CONFIG.load1b.power;
        feeder1Power += LOAD_CONFIG.load1b.power;
    }
    if (systemState.loads.load2a) {
        totalPower += LOAD_CONFIG.load2a.power;
        feeder2Power += LOAD_CONFIG.load2a.power;
    }
    if (systemState.loads.load2b) {
        totalPower += LOAD_CONFIG.load2b.power;
        feeder2Power += LOAD_CONFIG.load2b.power;
    }
    
    systemState.totalPower = totalPower;
    
    console.log("Total power:", totalPower, "Feeder1:", feeder1Power, "Feeder2:", feeder2Power);
    
    // Update displays
    if (currentPower) currentPower.textContent = totalPower;
    if (currentConsumption) currentConsumption.textContent = totalPower + 'W';
    if (feeder1Dist) feeder1Dist.textContent = feeder1Power + 'W';
    if (feeder2Dist) feeder2Dist.textContent = feeder2Power + 'W';
    
    // Calculate headroom
    const headroom = 140 - totalPower;
    if (availableHeadroom) availableHeadroom.textContent = headroom + 'W';
    if (headroomPower) headroomPower.textContent = headroom;
    
    // Update progress bars
    const feeder1Percentage = (feeder1Power / 140) * 100;
    const feeder2Percentage = (feeder2Power / 140) * 100;
    
    const feeder1Fill = document.querySelector('.feeder1-fill');
    const feeder2Fill = document.querySelector('.feeder2-fill');
    
    if (feeder1Fill) feeder1Fill.style.width = feeder1Percentage + '%';
    if (feeder2Fill) feeder2Fill.style.width = feeder2Percentage + '%';
    
    // Update feeder status
    const feeder1Active = feeder1Power > 0;
    const feeder2Active = feeder2Power > 0;
    
    if (feeder1Status) {
        feeder1Status.textContent = feeder1Active ? 'ACTIVE' : 'OFF';
        feeder1Status.className = feeder1Active ? 'status-badge active' : 'status-badge';
    }
    
    if (feeder2Status) {
        feeder2Status.textContent = feeder2Active ? 'ACTIVE' : 'OFF';
        feeder2Status.className = feeder2Active ? 'status-badge active' : 'status-badge';
    }
    
    // Update power status indicator
    updatePowerStatusIndicator(totalPower);
    
    // Apply threshold logic if auto mode is on
    if (systemState.autoMode) {
        applyThresholdLogic();
    }
}

// Apply Threshold Logic
function applyThresholdLogic() {
    const threshold = systemState.threshold;
    const currentPower = systemState.totalPower;
    
    console.log(`Applying threshold logic. Threshold: ${threshold}W, Current: ${currentPower}W`);
    
    // Store original state for comparison
    const originalLoads = { ...systemState.loads };
    
    // Logic based on threshold setting
    if (threshold >= 140) {
        // Monitor only - no action needed
        addAlert("Threshold ≥ 140W: Monitoring only", "normal");
    } else if (threshold >= 120 && threshold <= 139) {
        // Turn OFF Load 2B
        if (systemState.loads.load2b) {
            systemState.loads.load2b = false;
            if (load2bSwitch) load2bSwitch.checked = false;
            updateLoadStatus('load2b', false);
            addAlert(`Threshold ${threshold}W: Load 2B turned OFF`, "warning");
        }
    } else if (threshold >= 100 && threshold <= 119) {
        // Turn OFF both Feeder 2 loads
        if (systemState.loads.load2a || systemState.loads.load2b) {
            systemState.loads.load2a = false;
            systemState.loads.load2b = false;
            if (load2aSwitch) load2aSwitch.checked = false;
            if (load2bSwitch) load2bSwitch.checked = false;
            updateLoadStatus('load2a', false);
            updateLoadStatus('load2b', false);
            addAlert(`Threshold ${threshold}W: Feeder 2 turned OFF`, "alert");
        }
    } else if (threshold >= 50 && threshold <= 99) {
        // Turn OFF Feeder 2 + Load 1B
        if (systemState.loads.load2a || systemState.loads.load2b || systemState.loads.load1b) {
            systemState.loads.load2a = false;
            systemState.loads.load2b = false;
            systemState.loads.load1b = false;
            if (load2aSwitch) load2aSwitch.checked = false;
            if (load2bSwitch) load2bSwitch.checked = false;
            if (load1bSwitch) load1bSwitch.checked = false;
            updateLoadStatus('load2a', false);
            updateLoadStatus('load2b', false);
            updateLoadStatus('load1b', false);
            addAlert(`Threshold ${threshold}W: Feeder 2 + Load 1B turned OFF`, "critical");
        }
    } else if (threshold < 50) {
        // Emergency shutdown - turn OFF everything except Load 1A
        if (systemState.loads.load2a || systemState.loads.load2b || systemState.loads.load1b) {
            systemState.loads.load2a = false;
            systemState.loads.load2b = false;
            systemState.loads.load1b = false;
            if (load2aSwitch) load2aSwitch.checked = false;
            if (load2bSwitch) load2bSwitch.checked = false;
            if (load1bSwitch) load1bSwitch.checked = false;
            updateLoadStatus('load2a', false);
            updateLoadStatus('load2b', false);
            updateLoadStatus('load1b', false);
            addAlert(`Threshold ${threshold}W: Emergency shutdown - Only Load 1A remains ON`, "emergency");
        }
    }
    
    // Check if any changes were made
    let changesMade = false;
    for (const load in originalLoads) {
        if (originalLoads[load] !== systemState.loads[load]) {
            changesMade = true;
            break;
        }
    }
    
    // Update system state after changes
    if (changesMade) {
        updateSystemState();
    }
}

// Update Power Status Indicator
function updatePowerStatusIndicator(power) {
    if (!powerStatusIndicator) return;
    
    const indicatorDot = powerStatusIndicator.querySelector('.indicator-dot');
    const indicatorText = powerStatusIndicator.querySelector('.indicator-text');
    
    if (!indicatorDot || !indicatorText) return;
    
    if (power >= 140) {
        indicatorDot.style.background = '#2ecc71';
        indicatorText.textContent = 'Safe';
    } else if (power >= 120) {
        indicatorDot.style.background = '#f39c12';
        indicatorText.textContent = 'Warning';
    } else if (power >= 100) {
        indicatorDot.style.background = '#e74c3c';
        indicatorText.textContent = 'Alert';
    } else if (power >= 50) {
        indicatorDot.style.background = '#9b59b6';
        indicatorText.textContent = 'Critical';
    } else {
        indicatorDot.style.background = '#c0392b';
        indicatorText.textContent = 'Emergency';
    }
}

// Control Functions
function turnFeederOn(feeder) {
    if (feeder === 1) {
        systemState.loads.load1a = true;
        systemState.loads.load1b = true;
        if (load1aSwitch) load1aSwitch.checked = true;
        if (load1bSwitch) load1bSwitch.checked = true;
        updateLoadStatus('load1a', true);
        updateLoadStatus('load1b', true);
        addAlert("Feeder 1 turned ON", "normal");
    } else if (feeder === 2) {
        systemState.loads.load2a = true;
        systemState.loads.load2b = false; // Keep Load 2B OFF by default
        if (load2aSwitch) load2aSwitch.checked = true;
        if (load2bSwitch) load2bSwitch.checked = false;
        updateLoadStatus('load2a', true);
        updateLoadStatus('load2b', false);
        addAlert("Feeder 2 turned ON (Load 2A only)", "normal");
    }
    updateSystemState();
}

function turnFeederOff(feeder) {
    if (feeder === 1) {
        systemState.loads.load1a = false;
        systemState.loads.load1b = false;
        if (load1aSwitch) load1aSwitch.checked = false;
        if (load1bSwitch) load1bSwitch.checked = false;
        updateLoadStatus('load1a', false);
        updateLoadStatus('load1b', false);
        addAlert("Feeder 1 turned OFF", "warning");
    } else if (feeder === 2) {
        systemState.loads.load2a = false;
        systemState.loads.load2b = false;
        if (load2aSwitch) load2aSwitch.checked = false;
        if (load2bSwitch) load2bSwitch.checked = false;
        updateLoadStatus('load2a', false);
        updateLoadStatus('load2b', false);
        addAlert("Feeder 2 turned OFF", "warning");
    }
    updateSystemState();
}

function turnAllOn() {
    systemState.loads.load1a = true;
    systemState.loads.load1b = true;
    systemState.loads.load2a = true;
    systemState.loads.load2b = false; // Keep Load 2B OFF by default
    
    if (load1aSwitch) load1aSwitch.checked = true;
    if (load1bSwitch) load1bSwitch.checked = true;
    if (load2aSwitch) load2aSwitch.checked = true;
    if (load2bSwitch) load2bSwitch.checked = false;
    
    updateLoadStatus('load1a', true);
    updateLoadStatus('load1b', true);
    updateLoadStatus('load2a', true);
    updateLoadStatus('load2b', false);
    
    addAlert("All loads turned ON (Load 2B remains OFF)", "normal");
    updateSystemState();
}

function turnAllOff() {
    systemState.loads.load1a = false;
    systemState.loads.load1b = false;
    systemState.loads.load2a = false;
    systemState.loads.load2b = false;
    
    if (load1aSwitch) load1aSwitch.checked = false;
    if (load1bSwitch) load1bSwitch.checked = false;
    if (load2aSwitch) load2aSwitch.checked = false;
    if (load2bSwitch) load2bSwitch.checked = false;
    
    updateLoadStatus('load1a', false);
    updateLoadStatus('load1b', false);
    updateLoadStatus('load2a', false);
    updateLoadStatus('load2b', false);
    
    addAlert("All loads turned OFF", "warning");
    updateSystemState();
}

// Update Threshold Line on Chart
function updateThresholdLine(newThreshold) {
    if (!powerChart || !powerChart.data.datasets[1]) {
        console.warn("Chart not ready for threshold update");
        return;
    }
    
    // Update threshold data array
    thresholdData = Array(timeLabels.length).fill(newThreshold);
    powerChart.data.datasets[1].data = thresholdData;
    
    // Update the chart
    powerChart.update();
    
    console.log("Threshold line updated to:", newThreshold);
}

// Add Alert
function addAlert(message, type) {
    const alertList = document.getElementById('alerts-list');
    if (!alertList) return;
    
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    
    // Determine icon based on alert type
    let iconClass = 'fa-info-circle';
    if (type === 'emergency') iconClass = 'fa-exclamation-triangle';
    else if (type === 'critical') iconClass = 'fa-exclamation-circle';
    else if (type === 'alert') iconClass = 'fa-exclamation-triangle';
    else if (type === 'warning') iconClass = 'fa-exclamation-circle';
    
    alert.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <div class="alert-content">
            <p>${message}</p>
            <span class="alert-time">${timeString}</span>
        </div>
    `;
    
    alertList.insertBefore(alert, alertList.firstChild);
    
    // Keep only last 5 alerts
    while (alertList.children.length > 5) {
        alertList.removeChild(alertList.lastChild);
    }
}

// Simulate Real-time Data
function simulateRealTimeData() {
    console.log("Starting real-time data simulation...");
    
    // Update chart every 3 seconds
    setInterval(() => {
        if (!powerChart) {
            console.warn("Chart not available for update");
            return;
        }
        
        // Add new data point
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
        
        // Add some random variation to power data
        const variation = (Math.random() * 20 - 10); // -10 to +10
        const newPowerValue = Math.max(0, systemState.totalPower + variation);
        
        timeLabels.push(timeString);
        powerData.push(newPowerValue);
        thresholdData.push(systemState.threshold);
        
        // Keep only last 20 points
        if (timeLabels.length > 20) {
            timeLabels.shift();
            powerData.shift();
            thresholdData.shift();
        }
        
        // Update chart data
        powerChart.data.labels = timeLabels;
        powerChart.data.datasets[0].data = powerData;
        powerChart.data.datasets[1].data = thresholdData;
        
        // Update chart with animation
        powerChart.update();
        
    }, 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing application...");
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library not loaded!");
        // Try to load Chart.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = function() {
            console.log("Chart.js loaded dynamically");
            setTimeout(initDashboard, 100);
        };
        script.onerror = function() {
            console.error("Failed to load Chart.js");
            // Show error message
            const graphContainer = document.querySelector('.graph-container');
            if (graphContainer) {
                graphContainer.innerHTML = `
                    <div style="color: #e74c3c; text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                        <h4>Chart Library Error</h4>
                        <p>Unable to load Chart.js library.</p>
                        <button onclick="location.reload()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 15px; cursor: pointer;">
                            <i class="fas fa-sync-alt"></i> Retry
                        </button>
                    </div>
                `;
            }
        };
        document.head.appendChild(script);
    } else {
        console.log("Chart.js already loaded");
        initDashboard();
    }
});

// Add error handling for window
window.addEventListener('error', function(e) {
    console.error('Global error:', e.message, 'at', e.filename, ':', e.lineno);
});

// Export for debugging
window.debugSystem = systemState;

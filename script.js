// DOM Elements
const voltageValue = document.getElementById('voltage-value');
const currentValue = document.getElementById('current-value');
const powerValue = document.getElementById('power-value');
const pfValue = document.getElementById('pf-value');
const relay1Status = document.getElementById('relay1-status');
const relay2Status = document.getElementById('relay2-status');
const thresholdValue = document.getElementById('threshold-value');
const thresholdSlider = document.getElementById('threshold-slider');
const relay1Switch = document.getElementById('relay1-switch');
const relay2Switch = document.getElementById('relay2-switch');
const autoModeSwitch = document.getElementById('auto-mode-switch');

// Chart Variables
let powerChart;
let timeLabels = [];
let powerData = [];

// Initialize Dashboard
function initDashboard() {
    // Initialize chart
    initPowerChart();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start data simulation
    simulateRealTimeData();
    
    // Initialize mobile menu
    initMobileMenu();
}

// Initialize Power Chart
function initPowerChart() {
    const ctx = document.getElementById('powerChart').getContext('2d');
    
    // Generate initial data
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        timeLabels.push(time.getHours().toString().padStart(2, '0') + ':' + 
                       time.getMinutes().toString().padStart(2, '0'));
        powerData.push(Math.random() * 500 + 1000); // Random data between 1000-1500W
    }
    
    powerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Power Consumption (W)',
                data: powerData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 800,
                    title: {
                        display: true,
                        text: 'Watts (W)'
                    }
                }
            }
        }
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Threshold Slider
    thresholdSlider.addEventListener('input', function() {
        thresholdValue.textContent = this.value;
        checkPowerThreshold();
    });
    
    // Relay Switches
    relay1Switch.addEventListener('change', function() {
        relay1Status.textContent = this.checked ? 'ON' : 'OFF';
        relay1Status.className = this.checked ? 'status active' : 'status';
        updateSystemStatus();
    });
    
    relay2Switch.addEventListener('change', function() {
        relay2Status.textContent = this.checked ? 'ON' : 'OFF';
        relay2Status.className = this.checked ? 'status active' : 'status';
        updateSystemStatus();
    });
    
    // Auto Mode Switch
    autoModeSwitch.addEventListener('change', function() {
        const modeStatus = document.querySelector('.mode-status');
        if (this.checked) {
            modeStatus.textContent = 'System will automatically control loads based on power threshold';
            enableAutoMode();
        } else {
            modeStatus.textContent = 'Manual control mode - automatic load control disabled';
            disableAutoMode();
        }
    });
    
    // Smooth scrolling for navigation links
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
    
    hamburger.addEventListener('click', () => {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        if (navMenu.style.display === 'flex') {
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
    
    // Close menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navMenu.style.display = '';
        }
    });
}

// Simulate Real-time Data
function simulateRealTimeData() {
    setInterval(() => {
        // Update values with small random variations
        const voltage = 230 + (Math.random() * 2 - 1);
        const current = 8 + (Math.random() * 1 - 0.5);
        const power = voltage * current;
        const powerFactor = 0.92 + (Math.random() * 0.06 - 0.03);
        
        voltageValue.textContent = voltage.toFixed(1);
        currentValue.textContent = current.toFixed(1);
        powerValue.textContent = Math.round(power);
        pfValue.textContent = powerFactor.toFixed(2);
        
        // Update power chart
        updatePowerChart(power);
        
        // Check thresholds if auto mode is enabled
        if (autoModeSwitch.checked) {
            checkPowerThreshold();
        }
        
        // Update status indicators
        updateStatusIndicators(power, voltage, current, powerFactor);
        
    }, 2000); // Update every 2 seconds
}

// Update Power Chart
function updatePowerChart(power) {
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
    
    // Add new data point
    timeLabels.push(timeString);
    powerData.push(power);
    
    // Keep only last 12 points
    if (timeLabels.length > 12) {
        timeLabels.shift();
        powerData.shift();
    }
    
    // Update chart
    powerChart.data.labels = timeLabels;
    powerChart.data.datasets[0].data = powerData;
    powerChart.update('none');
}

// Check Power Threshold
function checkPowerThreshold() {
    const currentPower = parseInt(powerValue.textContent);
    const threshold = parseInt(thresholdSlider.value);
    
    if (autoModeSwitch.checked && currentPower > threshold) {
        // If power exceeds threshold, turn off relay 2 (low priority)
        if (relay2Switch.checked) {
            relay2Switch.checked = false;
            relay2Status.textContent = 'OFF';
            relay2Status.className = 'status';
            
            // Show notification
            showNotification('System Alert', `Power consumption (${currentPower}W) exceeded threshold (${threshold}W). Low priority feeder turned OFF.`);
        }
    } else if (autoModeSwitch.checked && currentPower <= threshold * 0.8) {
        // If power is safely below threshold, turn relay 2 back on
        if (!relay2Switch.checked) {
            relay2Switch.checked = true;
            relay2Status.textContent = 'ON';
            relay2Status.className = 'status active';
            
            // Show notification
            showNotification('System Update', `Power consumption (${currentPower}W) is now safe. Low priority feeder turned ON.`);
        }
    }
}

// Update Status Indicators
function updateStatusIndicators(power, voltage, current, powerFactor) {
    const threshold = parseInt(thresholdSlider.value);
    
    // Update power status
    const powerStatus = document.querySelector('#power-value').nextElementSibling.nextElementSibling;
    if (power > threshold) {
        powerStatus.textContent = 'Critical';
        powerStatus.className = 'param-status critical';
    } else if (power > threshold * 0.8) {
        powerStatus.textContent = 'Warning';
        powerStatus.className = 'param-status warning';
    } else {
        powerStatus.textContent = 'Normal';
        powerStatus.className = 'param-status normal';
    }
    
    // Update voltage status
    const voltageStatus = document.querySelector('#voltage-value').nextElementSibling.nextElementSibling;
    if (voltage < 220 || voltage > 240) {
        voltageStatus.textContent = 'Abnormal';
        voltageStatus.className = 'param-status warning';
    } else {
        voltageStatus.textContent = 'Normal';
        voltageStatus.className = 'param-status normal';
    }
    
    // Update power factor status
    const pfStatus = document.querySelector('#pf-value').nextElementSibling.nextElementSibling;
    if (powerFactor < 0.85) {
        pfStatus.textContent = 'Poor';
        pfStatus.className = 'param-status warning';
    } else if (powerFactor < 0.95) {
        pfStatus.textContent = 'Acceptable';
        pfStatus.className = 'param-status normal';
    } else {
        pfStatus.textContent = 'Good';
        pfStatus.className = 'param-status normal';
    }
}

// Update System Status
function updateSystemStatus() {
    const relay1State = relay1Switch.checked ? 'ON' : 'OFF';
    const relay2State = relay2Switch.checked ? 'ON' : 'OFF';
    const autoMode = autoModeSwitch.checked ? 'ENABLED' : 'DISABLED';
    
    console.log(`System Status: Relay1=${relay1State}, Relay2=${relay2State}, AutoMode=${autoMode}`);
}

// Enable Auto Mode
function enableAutoMode() {
    console.log('Auto mode enabled - system will automatically control loads');
}

// Disable Auto Mode
function disableAutoMode() {
    console.log('Auto mode disabled - manual control only');
}

// Show Notification
function showNotification(title, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <strong>${title}</strong>
        <p>${message}</p>
    `;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = '#2c3e50';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    notification.style.zIndex = '10000';
    notification.style.maxWidth = '300px';
    notification.style.animation = 'slideIn 0.3s ease-out';
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', initDashboard);

// Add CSS for mobile menu
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-menu {
                display: none;
            }
            
            .nav-menu.show {
                display: flex;
                flex-direction: column;
                position: absolute;
                top: 70px;
                left: 0;
                width: 100%;
                background: white;
                padding: 20px;
                box-shadow: 0 5px 10px rgba(0,0,0,0.1);
            }
            
            .nav-menu.show li {
                margin: 10px 0;
            }
        }
        
        /* Animation for system nodes */
        @keyframes nodePulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        .diagram-item:hover .status.active {
            animation: nodePulse 1s infinite;
        }
    `;
    document.head.appendChild(style);
});
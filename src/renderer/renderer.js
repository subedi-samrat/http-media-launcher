// Browser configurations with enhanced path detection
const browsers = {
    chrome: {
        name: 'Chrome',
        icon: '🟢',
        paths: {
            windows: [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                '%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe'
            ],
            darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
            linux: [
                '/usr/bin/google-chrome',
                '/snap/bin/chromium',
                '/usr/bin/chromium-browser',
                '/usr/bin/chromium',
                '/opt/google/chrome/chrome'
            ]
        },
        flags: [
            '--unsafely-treat-insecure-origin-as-secure={url}',
            '--user-data-dir={tempDir}',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-features=VizDisplayCompositor',
            '--autoplay-policy=no-user-gesture-required'
        ]
    },
    brave: {
        name: 'Brave',
        icon: '🦁',
        paths: {
            windows: [
                '%LOCALAPPDATA%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
                'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
                'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
            ],
            darwin: ['/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'],
            linux: [
                '/usr/bin/brave-browser',
                '/snap/bin/brave',
                '/opt/brave.com/brave/brave-browser',
                '/usr/bin/brave'
            ]
        },
        flags: [
            '--unsafely-treat-insecure-origin-as-secure={url}',
            '--user-data-dir={tempDir}',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-brave-update',
            '--autoplay-policy=no-user-gesture-required'
        ]
    },
    firefox: {
        name: 'Firefox',
        icon: '🦊',
        paths: {
            windows: [
                'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
                'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe',
                '%APPDATA%\\Mozilla Firefox\\firefox.exe'
            ],
            darwin: ['/Applications/Firefox.app/Contents/MacOS/firefox'],
            linux: [
                '/usr/bin/firefox',
                '/snap/bin/firefox',
                '/opt/firefox/firefox',
                '/usr/bin/firefox-esr'
            ]
        },
        flags: ['-profile', '{tempProfile}', '-no-remote']
    },
    edge: {
        name: 'Edge',
        icon: '🔷',
        paths: {
            windows: [
                'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
                'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
            ],
            darwin: ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
            linux: [
                '/usr/bin/microsoft-edge',
                '/opt/microsoft/msedge/msedge',
                '/usr/bin/microsoft-edge-stable'
            ]
        },
        flags: [
            '--unsafely-treat-insecure-origin-as-secure={url}',
            '--user-data-dir={tempDir}',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--autoplay-policy=no-user-gesture-required'
        ]
    },
    chromium: {
        name: 'Chromium',
        icon: '🔵',
        paths: {
            windows: ['%LOCALAPPDATA%\\Chromium\\Application\\chrome.exe'],
            darwin: ['/Applications/Chromium.app/Contents/MacOS/Chromium'],
            linux: [
                '/usr/bin/chromium-browser',
                '/usr/bin/chromium',
                '/snap/bin/chromium'
            ]
        },
        flags: [
            '--unsafely-treat-insecure-origin-as-secure={url}',
            '--user-data-dir={tempDir}',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--autoplay-policy=no-user-gesture-required'
        ]
    },
    safari: {
        name: 'Safari',
        icon: '🧭',
        paths: {
            darwin: ['/Applications/Safari.app/Contents/MacOS/Safari']
        },
        flags: []
    }
};

// Global variables
let selectedBrowser = null;
let platformInfo = null;
let detectedBrowsers = {};
let lastGeneratedCommand = null;

// Initialize the application
async function init() {
    try {
        // Get platform information
        platformInfo = await window.electronAPI.getPlatform();
        
        // Update UI with platform info
        updatePlatformInfo();
        
        // Detect and render browsers
        await detectAndRenderBrowsers();
        
        // Setup event listeners
        setupEventListeners();
        
        // Set default URL for development
        setDefaultURL();
        
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize application: ' + error.message);
    }
}

// Update platform information in UI
function updatePlatformInfo() {
    const platformText = `${platformInfo.type} ${platformInfo.arch}`;
    const version = window.electronAPI.getAppVersion();
    
    document.getElementById('platformInfo').textContent = platformText;
    document.getElementById('appVersion').textContent = `v${version}`;
    document.getElementById('modalPlatformInfo').textContent = platformText;
    document.getElementById('modalAppVersion').textContent = version;
}

// Set default URL based on common development patterns
function setDefaultURL() {
    const urlInput = document.getElementById('url');
    if (!urlInput.value) {
        urlInput.value = 'http://localhost:3000';
    }
}

// Detect browsers and render them
async function detectAndRenderBrowsers() {
    const grid = document.getElementById('browserGrid');
    grid.innerHTML = '<div class="loading-browsers">🔍 Detecting browsers...</div>';
    
    detectedBrowsers = {};
    
    // Get platform-specific browser list
    const platformKey = platformInfo.platform === 'win32' ? 'windows' : 
                       platformInfo.platform === 'darwin' ? 'darwin' : 'linux';
    
    // Check each browser
    for (const [browserKey, browser] of Object.entries(browsers)) {
        const paths = browser.paths[platformKey] || [];
        
        if (paths.length === 0) {
            continue; // Skip browsers not available on this platform
        }
        
        let found = false;
        let workingPath = null;
        
        // Check each possible path
        for (const path of paths) {
            try {
                const expandedPath = window.electronAPI.expandPath(path);
                const result = await window.electronAPI.checkBrowserPath(expandedPath);
                
                if (result.exists) {
                    found = true;
                    workingPath = result.path;
                    break;
                }
            } catch (error) {
                console.warn(`Error checking ${browserKey} at ${path}:`, error);
            }
        }
        
        detectedBrowsers[browserKey] = {
            ...browser,
            found,
            path: workingPath,
            paths: paths
        };
    }
    
    renderBrowserGrid();
}

// Render the browser selection grid
function renderBrowserGrid() {
    const grid = document.getElementById('browserGrid');
    grid.innerHTML = '';
    
    Object.entries(detectedBrowsers).forEach(([browserKey, browser]) => {
        const option = document.createElement('div');
        option.className = 'browser-option';
        option.dataset.browser = browserKey;
        
        option.innerHTML = `
            <div class="browser-icon">${browser.icon}</div>
            <div class="browser-name">${browser.name}</div>
            <div class="status-indicator${browser.found ? '' : ' not-found'}"></div>
        `;
        
        option.addEventListener('click', () => selectBrowser(browserKey));
        
        // Add tooltip for not found browsers
        if (!browser.found) {
            option.title = `${browser.name} not detected on this system`;
        } else {
            option.title = `${browser.name} detected at: ${browser.path}`;
        }
        
        grid.appendChild(option);
    });
}

// Select a browser
function selectBrowser(browserKey) {
    // Check if browser is available
    if (!detectedBrowsers[browserKey]?.found) {
        showError(`${browsers[browserKey].name} is not installed or not found on this system`);
        return;
    }
    
    // Remove previous selection
    document.querySelectorAll('.browser-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked browser
    const option = document.querySelector(`[data-browser="${browserKey}"]`);
    if (option) {
        option.classList.add('selected');
        selectedBrowser = browserKey;
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('launcherForm').addEventListener('submit', handleLaunch);
    
    // URL suggestions
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('url').value = btn.dataset.url;
        });
    });
    
    // Refresh browsers
    document.getElementById('refreshBrowsers').addEventListener('click', async () => {
        const btn = document.getElementById('refreshBrowsers');
        const originalText = btn.textContent;
        btn.textContent = '🔄 Refreshing...';
        btn.disabled = true;
        
        await detectAndRenderBrowsers();
        
        btn.textContent = originalText;
        btn.disabled = false;
    });
    
    // Copy command
    document.getElementById('copyBtn').addEventListener('click', copyCommand);
    
    // Export command
    document.getElementById('exportBtn').addEventListener('click', exportCommand);
    
    // Modal controls
    setupModalListeners();
}

// Setup modal event listeners
function setupModalListeners() {
    // About modal
    document.getElementById('aboutBtn').addEventListener('click', () => {
        document.getElementById('aboutModal').style.display = 'block';
    });
    
    document.getElementById('closeAbout').addEventListener('click', () => {
        document.getElementById('aboutModal').style.display = 'none';
    });
    
    // Help modal
    document.getElementById('helpBtn').addEventListener('click', () => {
        document.getElementById('helpModal').style.display = 'block';
    });
    
    document.getElementById('closeHelp').addEventListener('click', () => {
        document.getElementById('helpModal').style.display = 'none';
    });
    
    // GitHub link
    document.getElementById('githubBtn').addEventListener('click', () => {
        window.electronAPI.openExternal('https://github.com/subedi-samrat/http-media-launcher');
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Handle form submission and browser launch
async function handleLaunch(e) {
    e.preventDefault();
    
    const url = document.getElementById('url').value.trim();
    const launchBtn = document.getElementById('launchBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const commandSection = document.getElementById('commandSection');
    
    // Clear previous messages
    hideMessages();
    
    // Validation
    if (!url) {
        showError('Please enter a valid URL');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showError('URL must start with http:// or https://');
        return;
    }
    
    if (!selectedBrowser) {
        showError('Please select a browser');
        return;
    }
    
    if (!detectedBrowsers[selectedBrowser]?.found) {
        showError(`${browsers[selectedBrowser].name} is not available on this system`);
        return;
    }
    
    // Show loading state
    launchBtn.disabled = true;
    launchBtn.innerHTML = '<span class="loading"></span>Launching Browser...';
    
    try {
        const result = await launchBrowserWithCommand(selectedBrowser, url);
        
        if (result.success) {
            showSuccess(`✅ ${browsers[selectedBrowser].name} launched successfully!`);
            document.getElementById('exportBtn').style.display = 'block';
        } else {
            throw new Error(result.error || 'Unknown error occurred');
        }
        
    } catch (error) {
        console.error('Launch error:', error);
        showError(`Failed to launch browser: ${error.message}`);
    } finally {
        launchBtn.disabled = false;
        launchBtn.innerHTML = '🚀 Launch Browser';
    }
}

// Launch browser with the appropriate command
async function launchBrowserWithCommand(browserKey, url) {
    const browser = detectedBrowsers[browserKey];
    const browserConfig = browsers[browserKey];
    
    try {
        let command, args, tempDir, tempProfile;
        
        if (browserKey === 'firefox') {
            // Special handling for Firefox
            const tempResult = await window.electronAPI.createTempDirectory('firefox_profile');
            if (!tempResult.success) {
                throw new Error('Failed to create temporary Firefox profile');
            }
            
            tempProfile = tempResult.path;
            
            // Create Firefox profile with unsafe preferences
            const profileResult = await window.electronAPI.createFirefoxProfile(tempProfile, url);
            if (!profileResult.success) {
                throw new Error('Failed to create Firefox profile configuration');
            }
            
            command = browser.path;
            args = ['-profile', tempProfile, '-no-remote', url];
            
            lastGeneratedCommand = {
                type: 'firefox',
                command: command,
                args: args,
                tempProfile: tempProfile,
                url: url
            };
            
        } else {
            // Chromium-based browsers (Chrome, Brave, Edge, etc.)
            const tempResult = await window.electronAPI.createTempDirectory(browserKey);
            if (!tempResult.success) {
                throw new Error('Failed to create temporary directory');
            }
            
            tempDir = tempResult.path;
            
            command = browser.path;
            args = [];
            
            // Process flags
            browserConfig.flags.forEach(flag => {
                const processedFlag = flag
                    .replace('{url}', url)
                    .replace('{tempDir}', tempDir);
                args.push(processedFlag);
            });
            
            args.push(url);
            
            lastGeneratedCommand = {
                type: 'chromium',
                command: command,
                args: args,
                tempDir: tempDir,
                url: url
            };
        }
        
        // Show command in UI
        displayCommand(lastGeneratedCommand);
        
        // Launch the browser
        const launchResult = await window.electronAPI.launchBrowser(command, args);
        
        return launchResult;
        
    } catch (error) {
        console.error('Browser launch error:', error);
        return { success: false, error: error.message };
    }
}

// Display the generated command
function displayCommand(commandData) {
    const commandSection = document.getElementById('commandSection');
    const commandOutput = document.getElementById('commandOutput');
    
    let commandText = `"${commandData.command}"`;
    commandData.args.forEach(arg => {
        commandText += ` "${arg}"`;
    });
    
    let output = `Generated command for ${browsers[selectedBrowser].name}:\n\n`;
    output += commandText + '\n\n';
    
    if (commandData.type === 'firefox') {
        output += `Firefox profile created at: ${commandData.tempProfile}\n`;
        output += 'Profile includes unsafe preferences for media access.\n\n';
    } else {
        output += `Temporary profile directory: ${commandData.tempDir}\n\n`;
    }
    
    output += 'This command:\n';
    output += '• Creates a temporary browser profile\n';
    output += '• Disables web security for HTTP media access\n';
    output += '• Enables camera and microphone permissions\n';
    output += '• Does not affect your regular browser settings\n';
    
    commandOutput.textContent = output;
    commandSection.style.display = 'block';
}

// Copy command to clipboard
async function copyCommand() {
    if (!lastGeneratedCommand) {
        showError('No command to copy');
        return;
    }
    
    let commandText = `"${lastGeneratedCommand.command}"`;
    lastGeneratedCommand.args.forEach(arg => {
        commandText += ` "${arg}"`;
    });
    
    try {
        await navigator.clipboard.writeText(commandText);
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    } catch (error) {
        showError('Failed to copy to clipboard');
    }
}

// Export command to file
async function exportCommand() {
    if (!lastGeneratedCommand) {
        showError('No command to export');
        return;
    }
    
    const extension = platformInfo.platform === 'win32' ? 'bat' : 'sh';
    const filename = `launch-${selectedBrowser}-${Date.now()}.${extension}`;
    
    try {
        const result = await window.electronAPI.showSaveDialog({
            defaultPath: filename,
            filters: [
                { name: 'Script Files', extensions: [extension] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        
        if (!result.canceled) {
            let scriptContent;
            
            if (platformInfo.platform === 'win32') {
                scriptContent = `@echo off\nREM HTTP Media Launcher Script\nREM Generated for ${browsers[selectedBrowser].name}\n\n`;
                scriptContent += `"${lastGeneratedCommand.command}"`;
                lastGeneratedCommand.args.forEach(arg => {
                    scriptContent += ` "${arg}"`;
                });
            } else {
                scriptContent = `#!/bin/bash\n# HTTP Media Launcher Script\n# Generated for ${browsers[selectedBrowser].name}\n\n`;
                scriptContent += `"${lastGeneratedCommand.command}"`;
                lastGeneratedCommand.args.forEach(arg => {
                    scriptContent += ` "${arg}"`;
                });
                scriptContent += '\n';
            }
            
            const saveResult = await window.electronAPI.saveFile(result.filePath, scriptContent);
            
            if (saveResult.success) {
                showSuccess(`Script saved to: ${result.filePath}`);
            } else {
                throw new Error(saveResult.error);
            }
        }
    } catch (error) {
        showError(`Failed to export command: ${error.message}`);
    }
}

// Utility functions for UI feedback
function showSuccess(message) {
    hideMessages();
    const successMessage = document.getElementById('successMessage');
    successMessage.innerHTML = message;
    successMessage.style.display = 'block';
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(message) {
    hideMessages();
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideMessages() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
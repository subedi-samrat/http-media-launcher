const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { spawn, exec } = require('child_process');
const os = require('os');

// Keep a global reference of the window object
let mainWindow;
let isDev = process.argv.includes('--dev');

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: getIconPath(),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false // Don't show until ready
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function getIconPath() {
  const platform = process.platform;
  if (platform === 'win32') {
    return path.join(__dirname, '..', 'assets', 'icon.ico');
  } else if (platform === 'darwin') {
    return path.join(__dirname, '..', 'assets', 'icon.icns');
  } else {
    return path.join(__dirname, '..', 'assets', 'icon.png');
  }
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// IPC Handlers
ipcMain.handle('get-platform', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    release: os.release(),
    type: os.type()
  };
});

ipcMain.handle('check-browser-path', async (event, browserPath) => {
  try {
    // Expand environment variables on Windows
    if (process.platform === 'win32' && browserPath.includes('%')) {
      browserPath = browserPath.replace(/%([^%]+)%/g, (match, varName) => {
        return process.env[varName] || match;
      });
    }
    
    const exists = await fs.pathExists(browserPath);
    return { exists, path: browserPath };
  } catch (error) {
    return { exists: false, path: browserPath, error: error.message };
  }
});

ipcMain.handle('create-temp-directory', async (event, prefix) => {
  try {
    const tempDir = path.join(os.tmpdir(), `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    await fs.ensureDir(tempDir);
    return { success: true, path: tempDir };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-firefox-profile', async (event, profilePath, url) => {
  try {
    await fs.ensureDir(profilePath);
    
    const userJsContent = `// Firefox unsafe profile configuration for ${url}
user_pref("security.tls.insecure_fallback_hosts", "${url}");
user_pref("security.mixed_content.block_active_content", false);
user_pref("security.mixed_content.block_display_content", false);
user_pref("media.navigator.permission.disabled", true);
user_pref("permissions.default.camera", 1);
user_pref("permissions.default.microphone", 1);
user_pref("media.getusermedia.insecure.enabled", true);
user_pref("media.navigator.streams.fake", false);
user_pref("media.navigator.permission.force", true);`;
    
    await fs.writeFile(path.join(profilePath, 'user.js'), userJsContent);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('launch-browser', async (event, command, args, options = {}) => {
  return new Promise((resolve) => {
    try {
      console.log('Launching browser:', command, args);
      
      const child = spawn(command, args, {
        detached: true,
        stdio: 'ignore',
        ...options
      });
      
      // Unref the child process so the parent can exit
      child.unref();
      
      child.on('error', (error) => {
        console.error('Browser launch error:', error);
        resolve({ 
          success: false, 
          error: `Failed to launch browser: ${error.message}` 
        });
      });
      
      child.on('spawn', () => {
        console.log('Browser launched successfully');
        resolve({ 
          success: true, 
          message: 'Browser launched successfully',
          pid: child.pid 
        });
      });
      
      // Timeout after 5 seconds if no spawn event
      setTimeout(() => {
        if (!child.killed) {
          resolve({ 
            success: true, 
            message: 'Browser launch initiated (timeout)',
            pid: child.pid 
          });
        }
      }, 5000);
      
    } catch (error) {
      console.error('Browser launch error:', error);
      resolve({ 
        success: false, 
        error: error.message 
      });
    }
  });
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  } catch (error) {
    return { canceled: true, error: error.message };
  }
});

ipcMain.handle('save-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle app updates (if using auto-updater)
if (!isDev) {
  // Auto-updater code would go here
  console.log('Production mode - auto-updater disabled for now');
}

// Prevent navigation away from the app
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'file://') {
      navigationEvent.preventDefault();
    }
  });
});
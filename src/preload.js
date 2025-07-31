const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform detection
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // Browser path checking
  checkBrowserPath: (browserPath) => ipcRenderer.invoke('check-browser-path', browserPath),
  
  // File system operations
  createTempDirectory: (prefix) => ipcRenderer.invoke('create-temp-directory', prefix),
  createFirefoxProfile: (profilePath, url) => ipcRenderer.invoke('create-firefox-profile', profilePath, url),
  
  // Browser launching
  launchBrowser: (command, args, options) => ipcRenderer.invoke('launch-browser', command, args, options),
  
  // File operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // App info
  getAppVersion: () => process.env.npm_package_version || '1.0.0',
  
  // Utilities
  expandPath: (pathStr) => {
    if (process.platform === 'win32') {
      return pathStr.replace(/%([^%]+)%/g, (match, varName) => {
        return process.env[varName] || match;
      });
    }
    return pathStr.replace(/~/g, process.env.HOME || process.env.USERPROFILE || '');
  }
});

// Expose a limited API for the renderer
contextBridge.exposeInMainWorld('platform', {
  isWindows: process.platform === 'win32',
  isMacOS: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
  arch: process.arch
});

// Security: Remove node integration globals if they exist
delete window.require;
delete window.exports;
delete window.module;
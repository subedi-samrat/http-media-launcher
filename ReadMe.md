# HTTP Media Launcher - Electron App

A cross-platform desktop application for launching web browsers with HTTP media access capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
  
### 1. Project Setup

Clone the Project from GitHub

```bash
# Clone the project 
git clone https://github.com/subedi-samrat/http-media-launcher.git

# Change directory
cd http-media-launcher
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Application Icons

Add icons in the `assets/` directory:
- `icon.png` (512x512) - for Linux
- `icon.ico` (with multiple sizes) - for Windows
- `icon.icns` (with multiple sizes) - for macOS

You can use online converters or tools like [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder).

### 4. Development

```bash
# Run in development mode
npm run dev
```

## 🏗️ Building for Distribution

### Build for Current Platform
```bash
npm run build
```

### Build for Specific Platforms
```bash
# Windows (creates .exe installer and portable)
npm run build:win

# macOS (creates .dmg and .zip)
npm run build:mac

# Linux (creates AppImage, .deb, .rpm, .tar.gz)
npm run build:linux

# All platforms
npm run build:all
```

## 📁 Project Structure

```
http-media-launcher/
├── package.json              # Project configuration
├── src/
│   ├── main.js              # Main Electron process
│   ├── preload.js           # Preload script for security
│   └── renderer/
│       ├── index.html       # Main UI
│       ├── styles.css       # Styling
│       └── renderer.js      # UI logic
├── assets/
│   ├── icon.png            # Linux icon
│   ├── icon.ico            # Windows icon
│   └── icon.icns           # macOS icon
├── dist/                   # Built applications
└── node_modules/           # Dependencies
```

## 🔧 Configuration

### Customizing the App

Edit `package.json` to customize:
- App name and description
- Author information  
- Repository URL
- Version number

### Build Configuration

The build configuration in `package.json` includes:
- **Windows**: NSIS installer + portable executable
- **macOS**: DMG installer + ZIP archive  
- **Linux**: AppImage, DEB, RPM, and TAR.GZ packages
- **Multiple architectures**: x64, ia32 (Windows), arm64 (macOS/Linux)

## 🌐 Supported Browsers

The app automatically detects and supports:
- **Google Chrome** 🟢
- **Brave Browser** 🦁  
- **Mozilla Firefox** 🦊
- **Microsoft Edge** 🔷
- **Chromium** 🔵
- **Safari** 🧭 (macOS only)

## 🛡️ Security Features

- **Isolated processes** with context isolation
- **Secure IPC** communication between main and renderer
- **No direct Node.js access** in renderer process
- **Temporary profiles** to protect user data
- **External link protection**

## 📦 Distribution

### GitHub Releases
1. Push your code to GitHub
2. Update the repository URL in `package.json`
3. Use `npm run build:all` to create builds
4. Upload the builds from `dist/` to GitHub Releases

### Auto-Updates (Optional)
The app is configured for auto-updates via GitHub releases. To enable:
1. Set up code signing certificates
2. Configure the `publish` section in `package.json`
3. Use electron-updater in your builds

## 🚨 Security Warning

This application helps developers test camera/microphone access on HTTP sites by temporarily disabling browser security features. It should only be used in development/testing environments.

## 🐛 Troubleshooting

### Common Issues

1. **Browser not detected**
   - Try refreshing the browser list
   - Check if the browser is installed in standard locations
   - Add custom browser paths if needed

2. **Build fails**
   - Ensure Node.js v18+ is installed  
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check for missing dependencies

3. **App won't start**
   - Check console for errors: `npm run dev`
   - Verify all files are in correct locations
   - Ensure proper file permissions

4. **Icons not showing**
   - Add proper icon files to `assets/` directory
   - Rebuild the app after adding icons

### Platform-Specific Issues

**Windows:**
- May require administrator privileges for some browsers
- Windows Defender might flag the app (add exception)

**macOS:**  
- May need to allow app in Security & Privacy settings
- Code signing required for distribution

**Linux:**
- Install required system dependencies for electron-builder
- Some browsers may need additional permissions


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - [LICENSE](LICENSE)

# Release Note - v1.0.0

## ✨ New Features & Improvements

- **Cross-Platform Compatibility:** Supports Windows, macOS, and Linux for seamless usage across different operating systems.
- **Multiple Browser Support:** Launch major browsers including Google Chrome 🟢, Brave Browser 🦁, Mozilla Firefox 🦊, Microsoft Edge 🔷, Chromium 🔵, and Safari 🧭 (macOS only).
- **Automatic Browser Detection:** Automatically detects installed browsers on your system, making it easy to select and launch.
- **Temporary Browser Profiles:** Launches browsers with isolated temporary profiles to ensure your regular browsing data remains unaffected.
- **Configurable URL Input:** Easily enter and suggested URLs for quick testing.
- **Command Generation & Export:** View the exact command used to launch the browser and export it as a `.bat` (Windows) or `.sh` (Linux/macOS) script for command-line use.
- **User-Friendly Interface:** Intuitive graphical interface for a smooth user experience.

## 🛡️ Security Enhancements

- **Isolated Processes:** Utilizes Electron's isolated processes and context isolation for enhanced security.
- **Secure IPC Communication:** Ensures secure communication channels between the main and renderer processes.
- **No Direct Node.js Access:** Prevents direct Node.js access in the renderer process to mitigate security risks.
- **Temporary Profiles for Safety:** Employs temporary browser profiles to protect user data from potentially insecure HTTP media access during testing.
- **External Link Protection:** Protects against unintended navigation by handling external links securely.

## 🐛 Known Issues & Troubleshooting

- **Browser Not Detected:**
    - Try clicking the "Refresh Browser List" button.
    - Ensure the browser is installed in standard locations or add custom paths if necessary.
- **Build Fails:**
    - Verify Node.js v18+ is installed.
    - Clear `node_modules` and reinstall dependencies: `rm -rf node_modules && npm install`.
    - Check for missing dependencies.
- **App Won't Start:**
    - Check the console for errors by running `npm run dev`.
    - Confirm all application files are in their correct locations.
    - Verify proper file permissions.
- **Icons Not Showing:**
    - Ensure appropriate icon files (`icon.png`, `icon.ico`, `icon.icns`) are present in the `assets/` directory.
    - Rebuild the application after adding icons.

### Platform-Specific Issues:

- **Windows:**
    - May require administrator privileges for certain browser operations.
    - Windows Defender might flag the application; add an exception if needed.
- **macOS:**
    - May need to grant permission in "Security & Privacy" settings.
    - Code signing is required for distribution.
- **Linux:**
    - Install necessary system dependencies for electron-builder.
    - Some browsers may require additional permissions.

## 📄 License

This project is released under the MIT License.

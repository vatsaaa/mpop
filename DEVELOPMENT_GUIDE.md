# MPOP Development Guide

This guide covers the reorganized project structure and development workflow for the Medium Public Only Posts Chrome extension.

## 🏗️ Project Structure Overview

The project has been reorganized into a clean, maintainable structure following Chrome extension best practices:

```
mpop/
├── src/                          # 🎯 Source code (load this in Chrome)
│   ├── manifest.json            # Extension manifest (updated paths)
│   ├── content/                 # Content scripts
│   │   ├── content.js           # Main content filtering logic
│   │   └── styles.css           # Page modification styles
│   ├── popup/                   # Popup interface
│   │   ├── popup.html           # Popup HTML structure
│   │   ├── popup.js             # Popup functionality
│   │   └── popup.css            # Popup styles (extracted from HTML)
│   └── assets/                  # Static assets
│       └── icons/               # Extension icons (16, 32, 48, 128px)
├── scripts/                     # 🔧 Build and utility scripts
│   ├── install.sh               # Development installation helper
│   ├── package.sh               # Package for Chrome Web Store
│   ├── production_build.sh      # Create production build
│   └── test_extension.sh        # Run comprehensive tests
├── tests/                       # 🧪 Test files and reports
│   ├── test.js                  # Test utilities
│   └── test_report.html         # Generated test reports
├── docs/                        # 📚 Documentation
│   ├── CHROME_EXTENSION_TUTORIAL.md # Complete extension tutorial
│   ├── DEVELOPMENT.md           # Original development guide
│   ├── STORE_LISTING.md         # Chrome Web Store listing content
│   ├── READY_FOR_SUBMISSION.md  # Submission readiness guide
│   ├── SUBMISSION_CHECKLIST.md  # Pre-submission checklist
│   └── ICON_INSTRUCTIONS.md     # Icon creation instructions
├── dist/                        # 🚀 Build output (gitignored)
├── package.json                 # Project metadata and scripts
├── README.md                    # Main project documentation
├── PRIVACY_POLICY.md            # Privacy policy (required for Chrome Web Store)
├── LICENSE                      # MIT License
└── .gitignore                   # Git ignore rules (updated for new structure)
```

## 🚀 Development Workflow

### 1. Initial Setup

```bash
# Clone the repository
git clone https://github.com/vatsaaa/mpop.git
cd mpop

# Quick install for development
./scripts/install.sh
```

**Manual Installation:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `src/` directory (⚠️ Important: select src/, not root)

### 2. Development Process

#### Working with Source Files

- **Extension Source**: Work in the `src/` directory
- **Content Scripts**: Modify `src/content/content.js` and `src/content/styles.css`
- **Popup Interface**: Edit files in `src/popup/`
- **Configuration**: Update `src/manifest.json` (paths are relative to src/)

#### Testing Changes

```bash
# Run comprehensive tests
./scripts/test_extension.sh

# Or test manually:
# 1. Make changes in src/
# 2. Go to chrome://extensions/
# 3. Click reload button on your extension
# 4. Test on Medium.com
```

#### Build Process

```bash
# Create production build (removes debug statements)
./scripts/production_build.sh

# Package for Chrome Web Store submission
./scripts/package.sh

# Use npm scripts (defined in package.json)
npm run build          # Same as production_build.sh
npm run package        # Same as package.sh
npm run test           # Same as test_extension.sh
npm run install-dev    # Same as install.sh
```

### 3. Key Changes from Reorganization

#### Manifest Updates

The `manifest.json` file has been updated with correct paths:

```json
{
  "content_scripts": [{
    "js": ["content/content.js"],      // Was: ["content.js"]
    "css": ["content/styles.css"]      // Was: ["styles.css"]
  }],
  "action": {
    "default_popup": "popup/popup.html"  // Was: "popup.html"
  },
  "icons": {
    "16": "assets/icons/icon16.png"     // Was: "icons/icon16.png"
    // ... etc
  }
}
```

#### Build Scripts

All build scripts have been updated to work with the new structure:
- **Source location**: Scripts now copy from `src/` directory
- **Path handling**: Correct relative paths maintained in builds
- **Clean output**: Production builds exclude development files

## 🧪 Testing Strategy

### Local Testing

1. **Load Extension**: Install the `src/` directory in Chrome
2. **Test Pages**: Visit different Medium.com pages
3. **Test Popup**: Click extension icon and test all controls
4. **Check Console**: Look for any JavaScript errors (F12)

### Automated Testing

```bash
# Run the comprehensive test script
./scripts/test_extension.sh
```

For complete development details, see `docs/DEVELOPMENT.md` and `docs/CHROME_EXTENSION_TUTORIAL.md`.

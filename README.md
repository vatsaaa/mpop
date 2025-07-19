# Medium Public Only Posts (MPOP)

A Google Chrome extension that automatically removes "Member-only story" content from Medium.com pages, allowing you to see only public posts for a cleaner reading experience.

## 🎯 What It Does

Transform your Medium reading experience by focusing only on content you can actually read! MPOP automatically hides member-only stories from Medium.com, leaving you with a clean feed of free public posts. No more frustration clicking on stories you can't read!

## ✨ Features

- **🚫 Automatic Content Filtering** - Removes member-only stories as pages load
- **🔄 Dynamic Content Support** - Works with infinite scroll and dynamic loading
- **📊 Real-time Statistics** - Shows count of hidden stories in popup
- **⚡ Performance Optimized** - Lightweight and fast, won't slow down browsing
- **🎛️ Easy Toggle Control** - Enable/disable with one click
- **🔄 Auto-refresh Functionality** - Quick page reload from popup
- **🔒 Privacy First** - No data collection, works entirely locally
- **🎨 Clean Layout** - Eliminates gaps left by hidden content

## 🚀 Installation

### Option 1: Developer Mode (Current)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vatsaaa/mpop.git
   cd mpop
   ```

2. **Install in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `src/` folder
   - The extension icon should appear in your Chrome toolbar

3. **Quick install script**:
   ```bash
   ./scripts/install.sh
   ```

### Option 2: Chrome Web Store (Coming Soon)

The extension will be submitted to the Chrome Web Store for easier installation.

## 📱 Usage

1. **Navigate to Medium.com** - Visit any Medium page
2. **Automatic filtering** - Member-only stories are automatically hidden
3. **View statistics** - Click the extension icon to see how many stories were filtered
4. **Toggle functionality** - Use the popup to enable/disable filtering
5. **Refresh page** - Quick reload button in popup

## 🔧 How It Works

The extension uses content scripts to:
- **Scan page content** for member-only indicators and paywall signals
- **Identify restricted stories** through multiple detection methods
- **Hide content dynamically** using CSS while preserving page layout
- **Monitor for new content** as you scroll (infinite scroll support)
- **Provide real-time feedback** with statistics and controls

## 🏗️ Project Structure

```
mpop/
├── src/                          # 🎯 Source code
│   ├── manifest.json            # Extension configuration
│   ├── content/                 # Content script functionality
│   │   ├── content.js           # Main filtering logic
│   │   └── styles.css           # Page modification styles
│   ├── popup/                   # Popup interface
│   │   ├── popup.html           # Interface structure
│   │   ├── popup.js             # Popup functionality
│   │   └── popup.css            # Popup styling
│   └── assets/                  # Static assets
│       └── icons/               # Extension icons (16, 32, 48, 128px)
├── scripts/                     # 🔧 Build & utility scripts
│   ├── install.sh               # Development installation
│   ├── package.sh               # Package for Chrome Web Store
│   ├── production_build.sh      # Create production build
│   └── test_extension.sh        # Run comprehensive tests
├── tests/                       # 🧪 Testing files
├── docs/                        # 📚 Documentation
├── package.json                 # Project metadata
├── LICENSE                      # MIT License
└── README.md                    # This file
```

## 🛠️ Development

### Quick Start

```bash
# Clone and setup
git clone https://github.com/vatsaaa/mpop.git
cd mpop

# Install for development
./scripts/install.sh

# Run tests
./scripts/test_extension.sh

# Build for production
./scripts/production_build.sh

# Package for Chrome Web Store
./scripts/package.sh
```

### Available Scripts

- `npm run build` - Create production build
- `npm run package` - Package for Chrome Web Store submission
- `npm run test` - Run comprehensive tests
- `npm run install-dev` - Install extension for development

### Testing

1. **Load extension** in Chrome developer mode (select `src/` folder)
2. **Visit Medium.com** and test on various pages:
   - Homepage feed
   - Topic pages
   - Search results
   - Individual profiles
3. **Check popup functionality** - Statistics and toggle controls
4. **Monitor console** for debug messages (F12 → Console)
5. **Test performance** with large pages and infinite scroll

### Building for Production

The production build removes debug statements and creates a clean package:

```bash
./scripts/production_build.sh  # Creates production/ directory
./scripts/package.sh           # Creates ZIP for Chrome Web Store
```

## 🔒 Privacy & Security

- **No Data Collection** - Extension works entirely locally in your browser
- **No External Requests** - No data transmitted to external servers
- **Minimal Permissions** - Only requests `activeTab` for Medium.com
- **Open Source** - Full source code available for review
- **No Tracking** - No analytics or user behavior monitoring

**Permissions Explained:**
- `activeTab` - Modify Medium.com pages you're actively viewing
- `host_permissions` - Access only Medium.com and its subdomains

## 📊 Technical Details

- **Manifest Version:** 3 (latest Chrome extension standard)
- **Browser Support:** Chrome 88+ (Manifest V3 compatible)
- **Package Size:** ~28KB (well under 128MB limit)
- **Performance:** Efficient DOM processing with mutation observers
- **Compatibility:** Works on all Medium pages and subdomains

## 🎨 Perfect For

- Casual Medium readers who want free content only
- Users without Medium membership
- Anyone seeking a cleaner, less cluttered reading experience
- Researchers browsing Medium without subscription limits
- Productivity-focused users who want distraction-free reading

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** in the `src/` directory
4. **Test thoroughly** on Medium.com
5. **Run the test script**: `./scripts/test_extension.sh`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Submit a pull request**

### Development Guidelines

- Keep all source code in `src/` directory
- Update tests when adding new features
- Follow existing code style and patterns
- Test on multiple Medium page types
- Update documentation as needed

## 📋 Roadmap

- [ ] Chrome Web Store submission
- [ ] Firefox extension support
- [ ] Advanced filtering options
- [ ] Custom keyword filtering
- [ ] Statistics dashboard
- [ ] Export/import settings

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This extension is for educational and productivity purposes. Please respect Medium's business model and consider supporting writers you enjoy reading. The extension simply filters content visibility and does not bypass any paywalls or access restrictions.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/vatsaaa/mpop/issues)
- **Source Code**: [GitHub Repository](https://github.com/vatsaaa/mpop)
- **Documentation**: See `docs/` directory for detailed guides

---

**Made with ❤️ for a cleaner Medium reading experience**
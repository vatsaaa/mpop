# Medium Public Only Posts

A Google Chrome extension that automatically removes "Member-only story" content from Medium.com pages, allowing you to see only public posts.

## Features

- 🚫 Automatically hides member-only stories from Medium feeds
- 🔄 Works with dynamic content loading (infinite scroll)
- 📊 Shows statistics of hidden stories in popup
- ⚡ Lightweight and fast
- 🎛️ Easy enable/disable toggle
- 🔄 Auto-refresh functionality

## Installation

### Option 1: Developer Mode (Recommended for now)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your Chrome toolbar

### Option 2: Chrome Web Store (Coming Soon)

The extension will be submitted to the Chrome Web Store for easier installation.

## Usage

1. Navigate to any Medium.com page
2. The extension automatically starts filtering member-only content
3. Click the extension icon to see statistics and controls
4. Use the toggle to temporarily disable/enable filtering
5. Use the refresh button to reload the current page

## How It Works

The extension uses content scripts to:
- Scan page content for member-only indicators
- Identify stories with member-only labels or paywalls
- Hide these stories using CSS while preserving page layout
- Monitor for new content as you scroll (dynamic loading)

## Privacy

- No data is collected or transmitted
- All filtering happens locally in your browser
- No external API calls or tracking
- Open source and transparent

## Development

### Files Structure

```
├── manifest.json       # Extension configuration
├── content.js         # Main content script for filtering
├── popup.html         # Extension popup interface
├── popup.js           # Popup functionality
├── styles.css         # CSS for hiding content
└── icons/             # Extension icons
```

### Building

No build process required - the extension runs directly from source files.

### Testing

1. Load the extension in developer mode
2. Visit medium.com
3. Look for member-only stories being hidden
4. Check browser console for debug messages
5. Test the popup interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on Medium.com
5. Submit a pull request

## License

MIT License - feel free to modify and distribute.

## Disclaimer

This extension is for educational purposes. Please respect Medium's business model and consider supporting writers you enjoy reading.
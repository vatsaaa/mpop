#!/bin/bash

# Medium Public Only Posts - Installation Helper Script

echo "🚀 Medium Public Only Posts - Chrome Extension Setup"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this script from the extension directory."
    exit 1
fi

echo "✅ Found manifest.json"

# Check for required files
required_files=("content.js" "popup.html" "popup.js" "styles.css")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    else
        echo "✅ Found $file"
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing required files: ${missing_files[*]}"
    exit 1
fi

# Check for icon files
echo ""
echo "🖼️  Checking icon files..."
icon_files=("icons/icon16.png" "icons/icon32.png" "icons/icon48.png" "icons/icon128.png")
missing_icons=()

for icon in "${icon_files[@]}"; do
    if [ ! -f "$icon" ]; then
        missing_icons+=("$icon")
    else
        echo "✅ Found $icon"
    fi
done

if [ ${#missing_icons[@]} -ne 0 ]; then
    echo "⚠️  Missing icon files: ${missing_icons[*]}"
    echo "   The extension will work but may not have proper icons."
    echo "   See ICON_INSTRUCTIONS.md for how to create them."
fi

echo ""
echo "🎯 Installation Instructions:"
echo "1. Open Google Chrome"
echo "2. Navigate to chrome://extensions/"
echo "3. Enable 'Developer mode' (toggle in top right)"
echo "4. Click 'Load unpacked'"
echo "5. Select this folder: $(pwd)"
echo "6. The extension should appear in your Chrome toolbar"
echo ""
echo "🧪 Testing Instructions:"
echo "1. Navigate to medium.com"
echo "2. Look for member-only stories being hidden"
echo "3. Click the extension icon to see the popup"
echo "4. Check browser console for debug messages (F12 > Console)"
echo ""
echo "✨ Extension is ready for installation!"

# Optionally open Chrome extensions page
read -p "🔗 Would you like to open chrome://extensions/ now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "chrome://extensions/"
        echo "✅ Opened Chrome extensions page"
    else
        echo "ℹ️  Please manually navigate to chrome://extensions/"
    fi
fi

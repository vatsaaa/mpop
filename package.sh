#!/bin/bash

# Chrome Extension Packaging Script
# Prepares the extension for Chrome Web Store submission

echo "🚀 Packaging Medium Public Only Posts Extension for Chrome Web Store"
echo "=================================================================="

# Set variables
EXTENSION_NAME="medium-public-only-posts"
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')
PACKAGE_NAME="${EXTENSION_NAME}-v${VERSION}"
TEMP_DIR="temp_package"
OUTPUT_DIR="dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Version detected: ${VERSION}${NC}"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Clean up any existing temp directory
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

# Create temporary directory for packaging
mkdir "$TEMP_DIR"

echo -e "${YELLOW}📁 Copying extension files...${NC}"

# Copy essential files only (exclude development files)
cp manifest.json "$TEMP_DIR/"
cp content.js "$TEMP_DIR/"
cp popup.html "$TEMP_DIR/"
cp popup.js "$TEMP_DIR/"
cp styles.css "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"

# Copy icons directory
cp -r icons "$TEMP_DIR/"

echo -e "${YELLOW}🧹 Cleaning up files for production...${NC}"

# Remove .DS_Store files (macOS)
find "$TEMP_DIR" -name ".DS_Store" -delete

# Verify required files exist
echo -e "${YELLOW}✅ Verifying required files...${NC}"

required_files=("manifest.json" "content.js" "popup.html" "popup.js" "styles.css" "icons/icon16.png" "icons/icon32.png" "icons/icon48.png" "icons/icon128.png")

for file in "${required_files[@]}"; do
    if [ -f "$TEMP_DIR/$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} Missing: $file"
        exit 1
    fi
done

# Check manifest.json syntax
echo -e "${YELLOW}🔍 Validating manifest.json...${NC}"
if python3 -m json.tool "$TEMP_DIR/manifest.json" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} manifest.json is valid JSON"
else
    echo -e "${RED}✗${NC} manifest.json has syntax errors"
    exit 1
fi

# Check for required manifest fields
echo -e "${YELLOW}📋 Checking manifest completeness...${NC}"
required_fields=("name" "version" "description" "manifest_version" "permissions" "action" "icons")
for field in "${required_fields[@]}"; do
    if grep -q "\"$field\"" "$TEMP_DIR/manifest.json"; then
        echo -e "${GREEN}✓${NC} $field"
    else
        echo -e "${RED}✗${NC} Missing manifest field: $field"
        exit 1
    fi
done

# Calculate package size
package_size=$(du -sh "$TEMP_DIR" | cut -f1)
echo -e "${BLUE}📦 Package size: ${package_size}${NC}"

# Create ZIP package
echo -e "${YELLOW}🗜️  Creating ZIP package...${NC}"
cd "$TEMP_DIR"
zip -r "../$OUTPUT_DIR/$PACKAGE_NAME.zip" . -x "*.DS_Store*" "*.git*"
cd ..

# Verify ZIP was created
if [ -f "$OUTPUT_DIR/$PACKAGE_NAME.zip" ]; then
    zip_size=$(du -sh "$OUTPUT_DIR/$PACKAGE_NAME.zip" | cut -f1)
    echo -e "${GREEN}✅ Package created successfully!${NC}"
    echo -e "${GREEN}📦 ZIP file: $OUTPUT_DIR/$PACKAGE_NAME.zip${NC}"
    echo -e "${GREEN}📏 ZIP size: ${zip_size}${NC}"
else
    echo -e "${RED}❌ Failed to create ZIP package${NC}"
    exit 1
fi

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}🎉 Extension packaging complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Test the packaged extension:"
echo "   - Go to chrome://extensions/"
echo "   - Enable Developer mode"
echo "   - Click 'Load unpacked' and select the dist folder"
echo ""
echo "2. Upload to Chrome Web Store:"
echo "   - Go to Chrome Web Store Developer Dashboard"
echo "   - Upload the ZIP file: $OUTPUT_DIR/$PACKAGE_NAME.zip"
echo "   - Fill out store listing with content from STORE_LISTING.md"
echo ""
echo "3. Required for submission:"
echo "   - Screenshots (1280x800 or 640x400)"
echo "   - Detailed description (see STORE_LISTING.md)"
echo "   - Privacy policy (see PRIVACY_POLICY.md)"
echo ""
echo -e "${YELLOW}⚠️  Remember to test thoroughly before submitting!${NC}"
echo ""

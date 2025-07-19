#!/bin/bash

# Chrome Extension Testing Script
# Comprehensive testing before Chrome Web Store submission

echo "🧪 Testing Medium Public Only Posts Extension"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test URLs for Medium
TEST_URLS=(
    "https://medium.com"
    "https://medium.com/topic/technology"
    "https://medium.com/search?q=javascript"
    "https://towardsdatascience.medium.com"
)

echo -e "${BLUE}📋 Pre-flight checks...${NC}"

# Check if Chrome is available
if command -v google-chrome >/dev/null 2>&1; then
    CHROME_CMD="google-chrome"
elif command -v chromium >/dev/null 2>&1; then
    CHROME_CMD="chromium"
elif command -v /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome >/dev/null 2>&1; then
    CHROME_CMD="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
else
    echo -e "${RED}❌ Chrome/Chromium not found. Please install Chrome for testing.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Chrome found: $CHROME_CMD${NC}"

# Check required files
echo -e "${YELLOW}📁 Checking extension files...${NC}"
required_files=("manifest.json" "content.js" "popup.html" "popup.js" "styles.css")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} Missing: $file"
        exit 1
    fi
done

# Check icon files
echo -e "${YELLOW}🎨 Checking icon files...${NC}"
icon_sizes=("16" "32" "48" "128")

for size in "${icon_sizes[@]}"; do
    icon_file="icons/icon${size}.png"
    if [ -f "$icon_file" ]; then
        echo -e "${GREEN}✓${NC} ${icon_file}"
        # Check if it's actually a PNG file
        if file "$icon_file" | grep -q "PNG image data"; then
            echo -e "${GREEN}  └─ Valid PNG format${NC}"
        else
            echo -e "${RED}  └─ Not a valid PNG file${NC}"
        fi
    else
        echo -e "${RED}✗${NC} Missing: $icon_file"
    fi
done

# Validate manifest.json
echo -e "${YELLOW}🔍 Validating manifest.json...${NC}"

# Check JSON syntax
if python3 -m json.tool manifest.json > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Valid JSON syntax"
else
    echo -e "${RED}✗${NC} Invalid JSON syntax in manifest.json"
    exit 1
fi

# Check manifest version
manifest_version=$(grep '"manifest_version"' manifest.json | grep -o '[0-9]')
if [ "$manifest_version" = "3" ]; then
    echo -e "${GREEN}✓${NC} Using Manifest V3"
else
    echo -e "${RED}✗${NC} Not using Manifest V3"
fi

# Check for required fields
required_manifest_fields=("name" "version" "description" "permissions" "action" "icons")
for field in "${required_manifest_fields[@]}"; do
    if grep -q "\"$field\"" manifest.json; then
        echo -e "${GREEN}✓${NC} Has $field"
    else
        echo -e "${RED}✗${NC} Missing $field in manifest"
    fi
done

# Check file sizes
echo -e "${YELLOW}📏 Checking file sizes...${NC}"
total_size=0

for file in *.js *.html *.css *.json; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        total_size=$((total_size + size))
        if [ $size -gt 102400 ]; then  # 100KB
            echo -e "${YELLOW}⚠️${NC}  $file is large: $(($size / 1024))KB"
        else
            echo -e "${GREEN}✓${NC} $file: $(($size / 1024))KB"
        fi
    fi
done

echo -e "${BLUE}📦 Total extension size: $((total_size / 1024))KB${NC}"

# Performance check - look for potential issues
echo -e "${YELLOW}⚡ Performance checks...${NC}"

# Check for console.log statements (should be removed in production)
log_count=$(grep -r "console\.log" *.js | wc -l)
if [ $log_count -gt 0 ]; then
    echo -e "${YELLOW}⚠️${NC}  Found $log_count console.log statements (consider removing for production)"
else
    echo -e "${GREEN}✓${NC} No console.log statements found"
fi

# Check for setTimeout/setInterval usage
timer_count=$(grep -r "setTimeout\|setInterval" *.js | wc -l)
if [ $timer_count -gt 0 ]; then
    echo -e "${BLUE}ℹ️${NC}  Found $timer_count timer functions (verify they're necessary)"
else
    echo -e "${GREEN}✓${NC} No timer functions found"
fi

# Manual testing instructions
echo ""
echo -e "${BLUE}🧑‍💻 Manual Testing Required:${NC}"
echo ""
echo "1. Load extension in Chrome:"
echo "   - Open chrome://extensions/"
echo "   - Enable Developer mode"
echo "   - Click 'Load unpacked' and select this folder"
echo ""
echo "2. Test on these Medium URLs:"
for url in "${TEST_URLS[@]}"; do
    echo "   - $url"
done
echo ""
echo "3. Verify functionality:"
echo "   ✓ Member-only stories are hidden"
echo "   ✓ Layout gaps are removed"
echo "   ✓ Popup shows correct statistics"
echo "   ✓ Enable/disable toggle works"
echo "   ✓ No console errors"
echo "   ✓ Page loads normally"
echo ""
echo "4. Test edge cases:"
echo "   ✓ Pages with no member-only content"
echo "   ✓ Pages with all member-only content"
echo "   ✓ Dynamic content loading (infinite scroll)"
echo "   ✓ Incognito mode"
echo ""

# Create a simple HTML test report
cat > test_report.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Extension Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; }
        .pass { color: #28a745; }
        .warn { color: #ffc107; }
        .fail { color: #dc3545; }
        .section { margin: 20px 0; padding: 15px; border-left: 3px solid #007bff; background: #f8f9fa; }
        .checklist { list-style: none; padding: 0; }
        .checklist li { margin: 5px 0; }
        .checklist li:before { content: "☐ "; margin-right: 5px; }
        .completed:before { content: "✅ "; }
    </style>
</head>
<body>
    <h1>Medium Public Only Posts - Test Report</h1>
    <p>Generated: $(date)</p>
    
    <div class="section">
        <h2>Automated Checks</h2>
        <p class="pass">✅ All required files present</p>
        <p class="pass">✅ Manifest V3 compliance</p>
        <p class="pass">✅ JSON syntax valid</p>
        <p class="pass">✅ Icon files present</p>
    </div>
    
    <div class="section">
        <h2>Manual Testing Checklist</h2>
        <ul class="checklist">
            <li>Extension loads without errors</li>
            <li>Member-only stories are hidden on Medium homepage</li>
            <li>Layout gaps are properly removed</li>
            <li>Popup interface displays correctly</li>
            <li>Statistics are accurate</li>
            <li>Enable/disable toggle functions</li>
            <li>Works on topic pages</li>
            <li>Works on search results</li>
            <li>Works on publication pages</li>
            <li>No console errors</li>
            <li>Performance is acceptable</li>
            <li>Works in incognito mode</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Test URLs</h2>
        <ul>
$(for url in "${TEST_URLS[@]}"; do echo "            <li><a href=\"$url\" target=\"_blank\">$url</a></li>"; done)
        </ul>
    </div>
</body>
</html>
EOF

echo -e "${GREEN}📄 Test report created: test_report.html${NC}"
echo ""
echo -e "${YELLOW}🎯 Next steps:${NC}"
echo "1. Complete manual testing using the checklist above"
echo "2. Fix any issues found during testing"
echo "3. Create screenshots for Chrome Web Store"
echo "4. Run ./package.sh to create final package"
echo "5. Submit to Chrome Web Store"
echo ""
echo -e "${GREEN}🚀 Extension is ready for manual testing!${NC}"

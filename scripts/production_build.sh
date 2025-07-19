#!/bin/bash

# Production Build Script
# Creates a production-ready version by removing debug statements

echo "🏭 Creating production build..."

# Create production directory
mkdir -p production

# Copy src directory structure to production
cp -r src/* production/

# Copy essential root files
cp README.md production/ 2>/dev/null || true
cp PRIVACY_POLICY.md production/ 2>/dev/null || true

# Remove debug statements from JavaScript files
echo "🧹 Removing debug statements from JavaScript files..."

cd production

# Remove console.log from content.js
sed -i.bak '/console\.log/d' content/content.js
echo "✓ Cleaned content/content.js"

# Remove console.log from popup.js  
sed -i.bak '/console\.log/d' popup/popup.js
echo "✓ Cleaned popup/popup.js"

# Remove .bak files
rm -f *.bak content/*.bak popup/*.bak

# Verify no console.log statements remain
remaining_logs=$(find . -name "*.js" -exec grep -l "console\.log" {} \; | wc -l)
if [ $remaining_logs -eq 0 ]; then
    echo "✅ All debug statements removed"
else
    echo "⚠️  $remaining_logs console.log statements still found"
fi

cd ..

echo "📦 Production build created in 'production/' directory"
echo "🎯 Use this version for Chrome Web Store submission"

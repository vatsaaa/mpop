#!/bin/bash

# Production Build Script
# Creates a production-ready version by removing debug statements

echo "🏭 Creating production build..."

# Create production directory
mkdir -p production

# Copy all files to production
cp -r * production/ 2>/dev/null || true
cp -r icons production/ 2>/dev/null || true

# Remove development files from production
cd production
rm -f package.sh test_extension.sh DEVELOPMENT.md SUBMISSION_CHECKLIST.md STORE_LISTING.md test.js install.sh test_report.html
rm -f production_build.sh

# Remove console.log statements from JavaScript files
echo "🧹 Removing debug statements from JavaScript files..."

# Remove console.log from content.js
sed -i.bak '/console\.log/d' content.js
echo "✓ Cleaned content.js"

# Remove console.log from popup.js  
sed -i.bak '/console\.log/d' popup.js
echo "✓ Cleaned popup.js"

# Remove .bak files
rm -f *.bak

# Verify no console.log statements remain
remaining_logs=$(grep -r "console\.log" *.js | wc -l)
if [ $remaining_logs -eq 0 ]; then
    echo "✅ All debug statements removed"
else
    echo "⚠️  $remaining_logs console.log statements still found"
fi

cd ..

echo "📦 Production build created in 'production/' directory"
echo "🎯 Use this version for Chrome Web Store submission"

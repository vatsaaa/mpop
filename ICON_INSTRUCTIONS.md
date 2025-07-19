# Icon Generation Instructions

Since the Chrome extension requires PNG icon files, you'll need to create them from the SVG file or use simple colored squares as placeholders.

## Quick Solution - Create Simple Placeholder Icons

You can create simple colored square PNG files as temporary icons:

### Using any image editor or online tool:

1. Create a 16x16 pixel image with a blue background (#1a73e8)
2. Add a white "M" in the center
3. Save as `icon16.png`
4. Repeat for 32x32, 48x48, and 128x128 sizes

### Using macOS Preview (if available):

1. Open the `icon.svg` file in Preview
2. Export as PNG at different sizes
3. Rename to match the required filenames

### Using online SVG to PNG converters:

1. Upload the `icon.svg` file to any online SVG to PNG converter
2. Generate at sizes: 16px, 32px, 48px, 128px
3. Download and rename appropriately

### Required icon files:
- `icons/icon16.png` (16x16 pixels)
- `icons/icon32.png` (32x32 pixels)  
- `icons/icon48.png` (48x48 pixels)
- `icons/icon128.png` (128x128 pixels)

## Alternative: Temporary Fix

For immediate testing, you can modify the manifest.json to remove the icon references temporarily, or create simple colored PNG files with any basic image editor.

The extension will work without custom icons (Chrome will use a default icon), but having proper icons improves the user experience.

// Test script for Medium Public Only Posts extension
// Run this in browser console on medium.com to test functionality

(function testMPOPExtension() {
    console.log('🧪 Testing Medium Public Only Posts Extension');
    console.log('============================================');
    
    // Check if extension is loaded
    const extensionLoaded = document.querySelector('[data-mpop-hidden]') !== null || 
                           typeof window.mpopTimeout !== 'undefined';
    
    console.log('Extension loaded:', extensionLoaded ? '✅' : '❌');
    
    // Check for hidden stories
    const hiddenStories = document.querySelectorAll('[data-mpop-hidden]');
    console.log(`Hidden stories found: ${hiddenStories.length}`);
    
    if (hiddenStories.length > 0) {
        console.log('✅ Extension is working - found hidden member-only stories');
        hiddenStories.forEach((story, index) => {
            console.log(`  Story ${index + 1}:`, story);
        });
    } else {
        console.log('ℹ️  No hidden stories found - either no member-only content on page or extension not working');
    }
    
    // Check for common Medium story containers
    const storyContainers = document.querySelectorAll('[data-testid="storyPreview"], .js-postListHandle, article');
    console.log(`Total story containers found: ${storyContainers.length}`);
    
    // Test member-only detection manually
    let memberOnlyFound = 0;
    storyContainers.forEach((container, index) => {
        const ariaLabel = container.getAttribute('aria-label') || '';
        const textContent = container.textContent || '';
        const combinedText = (ariaLabel + ' ' + textContent).toLowerCase();
        
        const isMemberOnly = ['member-only', 'member only', 'members only', 'premium story'].some(keyword => 
            combinedText.includes(keyword)
        );
        
        if (isMemberOnly) {
            memberOnlyFound++;
            console.log(`  Member-only story ${memberOnlyFound}:`, container);
        }
    });
    
    console.log(`Member-only stories detected: ${memberOnlyFound}`);
    
    // Performance check
    const startTime = performance.now();
    // Simulate the extension's detection logic
    storyContainers.forEach(container => {
        const ariaLabel = container.getAttribute('aria-label') || '';
        const textContent = container.textContent || '';
        const combinedText = (ariaLabel + ' ' + textContent).toLowerCase();
        ['member-only', 'member only', 'members only'].some(keyword => 
            combinedText.includes(keyword)
        );
    });
    const endTime = performance.now();
    
    console.log(`Performance: Detection took ${(endTime - startTime).toFixed(2)}ms`);
    
    // Check CSS
    const mpopStyles = Array.from(document.styleSheets).some(sheet => {
        try {
            return Array.from(sheet.cssRules).some(rule => 
                rule.selectorText && rule.selectorText.includes('data-mpop-hidden')
            );
        } catch (e) {
            return false;
        }
    });
    
    console.log('MPOP CSS loaded:', mpopStyles ? '✅' : '❌');
    
    console.log('============================================');
    console.log('Test completed. Check results above.');
    
    return {
        extensionLoaded,
        hiddenCount: hiddenStories.length,
        totalContainers: storyContainers.length,
        memberOnlyDetected: memberOnlyFound,
        cssLoaded: mpopStyles
    };
})();

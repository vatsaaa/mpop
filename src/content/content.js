// Medium Public Only Posts - Content Script
// This script removes member-only stories from Medium.com pages

(function() {
    'use strict';

    // Global state
    let extensionEnabled = true;
    let totalHiddenCount = 0;

    // Configuration
    const config = {
        selectors: {
            // Common selectors for member-only content
            memberOnlyIndicators: [
                '[data-testid="storyPreview"] [aria-label*="member"]',
                '[data-testid="storyPreview"] [aria-label*="Member"]',
                '.js-postListHandle [aria-label*="member"]',
                '.js-postListHandle [aria-label*="Member"]',
                'article [aria-label*="member"]',
                'article [aria-label*="Member"]',
                '.story-preview [aria-label*="member"]',
                '.story-preview [aria-label*="Member"]',
                '.post-preview [aria-label*="member"]',
                '.post-preview [aria-label*="Member"]'
            ],
            // Text-based selectors for member-only content
            memberOnlyText: [
                '.member-preview-overlay',
                '.paywall-preview',
                '.meter-card'
            ],
            // Story containers to remove
            storyContainers: [
                '[data-testid="storyPreview"]',
                '.js-postListHandle',
                'article',
                '.story-preview',
                '.post-preview',
                '.post',
                '.story'
            ],
            // Recommended sections to check for emptiness
            recommendedSections: [
                '[data-testid="recommendedFromMedium"]',
                '[data-testid="recommended-from-medium"]',
                '.recommended-from-medium',
                'section:has(h2:contains("Recommended from Medium"))',
                'section:has(h3:contains("Recommended from Medium"))',
                'div:has(h2:contains("Recommended from Medium"))',
                'div:has(h3:contains("Recommended from Medium"))',
                // Additional patterns for recommended sections
                '[class*="recommended"]',
                '[data-module="recommended"]',
                '[data-testid*="recommended"]'
            ]
        },
        keywords: [
            'member-only',
            'member only',
            'members only',
            'members-only',
            'premium story',
            'premium content',
            'subscriber-only',
            'subscriber only'
        ]
    };

    // Debug function to find all sections with "recommended" text
    function debugRecommendedSections() {
        console.log('MPOP: === DEBUGGING RECOMMENDED SECTIONS ===');
        
        // Find all sections containing "recommended" text
        const allElements = document.querySelectorAll('*');
        const recommendedElements = Array.from(allElements).filter(el => {
            const text = el.textContent?.toLowerCase() || '';
            return text.includes('recommended from medium') || 
                   text.includes('recommended') && text.includes('medium');
        });
        
        console.log(`MPOP: Found ${recommendedElements.length} elements containing "recommended" text`);
        
        recommendedElements.forEach((el, index) => {
            console.log(`MPOP: Element ${index + 1}:`, el);
            console.log(`MPOP: Tag: ${el.tagName}, Classes: ${el.className}`);
            console.log(`MPOP: Text (first 100 chars): ${el.textContent?.substring(0, 100)}`);
            
            // Check for stories within this element
            const stories = el.querySelectorAll(config.selectors.storyContainers.join(', '));
            const hiddenStories = Array.from(stories).filter(story => story.hasAttribute('data-mpop-hidden'));
            console.log(`MPOP: Contains ${stories.length} stories, ${hiddenStories.length} hidden`);
            console.log('---');
        });
        
        console.log('MPOP: === END DEBUGGING ===');
    }

    // Function to check and hide empty recommended sections
    function hideEmptyRecommendedSections() {
        if (!extensionEnabled) {
            return 0;
        }

        let hiddenSections = 0;
        console.log('MPOP: Starting hideEmptyRecommendedSections...');
        
        // Debug what's on the page
        debugRecommendedSections();

        // Method 1: Find all elements containing "Recommended from Medium" text
        const allElements = document.querySelectorAll('*');
        const recommendedElements = Array.from(allElements).filter(el => {
            const text = el.textContent?.toLowerCase() || '';
            return (text.includes('recommended from medium') || 
                   (text.includes('recommended') && text.includes('medium')) ||
                   text.includes('more from medium')) && 
                   el.children.length > 0; // Only consider containers with children
        });

        console.log(`MPOP: Found ${recommendedElements.length} elements with recommended text`);

        recommendedElements.forEach(element => {
            if (element.hasAttribute('data-mpop-section-checked')) {
                return; // Skip already checked elements
            }
            
            element.setAttribute('data-mpop-section-checked', 'true');
            
            // Check if this element or any parent contains stories
            let containerToCheck = element;
            let parentContainer = element.closest('section, div[class*="container"], div[class*="section"], aside');
            if (parentContainer && parentContainer !== element) {
                containerToCheck = parentContainer;
            }
            
            // Look for stories in this container
            const stories = containerToCheck.querySelectorAll(config.selectors.storyContainers.join(', '));
            const visibleStories = Array.from(stories).filter(story => 
                !story.hasAttribute('data-mpop-hidden') && 
                story.offsetHeight > 0 && 
                story.offsetWidth > 0
            );
            
            console.log(`MPOP: Container has ${stories.length} total stories, ${visibleStories.length} visible`);
            
            // If all stories are hidden or there are no meaningful links, hide the section
            if (stories.length > 0 && visibleStories.length === 0) {
                containerToCheck.style.display = 'none';
                containerToCheck.setAttribute('data-mpop-section-hidden', 'true');
                hiddenSections++;
                console.log('MPOP: Hidden empty recommended section (method 1)');
            } else if (stories.length === 0) {
                // Check for any meaningful content links
                const meaningfulLinks = Array.from(containerToCheck.querySelectorAll('a[href*="/@"], a[href*="/story/"], a[href*="medium.com"]')).filter(link => 
                    link.offsetHeight > 0 && 
                    link.offsetWidth > 0 && 
                    !link.closest('[data-mpop-hidden]')
                );
                
                console.log(`MPOP: Container has ${meaningfulLinks.length} meaningful links`);
                
                if (meaningfulLinks.length === 0) {
                    containerToCheck.style.display = 'none';
                    containerToCheck.setAttribute('data-mpop-section-hidden', 'true');
                    hiddenSections++;
                    console.log('MPOP: Hidden empty recommended section with no content (method 1)');
                }
            }
        });

        // Method 2: Look for specific data attributes and selectors
        const specificSelectors = [
            '[data-testid*="recommend"]',
            '[class*="recommend"]',
            'section:has(h2:contains("Recommended"))',
            'section:has(h3:contains("Recommended"))',
            'div:has(h2:contains("Recommended"))',
            'div:has(h3:contains("Recommended"))'
        ];

        specificSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (!element.hasAttribute('data-mpop-section-checked')) {
                        element.setAttribute('data-mpop-section-checked', 'true');
                        
                        const stories = element.querySelectorAll(config.selectors.storyContainers.join(', '));
                        const visibleStories = Array.from(stories).filter(story => 
                            !story.hasAttribute('data-mpop-hidden') && 
                            story.offsetHeight > 0 && 
                            story.offsetWidth > 0
                        );
                        
                        if (stories.length > 0 && visibleStories.length === 0) {
                            element.style.display = 'none';
                            element.setAttribute('data-mpop-section-hidden', 'true');
                            hiddenSections++;
                            console.log('MPOP: Hidden empty recommended section (method 2)');
                        }
                    }
                });
            } catch (e) {
                // Ignore selector errors
            }
        });

        console.log(`MPOP: hideEmptyRecommendedSections completed, hidden ${hiddenSections} sections`);
        return hiddenSections;
    }

    // Function to check if an element contains member-only indicators
    function isMemberOnlyContent(element) {
        // Check aria-labels and text content
        const ariaLabel = element.getAttribute('aria-label') || '';
        const textContent = element.textContent || '';
        const innerHTML = element.innerHTML || '';
        
        // Check for member-only keywords in aria-label or text
        const combinedText = (ariaLabel + ' ' + textContent + ' ' + innerHTML).toLowerCase();
        
        return config.keywords.some(keyword => 
            combinedText.includes(keyword.toLowerCase())
        );
    }

    // Function to find and remove member-only stories
    function removeMemberOnlyStories() {
        if (!extensionEnabled) {
            return 0;
        }

        let removedCount = 0;

        // Check each story container type
        config.selectors.storyContainers.forEach(containerSelector => {
            const containers = document.querySelectorAll(containerSelector);
            
            containers.forEach(container => {
                if (isMemberOnlyContent(container) && !container.hasAttribute('data-mpop-hidden')) {
                    // Hide the container instead of removing to avoid layout issues
                    container.style.display = 'none';
                    container.setAttribute('data-mpop-hidden', 'true');
                    removedCount++;
                    totalHiddenCount++;
                    console.log('MPOP: Hidden member-only story container');
                }
            });
        });

        // Also check for specific member-only indicators
        config.selectors.memberOnlyIndicators.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // Find the closest story container and hide it
                    const storyContainer = element.closest('[data-testid="storyPreview"], .js-postListHandle, article, .story-preview, .post-preview, .post, .story');
                    if (storyContainer && !storyContainer.hasAttribute('data-mpop-hidden')) {
                        storyContainer.style.display = 'none';
                        storyContainer.setAttribute('data-mpop-hidden', 'true');
                        removedCount++;
                        totalHiddenCount++;
                        console.log('MPOP: Hidden member-only story via indicator');
                    }
                });
            } catch (e) {
                // Ignore selector errors
            }
        });

        // Check for paywall overlays and member preview overlays
        config.selectors.memberOnlyText.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    const storyContainer = element.closest('[data-testid="storyPreview"], .js-postListHandle, article, .story-preview, .post-preview, .post, .story');
                    if (storyContainer && !storyContainer.hasAttribute('data-mpop-hidden')) {
                        storyContainer.style.display = 'none';
                        storyContainer.setAttribute('data-mpop-hidden', 'true');
                        removedCount++;
                        totalHiddenCount++;
                        console.log('MPOP: Hidden member-only story via overlay');
                    }
                });
            } catch (e) {
                // Ignore selector errors
            }
        });

        // Clean up gaps after removing stories
        if (removedCount > 0) {
            requestAnimationFrame(() => {
                cleanupGaps();
                // Trigger section hiding immediately and then again with delays
                hideEmptyRecommendedSections();
                setTimeout(() => {
                    hideEmptyRecommendedSections();
                }, 100);
                setTimeout(() => {
                    hideEmptyRecommendedSections();
                }, 500);
            });
            console.log(`MPOP: Hidden ${removedCount} member-only stories (total: ${totalHiddenCount})`);
        } else {
            // Even if no new stories were removed, check for empty sections multiple times
            // in case sections became empty due to previous removals
            hideEmptyRecommendedSections();
            setTimeout(() => {
                hideEmptyRecommendedSections();
            }, 100);
            setTimeout(() => {
                hideEmptyRecommendedSections();
            }, 300);
        }

        return removedCount;
    }

    // Function to clean up gaps left by hidden stories
    function cleanupGaps() {
        // Remove empty spacing between visible stories
        const allStoryContainers = document.querySelectorAll(
            '[data-testid="storyPreview"], .js-postListHandle, article'
        );

        allStoryContainers.forEach((container, index) => {
            if (container.hasAttribute('data-mpop-hidden')) {
                return; // Skip hidden containers
            }

            // Reset margins for visible containers to ensure proper spacing
            const isFirstVisible = !document.querySelector(
                '[data-testid="storyPreview"]:not([data-mpop-hidden]), .js-postListHandle:not([data-mpop-hidden]), article:not([data-mpop-hidden])'
            ) || container === document.querySelector(
                '[data-testid="storyPreview"]:not([data-mpop-hidden]), .js-postListHandle:not([data-mpop-hidden]), article:not([data-mpop-hidden])'
            );

            if (isFirstVisible) {
                container.style.marginTop = '0';
                container.style.paddingTop = '0';
            }
        });

        // Handle spacing elements that might be left between stories
        const spacingElements = document.querySelectorAll('hr, [class*="divider"], [style*="border-top"], [style*="border-bottom"]');
        spacingElements.forEach(spacer => {
            const nextElement = spacer.nextElementSibling;
            const prevElement = spacer.previousElementSibling;

            // If spacer is between hidden elements or next to a hidden element, hide it temporarily
            if ((nextElement && nextElement.hasAttribute('data-mpop-hidden')) ||
                (prevElement && prevElement.hasAttribute('data-mpop-hidden'))) {
                
                // Only hide very specific spacing elements to avoid breaking layout
                if (spacer.tagName === 'HR' || 
                    spacer.className.includes('divider') ||
                    (spacer.style.borderTop && spacer.style.height && parseInt(spacer.style.height) < 10)) {
                    spacer.style.display = 'none';
                    spacer.setAttribute('data-mpop-spacer-hidden', 'true');
                }
            }
        });
    }

    // Function to observe DOM changes and continuously remove member-only content
    function observeChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any added nodes might contain stories
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            shouldCheck = true;
                            break;
                        }
                    }
                }
            });

            if (shouldCheck) {
                // Debounce the removal function
                clearTimeout(window.mpopTimeout);
                window.mpopTimeout = setTimeout(removeMemberOnlyStories, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    // Function to initialize the extension
    function initialize() {
        console.log('MPOP: Medium Public Only Posts extension initialized');
        
        // Initial removal
        removeMemberOnlyStories();
        
        // Set up observer for dynamic content
        observeChanges();
        
        // Also run periodically as a fallback
        setInterval(removeMemberOnlyStories, 2000);
        
        // Run section cleanup after page loads completely
        setTimeout(() => {
            hideEmptyRecommendedSections();
        }, 3000);
        
        // Additional cleanup for dynamic content
        setTimeout(() => {
            hideEmptyRecommendedSections();
        }, 5000);
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Also run when the page becomes visible (for navigation)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(removeMemberOnlyStories, 500);
        }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getStats') {
            sendResponse({
                hiddenCount: totalHiddenCount,
                enabled: extensionEnabled
            });
        } else if (request.action === 'disable') {
            extensionEnabled = false;
            // Restore all hidden stories
            const hiddenElements = document.querySelectorAll('[data-mpop-hidden]');
            hiddenElements.forEach(element => {
                // Reset all styles to make stories visible again
                element.style.display = '';
                element.style.visibility = '';
                element.style.height = '';
                element.style.margin = '';
                element.style.padding = '';
                element.style.overflow = '';
                element.style.position = '';
                element.style.left = '';
                element.style.width = '';
                element.style.opacity = '';
                element.removeAttribute('data-mpop-hidden');
            });
            
            // Restore hidden spacers
            const hiddenSpacers = document.querySelectorAll('[data-mpop-spacer-hidden]');
            hiddenSpacers.forEach(spacer => {
                spacer.style.display = '';
                spacer.removeAttribute('data-mpop-spacer-hidden');
            });

            // Restore hidden sections
            const hiddenSections = document.querySelectorAll('[data-mpop-section-hidden]');
            hiddenSections.forEach(section => {
                section.style.display = '';
                section.removeAttribute('data-mpop-section-hidden');
                section.removeAttribute('data-mpop-section-checked');
            });
            
            console.log('MPOP: Extension disabled - restored all stories and sections');
        } else if (request.action === 'enable') {
            extensionEnabled = true;
            totalHiddenCount = 0; // Reset counter
            setTimeout(() => {
                removeMemberOnlyStories();
            }, 100);
            console.log('MPOP: Extension enabled');
        }
    });

    // Listen for URL changes (SPA navigation)
    let currentUrl = location.href;
    setInterval(() => {
        if (location.href !== currentUrl) {
            currentUrl = location.href;
            setTimeout(removeMemberOnlyStories, 1000);
        }
    }, 1000);

})();

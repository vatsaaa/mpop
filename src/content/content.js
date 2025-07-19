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

    // Function to check and hide empty recommended sections
    function hideEmptyRecommendedSections() {
        if (!extensionEnabled) {
            return 0;
        }

        let hiddenSections = 0;

        // Periodically reset section check flags to re-evaluate sections
        if (Math.random() < 0.2) { // Increased from 10% to 20% chance to reset flags for more frequent re-checking
            document.querySelectorAll('[data-mpop-section-checked]').forEach(el => {
                el.removeAttribute('data-mpop-section-checked');
            });
        }

        // Find sections that might be "Recommended from Medium" - broader search
        const potentialSections = document.querySelectorAll('section, div, aside, [class*="recommend"], [data-testid*="recommend"], [class*="Related"], [class*="related"]');
        
        potentialSections.forEach(section => {
            // Safety check: don't process main content areas
            const isMainContent = section.closest('main, [role="main"], .main-content, #main-content') ||
                                 section.querySelector('main, [role="main"]') ||
                                 section.id?.includes('main') ||
                                 section.classList.toString().includes('main-content');
            
            if (isMainContent) {
                return; // Skip main content areas
            }
            
            // Check if this section contains "Recommended from Medium" or related text
            const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"], strong, b, span');
            const allText = section.textContent || '';
            
            const isRecommendedSection = Array.from(headings).some(heading => {
                const headingText = heading.textContent.toLowerCase();
                return headingText.includes('recommended from medium') ||
                       (headingText.includes('recommended') && headingText.includes('medium')) ||
                       headingText.includes('more from medium');
            }) || (allText.toLowerCase().includes('recommended from medium') && 
                   !allText.toLowerCase().includes('for you')); // Exclude "For you" sections which are different

            if (isRecommendedSection && !section.hasAttribute('data-mpop-section-checked')) {
                section.setAttribute('data-mpop-section-checked', 'true');
                
                console.log('MPOP: Found recommended section:', section.textContent.substring(0, 100));
                
                // Check if all stories in this section are hidden
                const allStories = section.querySelectorAll(config.selectors.storyContainers.join(', '));
                const visibleStories = Array.from(allStories).filter(story => {
                    // Story is visible if:
                    // 1. Not marked as hidden by our extension
                    // 2. Has actual dimensions (not collapsed)
                    // 3. Not hidden via visibility or display
                    const isHidden = story.hasAttribute('data-mpop-hidden');
                    const hasSize = story.offsetHeight > 0 && story.offsetWidth > 0;
                    const isVisibilityHidden = story.style.visibility === 'hidden';
                    const isDisplayNone = story.style.display === 'none';
                    
                    return !isHidden && hasSize && !isVisibilityHidden && !isDisplayNone;
                });
                
                console.log(`MPOP: Section has ${allStories.length} total stories, ${visibleStories.length} visible`);
                
                // Check for any visible content links or articles
                const visibleLinks = Array.from(section.querySelectorAll('a[href*="/"]')).filter(link => {
                    const isInHiddenContainer = link.closest('[data-mpop-hidden]');
                    const hasSize = link.offsetHeight > 0 && link.offsetWidth > 0;
                    const isVisibilityHidden = link.style.visibility === 'hidden';
                    const isDisplayNone = link.style.display === 'none';
                    
                    return !isInHiddenContainer && hasSize && !isVisibilityHidden && !isDisplayNone;
                });
                
                // Check for any meaningful content (excluding just headers and empty divs)
                const meaningfulContent = Array.from(section.children).filter(child => {
                    // Skip pure headers, empty divs, and hidden elements
                    if (child.tagName?.match(/^H[1-6]$/)) return false;
                    if (child.hasAttribute('data-mpop-hidden')) return false;
                    if (child.style.display === 'none' || child.style.visibility === 'hidden') return false;
                    
                    // Check if element has meaningful text content, links, or interactive elements
                    const hasText = child.textContent?.trim().length > 0;
                    const hasLinks = child.querySelectorAll('a[href*="/"]').length > 0;
                    const hasImages = child.querySelectorAll('img').length > 0;
                    const hasInteractiveElements = child.querySelectorAll('button, input, [data-testid], [class*="story"], [class*="post"], [class*="article"]').length > 0;
                    
                    // Content is meaningful if it has text AND (links OR images OR interactive elements OR multiple children)
                    return hasText && (hasLinks || hasImages || hasInteractiveElements || child.children.length > 1);
                });
                
                console.log(`MPOP: Section has ${visibleLinks.length} visible links, ${meaningfulContent.length} meaningful content elements`);
                
                // Hide section only if it's truly empty - be more conservative
                // Only hide if:
                // 1. Has stories but all are hidden by our extension, OR
                // 2. Has no visible links AND no meaningful content AND appears to be just a header placeholder
                const isOnlyHeaders = section.children.length > 0 && 
                     Array.from(section.children).every(child => 
                        child.tagName?.match(/^H[1-6]$/) || 
                        child.textContent?.trim().length === 0 ||
                        (child.children.length === 0 && !child.querySelector('a, img, button, [data-testid], [class*="story"], [class*="post"], [class*="article"]'))
                     );
                
                const shouldHideSection = 
                    (allStories.length > 0 && visibleStories.length === 0) ||
                    (visibleLinks.length === 0 && meaningfulContent.length === 0 && isOnlyHeaders);
                
                if (shouldHideSection) {
                    section.style.display = 'none';
                    section.setAttribute('data-mpop-section-hidden', 'true');
                    hiddenSections++;
                    console.log(`MPOP: Hidden empty "Recommended from Medium" section - stories: ${allStories.length}, visible: ${visibleStories.length}, links: ${visibleLinks.length}, content: ${meaningfulContent.length}`);
                } else {
                    console.log(`MPOP: Keeping "Recommended from Medium" section - found meaningful content (${visibleLinks.length} links, ${meaningfulContent.length} content elements)`);
                }
            }
        });

        // Also check for sections using more specific selectors
        config.selectors.recommendedSections.forEach(selector => {
            try {
                const sections = document.querySelectorAll(selector);
                sections.forEach(section => {
                    if (!section.hasAttribute('data-mpop-section-checked')) {
                        section.setAttribute('data-mpop-section-checked', 'true');
                        
                        const allStories = section.querySelectorAll(config.selectors.storyContainers.join(', '));
                        const visibleStories = Array.from(allStories).filter(story => {
                            const isHidden = story.hasAttribute('data-mpop-hidden');
                            const hasSize = story.offsetHeight > 0 && story.offsetWidth > 0;
                            const isVisibilityHidden = story.style.visibility === 'hidden';
                            const isDisplayNone = story.style.display === 'none';
                            
                            return !isHidden && hasSize && !isVisibilityHidden && !isDisplayNone;
                        });
                        
                        if (allStories.length > 0 && visibleStories.length === 0) {
                            section.style.display = 'none';
                            section.setAttribute('data-mpop-section-hidden', 'true');
                            hiddenSections++;
                            console.log(`MPOP: Hidden empty recommended section via selector - had ${allStories.length} stories, ${visibleStories.length} visible`);
                        }
                    }
                });
            } catch (e) {
                // Ignore selector errors
            }
        });

        // Additional aggressive check for empty sections with just headings
        const additionalSections = document.querySelectorAll('section, div[class*="recommend"], div[data-testid*="recommend"], div[class*="Related"], div[class*="related"]');
        additionalSections.forEach(section => {
            if (section.hasAttribute('data-mpop-section-hidden') || section.hasAttribute('data-mpop-section-checked')) {
                return; // Skip already processed sections
            }
            
            const sectionText = section.textContent?.toLowerCase() || '';
            // Only target specific "recommended from medium" text, not general recommendations
            const hasRecommendedText = sectionText.includes('recommended from medium') || 
                                     sectionText.includes('more from medium');
                                     
            if (hasRecommendedText) {
                section.setAttribute('data-mpop-section-checked', 'true');
                
                // Check if section is essentially empty (only headers, no content links)
                const contentLinks = section.querySelectorAll('a[href*="/"]');
                const visibleContentLinks = Array.from(contentLinks).filter(link => {
                    const hasSize = link.offsetHeight > 0 && link.offsetWidth > 0;
                    const isHidden = link.closest('[data-mpop-hidden]') || 
                                   link.style.visibility === 'hidden' || 
                                   link.style.display === 'none';
                    return hasSize && !isHidden;
                });
                
                // Check for meaningful content elements (articles, story previews, etc.)
                const meaningfulElements = section.querySelectorAll(
                    'article, [data-testid*="story"], [class*="story"], [class*="post"], [class*="article"], .js-postListHandle'
                );
                const visibleMeaningfulElements = Array.from(meaningfulElements).filter(el => {
                    const hasSize = el.offsetHeight > 0 && el.offsetWidth > 0;
                    const isHidden = el.hasAttribute('data-mpop-hidden') ||
                                   el.style.visibility === 'hidden' || 
                                   el.style.display === 'none';
                    return hasSize && !isHidden;
                });
                
                // More conservative check for truly empty sections
                // Only hide if BOTH conditions are met:
                // 1. No visible content links AND no visible meaningful elements
                // 2. AND section only has headers/empty containers (no real content structure)
                const hasNoContent = visibleContentLinks.length === 0 && 
                                   visibleMeaningfulElements.length === 0;
                
                // Check if section only contains headers, empty divs, or placeholder text
                const onlyHasHeaders = section.children.length > 0 && Array.from(section.children).every(child => {
                    if (child.hasAttribute('data-mpop-hidden')) return true;
                    if (child.style.display === 'none' || child.style.visibility === 'hidden') return true;
                    
                    const isHeader = child.tagName?.match(/^H[1-6]$/);
                    const isEmpty = child.textContent?.trim().length === 0;
                    const isEmptyContainer = child.children.length === 0 && 
                                          !child.querySelector('a, img, button, input, textarea, [data-testid], [class*="story"], [class*="post"], [class*="article"]');
                    
                    return isHeader || isEmpty || isEmptyContainer;
                });
                
                // Additional safety check: make sure this isn't a main content area
                const isMainContentArea = section.closest('main, [role="main"], .content, #content') ||
                                         section.querySelector('main, [role="main"]') ||
                                         section.classList.toString().includes('main') ||
                                         section.classList.toString().includes('content');
                
                if (hasNoContent && onlyHasHeaders && !isMainContentArea) {
                    console.log(`MPOP: Found empty recommended section - links: ${visibleContentLinks.length}, elements: ${visibleMeaningfulElements.length}, only headers: ${onlyHasHeaders}`);
                    section.style.display = 'none';
                    section.setAttribute('data-mpop-section-hidden', 'true');
                    hiddenSections++;
                }
            }
        });

        // Final check for any sections with "recommended" text but no visible content at all
        // This should be very conservative to avoid hiding legitimate content
        const allSections = document.querySelectorAll('section, div, aside');
        allSections.forEach(section => {
            if (section.hasAttribute('data-mpop-section-hidden') || section.hasAttribute('data-mpop-section-checked')) {
                return;
            }
            
            const sectionTextLower = section.textContent?.toLowerCase() || '';
            // Only target very specific "recommended from medium" sections
            const isSpecificRecommendedSection = sectionTextLower.includes('recommended from medium') ||
                                               sectionTextLower.includes('more from medium');
            
            if (isSpecificRecommendedSection) {
                section.setAttribute('data-mpop-section-checked', 'true');
                
                // Ultra-conservative check: only hide if it's clearly empty
                const hasActionableContent = section.querySelector('a[href*="/"], button, img[src*="/"], [data-testid*="story"], article, [class*="story"], [class*="post"]');
                const visibleActionableContent = hasActionableContent && 
                    hasActionableContent.offsetHeight > 0 && 
                    hasActionableContent.offsetWidth > 0 &&
                    !hasActionableContent.hasAttribute('data-mpop-hidden') &&
                    hasActionableContent.style.display !== 'none' &&
                    hasActionableContent.style.visibility !== 'hidden';
                
                // Additional safety: don't hide if section has substantial content
                const hasSubstantialContent = section.children.length > 2 ||
                                            section.querySelectorAll('div, article, section').length > 1;
                
                // Only hide if no actionable content AND no substantial content structure
                if (!visibleActionableContent && !hasSubstantialContent) {
                    console.log('MPOP: Found completely empty specific recommended section with no actionable content');
                    section.style.display = 'none';
                    section.setAttribute('data-mpop-section-hidden', 'true');
                    hiddenSections++;
                }
            }
        });

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
                    // Check if container is in a grid layout
                    const parent = container.parentElement;
                    const grandParent = parent?.parentElement;
                    
                    // Check multiple levels for grid/flex layout
                    const isInGrid = (parent && (
                        getComputedStyle(parent).display === 'grid' ||
                        getComputedStyle(parent).display === 'flex' ||
                        parent.classList.toString().includes('grid') ||
                        parent.classList.toString().includes('flex')
                    )) || (grandParent && (
                        getComputedStyle(grandParent).display === 'grid' ||
                        getComputedStyle(grandParent).display === 'flex' ||
                        grandParent.classList.toString().includes('grid') ||
                        grandParent.classList.toString().includes('flex')
                    ));
                    
                    if (isInGrid) {
                        // For grid/flex layouts, use visibility:hidden to maintain grid structure
                        container.style.visibility = 'hidden';
                        container.style.height = '0';
                        container.style.minHeight = '0';
                        container.style.margin = '0';
                        container.style.padding = '0';
                        container.style.overflow = 'hidden';
                        container.setAttribute('data-mpop-hidden', 'grid');
                    } else {
                        // For regular layouts, use display:none
                        container.style.display = 'none';
                        container.setAttribute('data-mpop-hidden', 'block');
                    }
                    
                    removedCount++;
                    totalHiddenCount++;
                    console.log('MPOP: Hidden member-only story container (grid-aware)');
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
                        // Check if container is in a grid layout
                        const parent = storyContainer.parentElement;
                        const grandParent = parent?.parentElement;
                        
                        const isInGrid = (parent && (
                            getComputedStyle(parent).display === 'grid' ||
                            getComputedStyle(parent).display === 'flex' ||
                            parent.classList.toString().includes('grid') ||
                            parent.classList.toString().includes('flex')
                        )) || (grandParent && (
                            getComputedStyle(grandParent).display === 'grid' ||
                            getComputedStyle(grandParent).display === 'flex' ||
                            grandParent.classList.toString().includes('grid') ||
                            grandParent.classList.toString().includes('flex')
                        ));
                        
                        if (isInGrid) {
                            // For grid/flex layouts, use visibility:hidden to maintain grid structure
                            storyContainer.style.visibility = 'hidden';
                            storyContainer.style.height = '0';
                            storyContainer.style.minHeight = '0';
                            storyContainer.style.margin = '0';
                            storyContainer.style.padding = '0';
                            storyContainer.style.overflow = 'hidden';
                            storyContainer.setAttribute('data-mpop-hidden', 'grid');
                        } else {
                            // For regular layouts, use display:none
                            storyContainer.style.display = 'none';
                            storyContainer.setAttribute('data-mpop-hidden', 'block');
                        }
                        
                        removedCount++;
                        totalHiddenCount++;
                        console.log('MPOP: Hidden member-only story via indicator (grid-aware)');
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
                        // Check if container is in a grid layout
                        const parent = storyContainer.parentElement;
                        const grandParent = parent?.parentElement;
                        
                        const isInGrid = (parent && (
                            getComputedStyle(parent).display === 'grid' ||
                            getComputedStyle(parent).display === 'flex' ||
                            parent.classList.toString().includes('grid') ||
                            parent.classList.toString().includes('flex')
                        )) || (grandParent && (
                            getComputedStyle(grandParent).display === 'grid' ||
                            getComputedStyle(grandParent).display === 'flex' ||
                            grandParent.classList.toString().includes('grid') ||
                            grandParent.classList.toString().includes('flex')
                        ));
                        
                        if (isInGrid) {
                            // For grid/flex layouts, use visibility:hidden to maintain grid structure
                            storyContainer.style.visibility = 'hidden';
                            storyContainer.style.height = '0';
                            storyContainer.style.minHeight = '0';
                            storyContainer.style.margin = '0';
                            storyContainer.style.padding = '0';
                            storyContainer.style.overflow = 'hidden';
                            storyContainer.setAttribute('data-mpop-hidden', 'grid');
                        } else {
                            // For regular layouts, use display:none
                            storyContainer.style.display = 'none';
                            storyContainer.setAttribute('data-mpop-hidden', 'block');
                        }
                        
                        removedCount++;
                        totalHiddenCount++;
                        console.log('MPOP: Hidden member-only story via overlay (grid-aware)');
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
                // Delay section hiding to ensure all content is processed
                setTimeout(() => {
                    hideEmptyRecommendedSections();
                    // Additional check after grid reflows are complete
                    setTimeout(() => {
                        hideEmptyRecommendedSections();
                    }, 500);
                }, 200);
            });
            console.log(`MPOP: Hidden ${removedCount} member-only stories (total: ${totalHiddenCount})`);
        } else {
            // Even if no new stories were removed, check for empty sections
            // in case sections became empty due to previous removals
            setTimeout(() => {
                hideEmptyRecommendedSections();
                // Additional check to catch any missed sections
                setTimeout(() => {
                    hideEmptyRecommendedSections();
                }, 500);
            }, 100);
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

        // Force grid reflow for any grid containers that might have hidden items
        const gridContainers = document.querySelectorAll('[style*="display: grid"], [class*="grid"], [style*="display: flex"], [class*="flex"]');
        gridContainers.forEach(container => {
            // Check if this container has any hidden children
            const hiddenChildren = container.querySelectorAll('[data-mpop-hidden="grid"]');
            if (hiddenChildren.length > 0) {
                // Force a reflow by toggling a CSS property
                const originalDisplay = container.style.display;
                container.style.display = 'none';
                container.offsetHeight; // Trigger reflow
                container.style.display = originalDisplay || '';
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
                window.mpopTimeout = setTimeout(() => {
                    removeMemberOnlyStories();
                    // Also check for empty sections after new content loads - with multiple passes
                    setTimeout(() => {
                        hideEmptyRecommendedSections();
                        // Additional pass for sections that might load slowly
                        setTimeout(() => {
                            hideEmptyRecommendedSections();
                        }, 1000);
                    }, 300); // Reduced delay for faster response
                }, 50); // Reduced debounce time
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
        
        // Run frequent checks for empty recommended sections - more aggressive timing
        setInterval(() => {
            if (extensionEnabled) {
                hideEmptyRecommendedSections();
            }
        }, 500); // Reduced from 1000ms to 500ms for faster detection
        
        // Run section cleanup after page loads completely
        setTimeout(() => {
            hideEmptyRecommendedSections();
        }, 2000); // Reduced from 3000ms
        
        // Additional cleanup for dynamic content - multiple checks
        setTimeout(() => {
            hideEmptyRecommendedSections();
        }, 4000); // Reduced from 5000ms
        
        // Extra cleanup for slow-loading content
        setTimeout(() => {
            hideEmptyRecommendedSections();
        }, 8000);
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
                element.style.minHeight = '';
                element.style.margin = '';
                element.style.padding = '';
                element.style.overflow = '';
                element.style.position = '';
                element.style.left = '';
                element.style.width = '';
                element.style.opacity = '';
                element.style.pointerEvents = '';
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

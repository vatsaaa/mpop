// Popup script for Medium Public Only Posts extension

document.addEventListener('DOMContentLoaded', function() {
    const statusText = document.getElementById('statusText');
    const statusDetail = document.getElementById('statusDetail');
    const hiddenCount = document.getElementById('hiddenCount');
    const refreshBtn = document.getElementById('refreshBtn');
    const toggleBtn = document.getElementById('toggleBtn');

    // Check if we're on a Medium page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const isMediumPage = currentTab.url.includes('medium.com');
        
        if (isMediumPage) {
            statusText.textContent = '✅ Active on Medium';
            statusDetail.textContent = 'Extension is running and filtering content';
            
            // Try to get stats from the content script
            chrome.tabs.sendMessage(currentTab.id, {action: 'getStats'}, function(response) {
                if (chrome.runtime.lastError) {
                    // Content script might not be ready yet
                    console.log('Content script not ready:', chrome.runtime.lastError.message);
                } else if (response) {
                    hiddenCount.textContent = response.hiddenCount || '0';
                }
            });
        } else {
            statusText.textContent = '⚠️ Not on Medium';
            statusDetail.textContent = 'Navigate to medium.com to use this extension';
            refreshBtn.disabled = true;
            toggleBtn.disabled = true;
        }
    });

    // Refresh button functionality
    refreshBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.reload(tabs[0].id);
            window.close();
        });
    });

    // Toggle button functionality
    toggleBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const isDisabled = toggleBtn.textContent === 'Enable';
            
            if (isDisabled) {
                // Re-enable the extension
                chrome.tabs.sendMessage(tabs[0].id, {action: 'enable'});
                toggleBtn.textContent = 'Disable';
                statusText.textContent = '✅ Active on Medium';
                statusDetail.textContent = 'Extension is running and filtering content';
            } else {
                // Disable the extension
                chrome.tabs.sendMessage(tabs[0].id, {action: 'disable'});
                toggleBtn.textContent = 'Enable';
                statusText.textContent = '⏸️ Disabled';
                statusDetail.textContent = 'Member-only stories are visible';
            }
        });
    });

    // Update stats periodically
    setInterval(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url.includes('medium.com')) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'getStats'}, function(response) {
                    if (!chrome.runtime.lastError && response) {
                        hiddenCount.textContent = response.hiddenCount || '0';
                    }
                });
            }
        });
    }, 2000);
});

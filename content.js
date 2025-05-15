/* 
ChatGPT Custom Shortcuts Pro
- Full Changelog: https://github.com/bwhurd/chatgpt-custom-shortcuts-pro#Changelog
- Privacy Statement: This extension does not collect, monitor, or track user activity.
*/



// =====================================
// @note To Do List
// =====================================
/* 
1. Implement Settings Sliders for Scroll Speed using https://refreshless.com/nouislider/examples/#section-click-pips
2. 
*/



// =====================================
// @note Global Functions
// =====================================

// Ensure GSAP and plugins are globally available
if (typeof window.gsap !== "undefined" &&
    typeof window.ScrollToPlugin !== "undefined" &&
    typeof window.Observer !== "undefined" &&
    typeof window.Flip !== "undefined") {

    // Assign GSAP to the window object if not already assigned
    window.gsap = gsap;
    window.ScrollToPlugin = ScrollToPlugin;
    window.Observer = Observer;
    window.Flip = Flip;

    // Register all GSAP plugins
    gsap.registerPlugin(window.ScrollToPlugin, window.Observer, window.Flip);
    console.log("GSAP and plugins registered successfully.");

} else {
    console.warn("GSAP is not loaded yet. Retrying in 100ms...");
    setTimeout(checkGSAP, 100); // Retry in 100ms
}

ScrollToPlugin.config({ autoKill: true });

// Shared scroll state object
const ScrollState = {
    scrollContainer: null,
    isAnimating: false,
    finalScrollPosition: 0,
    userInterrupted: false,
};

// Utility functions for scrolling
function resetScrollState() {
    if (ScrollState.isAnimating) {
        ScrollState.isAnimating = false;
        ScrollState.userInterrupted = true; // Mark animation as interrupted
    }
    ScrollState.scrollContainer = getScrollableContainer();
    if (ScrollState.scrollContainer) {
        ScrollState.finalScrollPosition = ScrollState.scrollContainer.scrollTop;
    }
}

function getScrollableContainer() {
    const firstMessage = document.querySelector('[data-testid^="conversation-turn-"]');
    if (!firstMessage) return null;

    let container = firstMessage.parentElement;
    while (container && container !== document.body) {
        const style = getComputedStyle(container);
        if (container.scrollHeight > container.clientHeight &&
            style.overflowY !== 'visible' && style.overflowY !== 'hidden') {
            return container;
        }
        container = container.parentElement;
    }
    return document.scrollingElement || document.documentElement;
}


// =====================================
// @note Sync Chrome Storage + UI State + Expose Global Variables
// =====================================

(function () {
    'use strict';

    // Function to apply visibility and configuration settings
    function applyVisibilitySettings(data) {
        // Check and hide the up and down buttons if necessary
        if (data.hideArrowButtonsCheckbox) {
            ['upButton', 'downButton'].forEach(id => {
                const button = document.getElementById(id);
                if (button) button.style.display = 'none';
            });
        }

        // Check and hide the menu buttons if necessary
        if (data.hideCornerButtonsCheckbox) {
            ['copyAllButton', 'copyCodeButton'].forEach(id => {
                const button = document.getElementById(id);
                if (button) button.style.display = 'none';
            });
        }

        // Define default values globally

        window.moveTopBarToBottomCheckbox = data.hasOwnProperty('moveTopBarToBottomCheckbox')
            ? data.moveTopBarToBottomCheckbox === true
            : false; // Default to false


        window.removeMarkdownOnCopyCheckbox = data.hasOwnProperty('removeMarkdownOnCopyCheckbox')
            ? data.removeMarkdownOnCopyCheckbox === true
            : true;  // Default to true

        window.selectMessagesSentByUserOrChatGptCheckbox = data.hasOwnProperty('selectMessagesSentByUserOrChatGptCheckbox')
            ? data.selectMessagesSentByUserOrChatGptCheckbox === true
            : true;  // Default to true

        window.onlySelectUserCheckbox = data.hasOwnProperty('onlySelectUserCheckbox')
            ? data.onlySelectUserCheckbox === true
            : false; // Default to false

        window.onlySelectAssistantCheckbox = data.hasOwnProperty('onlySelectAssistantCheckbox')
            ? data.onlySelectAssistantCheckbox === true
            : false; // Default to false

        window.disableCopyAfterSelectCheckbox = data.hasOwnProperty('disableCopyAfterSelectCheckbox')
            ? data.disableCopyAfterSelectCheckbox === true
            : false; // Default to false

        window.enableSendWithControlEnterCheckbox = data.hasOwnProperty('enableSendWithControlEnterCheckbox')
            ? data.enableSendWithControlEnterCheckbox === true
            : true;  // Default to true

        window.enableStopWithControlBackspaceCheckbox = data.hasOwnProperty('enableStopWithControlBackspaceCheckbox')
            ? data.enableStopWithControlBackspaceCheckbox === true
            : true;  // Default to true

        window.useAltForModelSwitcherRadio = data.hasOwnProperty('useAltForModelSwitcherRadio')
            ? data.useAltForModelSwitcherRadio === true
            : true;  // Default to true

        window.useControlForModelSwitcherRadio = data.hasOwnProperty('useControlForModelSwitcherRadio')
            ? data.useControlForModelSwitcherRadio === true
            : false; // Default to false
    }


    // Fetch initial values from Chrome storage
    chrome.storage.sync.get([
        'hideArrowButtonsCheckbox',
        'hideCornerButtonsCheckbox',
        'moveTopBarToBottomCheckbox',
        'removeMarkdownOnCopyCheckbox',
        'selectMessagesSentByUserOrChatGptCheckbox',
        'onlySelectUserCheckbox',
        'onlySelectAssistantCheckbox',
        'disableCopyAfterSelectCheckbox',
        'enableSendWithControlEnterCheckbox',
        'enableStopWithControlBackspaceCheckbox',
        'popupBottomBarOpacityValue',
        'useAltForModelSwitcherRadio',
        'useControlForModelSwitcherRadio'
    ], (data) => {
        applyVisibilitySettings(data);
    });

    // Listen for changes in Chrome storage and dynamically apply settings
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
            const updatedData = {};
            if (changes.hideArrowButtonsCheckbox) {
                updatedData.hideArrowButtonsCheckbox = changes.hideArrowButtonsCheckbox.newValue;
            }
            if (changes.hideCornerButtonsCheckbox) {
                updatedData.hideCornerButtonsCheckbox = changes.hideCornerButtonsCheckbox.newValue;
            }
            if (changes.moveTopBarToBottomCheckbox) {
                updatedData.moveTopBarToBottomCheckbox = changes.moveTopBarToBottomCheckbox.newValue;
            }
            if (changes.removeMarkdownOnCopyCheckbox) {
                updatedData.removeMarkdownOnCopyCheckbox = changes.removeMarkdownOnCopyCheckbox.newValue;
            }
            if (changes.selectMessagesSentByUserOrChatGptCheckbox) {
                updatedData.selectMessagesSentByUserOrChatGptCheckbox = changes.selectMessagesSentByUserOrChatGptCheckbox.newValue;
            }
            if (changes.onlySelectUserCheckbox) {
                updatedData.onlySelectUserCheckbox = changes.onlySelectUserCheckbox.newValue;
            }
            if (changes.onlySelectAssistantCheckbox) {
                updatedData.onlySelectAssistantCheckbox = changes.onlySelectAssistantCheckbox.newValue;
            }
            if (changes.disableCopyAfterSelectCheckbox) {
                updatedData.disableCopyAfterSelectCheckbox = changes.disableCopyAfterSelectCheckbox.newValue;
            }
            if (changes.enableSendWithControlEnterCheckbox) {
                updatedData.enableSendWithControlEnterCheckbox = changes.enableSendWithControlEnterCheckbox.newValue;
            }
            if (changes.enableStopWithControlBackspaceCheckbox) {
                updatedData.enableStopWithControlBackspaceCheckbox = changes.enableStopWithControlBackspaceCheckbox.newValue;
            }
            if (changes.popupBottomBarOpacityValue) {
                updatedData.popupBottomBarOpacityValue = changes.popupBottomBarOpacityValue.newValue;
            }
            if (changes.useAltForModelSwitcherRadio) {
                updatedData.useAltForModelSwitcherRadio = changes.useAltForModelSwitcherRadio.newValue;
            }
            if (changes.useControlForModelSwitcherRadio) {
                updatedData.useControlForModelSwitcherRadio = changes.useControlForModelSwitcherRadio.newValue;
            }
            applyVisibilitySettings(updatedData);
        }
    });
})();



// =============================
// @note Main IIFE
// =============================

(function () {
    'use strict';

    // appendWithFragment: Appends multiple elements to a parent element using a document fragment to improve performance.

    gsap.registerPlugin(ScrollToPlugin);
    ScrollToPlugin.config({ autoKill: true });

    function appendWithFragment(parent, ...elements) {
        const fragment = document.createDocumentFragment();
        elements.forEach(element => fragment.appendChild(element));
        parent.appendChild(fragment);
    }

    const loadCSS = (href) => {
        let link = document.createElement("link");
        link.href = href;
        link.rel = "stylesheet";
        document.head.appendChild(link);
    };

    function createButton(icon, onClick, tooltipText, id) {
        const button = document.createElement('button');
        button.style.cssText = "width: 20px; height: 20px; border: none; background: none; margin-right: 16px; cursor: pointer;";

        // Parse the SVG string into a DOM Node
        const parser = new DOMParser();
        const doc = parser.parseFromString(icon, 'image/svg+xml');
        const svgNode = doc.firstChild;

        // Apply initial color
        svgNode.setAttribute('fill', 'var(--text-secondary)');
        button.appendChild(svgNode);

        button.addEventListener('click', onClick);
        button.id = id;

        button.addEventListener('mouseenter', () => {
            svgNode.setAttribute('fill', '#AB68FD'); // Change the fill color of the SVG
        });

        button.addEventListener('mouseleave', () => {
            svgNode.setAttribute('fill', 'var(--text-secondary)'); // Change it back
        });

        if (tooltipText) {
            addTooltip(button, tooltipText);
        }

        return button;
    }

    async function loadSVG(iconPath) {
        const response = await fetch(chrome.runtime.getURL(iconPath));
        const text = await response.text();
        return text;
    }


    async function createMenu() {
        // Load SVGs
        const copyAllIconSVG = await loadSVG('icons/copy-all-text-icon.svg');
        const copyCodeIconSVG = await loadSVG('icons/copy-all-code-icon.svg');

        // Create buttons
        const copyAllButton = createButton(copyAllIconSVG, copyAll, "Copy and Join All Responses", 'copyAllButton');
        const copyCodeButton = createButton(copyCodeIconSVG, copyCode, "Copy and Join All Code Boxes", 'copyCodeButton');

        // Position the buttons
        copyAllButton.style.cssText = "display:none; position: fixed; zoom: .65; bottom: 6px; right: 100px; width: 32px; height: 32px; border: none; background: none; cursor: pointer; transition: opacity 1s;";
        copyCodeButton.style.cssText = "display:none; position: fixed; zoom: .65; bottom: 6px; right: 60px; width: 32px; height: 32px; border: none; background: none; cursor: pointer; transition: opacity 1s;";

        // Append buttons to the body
        appendWithFragment(document.body, copyAllButton, copyCodeButton);

        // Add opacity logic to the buttons
        const copyButtons = [copyAllButton, copyCodeButton];

        copyButtons.forEach(button => {
            // Mouseover: make button fully visible
            button.addEventListener('mouseover', () => {
                button.style.opacity = "1";
            });

            // Mouseleave: fade the button
            button.addEventListener('mouseleave', () => {
                button.style.transition = "opacity 1s";
                button.style.opacity = "0.2";
            });

            // Initial fade after a delay (3500ms)
            setTimeout(() => {
                button.style.transition = "opacity 1s";
                button.style.opacity = "0.2";
            }, 3500);
        });

        function applyVisibilitySettings(data) {
            // Check and hide the up button if necessary
            if (data.hideArrowButtonsCheckbox) {
                const upButton = document.getElementById('upButton');
                if (upButton) {
                    upButton.style.display = 'none';
                }
            }

            // Check and hide the menu buttons if necessary
            if (data.hideCornerButtonsCheckbox) {
                const copyAllButton = document.getElementById('copyAllButton');
                const copyCodeButton = document.getElementById('copyCodeButton');

                if (copyAllButton) copyAllButton.style.display = 'none';
                if (copyCodeButton) copyCodeButton.style.display = 'none';
            }

        }

        // Get the values from Chrome storage
        chrome.storage.sync.get(['hideArrowButtonsCheckbox', 'hideCornerButtonsCheckbox'], function (data) {
            applyVisibilitySettings(data);
        });
    }

    // Call createMenu without awaiting it
    createMenu();

    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = "position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); padding: 16px; background-color: #333; color: #FFF; border-radius: 4px; max-width: 90%; text-align: center; z-index: 1000; font-size: 14px; opacity: 1; transition: opacity 0.5s ease; box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);";
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3500);
    }

    function addTooltip(element, tooltipText) {
        const tooltip = document.createElement('div');
        tooltip.innerText = tooltipText;
        tooltip.style.cssText = "position: absolute; bottom: 50%; right: 100%; transform: translateX(-10px) translateY(50%); margin-right: 10-px; background-color: #2A2B32; color: #ECECF1; border-radius: 5px; padding: 5px; font-size: 12px; text-align: center; white-space: nowrap; visibility: hidden; opacity: 0; transition: opacity 0.3s";
        element.appendChild(tooltip);
        element.addEventListener('mouseenter', () => {
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
        });
        element.addEventListener('mouseleave', () => {
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
        });
    }

    function copyAll() {
        const proseElements = document.querySelectorAll('.prose');
        if (proseElements.length === 0) {
            showToast('No prose elements found');
            return;
        }

        chrome.storage.sync.get(['copyAll-userSeparator', 'copyCode-userSeparator'], function (data) {
            let copyAllSeparator = data['copyAll-userSeparator'] ? parseSeparator(data['copyAll-userSeparator']) : " \n  \n --- --- --- \n \n";

            let formattedText = '';
            for (const proseElement of proseElements) {
                formattedText += getFormattedText(proseElement);
                formattedText += copyAllSeparator; // n the separator from storage
            }

            // If there is no user defined separator, remove the last "\n\n"
            if (!data['copyAll-userSeparator']) {
                formattedText = formattedText.slice(0, -2);
            }

            if (formattedText) {
                navigator.clipboard.writeText(formattedText)
                    .then(function () {
                        showToast('All responses copied to clipboard!');
                    })
                    .catch(function (err) {
                        showToast('Error copying content to clipboard!');
                    });
            } else {
                showToast('No content found in the prose elements');
            }
        });
    }

    function getFormattedText(proseElement) {
        let result = '';
        for (const child of proseElement.childNodes) {
            switch (child.nodeType) {
                case Node.TEXT_NODE: {
                    result += child.textContent;
                    break;
                }
                case Node.ELEMENT_NODE: {
                    switch (child.tagName) {
                        case 'BR': {
                            result += '\n';
                            break;
                        }
                        case 'P': {
                            result += getFormattedText(child) + '\n\n';
                            break;
                        }
                        case 'PRE': {
                            result += processCodeBlock(child.textContent) + '\n\n';
                            break;
                        }
                        case 'OL':
                        case 'UL': {
                            let items = Array.from(child.querySelectorAll('li'));
                            if (child.tagName === 'OL') {
                                items = items.map((item, index) => `${index + 1}. ${getFormattedText(item)}\n`);
                            } else {
                                items = items.map(item => `- ${getFormattedText(item)}\n`);
                            }
                            result += items.join('') + '\n';
                            break;
                        }
                        default: {
                            result += getFormattedText(child);
                        }
                    }
                    break;
                }
            }
        }
        return result;
    }

    function processCodeBlock(codeBlockText) {
        let lines = codeBlockText.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
        if (lines.length === 0) return ''; // Skip empty blocks
        return lines.join('\n'); // Return raw code content without backticks
    }

    function copyCode() {
        const codeBoxes = document.querySelectorAll('pre'); // Get all code boxes
        if (codeBoxes.length === 0) {
            showToast('No code boxes found');
            return;
        }

        chrome.storage.sync.get('copyCode-userSeparator', function (data) {
            let copyCodeSeparator = data['copyCode-userSeparator']
                ? parseSeparator(data['copyCode-userSeparator'])
                : " \n  \n --- --- --- \n \n"; // Default to single line break

            let formattedBlocks = [];
            for (const codeBox of codeBoxes) {
                const codeElements = codeBox.querySelectorAll('code');
                for (const codeElement of codeElements) {
                    let block = codeElement.textContent.trim(); // Ensure we capture the code content only
                    if (block) {
                        formattedBlocks.push(block); // Add block directly
                    }
                }
            }

            // Join the code blocks with the specified separator
            const output = formattedBlocks.join(copyCodeSeparator);

            if (output.trim()) {
                navigator.clipboard.writeText(output)
                    .then(() => showToast('All code boxes copied to clipboard!'))
                    .catch(() => showToast('Error copying code content to clipboard!'));
            } else {
                showToast('No content found in the code boxes');
            }
        });
    }

    function parseSeparator(separator) {
        // Parse literal `\n` and similar into real line breaks
        return separator.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
    }

    function createScrollUpButton() {
        if (!window.gsap || !window.ScrollToPlugin) {
            console.error("GSAP or ScrollToPlugin is missing.");
            return;
        }


        const upButton = document.createElement('button');
        upButton.classList.add('chatGPT-scroll-btn', 'cursor-pointer', 'absolute', 'right-6', 'z-10', 'rounded-full', 'border', 'border-gray-200', 'bg-gray-50', 'text-gray-600', 'dark:border-white/10', 'dark:bg-white/10', 'dark:text-gray-200');
        upButton.style.cssText = "display: flex; align-items: center; justify-content: center; background-color: var(--main-surface-tertiary); color: var(--text-primary); opacity: 0.8; width: 25.33px; height: 25.33px; border-radius: 50%; position: fixed; top: 196px; right: 26px; z-index: 10000; transition: opacity 1s;";
        upButton.id = 'upButton';

        upButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-2xl" style="transform: scale(0.75);">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z" fill="currentColor"></path>
        </svg>
    `;

        upButton.onclick = function () {
            resetScrollState(); // Reset the shared scroll state

            const messages = document.querySelectorAll('[data-testid^="conversation-turn-"]');
            let targetMessage = null;

            // Determine offset values based on checkbox state
            const isBottom = window.moveTopBarToBottomCheckbox?.checked;
            const messageThreshold = isBottom ? -48 : -30;      // 2nd # is if TopBarToBottom is checked, 1st  # when topbar in default position
            const scrollOffset = isBottom ? 43 : 25;            // 2nd # is if TopBarToBottom is checked, 1st  # when topbar in default position

            for (let i = messages.length - 1; i >= 0; i--) {
                const messageTop = messages[i].getBoundingClientRect().top;

                if (messageTop < messageThreshold) {
                    targetMessage = messages[i];
                    break;
                }
            }

            const scrollContainer = getScrollableContainer();
            if (!scrollContainer) return;

            if (targetMessage) {
                gsap.to(scrollContainer, {
                    duration: .4,
                    scrollTo: {
                        y: targetMessage.offsetTop - scrollOffset
                    },
                    ease: "power4.out"
                });
            } else {
                gsap.to(scrollContainer, {
                    duration: .6,
                    scrollTo: {
                        y: 0
                    },
                    ease: "power4.out"
                });
            }

            feedbackAnimation(upButton);
        };


        // Mouseover and mouseleave events for opacity change
        upButton.addEventListener('mouseover', () => {
            upButton.style.opacity = "1";
        });

        upButton.addEventListener('mouseleave', () => {
            upButton.style.transition = "opacity 1s";
            upButton.style.opacity = "0.2";
        });

        // Fade out the button after 3500ms
        setTimeout(() => {
            upButton.style.transition = "opacity 1s";
            upButton.style.opacity = "0.2";
        }, 3500);

        return upButton;
    }

    function createScrollDownButton() {
        if (!window.gsap || !window.ScrollToPlugin) {
            console.error("GSAP or ScrollToPlugin is missing.");
            return;
        }

        gsap.registerPlugin(ScrollToPlugin);

        const downButton = document.createElement('button');
        downButton.classList.add('chatGPT-scroll-btn', 'cursor-pointer', 'absolute', 'right-6', 'z-10', 'rounded-full', 'border', 'border-gray-200', 'bg-gray-50', 'text-gray-600', 'dark:border-white/10', 'dark:bg-white/10', 'dark:text-gray-200');
        downButton.style.cssText = "display: flex; align-items: center; justify-content: center; background-color: var(--main-surface-tertiary); color: var(--text-primary); opacity: 0.8; width: 25.33px; height: 25.33px; border-radius: 50%; position: fixed; top: 228px; right: 26px; z-index: 10000; transition: opacity 1s;";
        downButton.id = 'downButton';

        downButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-2xl" style="transform: scale(0.75);">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M16.8081 23.0938C16.3618 23.5402 15.6381 23.5402 15.1918 23.0938L10.049 17.951C9.60265 17.5047 9.60265 16.7811 10.049 16.3348C10.4953 15.8884 11.219 15.8884 11.6653 16.3348L14.8571 19.5266V9.71429C14.8571 9.0831 15.3688 8.57143 15.9999 8.57143C16.6311 8.57143 17.1428 9.0831 17.1428 9.71429V19.5266L20.3347 16.3348C20.781 15.8884 21.5046 15.8884 21.9509 16.3348C22.3972 16.7811 22.3972 17.5047 21.9509 17.951L16.8081 23.0938Z" fill="currentColor"></path>
        </svg>
    `;

        downButton.onclick = function () {
            resetScrollState();

            const messages = Array.from(document.querySelectorAll('[data-testid^="conversation-turn-"]'));
            const scrollContainer = getScrollableContainer();
            if (!scrollContainer || !messages.length) return;

            // First, forcibly update to the tween’s current position
            gsap.set(scrollContainer, { scrollTo: '+=0' });
            gsap.killTweensOf(scrollContainer);

            const currentScrollTop = scrollContainer.scrollTop;

            // Determine offset values based on checkbox state
            const isBottom = window.moveTopBarToBottomCheckbox?.checked;
            const messageThreshold = isBottom ? 48 : 30;         // Mirror logic from upButton, reversed for downward scroll
            const scrollOffset = isBottom ? 43 : 25;             // Matching offset values

            // Find the first message whose offsetTop is just beyond currentScrollTop + threshold
            let targetMessage = null;
            for (let i = 0; i < messages.length; i++) {
                if (messages[i].offsetTop > currentScrollTop + messageThreshold) {
                    targetMessage = messages[i];
                    break;
                }
            }

            if (targetMessage) {
                gsap.to(scrollContainer, {
                    duration: 0.4,
                    scrollTo: { y: targetMessage.offsetTop - scrollOffset },
                    ease: "power4.out"
                });
            } else {
                gsap.to(scrollContainer, {
                    duration: 0.6,
                    scrollTo: { y: scrollContainer.scrollHeight - scrollContainer.clientHeight },
                    ease: "power4.out"
                });
            }

            feedbackAnimation(downButton);
        };





        // Mouseover and mouseleave events for opacity change
        downButton.addEventListener('mouseover', () => {
            downButton.style.opacity = "1";
        });

        downButton.addEventListener('mouseleave', () => {
            downButton.style.transition = "opacity 1s";
            downButton.style.opacity = "0.2";
        });

        // Fade out the button after 3500ms
        setTimeout(() => {
            downButton.style.transition = "opacity 1s";
            downButton.style.opacity = "0.2";
        }, 3500);

        return downButton;
    }

    function feedbackAnimation(button) {
        // Reset any ongoing transitions to ensure a clean start
        button.style.transition = "none";
        button.style.opacity = "1"; // Full opacity immediately
        button.style.transform = "scale(0.8)"; // Shrink for feedback effect

        // Delay to allow the scale and opacity changes to settle
        setTimeout(() => {
            button.style.transition = "transform 0.2s, opacity 2s"; // Add transitions
            button.style.transform = "scale(1)"; // Restore size
            button.style.opacity = "0.2"; // Gradually fade to low opacity
        }, 100); // Start fading and scaling after a brief delay
    }

    // Create scroll up and down buttons
    const upButton = createScrollUpButton();
    const downButton = createScrollDownButton();
    appendWithFragment(document.body, upButton, downButton);


    // @note Keyboard shortcut defaults 
    chrome.storage.sync.get(['shortcutKeyScrollUpOneMessage', 'shortcutKeyScrollDownOneMessage', 'shortcutKeyCopyLowest', 'shortcutKeyEdit', 'shortcutKeySendEdit', 'shortcutKeyCopyAllResponses', 'shortcutKeyCopyAllCodeBlocks', 'shortcutKeyClickNativeScrollToBottom', 'shortcutKeyScrollToTop', 'shortcutKeyNewConversation', 'shortcutKeySearchConversationHistory', 'shortcutKeyToggleSidebar', 'shortcutKeyActivateInput', 'shortcutKeySearchWeb', 'shortcutKeyPreviousThread', 'shortcutKeyNextThread', 'selectAllLowestResponse', 'shortcutKeyToggleSidebarFoldersButton', 'shortcutKeyClickSendButton', 'shortcutKeyClickStopButton', 'shortcutKeyToggleModelSelector'], (data) => {
        const shortcutKeyScrollUpOneMessage = data.shortcutKeyScrollUpOneMessage || 'a';
        const shortcutKeyScrollDownOneMessage = data.shortcutKeyScrollDownOneMessage || 'f';
        const shortcutKeyCopyLowest = data.shortcutKeyCopyLowest || 'c';
        const shortcutKeyEdit = data.shortcutKeyEdit || 'e';
        const shortcutKeySendEdit = data.shortcutKeySendEdit || 'd';
        const shortcutKeyCopyAllResponses = data.shortcutKeyCopyAllResponses || '[';
        const shortcutKeyCopyAllCodeBlocks = data.shortcutKeyCopyAllCodeBlocks || ']';
        const shortcutKeyClickNativeScrollToBottom = data.shortcutKeyClickNativeScrollToBottom || 'z';
        const shortcutKeyScrollToTop = data.shortcutKeyScrollToTop || 't';
        const shortcutKeyNewConversation = data.shortcutKeyNewConversation || 'n';
        const shortcutKeySearchConversationHistory = data.shortcutKeySearchConversationHistory || 'k';
        const shortcutKeyToggleSidebar = data.shortcutKeyToggleSidebar || 's';
        const shortcutKeyActivateInput = data.shortcutKeyActivateInput || 'w';
        const shortcutKeySearchWeb = data.shortcutKeySearchWeb || 'q';
        const shortcutKeyPreviousThread = data.shortcutKeyPreviousThread || 'j';
        const shortcutKeyNextThread = data.shortcutKeyNextThread || ';';
        const selectAllLowestResponse = data.selectAllLowestResponse || 'x';
        const shortcutKeyToggleSidebarFoldersButton = data.shortcutKeyToggleSidebarFoldersButton || 'g';
        const shortcutKeyClickSendButton = data.shortcutKeyClickSendButton || 'Enter';
        const shortcutKeyClickStopButton = data.shortcutKeyClickStopButton || 'Backspace';
        const shortcutKeyToggleModelSelector = data.shortcutKeyToggleModelSelector || '/';

        let scrollCompleted = false;



        function removeMarkdown(text) {
            return text
                // Remove bold/italics
                .replace(/(\*\*|__)(.*?)\1/g, "$2")
                .replace(/(\*|_)(.*?)\1/g, "$2")
                // Remove leading '#' from headers
                .replace(/^#{1,6}\s+(.*)/gm, "$1")
                // Preserve indentation for unordered list items
                .replace(/^(\s*)[\*\-\+]\s+(.*)/gm, "$1- $2")
                // Preserve indentation for ordered list items
                .replace(/^(\s*)(\d+)\.\s+(.*)/gm, "$1$2. $3")
                // Remove or comment out if you want to preserve triple+ line breaks exactly
                .replace(/\n{3,}/g, "\n\n")
                .trim();
        }


        // Define the mappings for Ctrl+Key shortcuts dynamically
        const keyFunctionMappingCtrl = {
            Enter: () => {
                try {
                    document.querySelector('button[data-testid="send-button"]')?.click();
                } catch (e) {
                    console.error('Enter handler failed:', e);
                }
            },
            Backspace: () => {
                try {
                    document.querySelector('button[data-testid="stop-button"]')?.click();
                } catch (e) {
                    console.error('Backspace handler failed:', e);
                }
            }
        };


        // Alt Key Function Maps
        const keyFunctionMappingAlt = {
            [shortcutKeyScrollUpOneMessage]: () => {
                upButton.click();
                feedbackAnimation(upButton);
            },
            [shortcutKeyScrollDownOneMessage]: () => {
                downButton.click();
                feedbackAnimation(downButton);
            },

            [shortcutKeyCopyAllResponses]: copyAll,
            [shortcutKeyCopyAllCodeBlocks]: copyCode,
            [shortcutKeyCopyLowest]: () => {
                const allButtons = Array.from(document.querySelectorAll('button'));
                const visibleButtons = allButtons.filter(button =>
                    button.innerHTML.includes('M7 5C7 3.34315')
                ).filter(button => {
                    const rect = button.getBoundingClientRect();
                    return (
                        rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                    );
                });

                if (visibleButtons.length > 0) {
                    visibleButtons[visibleButtons.length - 1].click();

                    // Proceed only if removeMarkdownOnCopyCheckbox is true
                    if (window.removeMarkdownOnCopyCheckbox) {
                        setTimeout(() => {
                            if (!navigator.clipboard) {
                                return;  // catch error silently
                            }

                            // Directly attempt clipboard operations without querying permissions
                            navigator.clipboard.readText()
                                .then((textContent) => {
                                    const cleanedContent = removeMarkdown(textContent);
                                    return navigator.clipboard.writeText(cleanedContent);
                                })
                                .then(() => {
                                    console.log("Clipboard content cleaned and copied.");
                                })
                                .catch(() => {
                                    // Suppress errors for a smoother user experience
                                });
                        }, 500);
                    }
                }
            },
            [shortcutKeyEdit]: () => {
                setTimeout(() => {
                    try {
                        const allButtons = Array.from(
                            document.querySelectorAll('button svg path[d^="M13.2929 4.29291"]')
                        ).map(svgPath => svgPath.closest('button'));

                        const composerBackground = document.getElementById('composer-background');
                        const composerRect = composerBackground ? composerBackground.getBoundingClientRect() : null;

                        const visibleButtons = allButtons.filter(button => {
                            if (!button) return false;
                            const rect = button.getBoundingClientRect();

                            const isVisible = (
                                rect.bottom > 0 &&
                                rect.right > 0 &&
                                rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
                                rect.left < (window.innerWidth || document.documentElement.clientWidth)
                            );

                            const doesNotOverlapComposer = composerRect
                                ? !(rect.bottom > composerRect.top && rect.top < composerRect.bottom &&
                                    rect.right > composerRect.left && rect.left < composerRect.right)
                                : true;

                            return isVisible && doesNotOverlapComposer;
                        });

                        if (visibleButtons.length > 0) {
                            const buttonsAwayFromBottom = visibleButtons.filter(button => {
                                const rect = button.getBoundingClientRect();
                                return rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - 100;
                            });

                            const targetButton = (buttonsAwayFromBottom.length > 0)
                                ? buttonsAwayFromBottom.reduce((lowest, button) => {
                                    const buttonBottom = button.getBoundingClientRect().bottom;
                                    return buttonBottom > lowest.getBoundingClientRect().bottom ? button : lowest;
                                }, buttonsAwayFromBottom[0])
                                : null;

                            targetButton?.click();
                        }
                    } catch (e) {
                        // Silent fail
                    }
                }, 50);
            },
            [shortcutKeySendEdit]: () => {
                try {
                    const containers = document.querySelectorAll('div.flex.justify-end.gap-2');

                    for (const container of containers) {
                        const buttons = container.querySelectorAll('button');
                        if (buttons.length >= 2) {
                            const sendButton = buttons[1];

                            const rect = sendButton.getBoundingClientRect();
                            const isVisible = (
                                rect.top >= 0 &&
                                rect.left >= 0 &&
                                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                            );

                            if (isVisible) {
                                sendButton.click();
                                break;
                            }
                        }
                    }
                } catch (e) {
                    // Fail silently
                }
            },
            [shortcutKeyNewConversation]: function newConversation() {
                // 1) Fire the native “New Chat” shortcut first (Ctrl/Cmd + Shift + O)
                const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
                const eventInit = {
                    key: 'o',
                    code: 'KeyO',
                    keyCode: 79,
                    which: 79,
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    shiftKey: true,
                    ctrlKey: !isMac,
                    metaKey: isMac
                };
                document.dispatchEvent(new KeyboardEvent('keydown', eventInit));
                document.dispatchEvent(new KeyboardEvent('keyup', eventInit));

                // 2) If that worked, we’re done.
                return;

                // 3) —never reached— legacy fallbacks for super‑old UIs:
                //    click a test‑ID if present, else SVG‑path match.
                const direct = document.querySelector('button[data-testid="new-chat-button"]');
                if (direct?.offsetParent !== null) {
                    direct.click();
                    return;
                }

                const selectors = [
                    'button:has(svg > path[d^="M15.6729 3.91287C16.8918"])',
                    'button:has(svg > path[d^="M15.673 3.913a3.121 3.121 0 1 1 4.414 4.414"])'
                ];
                for (const sel of selectors) {
                    const btn = document.querySelector(sel);
                    if (btn?.offsetParent !== null) {
                        btn.click();
                        return;
                    }
                }
            },

            [shortcutKeySearchConversationHistory]: () => {
                // 1) Fire the native “Search Conversation History” shortcut first (Ctrl/Cmd + K)
                const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
                const eventInit = {
                    key: 'k',
                    code: 'KeyK',
                    keyCode: 75,
                    which: 75,
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    shiftKey: false,
                    ctrlKey: !isMac,
                    metaKey: isMac,
                    altKey: false
                };
                document.dispatchEvent(new KeyboardEvent('keydown', eventInit));
                document.dispatchEvent(new KeyboardEvent('keyup', eventInit));

                // 2) Done—ChatGPT’s handler will have opened the search UI
                return;

                // 3a) Direct click on test‑ID button
                const direct = document.querySelector('button[data-testid="search-conversation-button"]');
                if (direct?.offsetParent !== null) {
                    direct.click();
                    return;
                }

                // 3b) SVG‑path hack for really old versions
                const path = document.querySelector('button svg path[d^="M10.75 4.25C7.16015"]');
                const btn = path?.closest('button');
                if (btn?.offsetParent !== null) {
                    const orig = btn.style.cssText;
                    btn.style.cssText += 'visibility: visible; display: block; position: absolute; top: 0; left: 0;';
                    btn.click();
                    btn.style.cssText = orig;
                    return;
                }
            },
            [shortcutKeyClickNativeScrollToBottom]: () => {      // @note // native scroll to bottom
                const scrollContainer = getScrollableContainer();

                if (!scrollContainer) return;

                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const currentScroll = scrollContainer.scrollTop;

                const remainingScroll = scrollHeight - clientHeight - currentScroll;
                const viewportsBelow = remainingScroll / clientHeight;
                const duration = (0.2 + Math.floor(viewportsBelow) * 0.5) * 0.02;

                gsap.to(scrollContainer, {
                    duration,
                    scrollTo: { y: "max" },
                    ease: "sine.out"
                });
            },
            [shortcutKeyScrollToTop]: () => {
                const scrollContainer = getScrollableContainer();

                if (!scrollContainer) return;

                const currentScroll = scrollContainer.scrollTop;
                const viewportHeight = scrollContainer.clientHeight;

                const viewportsAbove = currentScroll / viewportHeight;
                const duration = (0.2 + Math.floor(viewportsAbove) * 0.5) * 0.02;  //  .001, .01, .1, .5, .75, 1, 5, 10, 15, 20     0.001 is instant, .01 is default, .1 is slower, 1 is slow, 5 is crawl, 10, 15, 20 

                gsap.to(scrollContainer, {
                    duration,
                    scrollTo: { y: 0 },
                    ease: "sine.out"
                });
            },
            [shortcutKeyToggleSidebar]: function toggleSidebar() {
                // 1) fire native Ctrl+Shift+S (or Cmd+Shift+S on macOS)
                const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
                const eventInit = {
                    key: 's',
                    code: 'KeyS',
                    keyCode: 83,
                    which: 83,
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    shiftKey: true,
                    ctrlKey: !isMac,
                    metaKey: isMac
                };
                document.dispatchEvent(new KeyboardEvent('keydown', eventInit));
                document.dispatchEvent(new KeyboardEvent('keyup', eventInit));

                // 2) if native toggle succeeded, stop
                if (document.querySelector('button[data-testid="close-sidebar-button"]')?.offsetParent !== null) {
                    return;
                }

                // 3) fallback: direct click on test‑ID buttons
                const direct = document.querySelector(
                    'button[data-testid="open-sidebar-button"], button[data-testid="close-sidebar-button"]'
                );
                if (direct?.offsetParent !== null) {
                    direct.click();
                    return;
                }

                // 4) final fallback: legacy SVG‑path selectors
                const selectors = [
                    '#bottomBarContainer button:has(svg > path[d^="M8.85719 3H15.1428C16.2266 2.99999"])',
                    '#bottomBarContainer button:has(svg > path[d^="M8.85719 3L13.5"])',
                    '#bottomBarContainer button:has(svg > path[d^="M8.85720 3H15.1428C16.2266"])',
                    '#sidebar-header button:has(svg > path[d^="M8.85719 3H15.1428C16.2266 2.99999"])',
                    '#conversation-header-actions button:has(svg > path[d^="M8.85719 3H15.1428C16.2266"])',
                    '#sidebar-header button:has(svg > path[d^="M8.85719 3L13.5"])',
                    'div.draggable.h-header-height button[data-testid="open-sidebar-button"]',
                    'div.draggable.h-header-height button:has(svg > path[d^="M3 8C3 7.44772 3.44772"])',
                    'button:has(svg > path[d^="M3 8C3 7.44772 3.44772"])',
                    'button[data-testid="close-sidebar-button"]',
                    'button[data-testid="open-sidebar-button"]',
                    'button svg path[d^="M13.0187 7C13.0061"]',
                    'button svg path[d^="M8.85719 3L13.5"]',
                    'button svg path[d^="M3 8C3 7.44772"]',
                    'button svg path[d^="M8.85719 3H15.1428C16.2266"]',
                    'button svg path[d^="M3 6h18M3 12h18M3 18h18"]',
                    'button svg path[d^="M6 6h12M6 12h12M6 18h12"]'
                ];
                for (const sel of selectors) {
                    const el = document.querySelector(sel);
                    const btn = el?.closest('button');
                    if (btn?.offsetParent !== null) {
                        btn.click();
                        return;
                    }
                }
            },
            [shortcutKeyActivateInput]: function activateInput() {
                const selectors = [
                    '#prompt-textarea[contenteditable="true"]',
                    'div[contenteditable="true"][id="prompt-textarea"]',
                    'div.ProseMirror[contenteditable="true"]'
                ];

                for (const selector of selectors) {
                    const inputField = document.querySelector(selector);
                    if (inputField) {
                        inputField.focus();
                        return;
                    }
                }

                // Fallback: trigger the page’s native shortcut (Shift + Escape)
                const eventInit = {
                    key: 'Escape',
                    code: 'Escape',
                    keyCode: 27,
                    which: 27,
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    shiftKey: true,
                    ctrlKey: false,
                    metaKey: false
                };
                document.dispatchEvent(new KeyboardEvent('keydown', eventInit));
                document.dispatchEvent(new KeyboardEvent('keyup', eventInit));
            },
            [shortcutKeySearchWeb]: () => {
                const selectors = [
                    'button[data-testid="search-web-button"]',
                    'button[data-testid="composer-button-search"]',
                    'button svg path[d^="M2 12C2 6.47715"]'
                ];

                // First: scoped search inside unified composer
                const container = document.querySelector('form[data-type="unified-composer"]');
                if (container) {
                    for (const selector of selectors) {
                        const el = container.querySelector(selector);
                        if (el) {
                            const btn = el.closest('button');
                            if (btn) {
                                btn.click();
                                return;
                            }
                        }
                    }
                }

                // Fallback: full document search
                for (const selector of selectors) {
                    const el = document.querySelector(selector);
                    if (el) {
                        const btn = el.closest('button');
                        if (btn) {
                            btn.click();
                            return;
                        }
                    }
                }
            },
            [shortcutKeyPreviousThread]: () => {
                /* ---- 1. find every “previous‑response” button via multiple selectors ---- */
                const selectorList = [
                    'button svg path[d*="L9.41421 12"]',           // existing stable fragment
                    'button svg path[d^="M15.7071 4.29289"]',      // old SVG start
                    'button svg path[d*="L9.41421 12L15.7"]'       // new SVG fragment
                ];
                const buttons = selectorList.flatMap(sel =>
                    Array.from(document.querySelectorAll(sel))
                        .map(p => p.closest('button'))
                        .filter(Boolean)
                );
                if (!buttons.length) return;

                /* ---- 2. choose the one farthest down‑page (latest turn) ---- */
                const target = buttons.reduce((a, b) =>
                    b.getBoundingClientRect().top > a.getBoundingClientRect().top ? b : a
                );

                /* ---- 3. ensure it’s interactable even when masked ---- */
                const wrapper = target.closest('[class*="group-hover"]');
                if (wrapper) {
                    // (a) add persistent hover class
                    wrapper.classList.add('force-hover');
                    // (b) inject CSS override once
                    if (!document.getElementById('force-hover-style')) {
                        const s = document.createElement('style');
                        s.id = 'force-hover-style';
                        s.textContent = `
            .force-hover,
            .force-hover * {
                pointer-events: auto !important;
                opacity: 1 !important;
                mask-position: 0 0 !important;
            }`;
                        document.head.appendChild(s);
                    }
                    // (c) dispatch events some RSC bundles wait for
                    ['pointerover', 'pointerenter', 'mouseover']
                        .forEach(evt => wrapper.dispatchEvent(new MouseEvent(evt, { bubbles: true })));
                }

                /* ---- 4. click after one paint so the override is active ---- */
                requestAnimationFrame(() => target.click());
            },
            [shortcutKeyNextThread]: () => {
                /* ---- 1. find every “next‑response” button via multiple selectors ---- */
                const selectorList = [
                    'button[aria-label="Next response"]',
                    'button svg path[d^="M8.29289 4.29289"]',  // old SVG fragment
                    'button svg path[d*="L16.7071 11.2929"]'   // new SVG fragment
                ];
                const buttons = selectorList.flatMap(sel =>
                    Array.from(document.querySelectorAll(sel))
                        .map(el => el.closest('button'))
                        .filter(Boolean)
                );
                if (!buttons.length) return;

                /* ---- 2. dedupe ---- */
                const uniqueButtons = [...new Set(buttons)];

                /* ---- 3. choose the one farthest down‑page (latest turn) ---- */
                const target = uniqueButtons.reduce((a, b) =>
                    b.getBoundingClientRect().top > a.getBoundingClientRect().top ? b : a
                );

                /* ---- 4. ensure it’s interactable even when masked ---- */
                const wrapper = target.closest('[class*="group-hover"]');
                if (wrapper) {
                    wrapper.classList.add('force-hover');
                    if (!document.getElementById('force-hover-style')) {
                        const style = document.createElement('style');
                        style.id = 'force-hover-style';
                        style.textContent = `
.force-hover,
.force-hover * {
    pointer-events: auto !important;
    opacity: 1 !important;
    mask-position: 0 0 !important;
}`;
                        document.head.appendChild(style);
                    }
                    ['pointerover', 'pointerenter', 'mouseover']
                        .forEach(evt => wrapper.dispatchEvent(new MouseEvent(evt, { bubbles: true })));
                }

                /* ---- 5. click after one paint so the override takes effect ---- */
                requestAnimationFrame(() => target.click());
            },
            [selectAllLowestResponse]: (() => {
                window.selectAllLowestResponseState = window.selectAllLowestResponseState || {
                    lastSelectedIndex: -1
                };

                const DEBUG = false;

                return () => {
                    setTimeout(() => {
                        try {
                            const onlySelectAssistant = window.onlySelectAssistantCheckbox || false;
                            const onlySelectUser = window.onlySelectUserCheckbox || false;
                            const disableCopyAfterSelect = window.disableCopyAfterSelectCheckbox || false;

                            const allConversationTurns = Array.from(document.querySelectorAll('[class*="conversation-turn"]'));

                            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

                            const composerRect = (() => {
                                const composer = document.getElementById('composer-background');
                                return composer ? composer.getBoundingClientRect() : null;
                            })();

                            const visibleTurns = allConversationTurns.filter(el => {
                                const rect = el.getBoundingClientRect();
                                const horizontallyVisible = rect.right > 0 && rect.left < viewportWidth;
                                const verticallyVisible = rect.bottom > 0 && rect.top < viewportHeight;
                                if (!(horizontallyVisible && verticallyVisible)) return false;

                                if (composerRect && rect.top >= composerRect.top) return false;

                                return true;
                            });

                            const filteredVisibleTurns = visibleTurns.filter(el => {
                                if (onlySelectAssistant && !el.querySelector('[data-message-author-role="assistant"]')) return false;
                                if (onlySelectUser && !el.querySelector('[data-message-author-role="user"]')) return false;
                                return true;
                            });

                            if (!filteredVisibleTurns.length) return;

                            filteredVisibleTurns.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);

                            const { lastSelectedIndex } = window.selectAllLowestResponseState;
                            const nextIndex = (lastSelectedIndex + 1) % filteredVisibleTurns.length;
                            const selectedTurn = filteredVisibleTurns[nextIndex];
                            if (!selectedTurn) return;

                            selectAndCopyMessage(selectedTurn);
                            window.selectAllLowestResponseState.lastSelectedIndex = nextIndex;

                            function selectAndCopyMessage(turn) {
                                try {
                                    const isUser = !!turn.querySelector('[data-message-author-role="user"]');
                                    const isAssistant = !!turn.querySelector('[data-message-author-role="assistant"]');

                                    if (onlySelectUser && !isUser) return;
                                    if (onlySelectAssistant && !isAssistant) return;

                                    let contentEl = null;

                                    if (isUser) {
                                        contentEl =
                                            turn.querySelector('[data-message-author-role="user"] .whitespace-pre-wrap') ||
                                            turn.querySelector('[data-message-author-role="user"]');
                                    } else {
                                        contentEl =
                                            turn.querySelector('[data-message-author-role="assistant"] .prose') ||
                                            turn.querySelector('[data-message-author-role="assistant"]') ||
                                            turn.querySelector('.prose');
                                    }

                                    if (!contentEl || !contentEl.innerText.trim()) return;

                                    doSelectAndCopy(contentEl);
                                } catch (err) {
                                    if (DEBUG) console.debug('selectAndCopyMessage failed:', err);
                                }
                            }

                            function doSelectAndCopy(el) {
                                try {
                                    const selection = window.getSelection();
                                    if (!selection) return;
                                    selection.removeAllRanges();

                                    const range = document.createRange();
                                    range.selectNodeContents(el);
                                    selection.addRange(range);

                                    if (!disableCopyAfterSelect) {
                                        document.execCommand('copy');
                                    }
                                } catch (err) {
                                    if (DEBUG) console.debug('doSelectAndCopy failed:', err);
                                }
                            }
                        } catch (err) {
                            if (DEBUG) console.debug('outer selectAllLowestResponse failure:', err);
                        }
                    }, 50);
                };
            })(),
            [shortcutKeyToggleSidebarFoldersButton]: () => {
                try {
                    const btn = window.toggleSidebarFoldersButton;

                    if (
                        btn &&
                        btn.offsetParent !== null // ensures it's visible (not display:none or hidden)
                    ) {
                        btn.click();
                    }
                } catch (error) {
                    // Catch errors silently
                }
            },
            [shortcutKeyToggleModelSelector]: () => {
                window.toggleModelSelector();
            },


        }; // Close keyFunctionMapping object


        // Assign the functions to the window object for global access
        window.toggleSidebar = keyFunctionMappingAlt[shortcutKeyToggleSidebar];
        window.newConversation = keyFunctionMappingAlt[shortcutKeyNewConversation];
        window.globalScrollToBottom = keyFunctionMappingAlt[shortcutKeyClickNativeScrollToBottom];



        const isMac = /(Mac|iPhone|iPad|iPod)/i.test(navigator.userAgent);

        document.addEventListener('keydown', (event) => {
            if (
                event.isComposing ||                  // IME active (Hindi, Japanese)
                event.keyCode === 229 ||              // Generic composition keyCode
                ["Control", "Meta", "Alt", "AltGraph"].includes(event.key) ||  // Modifier keys
                event.getModifierState?.("AltGraph") ||                        // AltGr pressed (ES, EU)
                ["Henkan", "Muhenkan", "KanaMode"].includes(event.key)         // JIS IME-specific keys
            ) {
                return;
            }            

            const isCtrlPressed = isMac ? event.metaKey : event.ctrlKey;
            const isAltPressed = event.altKey;

            // Determine the intended key in a layout-independent way using event.key
            // Canonical key: use layout-aware key for text, keep exact for special keys
            let keyIdentifier = event.key.length === 1
                ? event.key.toLowerCase()
                : event.key;        

            // Handle Alt-based shortcuts (only if Alt is enabled for model switching or not a model-switch combo)
            if (isAltPressed && !isCtrlPressed) {
                // If user opted to use Ctrl for model switcher, skip Alt-based model switching keys to avoid conflicts
                const modelToggleKey = shortcutKeyToggleModelSelector.toLowerCase();
                if (window.useAltForModelSwitcherRadio === false) {
                    if (keyIdentifier === modelToggleKey || /^\d$/.test(keyIdentifier)) {
                        // Do not intercept Alt+<model key> or Alt+number when Alt-for-model is disabled (allows symbol/input)
                        return;
                    }
                }
                const altShortcut = keyFunctionMappingAlt[keyIdentifier];
                if (altShortcut) {
                    event.preventDefault();  // Prevent default when a valid Alt shortcut is found (stop symbol insertion on macOS)
                    altShortcut();           // Invoke the mapped Alt-key shortcut action
                }
            }

            // Handle Ctrl/Command‑based shortcuts (model‑menu **toggle** only)
            // Number‑key selection is left to the IIFE so we don’t duplicate logic.
            if (isCtrlPressed && !isAltPressed) {
                const modelToggleKey = shortcutKeyToggleModelSelector.toLowerCase();

                // If user chose Ctrl/Cmd for the model switcher, only intercept the toggle key (e.g. Ctrl + W).
                if (window.useControlForModelSwitcherRadio === true && keyIdentifier === modelToggleKey) {
                    event.preventDefault();
                    window.toggleModelSelector();   // open / close the menu
                    return;                         // allow Ctrl/Cmd + 1‑5 to fall through to the IIFE
                }

                // … everything else (Ctrl + Enter, Ctrl + Backspace, etc.) stays the same ↓
                if (keyIdentifier in keyFunctionMappingCtrl) {
                    if (isCtrlShortcutEnabled(keyIdentifier)) {
                        event.preventDefault();
                        keyFunctionMappingCtrl[keyIdentifier]();
                    }
                }
            }

        });



        // Function to check if the specific Ctrl/Command + Key shortcut is enabled
        function isCtrlShortcutEnabled(key) {
            if (key === shortcutKeyClickSendButton) {
                return window.enableSendWithControlEnterCheckbox === true;
            }
            if (key === shortcutKeyClickStopButton) {
                return window.enableStopWithControlBackspaceCheckbox === true;
            }
            return false;
        }





    });

})();



// ====================================
// @note UI Styling & Header Scaling 
// ====================================

(function () {
    function applyInitialTransitions() {
        // Hide .pe-3 upgrades
        // Delayed pass to catch late .pe-3 upgrade elements before observer
        setTimeout(() => {
            document.querySelectorAll('.pe-3').forEach(container => {
                const path = container.querySelector('svg path[d^="M12.5001"]');
                if (path) {
                    gsap.set(container, { opacity: 0, display: 'none' });
                }
            });
        }, 300);

        // Animate sticky topbar
        const sticky = document.querySelector('.sticky.top-0');
        if (sticky) {
            gsap.set(sticky, {
                paddingTop: '0.2rem',
                paddingBottom: '0.2rem',
                overflow: 'visible',
                width: '100%',
                boxSizing: 'border-box'
            });

            gsap.fromTo(sticky, {
                y: -20,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 0.2,
                ease: 'power1.out'
            });

            sticky.querySelectorAll('button, img, svg').forEach(el => {
                gsap.to(el, {
                    scale: 0.85,
                    transformOrigin: 'center',
                    duration: 0.2,
                    ease: 'sine.out'
                });
            });
        }

        // Profile button
        const profileBtn = document.querySelector('button[data-testid="profile-button"]');
        if (profileBtn) {
            profileBtn.style.padding = '0';
            profileBtn.style.overflow = 'visible';
            const img = profileBtn.querySelector('img');
            if (img) {
                gsap.to(img, {
                    scale: 0.85,
                    transformOrigin: 'center',
                    borderRadius: '50%',
                    duration: 0.2,
                    ease: 'power1.out'
                });
            }
            const rounded = profileBtn.querySelector('.rounded-full');
            if (rounded) {
                rounded.style.borderRadius = '50%';
                rounded.style.overflow = 'visible';
            }
        }

        // Conversation edit buttons hover behavior
        document.querySelectorAll('.group\\/conversation-turn .absolute').forEach(el => {
            el.style.display = 'flex';
            el.style.opacity = '0.1';
            el.style.transition = 'opacity 0.2s ease-in-out';
            const parent = el.closest('.group\\/conversation-turn');
            if (parent) {
                parent.addEventListener('mouseenter', () => gsap.to(el, { opacity: 1, duration: 0.2 }));
                parent.addEventListener('mouseleave', () => gsap.to(el, { opacity: 0.1, duration: 0.2 }));
            }
        });

        // Disclaimer text color match
        document.querySelectorAll('.items-center.justify-center.p-2.text-center.text-xs').forEach(el => {
            gsap.to(el, {
                color: getComputedStyle(document.body).getPropertyValue('--main-surface-primary'),
                duration: 0.1,
                ease: 'power1.out'
            });
        });

        // Sidebar labels truncation
        document.querySelectorAll('nav .relative.grow.overflow-hidden.whitespace-nowrap').forEach(el => {
            el.style.whiteSpace = 'nowrap';
            el.style.overflow = 'hidden';
            el.style.textOverflow = 'ellipsis';
            el.style.fontSize = '0.9em';
        });

        // Sidebar headers
        document.querySelectorAll('nav h3.px-2.text-xs.font-semibold').forEach(el => {
            el.style.display = 'block';
            el.style.backgroundColor = 'var(--sidebar-surface-primary)';
            el.style.width = '100%';
        });

        // Kill sidebar scrollbar
        const main = document.querySelector('#main.transition-width');
        if (main) {
            main.style.overflowY = 'hidden';
        }
    }

    // Initial pass after layout is stable
    const ready = () => {
        applyInitialTransitions();

        // Observer for dynamic nodes
        const mo = new MutationObserver(muts => {
            for (const m of muts) {
                for (const n of m.addedNodes) {
                    if (n.nodeType !== 1) continue;

                    // Late-loaded upgrade div
                    if (n.matches('.pe-3') && n.querySelector('svg path[d^="M12.5001"]')) {
                        gsap.set(n, { opacity: 0, display: 'none' });
                    }

                    // Late-loaded conversation edit buttons
                    if (n.matches('.group\\/conversation-turn .absolute')) {
                        gsap.set(n, { opacity: 0.1 });
                        const parent = n.closest('.group\\/conversation-turn');
                        if (parent) {
                            parent.addEventListener('mouseenter', () => gsap.to(n, { opacity: 1, duration: 0.2 }));
                            parent.addEventListener('mouseleave', () => gsap.to(n, { opacity: 0.1, duration: 0.2 }));
                        }
                    }

                    // Delayed header fade (originally timeout-based)
                    if (n.matches('.flex.h-\\[44px\\].items-center.justify-between')) {
                        gsap.to(n, {
                            opacity: 0.3,
                            duration: .2,
                            ease: 'sine.out'
                        });
                    }

                    // Shrink header height if `.md\:h-header-height` appears
                    if (n.matches('.md\\:h-header-height')) {
                        n.style.height = 'fit-content';
                    }

                    // Hide late anchor buttons
                    if (n.matches('a.group.flex.gap-2')) {
                        gsap.set(n, {
                            opacity: 0,
                            pointerEvents: 'none',
                            width: 0,
                            height: 0,
                            overflow: 'hidden'
                        });
                    }
                }
            }
        });

        mo.observe(document.documentElement, { childList: true, subtree: true });
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ready);
    } else {
        ready();
    }
})();



// =========================================
// @note PageUp/PageDown Key Takeover Logic
// =========================================

(() => {
    'use strict';

    // Handle PageUp & PageDown scrolling with GSAP
    function handleKeyDown(event) {
        if (event.key === 'PageUp' || event.key === 'PageDown') {
            resetScrollState(); // Reset shared state

            event.stopPropagation();
            event.preventDefault();

            const scrollContainer = getScrollableContainer();
            if (!scrollContainer) return;

            const viewportHeight = window.innerHeight * 0.8; // Keep the native PageUp/PageDown feel
            const direction = (event.key === 'PageUp') ? -1 : 1;
            let targetScrollPosition = scrollContainer.scrollTop + direction * viewportHeight;

            // Ensure we don't scroll past the natural top/bottom limits
            const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            targetScrollPosition = Math.max(0, Math.min(targetScrollPosition, maxScroll));

            // Use GSAP for smooth scrolling with slow end effect
            gsap.to(scrollContainer, {
                duration: .6, // Slightly longer for smoother motion
                scrollTo: {
                    y: targetScrollPosition
                },
                ease: "power4.out" // Ensures gradual deceleration at the end
            });
        }
    }

    // Stop animation on user interaction (wheel/touch)
    function handleUserInteraction() {
        resetScrollState(); // Interrupt animation and reset state
    }

    // Attach or detach the event listener
    function toggleEventListener(enabled) {
        if (enabled) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('wheel', handleUserInteraction, { passive: true });
            document.addEventListener('touchstart', handleUserInteraction, { passive: true });
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('wheel', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        }
    }

    // Initialize PageUp/PageDown takeover
    function initializePageUpDownTakeover() {
        chrome.storage.sync.get(['pageUpDownTakeover'], (data) => {
            const enabled = data.pageUpDownTakeover !== false;
            toggleEventListener(enabled);
        });

        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'sync' && changes.pageUpDownTakeover) {
                const enabled = changes.pageUpDownTakeover.newValue !== false;
                toggleEventListener(enabled);
            }
        });
    }

    initializePageUpDownTakeover();
})();



// ==================================================
// @note expose edit buttons with simulated mouse hover
// ==================================================
(function injectAlwaysVisibleStyle() {
    const style = document.createElement('style');
    style.textContent = `
    /* Force any element that uses group-hover classes to show */
    div[class*="group-hover/turn-messages"] {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    /* Make sure we also override any tailwind transitions that might re-add them */
    div[class*="group-hover/turn-messages"] * {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    
    /* Make sure we also override any tailwind transitions that might re-add them */
    div[data-id="hide-this-warning"] {
    color: var(--main-surface-primary);
    }
    .group-hover\\/turn-messages\\:pointer-events-auto,
        .group-hover\\/turn-messages\\:\\[mask-position\\:0_0\\] {
            pointer-events: auto !important;
            mask-position: 0% 0% !important;
        }

    .pe-3:has(svg path[d^="M12.5001"]) {
        display:none !important;
        }

    div.bg-token-bg-elevated-secondary:has(a span svg path[d^="M12.5001"]) {
    display: none !important;
        }


  `;
    document.head.appendChild(style);
})();



// =====================================
// Change Disclaimer Text Styling 
// =====================================

(function () {
    // Directly set the disclaimer text color to match the background color using --surface-secondary
    const disclaimer = document.querySelector('.px-2.py-2.text-center.text-xs');

    if (disclaimer) {
        disclaimer.style.color = 'var(--main-surface-primary)';
    }
})();



// ==================================================
// @note Collapse GPT & Folders Toggle + IIFE Delay 
// ==================================================

setTimeout(() => {
    (function () {
        // SVG icons
        const collapsedIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" style="fill: var(--text-secondary, #e8eaed);">
            <path d="M480-120 300-300l58-58 122 122 122-122 58 58-180 180ZM358-598l-58-58 180-180 180 180-58 58-122-122-122 122Z"/>
        </svg>
    `;
        const expandedIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" style="fill: var(--text-secondary, #e8eaed);">
            <path d="m356-160-56-56 180-180 180 180-56 56-124-124-124 124Zm124-404L300-744l56-56 124 124 124-124 56 56-180 180Z"/>
        </svg>
    `;

        // Inject basic styles for the toggle button
        const styleElement = document.createElement('style');
        styleElement.textContent = `
        .gpts-projects-heading {
            pointer-events: auto !important;
            cursor: pointer !important;
            font-size: 0.7em !important;
            text-align: center;
            padding: 10px;
            border-radius: 4px;
            transition: background-color 0.3s ease, color 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            z-index: 9999;
            margin: 0 auto;
            padding-left: 6px;
            padding-right: 6px;
            position: relative;
        }
        .gpts-projects-heading:hover {
            background-color: var(--sidebar-surface-secondary);
            font-size: 0.7em;
            border-radius: 8px;
        }

        .bg-token-message-surface {
            background-color: var(--main-surface-secondary) !important;
        }
    `;
        document.head.appendChild(styleElement);

        // WeakMap of original display styles
        const originalStyles = new WeakMap();

        // Track last known state so we can re-apply to new elements
        let lastSidebarState = 'expanded';

        // Store the user’s preference
        function updateSidebarState(state) {
            lastSidebarState = state; // Avoid re-fetching from storage
            try {
                chrome.storage.sync.set({ sidebarState: state });
            } catch (err) {
                // Silently fail since this error is expected
            }
        }


        // Elements to be toggled
        function getTogglableElements() {
            const additionalLinks = Array.from(document.querySelectorAll("a.no-draggable.group.rounded-lg"));
            const elementsToToggle = [
                document.querySelector("ul.flex.flex-col.screen-arch\\:mb-3"),
                document.querySelector(".flex.flex-col.gap-2.text-token-text-primary.text-sm.false.mt-5.pb-2"),
                document.querySelector(".z-20.screen-arch\\:sticky.screen-arch\\:top-\\[var\\(--sticky-title-offset\\)\\].select-none.overflow-clip.text-ellipsis.break-all.pt-7.text-xs.font-semibold.text-token-text-primary.screen-arch\\:-mr-2.screen-arch\\:h-10.screen-arch\\:min-w-\\[50cqw\\].screen-arch\\:-translate-x-2.screen-arch\\:bg-\\[var\\(--sidebar-surface\\)\\].screen-arch\\:py-1.screen-arch\\:pl-2.screen-arch\\:text-token-text-secondary"),
                document.querySelector("a[data-testid='explore-gpts-button']"),
                document.querySelector("h2#snorlax-heading"),
                document.querySelector("body > div.relative.flex.h-full.w-full.overflow-hidden.transition-colors.z-0 > div.z-\\[21\\].flex-shrink-0.overflow-x-hidden.bg-token-sidebar-surface-primary.max-md\\:\\!w-0 > div > div > div > nav > div.flex-col.flex-1.transition-opacity.duration-500.relative.-mr-2.pr-2.overflow-y-auto > div > div:nth-child(3)"),
                document.querySelector("a.flex.h-9.w-full.items-center"),
                document.querySelector(".z-20.screen-arch\\:sticky.screen-arch\\:top-\\[var\\(--sticky-title-offset\\)\\]"),
                document.querySelector("div.bg-token-border-light.my-2.ms-2.h-px.w-7"),
                document.querySelector("a.group.flex.gap-2.p-2\\.5.text-sm.cursor-pointer.hover\\:bg-token-sidebar-surface-secondary")
            ].filter(Boolean);

            return elementsToToggle.concat(additionalLinks);
        }

        // Collapse or expand an array of elements
        function setElementsVisibility(els, expand) {
            els.forEach(el => {
                if (!originalStyles.has(el)) {
                    originalStyles.set(el, { display: window.getComputedStyle(el).display });
                }
                if (expand) {
                    gsap.set(el, {
                        display: originalStyles.get(el).display,
                        opacity: 0,
                        height: 'auto',
                        overflow: 'hidden'
                    });
                    const fullHeight = el.offsetHeight;
                    gsap.set(el, { height: 0 });
                    gsap.to(el, {
                        height: fullHeight,
                        opacity: 1,
                        duration: 0.4,
                        ease: 'power2.inOut',
                        onComplete: () => gsap.set(el, { height: 'auto' })
                    });
                } else {
                    gsap.set(el, { overflow: 'hidden' });
                    gsap.to(el, {
                        height: 0,
                        opacity: 0,
                        duration: 0.4,
                        ease: 'power2.inOut',
                        onComplete: () => gsap.set(el, { display: 'none' })
                    });
                }
            });
        }

        // Immediately apply stored state to elements upon load
        function applySavedStateOnce(button) {
            function fallbackExpand() {
                lastSidebarState = 'expanded';
                button.innerHTML = expandedIcon;
                const els = getTogglableElements();
                els.forEach(el => {
                    if (!originalStyles.has(el)) {
                        originalStyles.set(el, { display: window.getComputedStyle(el).display });
                    }
                    gsap.set(el, { display: originalStyles.get(el).display, height: 'auto' });
                });
            }

            try {
                if (typeof chrome !== 'undefined' &&
                    chrome.storage &&
                    chrome.storage.sync &&
                    typeof chrome.storage.sync.get === 'function') {
                    chrome.storage.sync.get(['sidebarState'], ({ sidebarState }) => {
                        lastSidebarState = sidebarState || 'expanded';
                        const isExpanded = lastSidebarState !== 'collapsed';
                        button.innerHTML = isExpanded ? expandedIcon : collapsedIcon;

                        const els = getTogglableElements();
                        els.forEach(el => {
                            if (!originalStyles.has(el)) {
                                originalStyles.set(el, { display: window.getComputedStyle(el).display });
                            }
                            if (!isExpanded) {
                                gsap.set(el, { display: 'none', height: 0 });
                            } else {
                                gsap.set(el, { display: originalStyles.get(el).display, height: 'auto' });
                            }
                        });
                    });
                } else {
                    fallbackExpand();
                }
            } catch (e) {
                fallbackExpand();
            }
        }


        // Create and attach the toggle button
        function attachToggleButton() {
            // Match the new topbar container
            const targetContainer = document.querySelector('#sidebar-header.flex.justify-between.h-header-height');
            if (!targetContainer) return false;

            // Avoid duplicates (search entire header)
            if (targetContainer.querySelector('.gpts-projects-heading')) return false;

            // Get the close-sidebar span (first child)
            const closeSidebarSpan = targetContainer.querySelector('span.flex[data-state="closed"]');
            if (!closeSidebarSpan) return false;

            // Get the right-side button group (should be the next sibling)
            const rightButtonsDiv = targetContainer.querySelector('div.flex');
            if (!rightButtonsDiv) return false;

            // Create toggle button
            const button = document.createElement('div');
            button.classList.add('gpts-projects-heading');
            button.setAttribute('data-collapseSidebarFolders', 'true');
            button.innerHTML = expandedIcon; // default

            // Expose button globally
            window.toggleSidebarFoldersButton = button;

            // Apply saved state once
            applySavedStateOnce(button);

            // Set click behavior
            button.addEventListener('click', () => {
                const els = getTogglableElements();
                const currentlyExpanded = lastSidebarState !== 'collapsed';
                gsap.to(button, {
                    scale: 0.7,
                    opacity: 0,
                    duration: 0.4,
                    ease: 'power1.inOut',
                    onComplete: () => {
                        button.innerHTML = currentlyExpanded ? collapsedIcon : expandedIcon;
                        gsap.fromTo(button, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2 });
                    }
                });
                setElementsVisibility(els, !currentlyExpanded);
                updateSidebarState(currentlyExpanded ? 'collapsed' : 'expanded');
            });

            // Insert button after close-sidebar span, before the right buttons div
            // (i.e. as the new second child of the header)
            closeSidebarSpan.insertAdjacentElement('afterend', button);

            return true;
        }



        // MutationObserver to attach the button as soon as container is found
        function observeUntilButtonAttached() {
            const observer = new MutationObserver(() => {
                if (attachToggleButton()) observer.disconnect();
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });

            // Try immediately in case container is already present
            attachToggleButton();
        }

        // Re-apply collapse if new elements show up after the user chose "collapsed"
        // + If the button goes missing, re-attach it
        function keepObservingForNewElements() {
            const newElsObserver = new MutationObserver(() => {
                // Always re-attach the button if it goes missing (re-render)
                if (!document.querySelector('.gpts-projects-heading')) {
                    attachToggleButton();
                }

                const newEls = getTogglableElements();
                newEls.forEach(el => {
                    if (!originalStyles.has(el)) {
                        originalStyles.set(el, { display: window.getComputedStyle(el).display });
                    }

                    // If the sidebar is collapsed, hide newly appeared items
                    if (lastSidebarState === 'collapsed') {
                        gsap.set(el, { display: 'none', height: 0 });
                    } else {
                        // If expanded, ensure they're shown
                        gsap.set(el, {
                            display: originalStyles.get(el).display,
                            height: 'auto',
                            opacity: 1
                        });
                    }
                });
            });

            // Observe entire DOM for newly inserted nodes
            newElsObserver.observe(document.documentElement, { childList: true, subtree: true });

            // Try attaching button immediately in case container already exists
            attachToggleButton();
        }


        // Initialize once DOM is at least parsed
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                observeUntilButtonAttached();
                keepObservingForNewElements();
            });
        } else {
            observeUntilButtonAttached();
            keepObservingForNewElements();
        }
    })();
}, 500);



// ==================================================
// @note TopBarToBottom Feature
// ==================================================

(function () {
    setTimeout(function injectBottomBarStyles() {
        if (window.moveTopBarToBottomCheckbox) {

            // -------------------- Section 1. Utilities --------------------
            async function waitForElement(selector, timeout = 12000, poll = 200) {
                const start = Date.now();
                let el;
                while (!(el = document.querySelector(selector)) && (Date.now() - start < timeout)) {
                    await new Promise(r => setTimeout(r, poll));
                }
                return el;
            }

            async function waitForElements(selectors, timeout = 12000, poll = 200) {
                const start = Date.now();
                let results;
                while (
                    !(results = selectors.map(sel => document.querySelector(sel))).every(Boolean) &&
                    (Date.now() - start < timeout)
                ) {
                    await new Promise(r => setTimeout(r, poll));
                }
                return results;
            }

            // ------------------------------------------------------------------------
            // (A) One-time storage fetch approach:
            //     Only fetch once from chrome.storage.sync to avoid repeated calls,
            //     and keep the resolved value in a single Promise.
            // ------------------------------------------------------------------------
            let opacityValuePromise;
            function ensureOpacityValueReady() {
                // Return the already-fetched value if we have it
                if (opacityValuePromise) return opacityValuePromise;

                // Otherwise, build the one-time promise that fetches from storage
                opacityValuePromise = new Promise((resolve) => {
                    // If chrome.storage.sync is missing/invalid, fallback silently to 0.6
                    if (!chrome?.storage?.sync) {
                        window.popupBottomBarOpacityValue = 0.6;
                        return resolve(window.popupBottomBarOpacityValue);
                    }

                    try {
                        chrome.storage.sync.get({ popupBottomBarOpacityValue: 0.6 }, (res) => {
                            if (chrome.runtime.lastError) {
                                // console.error("Error:", chrome.runtime.lastError); // comment out if you want silence
                                window.popupBottomBarOpacityValue = 0.6;
                            } else {
                                window.popupBottomBarOpacityValue =
                                    typeof res.popupBottomBarOpacityValue === 'number'
                                        ? res.popupBottomBarOpacityValue
                                        : 0.6;
                            }
                            resolve(window.popupBottomBarOpacityValue);
                        });
                    } catch (e) {
                        // console.error("Failed chrome.storage.sync.get:", e); // comment out if you want silence
                        window.popupBottomBarOpacityValue = 0.6;
                        resolve(window.popupBottomBarOpacityValue);
                    }
                });

                return opacityValuePromise;
            }

            function snapToBottom() {
                const sc = typeof getScrollableContainer === 'function' && getScrollableContainer();
                if (sc) sc.scrollTop = sc.scrollHeight; // native, one-line, zero-ms
            }

            // -------------------- Section 2. Main Logic & Reinject --------------------
            setTimeout(() => {
                if (window.moveTopBarToBottomCheckbox) {
                    (function () {
                        runMoveTopBarLogic();
                        // Stay alive if DOM changes (mutation-observe, auto re-inject)
                        let reinjectTimeout;
                        new MutationObserver(() => {
                            clearTimeout(reinjectTimeout);
                            reinjectTimeout = setTimeout(runMoveTopBarLogic, 350);
                        }).observe(document.body, { childList: true, subtree: true });

                        async function runMoveTopBarLogic() {
                            await ensureOpacityValueReady(); // Wait for storage fetch
                            // Wait for target UI pieces
                            const [topBarLeft, topBarRight, composerForm] = await waitForElements(
                                [
                                    "#page-header > .flex.items-center",                             // LEFT: sidebar + new chat + model
                                    "#page-header > .flex.items-center.gap-2.pe-1.leading-\\[0\\]",  // RIGHT: conversation header buttons
                                    "form[data-type='unified-composer']"                             // Composer form
                                ],
                                12000,
                                200
                            );




                            if (!topBarLeft || !topBarRight || !composerForm) return;
                            const composerContainer = composerForm.querySelector(".border-token-border-default") || composerForm;


                            injectBottomBar(topBarLeft, topBarRight, composerContainer);

                            // Grayscale Profile Button
                            waitForElement('button[data-testid="profile-button"]').then(profileButton => {
                                if (profileButton) {
                                    applyInitialGrayscale(profileButton);
                                    observeProfileButton(profileButton);
                                }
                            });
                        }


                        // -------------------- Section 3. Bottom Bar Creation --------------------
                        function injectBottomBar(topBarLeft, topBarRight, composerContainer) {
                            let bottomBar = document.getElementById('bottomBarContainer');
                            if (!bottomBar) {
                                bottomBar = document.createElement('div');
                                bottomBar.id = 'bottomBarContainer';
                                bottomBar.style.display = 'flex';
                                bottomBar.style.justifyContent = 'space-between';
                                bottomBar.style.alignItems = 'center';
                                bottomBar.style.padding = '0px 12px';
                                bottomBar.style.margin = '0';
                                bottomBar.style.minHeight = 'unset';
                                bottomBar.style.lineHeight = '1';
                                bottomBar.style.gap = '8px';
                                bottomBar.style.fontSize = '12px';
                                bottomBar.style.boxSizing = 'border-box';
                                bottomBar.style.opacity = '1';
                                bottomBar.style.transition = 'opacity 0.5s';

                                // Responsive width via ResizeObserver
                                const setBarWidth = () =>
                                    bottomBar.style.width = window.getComputedStyle(composerContainer).width;
                                setBarWidth();
                                const ro = new ResizeObserver(setBarWidth);
                                ro.observe(composerContainer);

                                // Fade/opacity logic
                                function setIdleOpacity() {
                                    const val = typeof window.popupBottomBarOpacityValue === 'number'
                                        ? window.popupBottomBarOpacityValue
                                        : 0.6;
                                    bottomBar.style.opacity = val.toString();
                                }

                                let fadeTimeout;
                                setTimeout(setIdleOpacity, 2500);

                                bottomBar.addEventListener("mouseover", () => {
                                    clearTimeout(fadeTimeout);
                                    bottomBar.style.opacity = "1";
                                    if (typeof setGrayscale === "function") setGrayscale(false);
                                });

                                bottomBar.addEventListener("mouseout", () => {
                                    fadeTimeout = setTimeout(() => {
                                        setIdleOpacity();
                                        if (typeof setGrayscale === "function") setGrayscale(true);
                                    }, 2500);
                                });

                                // Capture scroll position before inserting
                                const scrollContainer = typeof getScrollableContainer === 'function' && getScrollableContainer();
                                const prevScrollBottom = scrollContainer ? scrollContainer.scrollHeight - scrollContainer.scrollTop : 0;

                                // Drop the bar *after* the form element
                                const formEl = composerContainer.closest('form') || composerContainer;
                                formEl.insertAdjacentElement('afterend', bottomBar);

                                // Restore scroll position
                                if (scrollContainer) {
                                    const delta = scrollContainer.scrollHeight - prevScrollBottom;
                                    scrollContainer.scrollTop += delta;
                                }


                                gsap.set(bottomBar, { opacity: 0, y: 10, display: 'flex' });
                                gsap.to(bottomBar, {
                                    opacity: 1,
                                    y: 0,
                                    duration: 0.2,
                                    ease: 'power2.out'
                                });
                            }

                            let bottomBarLeft = document.getElementById('bottomBarLeft');
                            if (!bottomBarLeft) {
                                bottomBarLeft = document.createElement('div');
                                bottomBarLeft.id = 'bottomBarLeft';
                                bottomBarLeft.style.display = 'flex';
                                bottomBarLeft.style.alignItems = 'center';
                                bottomBarLeft.style.gap = '2px';
                                bottomBar.appendChild(bottomBarLeft);
                            }
                            let bottomBarRight = document.getElementById('bottomBarRight');
                            if (!bottomBarRight) {
                                bottomBarRight = document.createElement('div');
                                bottomBarRight.id = 'bottomBarRight';
                                bottomBarRight.style.display = 'flex';
                                bottomBarRight.style.alignItems = 'center';
                                bottomBarRight.style.gap = '2px';
                                bottomBarRight.style.marginLeft = "auto";
                                bottomBar.appendChild(bottomBarRight);
                            }

                            [...bottomBarLeft.children].forEach(child => {
                                const staticIds = ['static-sidebar-btn', 'static-newchat-btn'];
                                const isStatic = staticIds.includes(child.dataset.id);
                                if (!isStatic && child !== topBarLeft) child.remove();
                            });

                            if (!bottomBarLeft.contains(topBarLeft)) bottomBarLeft.appendChild(topBarLeft);
                            if (!bottomBarRight.contains(topBarRight)) bottomBarRight.appendChild(topBarRight);

                            injectStaticButtons(bottomBarLeft);

                            function adjustBottomBarScale() {
                                const available = composerContainer.clientWidth;
                                const content = bottomBar.scrollWidth;
                                let scale = available / content;
                                if (scale > 1) scale = 1;
                                bottomBar.style.transform = `scale(${scale})`;
                                bottomBar.style.transformOrigin = "left center";
                            }
                            adjustBottomBarScale();
                            window.addEventListener("resize", adjustBottomBarScale);

                            adjustBottomBarTextScaling(bottomBar);

                            const oldDisclaimer = document.querySelector(
                                'div.text-token-text-secondary.relative.mt-auto.flex.min-h-8.w-full.items-center.justify-center.p-2.text-center.text-xs'
                            );
                            if (oldDisclaimer) {
                                gsap.to(oldDisclaimer, {
                                    opacity: 0,
                                    duration: 0.4,
                                    ease: 'sine.out',
                                    onComplete: () => {
                                        oldDisclaimer.style.display = 'none';
                                    }
                                });
                            }
                        }



                        // -------------------- Section 4. Static Buttons --------------------
                        function injectStaticButtons(leftContainer) {
                            // ---- 4.1  Static Toggle‑Sidebar Button ----
                            let btnSidebar = leftContainer.querySelector('button[data-id="static-sidebar-btn"]');
                            if (!btnSidebar) {
                                btnSidebar = createStaticButton({
                                    label: 'Static Toggle Sidebar',
                                    svg: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8.85720 3H15.1428C16.2266 2.99999 17.1007 2.99998 17.8086 3.05782C18.5375 3.11737 19.1777 3.24318 19.77 3.54497C20.7108 4.02433 21.4757 4.78924 21.955 5.73005C22.2568 6.32234 22.3826 6.96253 22.4422 7.69138C22.5 8.39925 22.5 9.27339 22.5 10.3572V13.6428C22.5 14.7266 22.5 15.6008 22.4422 16.3086C22.3826 17.0375 22.2568 17.6777 21.955 18.27C21.4757 19.2108 20.7108 19.9757 19.77 20.455C19.1777 20.7568 18.5375 20.8826 17.8086 20.9422C17.1008 21 16.2266 21 15.1428 21H8.85717C7.77339 21 6.89925 21 6.19138 20.9422C5.46253 20.8826 4.82234 20.7568 4.23005 20.455C3.28924 19.9757 2.52433 19.2108 2.04497 18.27C1.74318 17.6777 1.61737 17.0375 1.55782 16.3086C1.49998 15.6007 1.49999 14.7266 1.5 13.6428V10.3572C1.49999 9.27341 1.49998 8.39926 1.55782 7.69138C1.61737 6.96253 1.74318 6.32234 2.04497 5.73005C2.52433 4.78924 3.28924 4.02433 4.23005 3.54497C4.82234 3.24318 5.46253 3.11737 6.19138 3.05782C6.89926 2.99998 7.77341 2.99999 8.85719 3ZM6.35424 5.05118C5.74907 5.10062 5.40138 5.19279 5.13803 5.32698C4.57354 5.6146 4.1146 6.07354 3.82698 6.63803C3.69279 6.90138 3.60062 7.24907 3.55118 7.85424C3.50078 8.47108 3.5 9.26339 3.5 10.4V13.6C3.5 14.7366 3.50078 15.5289 3.55118 16.1458C3.60062 16.7509 3.69279 17.0986 3.82698 17.362C4.1146 17.9265 4.57354 18.3854 5.13803 18.673C5.40138 18.8072 5.74907 18.8994 6.35424 18.9488C6.97108 18.9992 7.76339 19 8.9 19H9.5V5H8.9C7.76339 5 6.97108 5.00078 6.35424 5.05118ZM11.5 5V19H15.1C16.2366 19 17.0289 18.9992 17.6458 18.9488C18.2509 18.8994 18.5986 18.8072 18.862 18.673C19.4265 18.3854 19.8854 17.9265 20.173 17.362C20.3072 17.0986 20.3994 16.7509 20.4488 16.1458C20.4992 15.5289 20.5 14.7366 20.5 13.6V10.4C20.5 9.26339 20.4992 8.47108 20.4488 7.85424C20.3994 7.24907 20.3072 6.90138 20.173 6.63803C19.8854 6.07354 19.4265 5.6146 18.862 5.32698C18.5986 5.19279 18.2509 5.10062 17.6458 5.05118C17.0289 5.00078 16.2366 5 15.1 5H11.5ZM5 8.5C5 7.94772 5.44772 7.5 6 7.5H7C7.55229 7.5 8 7.94772 8 8.5C8 9.05229 7.55229 9.5 7 9.5H6C5.44772 9.5 5 9.05229 5 8.5ZM5 12C5 11.4477 5.44772 11 6 11H7C7.55229 11 8 11.4477 8 12C8 12.5523 7.55229 13 7 13H6C5.44772 13 5 12.5523 5 12Z"/></svg>',
                                    proxySelector: 'button[data-testid="open-sidebar-button"],button[data-testid="close-sidebar-button"]',
                                    fallbackShortcut: { ctrl: true, shift: true, key: 's', code: 'KeyS' }
                                });
                                leftContainer.insertBefore(btnSidebar, leftContainer.firstChild);
                            }

                            // ---- 4.2  Static New‑Chat Button ----
                            let btnNewChat = leftContainer.querySelector('button[data-id="static-newchat-btn"]');
                            if (!btnNewChat) {
                                btnNewChat = createStaticButton({
                                    label: 'Static New Chat',
                                    svg: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.6730 3.91287C16.8918 2.69392 18.8682 2.69392 20.0871 3.91287C21.3061 5.13182 21.3061 7.10813 20.0871 8.32708L14.1499 14.2643C13.3849 15.0293 12.3925 15.5255 11.3215 15.6785L9.14142 15.9899C8.82983 16.0344 8.51546 15.9297 8.29289 15.7071C8.07033 15.4845 7.96554 15.1701 8.01005 14.8586L8.32149 12.6785C8.47449 11.6075 8.97072 10.615 9.7357 9.85006L15.6729 3.91287ZM18.6729 5.32708C18.235 4.88918 17.525 4.88918 17.0871 5.32708L11.1499 11.2643C10.6909 11.7233 10.3932 12.3187 10.3014 12.9613L10.1785 13.8215L11.0386 13.6986C11.6812 13.6068 12.2767 13.3091 12.7357 12.8501L18.6729 6.91287C19.1108 6.47497 19.1108 5.76499 18.6729 5.32708ZM11 3.99929C11.0004 4.55157 10.5531 4.99963 10.0008 5.00007C9.00227 5.00084 8.29769 5.00827 7.74651 5.06064C7.20685 5.11191 6.88488 5.20117 6.63803 5.32695C6.07354 5.61457 5.6146 6.07351 5.32698 6.63799C5.19279 6.90135 5.10062 7.24904 5.05118 7.8542C5.00078 8.47105 5 9.26336 5 10.4V13.6C5 14.7366 5.00078 15.5289 5.05118 16.1457C5.10062 16.7509 5.19279 17.0986 5.32698 17.3619C5.6146 17.9264 6.07354 18.3854 6.63803 18.673C6.90138 18.8072 7.24907 18.8993 7.85424 18.9488C8.47108 18.9992 9.26339 19 10.4 19H13.6C14.7366 19 15.5289 18.9992 16.1458 18.9488C16.7509 18.8993 17.0986 18.8072 17.362 18.673C17.9265 18.3854 18.3854 17.9264 18.673 17.3619C18.7988 17.1151 18.8881 16.7931 18.9393 16.2535C18.9917 15.7023 18.9991 14.9977 18.9999 13.9992C19.0003 13.4469 19.4484 12.9995 20.0007 13C20.553 13.0004 21.0003 13.4485 20.9999 14.0007C20.9991 14.9789 20.9932 15.7808 20.9304 16.4426C20.8664 17.116 20.7385 17.7136 20.455 18.2699C19.9757 19.2107 19.2108 19.9756 18.27 20.455C17.6777 20.7568 17.0375 20.8826 16.3086 20.9421C15.6008 21 14.7266 21 13.6428 21H10.3572C9.27339 21 8.39925 21 7.69138 20.9421C6.96253 20.8826 6.32234 20.7568 5.73005 20.455C4.78924 19.9756 4.02433 19.2107 3.54497 18.2699C3.24318 17.6776 3.11737 17.0374 3.05782 16.3086C2.99998 15.6007 2.99999 14.7266 3 13.6428V10.3572C2.99999 9.27337 2.99998 8.39922 3.05782 7.69134C3.11737 6.96249 3.24318 6.3223 3.54497 5.73001C4.02433 4.7892 4.78924 4.0243 5.73005 3.54493C6.28633 3.26149 6.88399 3.13358 7.55735 3.06961C8.21919 3.00673 9.02103 3.00083 9.99922 3.00007C10.5515 2.99964 10.9996 3.447 11 3.99929Z"/></svg>',
                                    proxySelector: 'button[data-testid="new-chat-button"]',
                                    fallbackShortcut: { ctrl: true, shift: true, key: 'o', code: 'KeyO' }
                                });
                                leftContainer.insertBefore(btnNewChat, btnSidebar.nextSibling);
                            }
                        }

                        /* ---------- shared helper ---------- */
                        function createStaticButton({ label, svg, proxySelector, fallbackShortcut }) {
                            const btn = document.createElement('button');
                            btn.setAttribute('aria-label', label);
                            btn.setAttribute(
                                'data-id',
                                label.toLowerCase().includes('sidebar') ? 'static-sidebar-btn' : 'static-newchat-btn'
                            );

                            // ---- visual styling (unchanged) ----
                            btn.innerHTML = svg;
                            btn.className =
                                'text-token-text-secondary focus-visible:bg-token-surface-hover ' +
                                'enabled:hover:bg-token-surface-hover disabled:text-token-text-quaternary ' +
                                'h-10 rounded-lg px-2 focus-visible:outline-0';
                            Object.assign(btn.style, {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '36px',
                                padding: '8px'
                            });

                            /* ---- behaviour ---- */
                            btn.onclick = (e) => {
                                e.preventDefault();
                                e.stopImmediatePropagation();

                                // Attempt shortcut first (if defined)…
                                if (fallbackShortcut) {
                                    const { key, code, ctrl, shift, alt = false, meta = false } = fallbackShortcut;
                                    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

                                    const evtInit = {
                                        key: key.toUpperCase(),
                                        code,
                                        keyCode: key.toUpperCase().charCodeAt(0),
                                        which: key.toUpperCase().charCodeAt(0),
                                        bubbles: true,
                                        cancelable: true,
                                        composed: true,
                                        shiftKey: !!shift,
                                        ctrlKey: !!ctrl && !isMac,
                                        metaKey: !!meta || (isMac && !!ctrl),
                                        altKey: !!alt
                                    };

                                    // `dispatchEvent` returns FALSE if preventDefault was called → means the page handled our shortcut
                                    const shortcutUnhandled = document.dispatchEvent(new KeyboardEvent('keydown', evtInit));
                                    document.dispatchEvent(new KeyboardEvent('keyup', evtInit));

                                    // …fallback to click only when the shortcut was NOT handled
                                    if (shortcutUnhandled) {
                                        const target = document.querySelector(proxySelector);
                                        if (target?.offsetParent !== null) target.click();
                                    }
                                } else {
                                    // No shortcut defined → always click
                                    const target = document.querySelector(proxySelector);
                                    if (target?.offsetParent !== null) target.click();
                                }
                            };

                            return btn;
                        }



                        // -------------------- Section 5. Grayscale Profile Button --------------------
                        let profileBtnRef;
                        function applyInitialGrayscale(btn) {
                            if (!btn) return;
                            profileBtnRef = btn;
                            btn.style.setProperty('filter', 'grayscale(100%)', 'important');
                            btn.style.setProperty('transition', 'filter 0.4s ease', 'important');
                        }
                        function setGrayscale(state) {
                            if (!profileBtnRef) return;
                            profileBtnRef.style.setProperty('filter', state ? 'grayscale(100%)' : 'grayscale(0%)', 'important');
                        }
                        function observeProfileButton(btn) {
                            const parent = btn.parentElement || document.body;
                            const observer = new MutationObserver(() => {
                                const newBtn = document.querySelector('button[data-testid="profile-button"]');
                                if (newBtn && newBtn !== profileBtnRef) {
                                    applyInitialGrayscale(newBtn);
                                }
                            });
                            observer.observe(parent, { childList: true, subtree: false });
                        }

                        // ---------- Section 6 • Text Truncation ----------
                        function debounce(fn, d = 100) {
                            let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d); };
                        }

                        function applyOneLineEllipsis(el) {
                            const imp = v => ['important', v];
                            el.style.setProperty('white-space', 'nowrap', ...imp());
                            el.style.setProperty('overflow', 'hidden', ...imp());
                            el.style.setProperty('text-overflow', 'ellipsis', ...imp());
                            // keep the current font‑size; no shrinking logic
                        }

                        function adjustBottomBarTextScaling(bar) {
                            bar.querySelectorAll('.truncate').forEach(el => {
                                if (el.closest('button[data-id="static-sidebar-btn"],button[data-id="static-newchat-btn"]')) return;
                                applyOneLineEllipsis(el);
                            });
                        }

                        function initAdjustBottomBarTextScaling() {
                            const bar = document.querySelector('#bottomBarContainer, .bottom-bar');
                            if (!bar) return;

                            const run = () => adjustBottomBarTextScaling(bar);
                            const deb = debounce(run, 100);

                            run();                          // initial pass
                            window.addEventListener('resize', deb);
                            new ResizeObserver(deb).observe(bar); // re‑apply on layout changes
                        }

                        document.addEventListener('DOMContentLoaded', initAdjustBottomBarTextScaling);







                    })();
                }
            }, 500);

            // -------------------- Section 7. Style Injection ("global") --------------------

            (function injectBottomBarStyles() {
                const style = document.createElement('style');
                style.textContent = `
                    .draggable.sticky.top-0 {
                        opacity: 0 !important; pointer-events: none !important;
                        position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important;
                    }
                    #bottomBarContainer { padding-top:0!important; padding-bottom:0!important; margin-top:2px!important; margin-bottom:2px!important; overflow-anchor:none!important;}
                    #bottomBarContainer button:hover {filter:brightness(1.1)!important;}
                    div[data-id="hide-this-warning"] {
                        opacity:0!important; pointer-events:none!important; position:absolute!important;
                        width:1px!important; height:1px!important; overflow:hidden!important;
                    }
                    div#bottomBarLeft { scale: 0.9; }
                    div#bottomBarRight { scale: 0.85; padding-right: 2em;}
                    #thread-bottom-container {margin-bottom:0em;}

                    #bottomBarContainer button:has(svg > path[d^="M8.85719 3H15.1428C16.2266 2.99999"]),
                    #bottomBarContainer a:has(svg > path[d^="M8.85719 3H15.1428C16.2266 2.99999"]),
                    #bottomBarContainer button:has(svg > path[d^="M15.6729 3.91287C16.8918"]),
                    #bottomBarContainer a:has(svg > path[d^="M15.6729 3.91287C16.8918"]),
                    #bottomBarContainer button:has(svg > path[d^="M8.85719 3L13.5"]) {
                    visibility: hidden !important;
                    position: absolute !important;
                    width: 1px !important;
                    height: 1px !important;
                    overflow: hidden !important;
                    }

                    /* one‑line truncation for bottom‑bar text */
                    #bottomBarContainer .truncate,
                    #bottomBarLeft      .truncate,
                    #bottomBarRight     .truncate {
                    
                    white-space: nowrap !important;   /* single line */
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    word-break: break-word !important;
                    /* removed: -webkit-line-clamp, -webkit-box-orient, font‑size, line‑height, max‑height */
                    }





                `;
                document.head.appendChild(style);
            })();


            // -------------------- Section 7.1. Bottom Bar Mutation Observer for Duplicate Buttons --------------------
            (function () {
                const PATH_PREFIXES = ['M15.6729', 'M8.85719'];
                const SELECTOR = [
                    'button',
                    'a'
                ].map(
                    tag => PATH_PREFIXES.map(
                        prefix => `${tag} svg > path[d^="${prefix}"]`
                    ).join(',')
                ).join(',');

                function hideMatchedElements(container) {
                    if (!container) return;
                    // Find all matching paths in the container
                    const paths = container.querySelectorAll(SELECTOR);
                    paths.forEach(path => {
                        let el = path.closest('button,a');
                        if (el) {
                            el.style.setProperty('visibility', 'hidden', 'important');
                            el.style.setProperty('position', 'absolute', 'important');
                            el.style.setProperty('width', '1px', 'important');
                            el.style.setProperty('height', '1px', 'important');
                            el.style.setProperty('overflow', 'hidden', 'important');
                            // Optional: add a data attribute so you can track which elements were hidden
                            el.setAttribute('data-ext-hidden', 'true');
                        }
                    });
                }

                // Setup mutation observer
                function observeBottomBar() {
                    const container = document.querySelector('#bottomBarContainer');
                    if (!container) {
                        // Try again soon if the container isn't present yet
                        setTimeout(observeBottomBar, 500);
                        return;
                    }
                    // Initial hide
                    hideMatchedElements(container);
                    // Create the observer
                    const observer = new MutationObserver((mutationsList) => {
                        mutationsList.forEach((mutation) => {
                            // If children added/removed or subtree changed, re-hide
                            if (mutation.addedNodes.length > 0 || mutation.type === 'childList') {
                                hideMatchedElements(container);
                            }
                        });
                    });
                    observer.observe(container, {
                        childList: true,
                        subtree: true
                    });
                }

                // Run
                observeBottomBar();

            })();



            // -------------------- Section 8. Hide Disclaimers (live observation) --------------------
            setTimeout(() => {
                (function () {
                    const observer = new MutationObserver(() => {
                        document.querySelectorAll('div.text-token-text-secondary').forEach(el => {
                            const txt = el.textContent.trim().replace(/\s+/g, ' ');
                            if (txt.includes("Check important info")) {
                                el.setAttribute('data-id', 'hide-this-warning');
                            }
                        });
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                })();
            }, 100);

            // -------------------- Section 9. Remove Composer Button Labels (lang-agnostic) --------------------
            (function stripComposerLabels() {
                const ACTION_WRAPPER = '[style*="--vt-composer-search-action"],[style*="--vt-composer-research-action"]';
                const IMAGE_BUTTON = 'button[data-testid="composer-button-create-image"]';

                const stripLabel = btn => {
                    btn.querySelectorAll('span, div').forEach(node => {
                        if (!node.querySelector('svg') && !node.dataset.labelStripped) {
                            node.dataset.labelStripped = 'true';
                            gsap.to(node, {
                                opacity: 0,
                                duration: 0.15,
                                ease: 'sine.out',
                                onComplete: () => node.remove()
                            });
                        }
                    });
                };

                const scan = root => {
                    root.querySelectorAll(ACTION_WRAPPER).forEach(wrp => {
                        const btn = wrp.querySelector('button');
                        if (btn) stripLabel(btn);
                    });
                    root.querySelectorAll(IMAGE_BUTTON).forEach(btn => stripLabel(btn));
                };

                // Initial label removal
                scan(document);

                // Watch for new buttons
                new MutationObserver(mutations => {
                    for (const { addedNodes } of mutations) {
                        for (const node of addedNodes) {
                            if (node.nodeType !== 1) continue;
                            scan(node); // always scan deeply
                        }
                    }
                }).observe(document.body, { childList: true, subtree: true });
            })();


        }
    }, 100);
})();



// ==================================================
// @note styles when there is no bottombar (unchecked)
// ==================================================

(function () {
    setTimeout(function injectNoBottomBarStyles() {
        if (!window.moveTopBarToBottomCheckbox) {
            const style = document.createElement('style');
            style.textContent = `


        form.w-full[data-type="unified-composer"] {
        margin-bottom: -1em;
        }
        `;
            document.head.appendChild(style);
        }

        (function () {
            const observer = new MutationObserver(() => {
                document.querySelectorAll('div.text-token-text-secondary').forEach(el => {
                    const txt = el.textContent.trim().replace(/\s+/g, ' ');
                    if (txt.includes("Check important info")) {
                        el.setAttribute('data-id', 'hide-this-warning');
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        })();


    }, 100);



})();



// ==============================================================
// @note Auto-click 'try again' after 'Something went wrong'
// ==============================================================

// Auto-click "try again" when "Something went wrong" appears after switching from a foldered to non-foldered chat.
// Batch checks during browser idle time to avoid main-thread contention. Wrap click logic in an idle callback and schedule it once per mutation burst.

(() => {
    const containerSel = 'div.flex.h-full.w-full.flex-col.items-center.justify-center.gap-4';
    const btnSel = `${containerSel} button.btn-secondary`;

    // 1) Inject fade CSS
    const style = document.createElement('style');
    style.textContent = `
      ${containerSel} {
        opacity: 0;
        transition: opacity 200ms ease-in-out;
      }
      ${containerSel}.visible {
        opacity: 1;
      }
    `;
    document.head.append(style);

    // 2) Centralized click + fade logic
    let scheduled = false;
    const handleNode = (node) => {
        if (!(node instanceof HTMLElement) || !node.matches(containerSel)) return;
        node.classList.add('visible');   // fade in
        if (scheduled) return;
        scheduled = true;
        requestIdleCallback(() => {
            node.querySelector(btnSel)?.click();
            node.classList.remove('visible');  // fade out
            scheduled = false;
        });
    };

    // 3) Initial pass in case it’s already there
    document.querySelectorAll(containerSel).forEach(handleNode);

    // 4) Watch for new ones
    new MutationObserver(muts => {
        for (let { addedNodes } of muts) {
            addedNodes.forEach(handleNode);
        }
    }).observe(document.body, { childList: true, subtree: true });
})();

// =====================================
// @note Alt+1 to Alt+5 to select model
// =====================================

(() => {

    /* ────────────────────────────────────────────────────────────────
       1.  Alt/Option  or  Ctrl/Cmd  + 1 … 5   →   pick a model
       ──────────────────────────────────────────────────────────────── */
    (() => {
        // Hotkey model switching logic
        chrome.storage.sync.get(['useControlForModelSwitcherRadio'], ({ useControlForModelSwitcherRadio }) => {
            const IS_MAC = /Mac|iPad|iPhone|iPod/.test(navigator.platform);
            const USE_CTRL = !!useControlForModelSwitcherRadio;
            const MENU_BTN = 'button[data-testid="model-switcher-dropdown-button"]';
            const ITEM_SEL = 'div[role="menuitem"][data-radix-collection-item]';

            const modPressed = e =>
                USE_CTRL ? (IS_MAC ? e.metaKey : e.ctrlKey) : e.altKey;

            const synthClick = el => {
                if (el) {
                    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                    el.focus?.();
                }
            };

            const clickItem = i => synthClick([...document.querySelectorAll(ITEM_SEL)][i]);

            const openAndSelect = i => {
                const btn = document.querySelector(MENU_BTN);
                if (!btn) return;

                if (btn.getAttribute('aria-expanded') === 'true') {
                    clickItem(i);
                    return;
                }

                btn.focus();
                ['keydown', 'keyup'].forEach(type =>
                    btn.dispatchEvent(
                        new KeyboardEvent(type, {
                            key: ' ',
                            code: 'Space',
                            keyCode: 32,
                            charCode: 32,
                            bubbles: true,
                            cancelable: true,
                            composed: true
                        })
                    )
                );

                setTimeout(() => clickItem(i), 500);
            };

            window.addEventListener(
                'keydown',
                e => {
                    if (!modPressed(e) || !/^Digit[1-5]$/.test(e.code)) return;
                    e.preventDefault();
                    e.stopPropagation();
                    openAndSelect(+e.code.slice(-1) - 1);
                },
                true
            );
        });
    })();




    /* ────────────────────────────────────────────────────────────────
       2.  Append tiny “Alt/Option+N” or “Ctrl/Cmd+N” labels
       ──────────────────────────────────────────────────────────────── */
    (() => {
        // Label rendering logic
        chrome.storage.sync.get(['useControlForModelSwitcherRadio'], ({ useControlForModelSwitcherRadio }) => {
            const IS_MAC = /Mac|iPad|iPhone|iPod/.test(navigator.platform);
            const USE_CTRL = !!useControlForModelSwitcherRadio;
            const MOD_LABEL = USE_CTRL
                ? (IS_MAC ? 'Command' : 'Ctrl')
                : (IS_MAC ? 'Option' : 'Alt');

            const MENU_BTN_SEL = 'button[data-testid="model-switcher-dropdown-button"]';
            const ITEM_SEL = 'div[role="menuitem"][data-radix-collection-item]';
            const MAX_DIGIT = 5;

            const style = document.createElement('style');
            style.textContent = `
                .alt-hint {
                    font-size: 10px;
                    opacity: .55;
                    margin-left: 6px;
                    user-select: none;
                    pointer-events: none;
                }
            `;
            document.head.appendChild(style);

            const addHints = () => {
                const btn = document.querySelector(MENU_BTN_SEL);
                if (!btn || btn.getAttribute('aria-expanded') !== 'true') return;

                const menu = document.getElementById(btn.getAttribute('aria-controls') || '');
                if (!menu) return;

                [...menu.querySelectorAll(ITEM_SEL)]
                    .slice(0, MAX_DIGIT)
                    .forEach((el, i) => {
                        if (el.querySelector('.alt-hint')) return;
                        const span = document.createElement('span');
                        span.className = 'alt-hint';
                        span.textContent = `${MOD_LABEL}+${i + 1}`;
                        (el.querySelector('.flex') || el).appendChild(span);
                    });
            };

            const isOnMenuBtn = e =>
                e.composedPath?.().some(n => n instanceof Element && n.matches(MENU_BTN_SEL));

            document.addEventListener('click', e => isOnMenuBtn(e) && requestAnimationFrame(addHints));
            document.addEventListener('keydown', e => {
                if (isOnMenuBtn(e) && (e.key === 'Enter' || e.key === ' ')) {
                    requestAnimationFrame(addHints);
                }
            });

            if (document.querySelector(MENU_BTN_SEL)?.getAttribute('aria-expanded') === 'true') {
                requestAnimationFrame(addHints);
            }
        });
    })();



    /* ────────────────────────────────────────────────────────────────
       3.  Alt + W   →   open / close the model menu
       ──────────────────────────────────────────────────────────────── */
    // Global function to toggle the model selector menu
    window.toggleModelSelector = function () {
        try {
            const MENU_BTN_SEL = 'button[data-testid="model-switcher-dropdown-button"]';
            const btn = document.querySelector(MENU_BTN_SEL);
            if (!btn) return;

            btn.focus();
            ['keydown', 'keyup'].forEach(type => {
                btn.dispatchEvent(
                    new KeyboardEvent(type, {
                        key: ' ',
                        code: 'Space',
                        keyCode: 32,
                        charCode: 32,
                        bubbles: true,
                        cancelable: true,
                        composed: true
                    })
                );
            });
        } catch (_) {
            // Fail silently
        }
    };




})();



// =====================================
// @note Kill horizontal scroll bars
// =====================================
// 

/*  Inject once from your extension  */
(() => {
    const style = document.createElement("style");
    style.textContent = `
  /* Table wrapper: fills chat bubble, local scrolling if too wide */
  [class*="_tableContainer_"], [class*="_tableWrapper_"] {
    display: block !important;
    width: 100% !important;
    max-width: inherit !important;
    box-sizing: border-box !important;
    overflow-x: auto !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  /* Table: fills wrapper, columns auto-size to content, allows overflow for wide tables */
  [class*="_tableWrapper_"] > table {
    width: 100% !important;
    min-width: 100% !important;
    box-sizing: border-box !important;
    table-layout: auto !important;
  }
  
  /* Cells: allow normal wrap, but never squash below 20ch */
  [class*="_tableWrapper_"] th,
  [class*="_tableWrapper_"] td {
    width: auto !important;
    min-width: 20ch !important;          /* never less than 20 chars wide */
    max-width: 1px;                      /* try to shrink if crowded, but min still applies */
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
    text-overflow: ellipsis !important;
    white-space: normal !important;
    box-sizing: border-box !important;
    padding: 0.5em 1em !important;       /* visually matches code blocks */
  }
  
  /* Remove legacy/fixed size classes from the site */
  [class*="_tableWrapper_"] th[data-col-size],
  [class*="_tableWrapper_"] td[data-col-size] {
    width: auto !important;
    min-width: 20ch !important;
    max-width: none !important;
  }
  `;
    document.head.appendChild(style);
})();
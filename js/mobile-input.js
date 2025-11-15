// Mobile-optimized input enhancements for PWA
class MobileInput {
    static _initialized = false;
    static _isIOS = false;
    static _isAndroid = false;
    static _isMobile = false;

    static init() {
        if (this._initialized) return;

        // Detect mobile platforms
        const userAgent = navigator.userAgent;
        this._isIOS = /iPad|iPhone|iPod/.test(userAgent);
        this._isAndroid = /Android/.test(userAgent);
        this._isMobile = this._isIOS || this._isAndroid || 
                        /Mobile|Tablet|Touch|Phone/i.test(userAgent) ||
                        ('ontouchstart' in window) ||
                        (navigator.maxTouchPoints > 0);

        if (this._isMobile) {
            this._setupMobileStyles();
            this._setupViewportHandler();
            this._preventIOSZoom();
            this._enhanceExistingInputs();
        }

        this._initialized = true;
    }

    static _preventIOSZoom() {
        if (this._isIOS) {
            // Add viewport meta tag modification for iOS
            let viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                // Store original content
                const originalContent = viewport.content;
                
                // Prevent zoom on focus
                const preventZoom = () => {
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                };
                
                // Restore original on blur
                const restoreZoom = () => {
                    setTimeout(() => {
                        viewport.content = originalContent;
                    }, 500);
                };

                // Apply to all inputs
                document.addEventListener('focusin', (e) => {
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                        preventZoom();
                    }
                });

                document.addEventListener('focusout', (e) => {
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                        restoreZoom();
                    }
                });
            }
        }
    }

    static _setupMobileStyles() {
        if (document.querySelector('#mobile-input-styles')) return;

        const styles = createElement('STYLE', {
            parent: document.head,
            id: 'mobile-input-styles',
            innerHTML: `
                /* Mobile input optimizations */
                input, textarea, select {
                    /* Prevent zoom on iOS while keeping larger text */
                    font-size: 20px !important;
                    
                    /* Better touch targets */
                    min-height: 44px;
                    padding: 12px 16px;
                    
                    /* Improved tap response */
                    touch-action: manipulation;
                    
                    /* Better visual feedback */
                    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
                    
                    /* Enhanced focus styles for mobile */
                    outline: none;
                }

                /* iOS specific zoom prevention */
                input:focus, textarea:focus, select:focus {
                    /* Prevent zoom while maintaining larger text */
                    font-size: 20px !important;
                    border-color: var(--primary-color, #007bff);
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
                    background-color: var(--input-focus-bg, #ffffff);
                }

                /* Search input specific - slightly smaller to prevent zoom but still readable */
                input[type="search"], input.search-input {
                    font-size: 18px !important;
                }

                input[type="search"]:focus, input.search-input:focus {
                    font-size: 18px !important;
                }

                /* iOS specific optimizations */
                ${this._isIOS ? `
                    input, textarea, select {
                        /* Prevent rounded corners on iOS */
                        border-radius: 8px;
                        -webkit-appearance: none;
                        
                        /* Better keyboard handling */
                        -webkit-user-select: text;
                        
                        /* Prevent background zoom on focus */
                        background-attachment: local;
                    }
                    
                    input[type="number"] {
                        /* Better number input on iOS */
                        -webkit-appearance: none;
                        -moz-appearance: textfield;
                    }
                    
                    input[type="number"]::-webkit-outer-spin-button,
                    input[type="number"]::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                ` : ''}

                /* Android specific optimizations */
                ${this._isAndroid ? `
                    input, textarea, select {
                        /* Better Material Design feel */
                        border-radius: 4px;
                    }
                ` : ''}

                /* Textarea specific optimizations */
                textarea {
                    resize: vertical;
                    min-height: 120px;
                    line-height: 1.4;
                    
                    /* Better scrolling on mobile */
                    -webkit-overflow-scrolling: touch;
                    overflow-y: auto;
                }

                /* Search input specific optimizations */
                input[type="search"], input.search-input {
                    /* Consistent search styling */
                    -webkit-appearance: none;
                    border-radius: 20px;
                    background-image: none;
                }

                input[type="search"]::-webkit-search-decoration,
                input[type="search"]::-webkit-search-cancel-button {
                    -webkit-appearance: none;
                }

                /* Loading/processing state */
                .input-processing {
                    background-color: #f8f9fa;
                    cursor: wait;
                    opacity: 0.7;
                }

                /* Error state */
                .input-error {
                    border-color: #dc3545;
                    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
                }

                /* Success state */
                .input-success {
                    border-color: #28a745;
                    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
                }

                /* Virtual keyboard optimization */
                @media screen and (max-height: 500px) {
                    /* Reduce input padding when keyboard is likely visible */
                    input, textarea {
                        padding: 8px 12px;
                        min-height: 40px;
                    }
                    
                    textarea {
                        min-height: 80px;
                    }
                }

                /* Landscape mode optimizations */
                @media screen and (orientation: landscape) and (max-height: 600px) {
                    textarea {
                        min-height: 60px;
                    }
                }
            `
        });
    }

    static _setupViewportHandler() {
        // Handle virtual keyboard on mobile
        if (this._isIOS) {
            // iOS viewport handling
            let viewportHeight = window.innerHeight;
            
            window.addEventListener('resize', () => {
                const newHeight = window.innerHeight;
                const heightDiff = viewportHeight - newHeight;
                
                // Virtual keyboard likely opened if height decreased significantly
                if (heightDiff > 150) {
                    document.body.classList.add('keyboard-open');
                    // Scroll active input into view
                    setTimeout(() => {
                        const activeElement = document.activeElement;
                        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 300);
                } else if (heightDiff < -100) {
                    document.body.classList.remove('keyboard-open');
                }
            });

            // Add styles for keyboard open state
            if (!document.querySelector('#ios-keyboard-styles')) {
                createElement('STYLE', {
                    parent: document.head,
                    id: 'ios-keyboard-styles',
                    innerHTML: `
                        .keyboard-open {
                            /* Adjust layout when keyboard is open */
                            padding-bottom: 0;
                        }
                        
                        .keyboard-open #search-bar {
                            /* Keep search bar visible */
                            position: fixed;
                            bottom: 0;
                            z-index: 1001;
                        }
                    `
                });
            }
        }

        // Handle focus events for better mobile UX
        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this._handleInputFocus(e.target);
            }
        });

        document.addEventListener('focusout', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this._handleInputBlur(e.target);
            }
        });
    }

    static _handleInputFocus(input) {
        // Add haptic feedback for focus
        if (window.HapticFeedback) {
            HapticFeedback.selection();
        }

        // Add visual feedback
        input.classList.add('input-focused');
        
        // For iOS, delay scroll to avoid conflicts with browser behavior
        if (this._isIOS) {
            setTimeout(() => {
                input.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                });
            }, 300);
        }
    }

    static _handleInputBlur(input) {
        // Remove visual feedback
        input.classList.remove('input-focused');
        
        // Clear any error/success states after a delay
        setTimeout(() => {
            input.classList.remove('input-error', 'input-success');
        }, 3000);
    }

    static _enhanceExistingInputs() {
        // Enhance the search input
        const searchInput = document.querySelector('#search-input');
        if (searchInput) {
            this.enhanceSearchInput(searchInput);
        }

        // Enhance any existing inputs
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            this.enhanceInput(input);
        });
    }

    static enhanceSearchInput(input) {
        // Set optimal attributes for search
        const attributes = {
            autocomplete: 'off',
            autocorrect: 'off',
            autocapitalize: 'off',
            spellcheck: 'false',
            inputmode: 'search',
            enterkeyhint: 'search'
        };

        Object.entries(attributes).forEach(([attr, value]) => {
            input.setAttribute(attr, value);
        });

        // Add clear button functionality
        this._addClearButton(input);
    }

    static enhanceTextInput(input, options = {}) {
        const {
            inputmode = 'text',
            autocomplete = 'off',
            autocorrect = 'on',
            autocapitalize = 'sentences',
            spellcheck = 'true',
            enterkeyhint = 'done'
        } = options;

        const attributes = {
            autocomplete,
            autocorrect,
            autocapitalize,
            spellcheck,
            inputmode,
            enterkeyhint
        };

        Object.entries(attributes).forEach(([attr, value]) => {
            input.setAttribute(attr, value);
        });

        return input;
    }

    static enhanceNumberInput(input) {
        const attributes = {
            inputmode: 'numeric',
            autocomplete: 'off',
            autocorrect: 'off',
            autocapitalize: 'off',
            spellcheck: 'false',
            enterkeyhint: 'done'
        };

        Object.entries(attributes).forEach(([attr, value]) => {
            input.setAttribute(attr, value);
        });

        return input;
    }

    static enhanceTextarea(input, options = {}) {
        const {
            autocomplete = 'off',
            autocorrect = 'on',
            autocapitalize = 'sentences',
            spellcheck = 'true',
            enterkeyhint = 'enter'
        } = options;

        const attributes = {
            autocomplete,
            autocorrect,
            autocapitalize,
            spellcheck,
            enterkeyhint
        };

        Object.entries(attributes).forEach(([attr, value]) => {
            input.setAttribute(attr, value);
        });

        // Add auto-resize functionality
        this._addAutoResize(input);

        return input;
    }

    static enhanceInput(input) {
        // Apply appropriate enhancement based on input type
        const type = input.type || input.tagName.toLowerCase();
        
        switch (type) {
            case 'search':
                this.enhanceSearchInput(input);
                break;
            case 'number':
                this.enhanceNumberInput(input);
                break;
            case 'textarea':
                this.enhanceTextarea(input);
                break;
            default:
                this.enhanceTextInput(input);
        }

        // Add touch enhancements
        this._addTouchEnhancements(input);
    }

    static _addClearButton(input) {
        if (input.parentElement.querySelector('.input-clear-btn')) return;

        const clearBtn = createElement('BUTTON', {
            parent: input.parentElement,
            elementClass: 'input-clear-btn',
            innerHTML: '×',
            attributes: {
                type: 'button',
                'aria-label': 'Clear input'
            },
            eventListener: ['click', () => {
                input.value = '';
                input.focus();
                input.dispatchEvent(new Event('input', { bubbles: true }));
                if (window.HapticFeedback) {
                    HapticFeedback.light();
                }
            }]
        });

        // Add styles for clear button
        if (!document.querySelector('#clear-button-styles')) {
            createElement('STYLE', {
                parent: document.head,
                id: 'clear-button-styles',
                innerHTML: `
                    .input-clear-btn {
                        position: absolute;
                        right: 8px;
                        top: 50%;
                        transform: translateY(-50%);
                        background: none;
                        border: none;
                        font-size: 20px;
                        color: #999;
                        cursor: pointer;
                        padding: 4px;
                        line-height: 1;
                        border-radius: 50%;
                        min-width: 24px;
                        min-height: 24px;
                        display: none;
                    }
                    
                    .input-clear-btn:hover, .input-clear-btn:focus {
                        background-color: rgba(0, 0, 0, 0.1);
                        color: #666;
                    }
                    
                    input:not(:placeholder-shown) + .input-clear-btn {
                        display: block;
                    }
                    
                    #search-bar {
                        /* Keep fixed positioning for search bar */
                        position: fixed !important;
                    }
                `
            });
        }
    }

    static _addAutoResize(textarea) {
        const resize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
        };

        textarea.addEventListener('input', resize);
        textarea.addEventListener('change', resize);
        
        // Initial resize
        setTimeout(resize, 0);
    }

    static _addTouchEnhancements(input) {
        // Add haptic feedback for interactions
        input.addEventListener('focus', () => {
            if (window.HapticFeedback) {
                HapticFeedback.selection();
            }
        });

        // Add visual feedback for touch
        input.addEventListener('touchstart', () => {
            input.style.transform = 'scale(0.98)';
        }, { passive: true });

        input.addEventListener('touchend', () => {
            input.style.transform = '';
        }, { passive: true });
    }

    // Utility methods for validation states
    static setInputError(input, message = '') {
        input.classList.remove('input-success');
        input.classList.add('input-error');
        
        if (message) {
            this._showInputMessage(input, message, 'error');
        }
        
        if (window.HapticFeedback) {
            HapticFeedback.error();
        }
    }

    static setInputSuccess(input, message = '') {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        
        if (message) {
            this._showInputMessage(input, message, 'success');
        }
        
        if (window.HapticFeedback) {
            HapticFeedback.success();
        }
    }

    static clearInputState(input) {
        input.classList.remove('input-error', 'input-success', 'input-processing');
        this._hideInputMessage(input);
    }

    static _showInputMessage(input, message, type) {
        this._hideInputMessage(input);
        
        const messageEl = createElement('DIV', {
            parent: input.parentElement,
            elementClass: `input-message input-message-${type}`,
            text: message
        });

        // Add styles if not already present
        if (!document.querySelector('#input-message-styles')) {
            createElement('STYLE', {
                parent: document.head,
                id: 'input-message-styles',
                innerHTML: `
                    .input-message {
                        font-size: 12px;
                        margin-top: 4px;
                        padding: 4px 8px;
                        border-radius: 4px;
                        animation: fadeIn 0.3s ease;
                    }
                    
                    .input-message-error {
                        background-color: rgba(220, 53, 69, 0.1);
                        color: #dc3545;
                        border: 1px solid rgba(220, 53, 69, 0.2);
                    }
                    
                    .input-message-success {
                        background-color: rgba(40, 167, 69, 0.1);
                        color: #28a745;
                        border: 1px solid rgba(40, 167, 69, 0.2);
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-4px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `
            });
        }

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this._hideInputMessage(input);
        }, 5000);
    }

    static _hideInputMessage(input) {
        const existingMessage = input.parentElement.querySelector('.input-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    // Get platform information
    static getPlatformInfo() {
        return {
            isIOS: this._isIOS,
            isAndroid: this._isAndroid,
            isMobile: this._isMobile,
            hasTouch: 'ontouchstart' in window,
            maxTouchPoints: navigator.maxTouchPoints || 0
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MobileInput.init());
} else {
    MobileInput.init();
}

// Make available globally
window.MobileInput = MobileInput;
// Touch gestures and haptic feedback for mobile interaction
class TouchGestures {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.threshold = 50; // Minimum swipe distance
        this.restraint = 100; // Maximum perpendicular distance
        this.allowedTime = 300; // Maximum time for swipe
        this.startTime = 0;
        this.isScrolling = false;
        this.debug = false; // Set to true for debugging
    }

    init() {
        // Initialize haptic feedback system
        HapticFeedback.init();
        
        // Add touch gestures on all mobile devices, not just 'ontouchstart'
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
            document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        }
    }

    enableDebug() {
        this.debug = true;
        console.log('Touch gesture debugging enabled. Try swiping on the page.');
    }

    disableDebug() {
        this.debug = false;
        console.log('Touch gesture debugging disabled.');
    }

    handleTouchStart(e) {
        // Don't interfere with multi-touch gestures
        if (e.touches.length > 1) return;

        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.startTime = Date.now();
        this.isScrolling = false;
        
        if (this.debug) {
            console.log('Touch start:', { x: this.startX, y: this.startY });
        }
    }

    handleTouchMove(e) {
        if (e.touches.length > 1) return;

        const touch = e.touches[0];
        this.endX = touch.clientX;
        this.endY = touch.clientY;

        // Detect if user is scrolling vertically
        const distX = Math.abs(this.endX - this.startX);
        const distY = Math.abs(this.endY - this.startY);
        
        if (distY > distX && distY > 10) {
            this.isScrolling = true;
        }

        // For horizontal swipes, prevent default behavior on iOS to avoid page navigation
        if (distX > distY && distX > 30) {
            e.preventDefault();
        }
    }

    handleTouchEnd(e) {
        if (e.changedTouches.length > 1) return;
        if (this.isScrolling) return;

        const touch = e.changedTouches[0];
        this.endX = touch.clientX;
        this.endY = touch.clientY;

        const elapsedTime = Date.now() - this.startTime;
        if (elapsedTime > this.allowedTime) return;

        const distX = this.endX - this.startX;
        const distY = this.endY - this.startY;
        const absDistX = Math.abs(distX);
        const absDistY = Math.abs(distY);

        if (this.debug) {
            console.log('Touch end:', { 
                distX, distY, absDistX, absDistY, 
                elapsedTime, threshold: this.threshold, restraint: this.restraint
            });
        }

        // Check if it's a valid horizontal swipe
        if (absDistX >= this.threshold && absDistY <= this.restraint) {
            e.preventDefault(); // Prevent any default action on iOS
            if (distX > 0) {
                if (this.debug) console.log('Swipe right detected');
                this.onSwipeRight();
            } else {
                if (this.debug) console.log('Swipe left detected');
                this.onSwipeLeft();
            }
        }
        // Check if it's a valid vertical swipe (only up for add quote)
        else if (absDistY >= this.threshold && absDistX <= this.restraint) {
            if (distY < 0) { // Only handle swipe up
                e.preventDefault(); // Prevent any default action on iOS
                if (this.debug) console.log('Swipe up detected');
                this.onSwipeUp();
            }
        }
    }

    onSwipeLeft() {
        // Navigate forward or close current view
        if (!detailsView.classList.contains('hide')) {
            // Close details view
            HapticFeedback.swipe();
            if (backArrowCallback) {
                backArrowCallback();
                hide(backArrow);
                backArrowCallback = null;
            }
        } else if (!addView.classList.contains('hide')) {
            // Close add view
            HapticFeedback.swipe();
            if (backArrowCallback) {
                backArrowCallback();
                hide(backArrow);
                backArrowCallback = null;
            }
        } else if (!settingsView.classList.contains('hide')) {
            // Close settings view
            HapticFeedback.swipe();
            hide(settingsView);
            show(mainView, 'right');
            show(settingsButton, 'right');
            show(searchBar, 'right');
        } else {
            // Navigate to next page in main view
            this.navigateToNextPage();
        }
    }

    onSwipeRight() {
        // Navigate backward or show navigation
        if (mainView.classList.contains('hide')) {
            // Go back from any view
            HapticFeedback.swipe();
            if (backArrowCallback) {
                backArrowCallback();
                hide(backArrow);
                backArrowCallback = null;
            }
        } else {
            // Navigate to previous page in main view
            this.navigateToPreviousPage();
        }
    }

    onSwipeUp() {
        // Quick actions based on current view
        if (!mainView.classList.contains('hide')) {
            // If at top of main view, open add quote
            if (mainView.scrollTop < 50) {
                HapticFeedback.success();
                quoteButton.click();
            }
        }
    }

    navigateToNextPage() {
        // Find next button and click it if available
        const nextButton = document.querySelector('.page-button-right:not(.disabled)');
        if (nextButton) {
            HapticFeedback.swipe();
            nextButton.click();
        } else {
            // Provide feedback that there's no next page
            HapticFeedback.error();
        }
    }

    navigateToPreviousPage() {
        // Find previous button and click it if available
        const prevButton = document.querySelector('.page-button-left:not(.disabled)');
        if (prevButton) {
            HapticFeedback.swipe();
            prevButton.click();
        } else {
            // Provide feedback that there's no previous page
            HapticFeedback.error();
        }
    }

    // Detect long press for context actions
    handleLongPress(element, callback) {
        let pressTimer;
        
        element.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                HapticFeedback.heavy();
                callback(e);
            }, 500); // 500ms for long press
        }, { passive: true });

        element.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        }, { passive: true });

        element.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        }, { passive: true });
    }
}

// PWA-optimized haptic feedback utility class
class HapticFeedback {
    static _initialized = false;
    static _isSupported = null;
    static _userPreference = null;
    static _isPWA = false;
    static _isStandalone = false;

    static init() {
        if (this._initialized) return;

        // Detect PWA context
        this._isPWA = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
        this._isStandalone = window.navigator.standalone === true || this._isPWA;

        // Check support with PWA considerations
        this._isSupported = this._checkSupport();
        
        // Load user preference from storage
        this._loadUserPreference();

        // Listen for PWA display mode changes
        if (window.matchMedia) {
            window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
                this._isPWA = e.matches;
                this._isStandalone = this._isPWA || window.navigator.standalone === true;
            });
        }

        this._initialized = true;
    }

    static _checkSupport() {
        // Enhanced support detection for PWA context
        const hasVibrate = 'vibrate' in navigator || 'mozVibrate' in navigator || 'webkitVibrate' in navigator;
        
        // Check if we're on a mobile device
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isIOS = this._isIOSDevice();
        
        // iOS devices generally don't support the vibration API in Safari
        if (isIOS) {
            return false;
        }
        
        // Android devices with vibration API
        if (hasVibrate && !isIOS) {
            return true;
        }
        
        // PWAs have better haptic support when installed (non-iOS)
        if (this._isStandalone && hasVibrate && !isIOS) {
            return true;
        }
        
        // Fallback for other mobile devices
        return hasVibrate && (isMobile || hasTouchScreen);
    }

    static isEnabled() {
        if (!this._initialized) this.init();
        
        // Respect user preference first
        if (this._userPreference !== null) {
            return this._userPreference && this._isSupported;
        }

        // Default to enabled for PWA, but consider user's reduced motion preference
        const prefersReducedMotion = window.matchMedia && 
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        return this._isSupported && !prefersReducedMotion;
    }

    static _loadUserPreference() {
        try {
            const stored = localStorage.getItem('haptic-feedback-enabled');
            if (stored !== null) {
                this._userPreference = stored === 'true';
            }
        } catch (e) {
            // localStorage might not be available
            this._userPreference = null;
        }
    }

    static setEnabled(enabled) {
        this._userPreference = Boolean(enabled);
        try {
            localStorage.setItem('haptic-feedback-enabled', this._userPreference.toString());
        } catch (e) {
            // localStorage might not be available
        }
    }

    static vibrate(pattern) {
        if (!this.isEnabled()) return false;

        try {
            // PWA-optimized vibration patterns
            if (this._isStandalone) {
                // More subtle patterns for installed PWAs
                if (Array.isArray(pattern)) {
                    pattern = pattern.map(duration => Math.min(duration, 50)); // Cap at 50ms
                } else {
                    pattern = Math.min(pattern, 30); // Cap single vibrations at 30ms
                }
            }

            // Try different vibration methods with fallbacks
            if (navigator.vibrate) {
                return navigator.vibrate(pattern);
            } else if (navigator.mozVibrate) {
                return navigator.mozVibrate(pattern);
            } else if (navigator.webkitVibrate) {
                return navigator.webkitVibrate(pattern);
            }
        } catch (e) {
            console.debug('Haptic feedback failed:', e.message);
        }
        
        return false;
    }

    static _isIOSDevice() {
        // More comprehensive iOS detection
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Additional checks for iOS in PWA mode
        const isIOSPWA = window.navigator.standalone === true;
        const isIOSSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        return isIOS || isIOSPWA || (isIOSSafari && navigator.maxTouchPoints > 0);
    }

    // PWA-optimized feedback patterns
    static tap() {
        // Very subtle feedback for common interactions
        return this.vibrate(this._isStandalone ? 8 : 12);
    }

    static light() {
        return this.vibrate(this._isStandalone ? 10 : 15);
    }

    static medium() {
        return this.vibrate(this._isStandalone ? 20 : 30);
    }

    static heavy() {
        // Reduced intensity for PWA context
        return this.vibrate(this._isStandalone ? [15, 8, 15] : [25, 10, 25]);
    }

    static success() {
        // Positive feedback pattern
        return this.vibrate(this._isStandalone ? [8, 4, 8, 4, 12] : [12, 6, 12, 6, 18]);
    }

    static error() {
        // Distinct error pattern
        return this.vibrate(this._isStandalone ? [30, 15, 30] : [40, 20, 40]);
    }

    static notification() {
        // Attention-getting but not intrusive
        return this.vibrate(this._isStandalone ? [12, 8, 12, 8, 12] : [18, 10, 18, 10, 18]);
    }

    static selection() {
        // For selection/focus changes
        return this.vibrate(5);
    }

    static swipe() {
        // For gesture completion
        return this.vibrate(this._isStandalone ? 12 : 18);
    }

    // Custom pattern with PWA optimization
    static custom(pattern) {
        if (!Array.isArray(pattern) && typeof pattern !== 'number') {
            return false;
        }
        return this.vibrate(pattern);
    }

    // Utility methods for settings
    static getStatus() {
        if (!this._initialized) this.init();
        return {
            supported: this._isSupported,
            enabled: this.isEnabled(),
            isPWA: this._isPWA,
            isStandalone: this._isStandalone,
            userPreference: this._userPreference
        };
    }

    static toggle() {
        this.setEnabled(!this.isEnabled());
        return this.isEnabled();
    }

    // Test all haptic patterns (useful for debugging)
    static test() {
        console.log('Testing haptic feedback patterns...');
        const patterns = [
            { name: 'Tap', fn: () => this.tap() },
            { name: 'Light', fn: () => this.light() },
            { name: 'Medium', fn: () => this.medium() },
            { name: 'Heavy', fn: () => this.heavy() },
            { name: 'Success', fn: () => this.success() },
            { name: 'Error', fn: () => this.error() },
            { name: 'Notification', fn: () => this.notification() },
            { name: 'Selection', fn: () => this.selection() },
            { name: 'Swipe', fn: () => this.swipe() }
        ];

        let index = 0;
        const testNext = () => {
            if (index < patterns.length) {
                const pattern = patterns[index];
                console.log(`Testing ${pattern.name}...`);
                pattern.fn();
                index++;
                setTimeout(testNext, 1000); // Wait 1 second between tests
            } else {
                console.log('Haptic feedback test complete.');
            }
        };

        testNext();
    }
}

// Enhanced touch interactions for specific elements
class TouchEnhancements {
    static init() {
        // Initialize haptic feedback first
        HapticFeedback.init();
        
        // Add touch enhancements to buttons
        this.enhanceButtons();
        // Add touch enhancements to quotes
        this.enhanceQuotes();
    }

    static enhanceButtons() {
        // Enhance main action buttons with appropriate haptic feedback
        const buttons = [
            { element: quoteButton, feedback: 'medium' }, // Main action
            { element: settingsButton, feedback: 'tap' }, // Secondary action
            { element: backArrow, feedback: 'tap' } // Navigation
        ];

        buttons.forEach(({ element, feedback }) => {
            element.addEventListener('click', () => {
                HapticFeedback[feedback]();
            });
        });
    }

    static enhanceQuotes() {
        // Add subtle haptic feedback when quotes are tapped
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quote')) {
                HapticFeedback.selection();
            }
        });
    }
}

// Make touch gestures available globally for debugging
window.TouchGestures = TouchGestures;
window.HapticFeedback = HapticFeedback;
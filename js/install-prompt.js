// PWA Install Prompt for Quotebook
class PWAInstallPrompt {
    static _initialized = false;
    static _deferredPrompt = null;
    static _isInstallable = false;
    static _isInstalled = false;
    static _installButton = null;
    static _promptShown = false;

    static init() {
        if (this._initialized) return;

        this._checkInstallationStatus();
        this._setupInstallPrompt();
        this._createInstallButton();
        this._setupEventListeners();

        this._initialized = true;
    }

    static _checkInstallationStatus() {
        // Check if app is already installed
        this._isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;

        // Listen for display mode changes
        if (window.matchMedia) {
            window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
                this._isInstalled = e.matches;
                this._updateInstallButton();
            });
        }
    }

    static _setupInstallPrompt() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA install prompt available');
            
            // Prevent the default mini-infobar from appearing
            e.preventDefault();
            
            // Store the event for later use
            this._deferredPrompt = e;
            this._isInstallable = true;
            
            // Show our custom install button
            this._updateInstallButton();
            
            // Show install prompt after a delay (give user time to explore)
            if (!this._promptShown && !this._isInstalled) {
                setTimeout(() => {
                    this._showInstallPrompt();
                }, 10000); // Show after 10 seconds
            }
        });

        // Listen for successful installation
        window.addEventListener('appinstalled', (e) => {
            console.log('PWA was installed successfully');
            this._isInstalled = true;
            this._isInstallable = false;
            this._deferredPrompt = null;
            this._updateInstallButton();
            
            // Show success message
            this._showInstallSuccess();
            
            // Provide haptic feedback
            if (window.HapticFeedback) {
                HapticFeedback.success();
            }
        });
    }

    static _createInstallButton() {
        // Create install button
        this._installButton = createElement('BUTTON', {
            parent: document.body,
            elementClass: 'pwa-install-button',
            innerHTML: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Install App</span>
            `,
            attributes: {
                'aria-label': 'Install Quotebook as an app',
                title: 'Install Quotebook'
            },
            eventListener: ['click', () => this._triggerInstall()]
        });

        // Add styles for install button
        if (!document.querySelector('#pwa-install-styles')) {
            createElement('STYLE', {
                parent: document.head,
                id: 'pwa-install-styles',
                innerHTML: `
                    .pwa-install-button {
                        position: fixed;
                        bottom: 20px;
                        left: 20px;
                        background: var(--primary-color, #007bff);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        padding: 12px 16px;
                        font-size: 14px;
                        font-weight: 600;
                        display: none;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                        cursor: pointer;
                        transition: all 0.3s ease;
                        z-index: 1000;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    }

                    .pwa-install-button:hover {
                        background: var(--primary-color-dark, #0056b3);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
                    }

                    .pwa-install-button:active {
                        transform: translateY(0);
                        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
                    }

                    .pwa-install-button.show {
                        display: flex;
                        animation: slideInUp 0.5s ease-out;
                    }

                    .pwa-install-button.hide {
                        animation: slideOutDown 0.3s ease-in forwards;
                    }

                    @keyframes slideInUp {
                        from {
                            opacity: 0;
                            transform: translateY(100px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes slideOutDown {
                        from {
                            opacity: 1;
                            transform: translateY(0);
                        }
                        to {
                            opacity: 0;
                            transform: translateY(100px);
                        }
                    }

                    /* Install prompt modal */
                    .install-prompt-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        padding: 20px;
                        animation: fadeIn 0.3s ease;
                    }

                    .install-prompt-content {
                        background: white;
                        border-radius: 16px;
                        padding: 32px 24px 24px;
                        max-width: 400px;
                        width: 100%;
                        text-align: center;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                        animation: modalSlideIn 0.4s ease;
                        font-family: 'SF Pro', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                    }

                    .install-prompt-icon {
                        width: 64px;
                        height: 64px;
                        margin: 0 auto 16px;
                        border-radius: 12px;
                        background: var(--primary-color, #007bff);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 24px;
                        font-family: 'SF Pro', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                    }

                    .install-prompt-title {
                        font-size: 24px;
                        font-weight: 600;
                        margin: 0 0 12px;
                        color: #1a1a1a;
                        font-family: 'SF Pro', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                    }

                    .install-prompt-description {
                        font-size: 16px;
                        color: #666;
                        margin: 0 0 24px;
                        line-height: 1.5;
                        font-family: 'SF Pro', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                    }

                    .install-prompt-buttons {
                        display: flex;
                        gap: 12px;
                        flex-direction: column;
                    }

                    .install-prompt-button {
                        padding: 16px 24px;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        min-height: 52px;
                        font-family: 'SF Pro', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                    }

                    .install-prompt-button.primary {
                        background: var(--primary-color, #007bff);
                        color: white;
                    }

                    .install-prompt-button.primary:hover {
                        background: var(--primary-color-dark, #0056b3);
                        transform: translateY(-1px);
                    }

                    .install-prompt-button.secondary {
                        background: #f8f9fa;
                        color: #666;
                        border: 1px solid #e9ecef;
                    }

                    .install-prompt-button.secondary:hover {
                        background: #e9ecef;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes modalSlideIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px) scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }

                    /* Success notification */
                    .install-success {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #28a745;
                        color: white;
                        padding: 16px 20px;
                        border-radius: 12px;
                        font-weight: 600;
                        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
                        z-index: 10001;
                        animation: slideInRight 0.5s ease;
                        font-family: 'SF Pro', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                    }

                    @keyframes slideInRight {
                        from {
                            opacity: 0;
                            transform: translateX(100px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    /* Mobile responsive */
                    @media screen and (max-width: 768px) {
                        .pwa-install-button {
                            bottom: 90px; /* Above search bar */
                            left: 50%;
                            transform: translateX(-50%);
                            padding: 14px 20px;
                            font-size: 16px;
                            border-radius: 25px;
                        }

                        .pwa-install-button.show {
                            transform: translateX(-50%);
                        }

                        .install-prompt-content {
                            margin: 20px;
                            padding: 28px 20px 20px;
                        }

                        .install-prompt-buttons {
                            flex-direction: column;
                        }
                    }
                `
            });
        }

        this._updateInstallButton();
    }

    static _setupEventListeners() {
        // Hide install button when app becomes installed
        if (window.matchMedia) {
            window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
                if (e.matches) {
                    this._hideInstallButton();
                }
            });
        }

        // Check for iOS Safari specific install guidance
        if (this._isIOSSafari()) {
            setTimeout(() => {
                this._showIOSInstallGuidance();
            }, 15000); // Show iOS guidance after 15 seconds if not installed
        }
    }

    static _updateInstallButton() {
        if (!this._installButton) return;

        if (this._isInstallable && !this._isInstalled) {
            this._showInstallButton();
        } else {
            this._hideInstallButton();
        }
    }

    static _showInstallButton() {
        if (this._installButton && !this._isInstalled) {
            this._installButton.classList.add('show');
            this._installButton.classList.remove('hide');
        }
    }

    static _hideInstallButton() {
        if (this._installButton) {
            this._installButton.classList.add('hide');
            this._installButton.classList.remove('show');
            
            setTimeout(() => {
                this._installButton.style.display = 'none';
            }, 300);
        }
    }

    static _showInstallPrompt() {
        if (this._isInstalled || this._promptShown) return;

        this._promptShown = true;

        const modal = createElement('DIV', {
            parent: document.body,
            elementClass: 'install-prompt-modal',
            innerHTML: `
                <div class="install-prompt-content">
                    <div class="install-prompt-icon">📚</div>
                    <h2 class="install-prompt-title">Install Quotebook</h2>
                    <p class="install-prompt-description">
                        Get quick access to your quotes with our app. Install it on your device for a better experience.
                    </p>
                    <div class="install-prompt-buttons">
                        <button class="install-prompt-button primary" data-action="install">
                            Install App
                        </button>
                        <button class="install-prompt-button secondary" data-action="later">
                            Maybe Later
                        </button>
                    </div>
                </div>
            `,
            eventListener: ['click', (e) => {
                if (e.target.dataset.action === 'install') {
                    this._triggerInstall();
                    modal.remove();
                } else if (e.target.dataset.action === 'later') {
                    modal.remove();
                    // Store that user dismissed, don't show again for a while
                    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
                } else if (e.target === modal) {
                    // Click outside to close
                    modal.remove();
                }
            }]
        });

        // Provide haptic feedback
        if (window.HapticFeedback) {
            HapticFeedback.notification();
        }

        // Auto-remove after 30 seconds if no action
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 30000);
    }

    static async _triggerInstall() {
        if (!this._deferredPrompt) {
            console.log('No install prompt available');
            return;
        }

        try {
            // Provide haptic feedback
            if (window.HapticFeedback) {
                HapticFeedback.medium();
            }

            // Show the install prompt
            this._deferredPrompt.prompt();

            // Wait for the user to respond
            const { outcome } = await this._deferredPrompt.userChoice;

            console.log(`User response to install prompt: ${outcome}`);

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }

        } catch (error) {
            console.error('Error showing install prompt:', error);
        } finally {
            // Clear the deferredPrompt
            this._deferredPrompt = null;
            this._isInstallable = false;
            this._updateInstallButton();
        }
    }

    static _showInstallSuccess() {
        const success = createElement('DIV', {
            parent: document.body,
            elementClass: 'install-success',
            text: '✅ App installed successfully!'
        });

        setTimeout(() => {
            if (document.body.contains(success)) {
                success.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => success.remove(), 300);
            }
        }, 4000);
    }

    static _isIOSSafari() {
        const userAgent = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        return isIOS && isSafari && !window.navigator.standalone;
    }

    static _showIOSInstallGuidance() {
        if (this._isInstalled || localStorage.getItem('ios-install-guidance-shown')) return;

        const guidance = createElement('DIV', {
            parent: document.body,
            elementClass: 'install-prompt-modal',
            innerHTML: `
                <div class="install-prompt-content">
                    <div class="install-prompt-icon">📱</div>
                    <h2 class="install-prompt-title">Install on iOS</h2>
                    <p class="install-prompt-description">
                        To install this app on your iPhone or iPad:<br><br>
                        1. Tap the <strong>Share</strong> button below<br>
                        2. Select <strong>"Add to Home Screen"</strong><br>
                        3. Tap <strong>"Add"</strong> to confirm
                    </p>
                    <div class="install-prompt-buttons">
                        <button class="install-prompt-button primary" data-action="got-it">
                            Got it!
                        </button>
                    </div>
                </div>
            `,
            eventListener: ['click', (e) => {
                if (e.target.dataset.action === 'got-it' || e.target === guidance) {
                    guidance.remove();
                    localStorage.setItem('ios-install-guidance-shown', 'true');
                }
            }]
        });

        // Provide haptic feedback
        if (window.HapticFeedback) {
            HapticFeedback.notification();
        }
    }

    // Utility methods
    static isInstallable() {
        return this._isInstallable;
    }

    static isInstalled() {
        return this._isInstalled;
    }

    static canShowPrompt() {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) return true;
        
        // Show again after 7 days
        const dismissedTime = parseInt(dismissed);
        const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        return Date.now() - dismissedTime > oneWeek;
    }

    // Manual trigger for showing install prompt (can be called from console or UI)
    static showInstallPrompt() {
        if (this._isInstalled) {
            console.log('App is already installed');
            return;
        }

        if (!this._isInstallable) {
            console.log('App is not installable at the moment');
            return;
        }

        this._showInstallPrompt();
    }

    // Get installation status for debugging
    static getStatus() {
        return {
            initialized: this._initialized,
            installable: this._isInstallable,
            installed: this._isInstalled,
            promptShown: this._promptShown,
            canShowPrompt: this.canShowPrompt(),
            isIOSSafari: this._isIOSSafari()
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PWAInstallPrompt.init());
} else {
    PWAInstallPrompt.init();
}

// Make available globally for debugging
window.PWAInstallPrompt = PWAInstallPrompt;
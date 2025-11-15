// DOM elements
const mainView = document.querySelector('#main-view');
const detailsView = document.querySelector('#details-view');
const addView = document.querySelector('#add-view');
const settingsView = document.querySelector('#settings-view');

const quotesList = document.querySelector('#quotes-list');

const backArrow = document.querySelector('#back-arrow');
const quoteButton = document.querySelector('#quote-button');
const settingsButton = document.querySelector('#settings-button');

const searchInput = document.querySelector('#search-input');
const searchBar = document.querySelector('#search-bar');

const confirmationView = document.querySelector('#confirmation-view');

// Global variables
let backArrowCallback = null;
const defaultPageLimit = 10;

// Create global database instance
const quotebookDB = new QuotebookDB();

// Initialize UI with images
addImage('quote', quoteButton);
addImage('settings', settingsButton);
addImage('backArrow', backArrow);

// Initialize library
const library = new Library();

// Initialize touch gestures
const touchGestures = new TouchGestures();
touchGestures.init();

// Initialize touch enhancements
TouchEnhancements.init();

// Initialize the app asynchronously
async function initializeApp() {
    try {
        await quotebookDB.init();
        await library.loadStorage();
        library.renderList();
        
        // Handle PWA shortcuts and URL parameters
        handleAppLaunchParams();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // Fallback to empty library
        library.renderList();
    }
}

// Handle PWA shortcuts and launch parameters
function handleAppLaunchParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    switch (action) {
        case 'add':
            // Open add quote view
            setTimeout(() => {
                if (quoteButton) {
                    quoteButton.click();
                }
            }, 500); // Small delay to ensure UI is ready
            break;
            
        case 'search':
            // Focus search input
            setTimeout(() => {
                if (searchInput) {
                    searchInput.focus();
                }
            }, 500);
            break;
            
        default:
            // No special action, normal startup
            break;
    }
    
    // Clean up URL parameters after handling
    if (action) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Confirmation prompt function
function confirmPrompt(header, yesLabel, noLabel, view) {
    show(confirmationView, 'left');
    hide(view);

    while (confirmationView.firstChild) {
        confirmationView.firstChild.remove();
    }

    return new Promise(resolve => {
        backArrowCallback = () => {
            show(view, 'right');
            hide(confirmationView);

            resolve();
        };
        show(backArrow, 'left');

        createElement('H1', {
            parent: confirmationView,
            ID: 'confirmation-header',
            text: header
        });

        const wrapper = createElement('DIV', {
            parent: confirmationView,
            elementClass: 'save-discard-buttons'
        });

        createElement('BUTTON', {
            parent: wrapper,
            ID: 'confirmation-yes',
            elementClass: 'confirm-button',
            text: yesLabel,
            eventListener: ['click', () => {
                hide(confirmationView);
                show(view, 'right');

                resolve(true);
            }]
        });

        createElement('BUTTON', {
            parent: wrapper,
            ID: 'confirmation-no',
            elementClass: 'discard-button',
            text: noLabel,
            eventListener: ['click', () => {
                hide(confirmationView);
                show(view, 'right');

                resolve(false);
            }]
        });
    });
}

// Start the app
initializeApp();
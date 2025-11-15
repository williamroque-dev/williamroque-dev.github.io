// Event handlers

// Search input event handler
searchInput.addEventListener('input', () => {
    library.page = 0;
    library.renderList(searchInput.value);
});

// Quote button - Add new quote
// Events handler for Quotebook app

// Add button event handler
quoteButton.addEventListener('click', () => {
    HapticFeedback.medium();
    let originalScroll = mainView.scrollY;

    while (addView.firstChild) {
        addView.firstChild.remove();
    }

    createElement('H1', {
        parent: addView,
        text: 'Author',
        elementClass: 'add-input-label'
    });

    const authorInput = createElement('INPUT', {
        parent: addView,
        elementClass: 'add-input',
        attributes: {
            type: 'text'
        }
    });

    createElement('H1', {
        parent: addView,
        text: 'Reference',
        elementClass: 'add-input-label'
    });

    const referenceInput = createElement('INPUT', {
        parent: addView,
        elementClass: 'add-input',
        attributes: {
            type: 'text'
        },
        eventListener: ['change', async () => {
            const link = await linkScripture(referenceInput.value);

            if (link) {
                linkInput.value = link;
            }
        }]
    });

    createElement('H1', {
        parent: addView,
        text: 'Text',
        elementClass: 'add-input-label'
    });

    const quoteInput = createElement('TEXTAREA', {
        parent: addView,
        elementClass: 'add-textarea',
        attributes: {
            rows: 10
        }
    });

    createElement('H1', {
        parent: addView,
        text: 'Link',
        elementClass: 'add-input-label'
    });

    const linkInput = createElement('INPUT', {
        parent: addView,
        elementClass: 'add-input',
        attributes: {
            type: 'text'
        }
    });

    createElement('H1', {
        parent: addView,
        text: 'Category',
        elementClass: 'add-input-label'
    });

    const categoryInput = createElement('INPUT', {
        parent: addView,
        elementClass: 'add-input',
        attributes: {
            type: 'text'
        },
        eventListener: ['click', () => {
            while (categorySelect.firstChild) {
                categorySelect.firstChild.remove();
            }

            const categories = Object.keys(library.quotes).sort();

            categories.forEach(category => {
                createElement('DIV', {
                    parent: categorySelect,
                    elementClass: 'select-item',
                    text: category === 'zzzmisc' ? 'Miscellaneous' : category,
                    eventListener: ['click', () => {
                        categoryInput.value = category;
                    }]
                });
            });

            categorySelect.classList.remove('hide');
        }]
    });

    window.addEventListener('click', e => {
        categorySelect.classList.add('hide');
    }, false);

    const categorySelect = createElement('DIV', {
        parent: createElement('DIV', {
            parent: addView,
            elementClass: 'select-wrapper-container'
        }),
        elementClass: ['hide', 'select-wrapper']
    });

    categoryInput.addEventListener('focusout', () => {
        setTimeout(() => {
            categorySelect.classList.add('hide');
        }, 1);
    }, false);

    createElement('H1', {
        parent: addView,
        text: 'Subcategory',
        elementClass: 'add-input-label'
    });

    const subcategoryInput = createElement('INPUT', {
        parent: addView,
        elementClass: 'add-input',
        attributes: {
            type: 'text'
        },
        eventListener: ['click', () => {
            while (subcategorySelect.firstChild) {
                subcategorySelect.firstChild.remove();
            }

            const category = categoryInput.value;

            if (category in library.quotes) {
                const subcategories = Object.keys(library.quotes[category]).sort();

                subcategories.forEach(subcategory => {
                    createElement('DIV', {
                        parent: subcategorySelect,
                        elementClass: 'select-item',
                        text: subcategory,
                        eventListener: ['click', () => {
                            subcategoryInput.value = subcategory;
                        }]
                    });
                });
            }

            subcategorySelect.classList.remove('hide');
        }]
    });

    window.addEventListener('click', e => {
        subcategorySelect.classList.add('hide');
    }, false);

    const subcategorySelect = createElement('DIV', {
        parent: createElement('DIV', {
            parent: addView,
            elementClass: 'select-wrapper-container'
        }),
        elementClass: ['hide', 'select-wrapper']
    });

    subcategoryInput.addEventListener('focusout', () => {
        setTimeout(() => {
            subcategorySelect.classList.add('hide');
        }, 1);
    }, false);

    createElement('H1', {
        parent: addView,
        text: 'Tags',
        elementClass: 'add-input-label'
    });

    const tagsInput = createElement('INPUT', {
        parent: addView,
        elementClass: 'add-input',
        attributes: {
            type: 'text',
            placeholder: 'e.g. inspiration, wisdom, faith (comma separated)'
        }
    });

    // Create suggestions dropdown
    const tagsSelect = createElement('DIV', {
        parent: createElement('DIV', {
            parent: addView,
            elementClass: 'select-wrapper-container'
        }),
        elementClass: ['hide', 'select-wrapper', 'tags-select']
    });

    // Add suggestion functionality
    const showTagSuggestionsAdd = () => {
        const currentValue = tagsInput.value;
        const tags = currentValue.split(',').map(tag => tag.trim());
        const currentTag = tags[tags.length - 1].toLowerCase();
        
        // Clear previous suggestions
        while (tagsSelect.firstChild) {
            tagsSelect.firstChild.remove();
        }        const suggestions = library.getTagSuggestions(currentTag);
        
        if (suggestions.length > 0 && currentTag.length > 0) {
            suggestions.forEach(suggestion => {
                // Don't suggest tags that are already in the input
                const existingTags = tags.slice(0, -1).map(tag => tag.toLowerCase());
                if (!existingTags.includes(suggestion)) {
                    const suggestionItem = createElement('DIV', {
                        parent: tagsSelect,
                        elementClass: ['select-item', 'tag-suggestion'],
                        text: suggestion
                    });
                    
                    suggestionItem.addEventListener('mousedown', (e) => {
                        // Prevent the input from losing focus
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Replace the current partial tag with the suggestion
                        const currentValue = tagsInput.value;
                        const tags = currentValue.split(',').map(tag => tag.trim());
                        const newTags = [...tags.slice(0, -1), suggestion];
                        tagsInput.value = newTags.join(', ') + ', ';
                        
                        // Trigger input and change events to notify mobile input system
                        tagsInput.dispatchEvent(new Event('input', { bubbles: true }));
                        tagsInput.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        // Hide dropdown and refocus
                        tagsSelect.classList.add('hide');
                        tagsInput.focus();
                    });
                }
            });

            if (tagsSelect.children.length > 0) {
                tagsSelect.classList.remove('hide');
            }
        } else {
            tagsSelect.classList.add('hide');
        }
    };

    // Add event listeners for suggestions
    tagsInput.addEventListener('input', showTagSuggestionsAdd);
    tagsInput.addEventListener('focus', showTagSuggestionsAdd);

    // Hide suggestions when clicking outside
    tagsInput.addEventListener('blur', () => {
        setTimeout(() => {
            tagsSelect.classList.add('hide');
        }, 150); // Small delay to allow clicking on suggestions
    }, false);

    // Enhance with mobile optimization
    if (window.MobileInput) {
        MobileInput.enhanceTextInput(tagsInput, {
            autocapitalize: 'words',
            enterkeyhint: 'done'
        });
    }

    const buttonWrapper = createElement('DIV', {
        parent: addView,
        elementClass: 'add-button-wrapper'
    });

    const saveBtn = createElement('BUTTON', {
        parent: buttonWrapper,
        elementClass: 'add-button',
        text: 'Save'
    });

    saveBtn.addEventListener('click', async () => {
        HapticFeedback.success();
        if (authorInput.value || referenceInput.value) {
            // Parse tags from input
            const tagString = tagsInput.value.trim();
            const tags = tagString ? 
                tagString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0) : 
                [];

            const quote = new Quote(
                authorInput.value,
                referenceInput.value,
                quoteInput.value,
                linkInput.value,
                categoryInput.value || 'zzzmisc',
                subcategoryInput.value || '0misc',
                tags
            );

            library.addQuote(quote);
            await library.saveStorage();
            library.renderList(searchInput.value);
        }

        hide(addView);

        show(mainView, 'right');
        show(settingsButton, 'right');
        show(searchBar, 'right');

        mainView.scrollTo(0, originalScroll);
    });

    const saveAddBtn = createElement('BUTTON', {
        parent: buttonWrapper,
        className: 'btn',
        textContent: 'Save & Add'
    });
    
    saveAddBtn.addEventListener('click', async () => {
        HapticFeedback.success();
        if (authorInput.value || referenceInput.value) {
            // Parse tags from input
            const tagString = tagsInput.value.trim();
            const tags = tagString ? 
                tagString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0) : 
                [];

            const quote = new Quote(
                authorInput.value,
                referenceInput.value,
                quoteInput.value,
                linkInput.value,
                categoryInput.value || 'zzzmisc',
                subcategoryInput.value || '0misc',
                tags
            );

            library.addQuote(quote);
            await library.saveStorage();
            library.renderList(searchInput.value);
        }

        quoteInput.value = '';
        tagsInput.value = '';

        mainView.scrollTo(0, 0);
    });

    backArrowCallback = () => {
        library.renderList(searchInput.value);

        hide(addView);

        show(mainView, 'right');
        show(settingsButton, 'right');
        show(searchBar, 'right');

        mainView.scrollTo(0, originalScroll);
    };

    show(backArrow, 'left');

    mainView.scrollTo(0, 0);

    show(addView, 'left');

    hide(mainView);
    hide(settingsButton);
    hide(searchBar);
});

// Settings button event handler
settingsButton.addEventListener('click', () => {
    HapticFeedback.medium();
    while (settingsView.firstChild) {
        settingsView.firstChild.remove();
    }

    createElement('H1', {
        parent: settingsView,
        text: 'Settings',
        elementClass: 'settings-title'
    });

    createElement('H2', {
        parent: settingsView,
        text: 'Default Language',
        elementClass: 'settings-header'
    });

    // Initialize language input with async loading
    const languageInput = createElement('DIV', {
        parent: settingsView,
        elementClass: 'language-input',
        text: 'Loading...',
        eventListener: ['click', e => {
            e.stopPropagation();

            while (languageSelect.firstChild) {
                languageSelect.firstChild.remove();
            }

            const languages = ['English', 'Portuguese', 'Spanish', 'Japanese'];

            languages.forEach(language => {
                createElement('DIV', {
                    parent: languageSelect,
                    elementClass: 'select-item',
                    text: language,
                    eventListener: ['click', async () => {
                        languageInput.innerText = language;
                        await quotebookDB.setSettings('settings-language', language);
                    }]
                });
            });

            languageSelect.classList.remove('hide');
        }]
    });

    // Load the language setting asynchronously
    quotebookDB.getSettings('settings-language', 'English').then(language => {
        languageInput.innerText = language;
    }).catch(error => {
        console.warn('Failed to load language setting:', error);
        languageInput.innerText = 'English';
    });

    window.addEventListener('click', e => {
        languageSelect.classList.add('hide');
    }, false);

    const languageSelect = createElement('DIV', {
        parent: createElement('DIV', {
            parent: settingsView,
            elementClass: 'select-wrapper-container'
        }),
        elementClass: ['hide', 'select-wrapper']
    });

    languageInput.addEventListener('focusout', () => {
        setTimeout(() => {
            languageSelect.classList.add('hide');
        }, 1);
    }, false);

    createElement('H2', {
        parent: settingsView,
        text: 'Page Limit',
        elementClass: 'settings-header'
    });

    // Initialize page limit input with async loading
    const pageLimitInput = createElement('INPUT', {
        parent: settingsView,
        elementClass: 'language-input',
        attributes: {
            value: defaultPageLimit,
            type: 'number',
            min: '1',
            max: '1000',
            step: '1',
            placeholder: 'Enter page limit (1-1000)',
            autocomplete: 'off',
            autocorrect: 'off',
            autocapitalize: 'off',
            spellcheck: 'false',
            inputmode: 'numeric',
            enterkeyhint: 'done'
        },
        eventListener: ['change', async () => {
            const limit = Math.abs(parseInt(pageLimitInput.value));

            if (limit && limit >= 1 && limit <= 1000) {
                library.pageLimit = limit;
                await quotebookDB.setSettings('settings-page-limit', limit);
                if (window.MobileInput) {
                    MobileInput.setInputSuccess(pageLimitInput, `Page limit set to ${limit}`);
                }
            } else {
                pageLimitInput.value = defaultPageLimit;
                library.pageLimit = defaultPageLimit;
                await quotebookDB.setSettings('settings-page-limit', defaultPageLimit);
                if (window.MobileInput) {
                    MobileInput.setInputError(pageLimitInput, 'Please enter a number between 1 and 1000');
                }
            }
        }]
    });

    // Enhance with mobile optimization
    if (window.MobileInput) {
        MobileInput.enhanceNumberInput(pageLimitInput);
    }

    // Load the page limit setting asynchronously
    quotebookDB.getSettings('settings-page-limit', defaultPageLimit).then(pageLimit => {
        pageLimitInput.value = pageLimit;
        library.pageLimit = pageLimit;
    }).catch(error => {
        console.warn('Failed to load page limit setting:', error);
        pageLimitInput.value = defaultPageLimit;
    });

    // Haptic Feedback Settings
    createElement('H2', {
        parent: settingsView,
        text: 'Haptic Feedback',
        elementClass: 'settings-header'
    });

    const hapticStatus = HapticFeedback.getStatus();
    const hapticToggle = createElement('DIV', {
        parent: settingsView,
        elementClass: 'haptic-toggle',
        innerHTML: `
            <div class="haptic-text-container">
                <span class="toggle-label">Enable haptic feedback for touch interactions</span>
            </div>
            <div class="haptic-toggle-container">
                <div class="toggle-switch ${hapticStatus.enabled ? 'enabled' : 'disabled'}" data-enabled="${hapticStatus.enabled}">
                    <div class="toggle-slider"></div>
                </div>
            </div>
            <div class="haptic-info">
                Status: ${hapticStatus.supported ? 'Supported' : 'Not supported'} 
                ${hapticStatus.isPWA ? '• PWA Mode' : ''} 
                ${hapticStatus.isStandalone ? '• Installed' : ''}
            </div>
        `,
        eventListener: ['click', (e) => {
            // Only respond to clicks on the toggle switch itself
            if (e.target.closest('.toggle-switch')) {
                const newState = HapticFeedback.toggle();
                const toggleSwitch = hapticToggle.querySelector('.toggle-switch');
                
                // Update visual toggle
                toggleSwitch.className = `toggle-switch ${newState ? 'enabled' : 'disabled'}`;
                toggleSwitch.setAttribute('data-enabled', newState);
                
                // Provide immediate feedback if supported
                if (newState && HapticFeedback.getStatus().supported) {
                    HapticFeedback.success();
                }
            }
        }]
    });

    // Add styles for the toggle if they don't exist
    if (!document.querySelector('#haptic-toggle-styles')) {
        const styles = createElement('STYLE', {
            parent: document.head,
            id: 'haptic-toggle-styles',
            innerHTML: `
                .haptic-toggle {
                    margin: 1em 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    opacity: ${hapticStatus.supported ? '1' : '0.6'};
                }
                .haptic-text-container {
                    width: 100%;
                    margin-bottom: 1em;
                }
                .haptic-toggle-container {
                    display: flex;
                    justify-content: center;
                    cursor: ${hapticStatus.supported ? 'pointer' : 'not-allowed'};
                }
                .toggle-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5em;
                }
                .toggle-label {
                    color: var(--text-color);
                    font-size: 1.2em;
                    font-family: 'SF Pro', 'Open Sans', sans-serif;
                    text-align: left;
                    line-height: 1.4;
                }
                .toggle-switch {
                    position: relative;
                    width: 80px;
                    height: 40px;
                    background-color: #ccc;
                    border-radius: 30px;
                    transition: background-color 0.3s ease;
                }
                .toggle-switch.enabled {
                    background-color: var(--primary-color, #007bff);
                }
                .toggle-slider {
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    width: 34px;
                    height: 34px;
                    background-color: white;
                    border-radius: 50%;
                    transition: transform 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .toggle-switch.enabled .toggle-slider {
                    transform: translateX(30px);
                }
                .haptic-info {
                    color: var(--text-color);
                    opacity: 0.8;
                    font-family: 'SF Pro', 'Open Sans', sans-serif;
                    font-size: 1.1em;
                    line-height: 1.4;
                    margin-top: 0.8em;
                    width: 100%;
                    text-align: left;
                }
            `
        });
    }

    createElement('H2', {
        parent: settingsView,
        text: 'Import',
        elementClass: 'settings-header'
    });

    createElement('BUTTON', {
        parent: settingsView,
        text: 'Open File',
        elementClass: 'settings-button',
        eventListener: ['click', () => {
            const fileInput = createElement('INPUT', {
                parent: settingsView,
                elementClass: 'hide',
                attributes: {
                    type: 'file',
                    accept: '.quotes'
                },
                eventListener: ['change', e => {
                    const file = e.target.files[0];

                    if (!file) return;

                    const reader = new FileReader();

                    reader.onload = e => {
                        confirmPrompt('Replace current library or just add?', 'Overwrite', 'Add', settingsView).then(async (response) => {
                            if (response === true) {
                                const contents = e.target.result;

                                library.page = 0;

                                library.loadList(JSON.parse(contents));
                                library.renderList();
                                await library.saveStorage();

                                mainView.scrollTo(0, 0);

                                hide(settingsView);

                                show(mainView, 'right');
                                show(settingsButton, 'right');
                                show(searchBar, 'right');
                            } else if (response === false) {
                                const contents = JSON.parse(e.target.result);

                                contents.forEach(item => {
                                    library.addQuote(item);
                                });

                                library.page = 0;

                                library.renderList();
                                await library.saveStorage();

                                mainView.scrollTo(0, 0);

                                hide(settingsView);

                                show(mainView, 'right');
                                show(settingsButton, 'right');
                                show(searchBar, 'right');
                            }
                        });
                    };

                    reader.readAsText(file);
                }]
            });
            fileInput.click();
            fileInput.remove();
        }]
    });

    createElement('H2', {
        parent: settingsView,
        text: 'Export',
        elementClass: 'settings-header'
    });

    createElement('BUTTON', {
        parent: settingsView,
        text: 'Save',
        elementClass: 'settings-button',
        eventListener: ['click', () => {
            const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(library.getRaw()));
            
            const link = createElement('A', {
                parent: settingsView,
                elementClass: 'hide',
                attributes: {
                    href: data,
                    download: 'backup.quotes'
                }
            });

            link.click();
            link.remove();
        }]
    });

    // Set up back arrow callback for settings
    backArrowCallback = () => {
        library.renderList(searchInput.value);

        hide(settingsView);

        show(mainView, 'right');
        show(settingsButton, 'right');
        show(searchBar, 'right');
    };

    show(backArrow, 'left');
    hide(mainView);
    hide(settingsButton);
    hide(searchBar);

    show(settingsView, 'left');
});

// Back arrow event handler
backArrow.addEventListener('click', () => {
    HapticFeedback.light();
    if (backArrowCallback) {
        backArrowCallback();
    }

    hide(backArrow);
    backArrowCallback = null;
});
// Quote class
class Quote {
    constructor(author, reference, text, link, category, subcategory, tags = []) {
        this.author = author;
        this.reference = reference;
        this.text = text;
        this.link = link;
        this.category = category;
        this.subcategory = subcategory;
        this.tags = Array.isArray(tags) ? tags : [];

        this.library = undefined;
    }

    getRaw() {
        return {
            author: this.author,
            reference: this.reference,
            text: this.text,
            link: this.link,
            category: this.category,
            subcategory: this.subcategory,
            tags: this.tags
        };
    }

    async setProperty(property, value) {
        this[property] = value;
        await this.library.saveStorage();
    }

    renderRow() {
        const rowElement = createElement('DIV', {
            parent: quotesList,
            elementClass: 'quote'
        });

        createElement('DIV', {
            parent: rowElement,
            elementClass: 'quote-text',
            text: this.text,
            eventListener: ['click', this.renderDetails.bind(this)],
        });

        const reference = createElement('DIV', {
            parent: rowElement,
            elementClass: 'quote-reference',
            text: '―'
        });

        if (this.author) {
            createElement('SPAN', {
                parent: reference,
                elementClass: 'reference-author',
                text: this.author + (this.reference ? ', ' : '')
            });
        }

        if (this.link) {
            createElement('A', {
                parent: createElement('SPAN', {
                    parent: reference,
                    elementClass: 'reference-source'
                }),
                text: this.reference,
                elementClass: 'link',
                attributes: {
                    'href': this.link,
                    'target': '_blank'
                }
            });
        } else {
            createElement('SPAN', {
                parent: reference,
                elementClass: 'reference-source',
                text: this.reference
            });
        }

        // Render tags if they exist
        if (this.tags && this.tags.length > 0) {
            const tagsContainer = createElement('DIV', {
                parent: rowElement,
                elementClass: 'quote-tags'
            });

            this.tags.forEach(tag => {
                createElement('SPAN', {
                    parent: tagsContainer,
                    elementClass: 'quote-tag',
                    text: tag
                });
            });
        }

        return rowElement;
    }

    renderDetails() {
        HapticFeedback.light();
        let originalScroll = mainView.scrollY;

        while (detailsView.firstChild) {
            detailsView.firstChild.remove();
        }

        backArrowCallback = () => {
            this.library.renderList(searchInput.value);

            hide(detailsView);
            show(mainView, 'right');
            show(settingsButton, 'right');
            show(searchBar, 'right');

            mainView.scrollTo(0, originalScroll);
        };

        show(backArrow, 'left');

        hide(mainView);
        hide(settingsButton);
        hide(searchBar);

        createElement('H1', {
            parent: detailsView,
            elementClass: 'details-input-label',
            text: 'Author'
        });

        const authorInput = createElement('INPUT', {
            parent: detailsView,
            elementClass: 'details-input',
            attributes: {
                type: 'text',
                value: this.author,
                placeholder: 'Enter author name',
                autocomplete: 'off',
                autocorrect: 'on',
                autocapitalize: 'words',
                spellcheck: 'true',
                inputmode: 'text',
                enterkeyhint: 'next'
            },
            eventListener: ['change', async () => {
                this.author = authorInput.value;
                await this.library.saveStorage();
                if (window.MobileInput) {
                    MobileInput.setInputSuccess(authorInput);
                }
            }]
        });

        // Enhance with mobile optimization
        if (window.MobileInput) {
            MobileInput.enhanceTextInput(authorInput, {
                autocapitalize: 'words',
                enterkeyhint: 'next'
            });
        }

        createElement('H1', {
            parent: detailsView,
            elementClass: 'details-input-label',
            text: 'Reference'
        });

        const referenceInput = createElement('INPUT', {
            parent: detailsView,
            elementClass: 'details-input',
            attributes: {
                type: 'text',
                value: this.reference,
                placeholder: 'e.g. John 3:16, Genesis 1:1',
                autocomplete: 'off',
                autocorrect: 'off',
                autocapitalize: 'off',
                spellcheck: 'false',
                inputmode: 'text',
                enterkeyhint: 'next'
            },
            eventListener: ['change', async () => {
                this.reference = referenceInput.value;
                
                // Show processing state
                if (window.MobileInput) {
                    referenceInput.classList.add('input-processing');
                }
                
                let link = await linkScripture(referenceInput.value);

                if (link) {
                    this.link = link;
                    linkInput.value = link;
                    if (window.MobileInput) {
                        MobileInput.setInputSuccess(referenceInput, 'Scripture link generated');
                    }
                } else if (window.MobileInput) {
                    MobileInput.clearInputState(referenceInput);
                }

                referenceInput.classList.remove('input-processing');
                this.library.renderList();
                await this.library.saveStorage();
            }]
        });

        // Enhance with mobile optimization
        if (window.MobileInput) {
            MobileInput.enhanceTextInput(referenceInput, {
                autocorrect: 'off',
                autocapitalize: 'off',
                spellcheck: 'false',
                enterkeyhint: 'next'
            });
        }

        createElement('H1', {
            parent: detailsView,
            elementClass: 'details-input-label',
            text: 'Text'
        });

        const textInput = createElement('TEXTAREA', {
            parent: detailsView,
            elementClass: 'details-textarea',
            text: this.text,
            attributes: {
                rows: 10,
                placeholder: 'Enter the quote text here...',
                autocomplete: 'off',
                autocorrect: 'on',
                autocapitalize: 'sentences',
                spellcheck: 'true',
                enterkeyhint: 'enter'
            },
            eventListener: ['change', async () => {
                this.text = textInput.value;
                this.library.renderList();
                await this.library.saveStorage();
                if (window.MobileInput) {
                    MobileInput.setInputSuccess(textInput);
                }
            }]
        });

        // Enhance with mobile optimization
        if (window.MobileInput) {
            MobileInput.enhanceTextarea(textInput, {
                autocorrect: 'on',
                autocapitalize: 'sentences',
                spellcheck: 'true',
                enterkeyhint: 'enter'
            });
        }

        createElement('H1', {
            parent: detailsView,
            elementClass: 'details-input-label',
            text: 'Link'
        });

        const linkInput = createElement('INPUT', {
            parent: detailsView,
            elementClass: 'details-input',
            attributes: {
                type: 'url',
                value: this.link,
                placeholder: 'https://example.com/scripture-link',
                autocomplete: 'url',
                autocorrect: 'off',
                autocapitalize: 'off',
                spellcheck: 'false',
                inputmode: 'url',
                enterkeyhint: 'next'
            },
            eventListener: ['change', async () => {
                this.link = linkInput.value;
                await this.library.saveStorage();
                
                // Validate URL format
                if (linkInput.value && window.MobileInput) {
                    try {
                        new URL(linkInput.value);
                        MobileInput.setInputSuccess(linkInput, 'Valid URL');
                    } catch (e) {
                        MobileInput.setInputError(linkInput, 'Please enter a valid URL');
                    }
                }
            }]
        });

        // Enhance with mobile optimization
        if (window.MobileInput) {
            MobileInput.enhanceTextInput(linkInput, {
                inputmode: 'url',
                autocorrect: 'off',
                autocapitalize: 'off',
                spellcheck: 'false',
                enterkeyhint: 'next'
            });
        }

        createElement('H1', {
            parent: detailsView,
            elementClass: 'details-input-label',
            text: 'Category'
        });

        const categoryInput = createElement('INPUT', {
            parent: detailsView,
            elementClass: 'details-input',
            attributes: {
                type: 'text',
                value: this.category,
                placeholder: 'e.g. Faith, Hope, Love',
                autocomplete: 'off',
                autocorrect: 'on',
                autocapitalize: 'words',
                spellcheck: 'true',
                inputmode: 'text',
                enterkeyhint: 'next'
            },
            eventListener: ['change', async () => {
                this.category = categoryInput.value;
                await this.library.saveStorage();
                if (window.MobileInput) {
                    MobileInput.setInputSuccess(categoryInput);
                }
            }]
        });

        // Enhance with mobile optimization
        if (window.MobileInput) {
            MobileInput.enhanceTextInput(categoryInput, {
                autocapitalize: 'words',
                enterkeyhint: 'next'
            });
        }

        createElement('H1', {
            parent: detailsView,
            elementClass: 'details-input-label',
            text: 'Subcategory'
        });

        const subcategoryInput = createElement('INPUT', {
            parent: detailsView,
            elementClass: 'details-input',
            attributes: {
                type: 'text',
                value: this.subcategory,
                placeholder: 'e.g. Prayer, Worship, Study',
                autocomplete: 'off',
                autocorrect: 'on',
                autocapitalize: 'words',
                spellcheck: 'true',
                inputmode: 'text',
                enterkeyhint: 'done'
            },
            eventListener: ['change', async () => {
                this.subcategory = subcategoryInput.value;
                await this.library.saveStorage();
                if (window.MobileInput) {
                    MobileInput.setInputSuccess(subcategoryInput);
                }
            }]
        });

        // Enhance with mobile optimization
        if (window.MobileInput) {
            MobileInput.enhanceTextInput(subcategoryInput, {
                autocapitalize: 'words',
                enterkeyhint: 'done'
            });
        }

        createElement('H1', {
            parent: detailsView,
            elementClass: 'details-input-label',
            text: 'Tags'
        });

        const tagsInput = createElement('INPUT', {
            parent: detailsView,
            elementClass: 'details-input',
            attributes: {
                type: 'text',
                value: this.tags.join(', '),
                placeholder: 'e.g. inspiration, wisdom, faith (comma separated)',
                autocomplete: 'off',
                autocorrect: 'on',
                autocapitalize: 'words',
                spellcheck: 'true',
                inputmode: 'text',
                enterkeyhint: 'done'
            }
        });

        tagsInput.addEventListener('change', async () => {
            // Parse comma-separated tags and clean them
            const tagString = tagsInput.value.trim();
            if (tagString) {
                this.tags = tagString
                    .split(',')
                    .map(tag => tag.trim().toLowerCase())
                    .filter(tag => tag.length > 0)
                    .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates
            } else {
                this.tags = [];
            }
            
            // Update display value with cleaned tags
            tagsInput.value = this.tags.join(', ');
            
            await this.library.saveStorage();
            if (window.MobileInput) {
                MobileInput.setInputSuccess(tagsInput, `${this.tags.length} tag${this.tags.length !== 1 ? 's' : ''} saved`);
            }

            // Update the displayed tags
            this.updateTagsDisplay();
        });

        // Create suggestions dropdown for details view
        const detailsTagsSelect = createElement('DIV', {
            parent: createElement('DIV', {
                parent: detailsView,
                elementClass: 'select-wrapper-container'
            }),
            elementClass: ['hide', 'select-wrapper', 'tags-select']
        });

        // Add suggestion functionality with separate event listeners
        const showTagSuggestions = () => {
            const currentValue = tagsInput.value;
            const tags = currentValue.split(',').map(tag => tag.trim());
            const currentTag = tags[tags.length - 1].toLowerCase();
            
            // Clear previous suggestions
            while (detailsTagsSelect.firstChild) {
                detailsTagsSelect.firstChild.remove();
            }

            const suggestions = this.library.getTagSuggestions(currentTag);
            
            if (suggestions.length > 0 && currentTag.length > 0) {
                    suggestions.forEach(suggestion => {
                        // Don't suggest tags that are already in the input
                        const existingTags = tags.slice(0, -1).map(tag => tag.toLowerCase());
                        if (!existingTags.includes(suggestion)) {
                            const suggestionItem = createElement('DIV', {
                                parent: detailsTagsSelect,
                                elementClass: ['select-item', 'tag-suggestion'],
                                text: suggestion
                            });
                            
                            suggestionItem.addEventListener('mousedown', (e) => {
                                // Prevent the input from losing focus
                                e.preventDefault();
                                e.stopPropagation();
                                
                                // Replace the current partial tag with the suggestion
                                const currentValue = tagsInput.value;
                                const currentTags = currentValue.split(',').map(tag => tag.trim());
                                const newTags = [...currentTags.slice(0, -1), suggestion];
                                tagsInput.value = newTags.join(', ') + ', ';
                                
                                // Trigger input and change events to notify mobile input system
                                tagsInput.dispatchEvent(new Event('input', { bubbles: true }));
                                tagsInput.dispatchEvent(new Event('change', { bubbles: true }));
                                
                                // Hide dropdown and refocus
                                detailsTagsSelect.classList.add('hide');
                                tagsInput.focus();
                            });
                        }
                    });                if (detailsTagsSelect.children.length > 0) {
                    detailsTagsSelect.classList.remove('hide');
                }
            } else {
                detailsTagsSelect.classList.add('hide');
            }
        };

        // Add event listeners for suggestions
        tagsInput.addEventListener('input', showTagSuggestions);
        tagsInput.addEventListener('focus', showTagSuggestions);

        // Hide suggestions when clicking outside
        tagsInput.addEventListener('blur', () => {
            setTimeout(() => {
                detailsTagsSelect.classList.add('hide');
            }, 150); // Small delay to allow clicking on suggestions
        }, false);

        // Enhance with mobile optimization
        if (window.MobileInput) {
            MobileInput.enhanceTextInput(tagsInput, {
                autocapitalize: 'words',
                enterkeyhint: 'done'
            });
        }

        // Display current tags as clickable chips
        if (this.tags && this.tags.length > 0) {
            const tagsContainer = createElement('DIV', {
                parent: detailsView,
                elementClass: 'details-tags-display'
            });

            this.tags.forEach(tag => {
                createElement('SPAN', {
                    parent: tagsContainer,
                    elementClass: 'details-tag-chip',
                    text: tag
                });
            });
        }

        createElement('BUTTON', {
            parent: detailsView,
            elementClass: 'details-copy',
            text: 'Copy',
            eventListener: ['click', () => {
                HapticFeedback.success();
                let text = this.text;

                if (this.author || this.reference) {
                    text += '\n―';

                    if (this.author) {
                        text += this.author;
                    }

                    if (this.author && this.reference) {
                        text += ', ';
                    }

                    if (this.reference) {
                        text += this.reference;
                    }
                }

                navigator.clipboard.writeText(text);
            }]
        });

        createElement('BUTTON', {
            parent: detailsView,
            elementClass: 'details-delete',
            text: 'Delete',
            eventListener: ['click', () => {
                HapticFeedback.medium();
                confirmPrompt('Are you sure?', 'Yes', 'No', detailsView).then(async (response) => {
                    if (response) {
                        HapticFeedback.heavy(); // Strong feedback for deletion
                        await this.library.removeQuote(this);
                        this.library.renderList(searchInput.value);

                        show(mainView, 'right');
                        show(settingsButton, 'right');
                        show(searchBar, 'right');

                        hide(detailsView);
                        hide(backArrow);
                        backArrowCallback = null;

                        mainView.scrollTo(0, originalScroll);
                    }
                });
            }]
        });

        show(detailsView, 'left');
    }

    updateTagsDisplay() {
        // Find and update the existing tags display
        const existingTagsDisplay = detailsView.querySelector('.details-tags-display');
        if (existingTagsDisplay) {
            existingTagsDisplay.remove();
        }

        // Recreate tags display if there are tags
        if (this.tags && this.tags.length > 0) {
            const tagsContainer = createElement('DIV', {
                parent: detailsView,
                elementClass: 'details-tags-display'
            });

            this.tags.forEach(tag => {
                createElement('SPAN', {
                    parent: tagsContainer,
                    elementClass: 'details-tag-chip',
                    text: tag
                });
            });

            // Insert before the first button
            const firstButton = detailsView.querySelector('button');
            if (firstButton) {
                detailsView.insertBefore(tagsContainer, firstButton);
            }
        }
    }
}
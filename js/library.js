// Library class for managing quotes
class Library {
    constructor() {
        this.quotes = {};
        this.quotesCount = 0;

        this.page = 0;
        this.pageLimit = defaultPageLimit;
        
        // Initialize with default, will be loaded from IndexedDB
        this.initializeSettings();
    }

    async initializeSettings() {
        try {
            const pageLimit = await quotebookDB.getSettings('settings-page-limit', defaultPageLimit);
            this.pageLimit = pageLimit;
        } catch (error) {
            console.warn('Failed to load page limit from IndexedDB:', error);
            this.pageLimit = defaultPageLimit;
        }
    }

    addQuote(data) {
        const {
            author,
            reference,
            text,
            link,
            category,
            subcategory,
            tags = []
        } = data;

        const quote = new Quote(
            author,
            reference,
            text,
            link,
            category,
            subcategory,
            tags
        );

        quote.library = this;

        if (!(category in this.quotes)) {
            this.quotes[category] = {};
        }

        if (!(subcategory in this.quotes[category])) {
            this.quotes[category][subcategory] = [];
        }

        this.quotes[category][subcategory].push(quote);

        this.quotesCount++;
    }

    async removeQuote(quote) {
        const { category, subcategory } = quote;

        const list = this.quotes[category][subcategory];

        list.splice(list.indexOf(quote), 1);

        if (!list.length) {
            delete this.quotes[category][subcategory];
        }

        if (!Object.keys(this.quotes[category]).length) {
            delete this.quotes[category];
        }

        await this.saveStorage();

        this.quotesCount--;
    }

    loadList(list) {
        this.quotes = {};

        list.forEach(item => {
            this.addQuote(item);
        });
    }

    async loadStorage() {
        try {
            const data = await quotebookDB.getAllQuotes();
            this.loadList(data || []);
        } catch (error) {
            console.warn('Failed to load from IndexedDB:', error);
            // Fallback to localStorage for migration
            try {
                const storage = window.localStorage.getItem('quotebook-library');
                let data;
                
                if (storage) {
                    data = JSON.parse(storage);
                    // Migrate to IndexedDB
                    await this.migrateFromLocalStorage(data);
                } else {
                    data = [];
                }

                this.loadList(data);
            } catch (fallbackError) {
                console.error('Failed to load from localStorage as well:', fallbackError);
                this.loadList([]);
            }
        }
    }

    async migrateFromLocalStorage(data) {
        try {
            console.log('Migrating data from localStorage to IndexedDB...');
            await quotebookDB.saveAllQuotes(data);
            
            // Migrate settings
            const language = window.localStorage.getItem('settings-language');
            if (language) {
                await quotebookDB.setSettings('settings-language', language);
            }
            
            const pageLimit = window.localStorage.getItem('settings-page-limit');
            if (pageLimit) {
                await quotebookDB.setSettings('settings-page-limit', pageLimit);
            }
            
            // Clear localStorage after successful migration
            window.localStorage.removeItem('quotebook-library');
            window.localStorage.removeItem('settings-language');
            window.localStorage.removeItem('settings-page-limit');
            
            console.log('Migration completed successfully');
        } catch (error) {
            console.error('Failed to migrate data to IndexedDB:', error);
        }
    }

    getRaw() {
        let data = [];

        Object.values(this.quotes).forEach(category => {
            Object.values(category).forEach(subcategory => {
                Object.values(subcategory).forEach(quote => {
                    data.push(quote.getRaw());
                });
            });
        });

        return data;
    }

    getAllTags() {
        const tagSet = new Set();

        Object.values(this.quotes).forEach(category => {
            Object.values(category).forEach(subcategory => {
                Object.values(subcategory).forEach(quote => {
                    if (quote.tags && Array.isArray(quote.tags)) {
                        quote.tags.forEach(tag => {
                            if (tag && tag.trim()) {
                                tagSet.add(tag.trim().toLowerCase());
                            }
                        });
                    }
                });
            });
        });

        return Array.from(tagSet).sort();
    }

    getTagSuggestions(input) {
        const allTags = this.getAllTags();
        const inputLower = input.toLowerCase().trim();
        
        if (!inputLower) {
            // Return most popular tags if no input
            return allTags.slice(0, 10);
        }

        // Filter tags that start with the input
        const startsWith = allTags.filter(tag => tag.startsWith(inputLower));
        
        // Filter tags that contain the input (but don't start with it)
        const contains = allTags.filter(tag => 
            tag.includes(inputLower) && !tag.startsWith(inputLower)
        );

        // Combine and limit results
        return [...startsWith, ...contains].slice(0, 10);
    }

    async saveStorage() {
        try {
            const data = this.getRaw();
            await quotebookDB.saveAllQuotes(data);
        } catch (error) {
            console.error('Failed to save to IndexedDB:', error);
            // Fallback to localStorage
            const data = this.getRaw();
            window.localStorage.setItem('quotebook-library', JSON.stringify(data));
        }
    }

    renderList(query) {
        while (quotesList.firstChild) {
            quotesList.firstChild.remove();
        }

        if (!Object.keys(this.quotes).length) {
            return;
        }

        const lowerLimit = this.page * this.pageLimit;
        const upperLimit = (this.page + 1) * this.pageLimit;

        let count = 0;
        let nextExists = false;
        let lastRound = false;

        for (const category of Object.keys(this.quotes).sort()) {
            let displayCategory = false;

            const categoryHeader = createElement('H1', {
                parent: quotesList,
                elementClass: 'quotes-category',
                text: category === 'zzzmisc' ? 'Miscellaneous' : category
            });

            Object.keys(this.quotes[category]).sort().forEach(subcategory => {
                let subcategoryHeader;
                let displaySubcategory = false;

                if (subcategory !== '0misc') {
                    subcategoryHeader = createElement('H2', {
                        parent: quotesList,
                        elementClass: 'quotes-subcategory',
                        text: subcategory
                    });
                }

                const quotes = Object.values(this.quotes[category][subcategory]);

                for (let quoteIndex = 0; quoteIndex < quotes.length; quoteIndex++) {
                    if (count >= upperLimit) {
                        lastRound = true;
                    }

                    const quote = quotes[quoteIndex];

                    const matches = [
                        quote.author,
                        quote.reference,
                        quote.text,
                        quote.category,
                        quote.subcategory,
                        ...(quote.tags || []) // Include tags in search
                    ].some(field => {
                        return new RegExp(query, 'ig').test(field);
                    });

                    if (!query || matches) {
                        if (lastRound) {
                            nextExists = true;
                            break;
                        } else {
                            count++;

                            if (count <= lowerLimit) continue;

                            quote.renderRow();
                            displayCategory = true;
                            
                            if (subcategory !== '0misc') {
                                displaySubcategory = true;
                            }
                        }
                    }
                }

                if (!displaySubcategory) {
                    if (subcategory !== '0misc') {
                        subcategoryHeader.remove();
                    }
                }
            });

            if (!displayCategory) {
                categoryHeader.remove();
            }
        }

        if (!nextExists && this.page === 0) {
            return;
        }

        const pageButtonWrapper = createElement('DIV', {
            parent: quotesList,
            elementClass: 'page-button-wrapper'
        });

        const leftButton = createElement('BUTTON', {
            parent: pageButtonWrapper,
            elementClass: ['page-button', 'page-button-left'],
            eventListener: ['click', () => {
                if (this.page > 0) {
                    HapticFeedback.light();
                    this.page--;
                    this.renderList(query);

                    mainView.scrollTo(0, 0);
                } else {
                    HapticFeedback.error();
                }
            }]
        });

        if (this.page === 0) {
            leftButton.classList.add('disabled');
        }
        
        addImage('backArrow', leftButton);

        const rightButton = createElement('BUTTON', {
            parent: pageButtonWrapper,
            elementClass: ['page-button', 'page-button-right'],
            eventListener: ['click', () => {
                if (nextExists) {
                    HapticFeedback.light();
                    this.page++;
                    this.renderList(query);

                    mainView.scrollTo(0, 0);
                } else {
                    HapticFeedback.error();
                }
            }]
        });

        if (!nextExists) {
            rightButton.classList.add('disabled');
        }
        
        addImage('frontArrow', rightButton);
    }
}
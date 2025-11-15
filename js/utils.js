// Utility functions
function createElement(tag, config = {}) {
    const element = document.createElement(tag);

    if (config.ID) {
        element.id = config.ID;
    }

    if (config.elementClass) {
        if (Array.isArray(config.elementClass)) {
            config.elementClass.forEach(cls => element.classList.add(cls));
        } else {
            element.classList.add(config.elementClass);
        }
    }

    if (config.text) {
        element.innerText = config.text;
    }

    if (config.innerHTML) {
        element.innerHTML = config.innerHTML;
    }

    if (config.attributes) {
        for (const [key, value] of Object.entries(config.attributes)) {
            element.setAttribute(key, value);
        }
    }

    if (config.eventListener) {
        const [event, callback] = config.eventListener;
        element.addEventListener(event, callback);
    }

    if (config.parent) {
        config.parent.appendChild(element);
    }

    return element;
}

function addImage(label, element) {
    const imageWrapper = document.createElement('div');
    imageWrapper.innerHTML = images[label];
    imageWrapper.classList.add('image-wrapper');

    element.appendChild(imageWrapper);

    return element;
}

async function linkScripture(reference) {
    const scripturePattern = /^(?<book>(?:\d )?(?:[A-Za-z& ]+)+) (?<chapter>\d+)(?::(?<start>\d+)(?:-(?<end>\d+))?)?$/i;
    let link = '';

    if (reference.length <= 25 && scripturePattern.test(reference)) {
        const { book, chapter, start, end } = reference.match(scripturePattern).groups;

        for (const scripture in scriptures) {
            if (book in scriptures[scripture]) {
                const abbreviation = scriptures[scripture][book];

                link = `https://www.churchofjesuschrist.org/study/scriptures/${scripture}/${abbreviation}/${chapter}`;
                
                if (start) {
                    link += '.' + start;

                    if (end) {
                        link += '-' + end;
                    }
                }

                link += '?lang=' + languages[await quotebookDB.getSettings('settings-language', 'English')];
            }
        }
    }

    return link;
}

function hide(element) {
    element.classList.remove('slide-left', 'slide-right');
    element.classList.add('hide');
}

function show(element, side) {
    element.classList.remove('hide');
    element.classList.add('slide-' + side);
}
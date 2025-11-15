// SVG Icons collection
const images = {
    quote: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z"/></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/></svg>',
    backArrow: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>',
    frontArrow: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/></svg>'
};

// Language mappings for scripture links
const languages = {
    'English': 'eng',
    'Portuguese': 'por',
    'Spanish': 'spa',
    'Japanese': 'jpn'
};

// Scripture book abbreviations for different collections
const scriptures = {
    'ot': {
        'Genesis': 'gen',
        'Exodus': 'ex',
        'Leviticus': 'lev',
        'Numbers': 'num',
        'Deuteronomy': 'deut',
        'Joshua': 'josh',
        'Judges': 'judg',
        'Ruth': 'ruth',
        '1 Samuel': '1-sam',
        '2 Samuel': '2-sam',
        '1 Kings': '1-kgs',
        '2 Kings': '2-kgs',
        '1 Chronicles': '1-chr',
        '2 Chronicles': '2-chr',
        'Ezra': 'ezra',
        'Nehemiah': 'neh',
        'Esther': 'esth',
        'Job': 'job',
        'Psalms': 'ps',
        'Proverbs': 'prov',
        'Ecclesiastes': 'eccl',
        'Song of Solomon': 'song',
        'Isaiah': 'isa',
        'Jeremiah': 'jer',
        'Lamentations': 'lam',
        'Ezekiel': 'ezek',
        'Daniel': 'dan',
        'Hosea': 'hosea',
        'Joel': 'joel',
        'Amos': 'amos',
        'Obadiah': 'obad',
        'Jonah': 'jonah',
        'Micah': 'micah',
        'Nahum': 'nahum',
        'Habakkuk': 'hab',
        'Zephaniah': 'zeph',
        'Haggai': 'hag',
        'Zechariah': 'zech',
        'Malachi': 'mal'
    },
    'nt': {
        'Matthew': 'matt',
        'Mark': 'mark',
        'Luke': 'luke',
        'John': 'john',
        'Acts': 'acts',
        'Romans': 'rom',
        '1 Corinthians': '1-cor',
        '2 Corinthians': '2-cor',
        'Galatians': 'gal',
        'Ephesians': 'eph',
        'Philippians': 'philip',
        'Colossians': 'col',
        '1 Thessalonians': '1-thes',
        '2 Thessalonians': '2-thes',
        '1 Timothy': '1-tim',
        '2 Timothy': '2-tim',
        'Titus': 'titus',
        'Philemon': 'philem',
        'Hebrews': 'heb',
        'James': 'james',
        '1 Peter': '1-pet',
        '2 Peter': '2-pet',
        '1 John': '1-jn',
        '2 John': '2-jn',
        '3 John': '3-jn',
        'Jude': 'jude',
        'Revelation': 'rev'
    },
    'bofm': {
        '1 Nephi': '1-ne',
        '2 Nephi': '2-ne',
        'Jacob': 'jacob',
        'Enos': 'enos',
        'Jarom': 'jarom',
        'Omni': 'omni',
        'Words of Mormon': 'w-of-m',
        'Mosiah': 'mosiah',
        'Alma': 'alma',
        'Helaman': 'hel',
        '3 Nephi': '3-ne',
        '4 Nephi': '4-ne',
        'Mormon': 'morm',
        'Ether': 'ether',
        'Moroni': 'moro'
    },
    'dc-testament': {
        'Doctrine and Covenants': 'dc',
        'Official Declaration': 'od'
    },
    'pgp': {
        'Moses': 'moses',
        'Abraham': 'abr',
        'Joseph Smith Matthew': 'js-m',
        'Joseph Smith History': 'js-h',
        'Articles of Faith': 'a-of-f'
    }
};
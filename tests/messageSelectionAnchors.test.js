const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');
const popupJs = fs.readFileSync(path.join(root, 'popup.js'), 'utf8');

function loadPopup(storage) {
    const dom = new JSDOM(popupHtml, { runScripts: 'outside-only' });
    const { window } = dom;

    window.chrome = {
        storage: {
            sync: {
                get(keys, cb) {
                    const res = {};
                    if (typeof keys === 'string') res[keys] = storage[keys];
                    else if (Array.isArray(keys)) keys.forEach(k => { res[k] = storage[k]; });
                    else if (keys) Object.keys(keys).forEach(k => { res[k] = storage[k]; });
                    cb(res);
                },
                set(obj, cb) {
                    Object.assign(storage, obj);
                    if (cb) cb();
                }
            }
        },
        runtime: {},
        i18n: { getMessage: () => '' }
    };

    window.requestAnimationFrame = cb => setTimeout(cb, 0);

    window.eval(popupJs);
    window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true }));

    return { window, storage };
}

const keys = [
    'selectMessagesSentByUserOrChatGptCheckbox',
    'onlySelectAssistantCheckbox',
    'onlySelectUserCheckbox'
];

keys.forEach(key => {
    const { window, storage } = loadPopup({});
    const anchor = window.document.querySelector(`.message-selection-group a[data-setting="${key}"]`);
    anchor.click();
    keys.forEach(k => {
        const expected = k === key;
        assert.strictEqual(storage[k], expected, `Storage key ${k} should be ${expected} when clicking ${key}`);
    });
});

console.log('Message selection anchor click tests passed.');

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const popupJsPath = path.join(root, 'popup.js');
const popupCode = fs.readFileSync(popupJsPath, 'utf8');

function loadPopup(storage) {
    const html = '<!DOCTYPE html><input id="moveTopBarToBottomCheckbox" type="checkbox">';
    const dom = new JSDOM(html, { runScripts: 'outside-only' });
    const { window } = dom;

    const doc = window.document;
    const origGet = doc.getElementById.bind(doc);
    doc.getElementById = id => {
        const el = origGet(id);
        if (el) return el;
        const e = doc.createElement('input');
        e.id = id;
        doc.body.appendChild(e);
        return e;
    };

    window.chrome = {
        storage: {
            sync: {
                get(keys, cb) {
                    const res = {};
                    if (typeof keys === 'string') res[keys] = storage[keys];
                    else if (Array.isArray(keys)) keys.forEach(k => res[k] = storage[k]);
                    else if (keys) Object.keys(keys).forEach(k => res[k] = storage[k]);
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

    window.eval(popupCode);
    window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true }));

    return { window, storage };
}

let state = {};
let result = loadPopup(state);
assert.strictEqual(result.window.document.getElementById('moveTopBarToBottomCheckbox').checked, false);

state.moveTopBarToBottomCheckbox = true;
result = loadPopup(state);
assert.strictEqual(result.window.document.getElementById('moveTopBarToBottomCheckbox').checked, true);

state.moveTopBarToBottomCheckbox = false;
result = loadPopup(state);
assert.strictEqual(result.window.document.getElementById('moveTopBarToBottomCheckbox').checked, false);

console.log('Popup checkbox state test passed.');

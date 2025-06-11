// settings.js
// ✅ Safe to include via <script src="settings.js"> in popup.html and used in content.js
// ✅ No imports, no modules — just classic global helper functions

/**
 * Load values from chrome.storage.sync for the given keys.
 * @param {string[]} keys - Array of keys to load
 * @param {function} callback - Function that receives the results object
 */
function loadSyncedSettings(keys, callback) {
    chrome.storage.sync.get(keys, (data) => {
        if (chrome.runtime.lastError) {
            console.error('loadSyncedSettings error:', chrome.runtime.lastError);
            callback({});
        } else {
            callback(data);
        }
    });
}

/**
 * Save a single key-value pair to chrome.storage.sync.
 * @param {string} key - The key to save
 * @param {*} value - The value to store
 */
function saveSyncedSetting(key, value) {
    chrome.storage.sync.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
            console.error(`Failed to save ${key}:`, chrome.runtime.lastError);
        }
    });
}

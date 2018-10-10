"use strict";
/* tslint:disable:no-reference */
/// <reference path="../models/encryption.ts" />
/// <reference path="../models/interface.ts" />
/// <reference path="../models/storage.ts" />
/// <reference path="./ui.ts" />
/// <reference path="./add-account.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getEntries(encryption) {
    return __awaiter(this, void 0, void 0, function* () {
        const optEntries = yield EntryStorage.get(encryption);
        return optEntries;
    });
}
/* tslint:disable-next-line:no-any */
function updateCode(app) {
    return __awaiter(this, void 0, void 0, function* () {
        let second = new Date().getSeconds();
        if (localStorage.offset) {
            // prevent second from negative
            second += Number(localStorage.offset) + 60;
        }
        second = second % 60;
        app.second = second;
        // only when sector is not started (timer is not initialized),
        // passphrase box should not be shown (no passphrase set) or
        // there are entiries shown and passphrase box isn't shown (the user has
        // already provided password)
        if (!app.sectorStart &&
            (!app.shouldShowPassphrase ||
                app.entries.length > 0 && app.info !== 'passphrase')) {
            app.sectorStart = true;
            app.sectorOffset = -second;
        }
        // if (second > 25) {
        //   app.class.timeout = true;
        // } else {
        //   app.class.timeout = false;
        // }
        // if (second < 1) {
        //   const entries = app.entries as OTP[];
        //   for (let i = 0; i < entries.length; i++) {
        //     if (entries[i].type !== OTPType.hotp &&
        //         entries[i].type !== OTPType.hhex) {
        //       entries[i].generate();
        //     }
        //   }
        // }
        const entries = app.entries;
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].type !== OTPType.hotp && entries[i].type !== OTPType.hhex) {
                entries[i].generate();
            }
        }
    });
}
function getBackupFile(entryData) {
    let json = JSON.stringify(entryData, null, 2);
    // for windows notepad
    json = json.replace(/\n/g, '\r\n');
    const base64Data = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(json));
    return `data:application/octet-stream;base64,${base64Data}`;
}
function getSiteName() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
                const tab = tabs[0];
                if (!tab) {
                    return resolve([null, null]);
                }
                const title = tab.title ?
                    tab.title.replace(/[^a-z0-9]/ig, '').toLowerCase() :
                    null;
                if (!tab.url) {
                    return resolve([title, null]);
                }
                const urlParser = document.createElement('a');
                urlParser.href = tab.url;
                const hostname = urlParser.hostname.toLowerCase();
                // try to parse name from hostname
                // i.e. hostname is www.example.com
                // name should be example
                let nameFromDomain = '';
                // ip address
                if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
                    nameFromDomain = hostname;
                }
                // local network
                if (hostname.indexOf('.') === -1) {
                    nameFromDomain = hostname;
                }
                const hostLevelUnits = hostname.split('.');
                if (hostLevelUnits.length === 2) {
                    nameFromDomain = hostLevelUnits[0];
                }
                // www.example.com
                // example.com.cn
                if (hostLevelUnits.length > 2) {
                    // example.com.cn
                    if (['com', 'net', 'org', 'edu', 'gov', 'co'].indexOf(hostLevelUnits[hostLevelUnits.length - 2]) !== -1) {
                        nameFromDomain = hostLevelUnits[hostLevelUnits.length - 3];
                    }
                    else {
                        nameFromDomain = hostLevelUnits[hostLevelUnits.length - 2];
                    }
                }
                nameFromDomain = nameFromDomain.replace(/-/g, '').toLowerCase();
                return resolve([title, nameFromDomain, hostname]);
            });
        });
    });
}
function hasMatchedEntry(siteName, entries) {
    if (siteName.length < 2) {
        return false;
    }
    for (let i = 0; i < entries.length; i++) {
        if (isMatchedEntry(siteName, entries[i])) {
            return true;
        }
    }
    return false;
}
function isMatchedEntry(siteName, entry) {
    if (!entry.issuer) {
        return false;
    }
    const issuerHostMatches = entry.issuer.split('::');
    const issuer = issuerHostMatches[0].replace(/[^0-9a-z]/ig, '').toLowerCase();
    if (!issuer) {
        return false;
    }
    const siteTitle = siteName[0] || '';
    const siteNameFromHost = siteName[1] || '';
    const siteHost = siteName[2] || '';
    if (issuerHostMatches.length > 1) {
        if (siteHost && siteHost.indexOf(issuerHostMatches[1]) !== -1) {
            return true;
        }
    }
    // site title should be more detailed
    // so we use siteTitle.indexOf(issuer)
    if (siteTitle && siteTitle.indexOf(issuer) !== -1) {
        return true;
    }
    if (siteNameFromHost && issuer.indexOf(siteNameFromHost) !== -1) {
        return true;
    }
    return false;
}
function getCachedPassphrase() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const cookie = document.cookie;
            const cookieMatch = cookie ? document.cookie.match(/passphrase=([^;]*)/) : null;
            const cachedPassphrase = cookieMatch && cookieMatch.length > 1 ? cookieMatch[1] : null;
            const cachedPassphraseLocalStorage = localStorage.encodedPhrase ?
                CryptoJS.AES.decrypt(localStorage.encodedPhrase, '')
                    .toString(CryptoJS.enc.Utf8) :
                '';
            if (cachedPassphrase || cachedPassphraseLocalStorage) {
                return resolve(cachedPassphrase || cachedPassphraseLocalStorage);
            }
            chrome.runtime.sendMessage({ action: 'passphrase' }, (passphrase) => {
                return resolve(passphrase);
            });
        });
    });
}
function entry(_ui) {
    return __awaiter(this, void 0, void 0, function* () {
        const cachedPassphrase = yield getCachedPassphrase();
        const encryption = new Encryption(cachedPassphrase);
        let shouldShowPassphrase = cachedPassphrase ? false : yield EntryStorage.hasEncryptedEntry();
        const exportData = shouldShowPassphrase ? {} : yield EntryStorage.getExport(encryption);
        const exportEncData = shouldShowPassphrase ?
            {} :
            yield EntryStorage.getExport(encryption, true);
        const entries = shouldShowPassphrase ? [] : yield getEntries(encryption);
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].code === 'Encrypted') {
                shouldShowPassphrase = true;
                break;
            }
        }
        const exportFile = getBackupFile(exportData);
        const exportEncryptedFile = getBackupFile(exportEncData);
        const siteName = yield getSiteName();
        const shouldFilter = hasMatchedEntry(siteName, entries);
        const showSearch = false;
        const ui = {
            data: {
                entries,
                encryption,
                OTPType,
                shouldShowPassphrase,
                exportData: JSON.stringify(exportData, null, 2),
                exportEncData: JSON.stringify(exportEncData, null, 2),
                exportFile,
                exportEncryptedFile,
                getFilePassphrase: false,
                sector: '',
                sectorStart: false,
                sectorOffset: 0,
                second: 0,
                notification: '',
                notificationTimeout: 0,
                filter: true,
                shouldFilter,
                showSearch,
                importType: 'import_file',
                importCode: '',
                importEncrypted: false,
                importPassphrase: '',
                importFilePassphrase: ''
            },
            methods: {
                isMatchedEntry: (entry) => {
                    return isMatchedEntry(siteName, entry);
                },
                searchListener: (e) => {
                    if (e.keyCode === 191) {
                        if (_ui.instance.info !== '') {
                            return;
                        }
                        _ui.instance.filter = false;
                        // It won't focus the texfield if vue unhides the div
                        //_ui.instance.showSearch = true;
                        const searchDiv = document.getElementById('search');
                        const searchInput = document.getElementById('searchInput');
                        if (!searchInput || !searchDiv) {
                            return;
                        }
                        searchDiv.style.display = 'block';
                        searchInput.focus();
                    }
                },
                searchUpdate: () => {
                    if (_ui.instance.filter) {
                        _ui.instance.filter = false;
                    }
                    if (!_ui.instance.showSearch) {
                        _ui.instance.showSearch = true;
                    }
                },
                isSearchedEntry: (entry) => {
                    if (_ui.instance.searchText === '') {
                        return true;
                    }
                    if (entry.issuer.toLowerCase().includes(_ui.instance.searchText.toLowerCase()) ||
                        entry.account.toLowerCase().includes(_ui.instance.searchText.toLowerCase())) {
                        return true;
                    }
                    else {
                        return false;
                    }
                },
                updateCode: () => __awaiter(this, void 0, void 0, function* () {
                    return yield updateCode(_ui.instance);
                }),
                decryptBackupData: (backupData, passphrase) => {
                    const decryptedbackupData = {};
                    for (const hash of Object.keys(backupData)) {
                        if (typeof backupData[hash] !== 'object') {
                            continue;
                        }
                        if (!backupData[hash].secret) {
                            continue;
                        }
                        if (backupData[hash].encrypted && !passphrase) {
                            continue;
                        }
                        if (backupData[hash].encrypted && passphrase) {
                            try {
                                backupData[hash].secret =
                                    CryptoJS.AES.decrypt(backupData[hash].secret, passphrase)
                                        .toString(CryptoJS.enc.Utf8);
                                backupData[hash].encrypted = false;
                            }
                            catch (error) {
                                continue;
                            }
                        }
                        // backupData[hash].secret may be empty after decrypt with wrong
                        // passphrase
                        if (!backupData[hash].secret) {
                            continue;
                        }
                        decryptedbackupData[hash] = backupData[hash];
                    }
                    return decryptedbackupData;
                },
                importBackupCode: () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const exportData = JSON.parse(_ui.instance.importCode);
                        const passphrase = _ui.instance.importEncrypted && _ui.instance.importPassphrase ?
                            _ui.instance.importPassphrase :
                            null;
                        const decryptedbackupData = _ui.instance.decryptBackupData(exportData, passphrase);
                        if (Object.keys(decryptedbackupData).length) {
                            yield EntryStorage.import(_ui.instance.encryption, decryptedbackupData);
                            yield _ui.instance.updateEntries();
                            alert(_ui.instance.i18n.updateSuccess);
                            window.close();
                        }
                        else {
                            alert(_ui.instance.i18n.updateFailure);
                        }
                        return;
                    }
                    catch (error) {
                        throw error;
                    }
                }),
                noCopy: (code) => {
                    return code === 'Encrypted' || code === 'Invalid' ||
                        code.startsWith('&bull;');
                },
                updateStorage: () => __awaiter(this, void 0, void 0, function* () {
                    yield EntryStorage.set(_ui.instance.encryption, _ui.instance.entries);
                    return;
                }),
                showBulls: (code) => {
                    if (code.startsWith('&bull;')) {
                        return code;
                    }
                    return new Array(code.length).fill('&bull;').join('');
                },
                importEntries: () => __awaiter(this, void 0, void 0, function* () {
                    yield EntryStorage.import(_ui.instance.encryption, JSON.parse(_ui.instance.exportData));
                    yield _ui.instance.updateEntries();
                    _ui.instance.alert(_ui.instance.i18n.updateSuccess);
                    return;
                }),
                updateEntries: () => __awaiter(this, void 0, void 0, function* () {
                    const exportData = yield EntryStorage.getExport(_ui.instance.encryption);
                    const exportEncData = yield EntryStorage.getExport(_ui.instance.encryption, true);
                    _ui.instance.exportData = JSON.stringify(exportData, null, 2);
                    _ui.instance.entries = yield getEntries(_ui.instance.encryption);
                    _ui.instance.exportFile = getBackupFile(exportData);
                    _ui.instance.exportEncryptedFile = getBackupFile(exportEncData);
                    yield _ui.instance.updateCode();
                    return;
                }),
                getOldPassphrase: () => __awaiter(this, void 0, void 0, function* () {
                    _ui.instance.getFilePassphrase = true;
                    while (true) {
                        if (_ui.instance.readFilePassphrase) {
                            if (_ui.instance.importFilePassphrase) {
                                _ui.instance.readFilePassphrase = false;
                                break;
                            }
                            else {
                                _ui.instance.readFilePassphrase = false;
                            }
                        }
                        yield new Promise(resolve => setTimeout(resolve, 250));
                    }
                    return _ui.instance.importFilePassphrase;
                }),
                importFile: (event, closeWindow) => {
                    const target = event.target;
                    if (!target || !target.files) {
                        return;
                    }
                    if (target.files[0]) {
                        const reader = new FileReader();
                        let decryptedFileData = {};
                        reader.onload = () => __awaiter(this, void 0, void 0, function* () {
                            const importData = JSON.parse(reader.result);
                            let encrypted = false;
                            for (const hash in importData) {
                                if (importData[hash].encrypted) {
                                    encrypted = true;
                                    try {
                                        const oldPassphrase = yield _ui.instance.getOldPassphrase();
                                        decryptedFileData =
                                            _ui.instance.decryptBackupData(importData, oldPassphrase);
                                        break;
                                    }
                                    catch (_a) {
                                        break;
                                    }
                                }
                            }
                            if (!encrypted) {
                                decryptedFileData = importData;
                            }
                            if (Object.keys(decryptedFileData).length) {
                                yield EntryStorage.import(_ui.instance.encryption, decryptedFileData);
                                yield _ui.instance.updateEntries();
                                alert(_ui.instance.i18n.updateSuccess);
                                if (closeWindow) {
                                    window.close();
                                }
                            }
                            else {
                                alert(_ui.instance.i18n.updateFailure);
                                _ui.instance.getFilePassphrase = false;
                                _ui.instance.importFilePassphrase = '';
                            }
                        });
                        reader.readAsText(target.files[0]);
                    }
                    else {
                        _ui.instance.alert(_ui.instance.i18n.updateFailure);
                        if (closeWindow) {
                            window.alert(_ui.instance.i18n.updateFailure);
                            window.close();
                        }
                    }
                    return;
                },
                removeEntry: (entry) => __awaiter(this, void 0, void 0, function* () {
                    if (yield _ui.instance.confirm(_ui.instance.i18n.confirm_delete)) {
                        yield entry.delete();
                        yield _ui.instance.updateEntries();
                    }
                    return;
                }),
                editEntry: () => {
                    _ui.instance.class.edit = !_ui.instance.class.edit;
                    const codes = document.getElementById('codes');
                    if (codes) {
                        // wait vue apply changes to dom
                        setTimeout(() => {
                            codes.scrollTop = _ui.instance.class.edit ? codes.scrollHeight : 0;
                        }, 0);
                    }
                    return;
                },
                nextCode: (entry) => __awaiter(this, void 0, void 0, function* () {
                    if (_ui.instance.class.Diabled) {
                        return;
                    }
                    _ui.instance.class.hotpDiabled = true;
                    yield entry.next(_ui.instance.encryption);
                    setTimeout(() => {
                        _ui.instance.class.hotpDiabled = false;
                    }, 3000);
                    return;
                }),
                copyCode: (entry) => __awaiter(this, void 0, void 0, function* () {
                    if (_ui.instance.class.edit || entry.code === 'Invalid' ||
                        entry.code.startsWith('&bull;')) {
                        return;
                    }
                    if (entry.code === 'Encrypted') {
                        _ui.instance.showInfo('passphrase');
                        return;
                    }
                    if (navigator.userAgent.indexOf('Edge') !== -1) {
                        const codeClipboard = document.getElementById('codeClipboard');
                        if (!codeClipboard) {
                            return;
                        }
                        if (_ui.instance.useAutofill) {
                            yield insertContentScript();
                            chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
                                const tab = tabs[0];
                                if (!tab || !tab.id) {
                                    return;
                                }
                                chrome.tabs.sendMessage(tab.id, { action: 'pastecode', code: entry.code });
                            });
                        }
                        codeClipboard.value = entry.code;
                        codeClipboard.focus();
                        codeClipboard.select();
                        document.execCommand('Copy');
                        _ui.instance.notification = _ui.instance.i18n.copied;
                        clearTimeout(_ui.instance.notificationTimeout);
                        _ui.instance.class.notificationFadein = true;
                        _ui.instance.class.notificationFadeout = false;
                        _ui.instance.notificationTimeout = setTimeout(() => {
                            _ui.instance.class.notificationFadein = false;
                            _ui.instance.class.notificationFadeout = true;
                            setTimeout(() => {
                                _ui.instance.class.notificationFadeout = false;
                            }, 200);
                        }, 1000);
                    }
                    else {
                        chrome.permissions.request({ permissions: ['clipboardWrite'] }, (granted) => __awaiter(this, void 0, void 0, function* () {
                            if (granted) {
                                const codeClipboard = document.getElementById('codeClipboard');
                                if (!codeClipboard) {
                                    return;
                                }
                                if (_ui.instance.useAutofill) {
                                    yield insertContentScript();
                                    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
                                        const tab = tabs[0];
                                        if (!tab || !tab.id) {
                                            return;
                                        }
                                        chrome.tabs.sendMessage(tab.id, { action: 'pastecode', code: entry.code });
                                    });
                                }
                                codeClipboard.value = entry.code;
                                codeClipboard.focus();
                                codeClipboard.select();
                                document.execCommand('Copy');
                                _ui.instance.notification = _ui.instance.i18n.copied;
                                clearTimeout(_ui.instance.notificationTimeout);
                                _ui.instance.class.notificationFadein = true;
                                _ui.instance.class.notificationFadeout = false;
                                _ui.instance.notificationTimeout = setTimeout(() => {
                                    _ui.instance.class.notificationFadein = false;
                                    _ui.instance.class.notificationFadeout = true;
                                    setTimeout(() => {
                                        _ui.instance.class.notificationFadeout = false;
                                    }, 200);
                                }, 1000);
                            }
                        }));
                    }
                    return;
                }),
            }
        };
        _ui.update(ui);
    });
}
//# sourceMappingURL=entry.js.map
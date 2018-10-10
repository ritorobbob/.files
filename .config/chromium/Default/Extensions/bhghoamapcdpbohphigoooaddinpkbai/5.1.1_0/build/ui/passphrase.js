"use strict";
/* tslint:disable:no-reference */
/// <reference path="../models/interface.ts" />
/// <reference path="./ui.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function cachePassword(password) {
    document.cookie = 'passphrase=' + password;
    chrome.runtime.sendMessage({ action: 'cachePassphrase', value: password });
}
function passphrase(_ui) {
    return __awaiter(this, void 0, void 0, function* () {
        const ui = {
            data: { passphrase: '' },
            methods: {
                lock: () => {
                    document.cookie = 'passphrase=";expires=Thu, 01 Jan 1970 00:00:00 GMT"';
                    chrome.runtime.sendMessage({ action: 'lock' }, window.close);
                    return;
                },
                removePassphrase: () => __awaiter(this, void 0, void 0, function* () {
                    _ui.instance.newPassphrase.phrase = '';
                    _ui.instance.newPassphrase.confirm = '';
                    yield _ui.instance.changePassphrase();
                    return;
                }),
                applyPassphrase: () => __awaiter(this, void 0, void 0, function* () {
                    if (!_ui.instance.passphrase) {
                        return;
                    }
                    _ui.instance.encryption.updateEncryptionPassword(_ui.instance.passphrase);
                    yield _ui.instance.updateEntries();
                    _ui.instance.closeInfo();
                    cachePassword(_ui.instance.passphrase);
                    return;
                }),
                changePassphrase: () => __awaiter(this, void 0, void 0, function* () {
                    if (_ui.instance.newPassphrase.phrase !==
                        _ui.instance.newPassphrase.confirm) {
                        _ui.instance.alert(_ui.instance.i18n.phrase_not_match);
                        return;
                    }
                    _ui.instance.encryption.updateEncryptionPassword(_ui.instance.newPassphrase.phrase);
                    cachePassword(_ui.instance.newPassphrase.phrase);
                    yield _ui.instance.importEntries();
                    // remove cached passphrase in old version
                    localStorage.removeItem('encodedPhrase');
                    return;
                })
            }
        };
        _ui.update(ui);
    });
}
//# sourceMappingURL=passphrase.js.map
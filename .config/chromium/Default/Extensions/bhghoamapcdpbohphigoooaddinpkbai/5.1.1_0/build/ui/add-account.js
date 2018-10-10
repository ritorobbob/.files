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
function insertContentScript() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            try {
                return chrome.tabs.executeScript({ file: '/build/content.js' }, () => {
                    chrome.tabs.insertCSS({ file: '/css/content.css' }, resolve);
                });
            }
            catch (error) {
                return reject(error);
            }
        });
    });
}
function addAccount(_ui) {
    return __awaiter(this, void 0, void 0, function* () {
        const ui = {
            data: {
                newAccount: { show: false, account: '', secret: '', type: OTPType.totp },
                newPassphrase: { phrase: '', confirm: '' }
            },
            methods: {
                addNewAccount: () => __awaiter(this, void 0, void 0, function* () {
                    _ui.instance.newAccount.secret =
                        _ui.instance.newAccount.secret.replace(/ /g, '');
                    if (!/^[a-z2-7]+=*$/i.test(_ui.instance.newAccount.secret) &&
                        !/^[0-9a-f]+$/i.test(_ui.instance.newAccount.secret)) {
                        _ui.instance.alert(_ui.instance.i18n.errorsecret + _ui.instance.newAccount.secret);
                        return;
                    }
                    let type;
                    if (!/^[a-z2-7]+=*$/i.test(_ui.instance.newAccount.secret) &&
                        /^[0-9a-f]+$/i.test(_ui.instance.newAccount.secret) &&
                        _ui.instance.newAccount.type === 'totp') {
                        type = OTPType.hex;
                    }
                    else if (!/^[a-z2-7]+=*$/i.test(_ui.instance.newAccount.secret) &&
                        /^[0-9a-f]+$/i.test(_ui.instance.newAccount.secret) &&
                        _ui.instance.newAccount.type === 'hotp') {
                        type = OTPType.hhex;
                    }
                    else {
                        type = _ui.instance.newAccount.type;
                    }
                    const entry = new OTPEntry(type, '', _ui.instance.newAccount.secret, _ui.instance.newAccount.account, 0, 0);
                    yield entry.create(_ui.instance.encryption);
                    yield _ui.instance.updateEntries();
                    _ui.instance.newAccount.type = OTPType.totp;
                    _ui.instance.account = '';
                    _ui.instance.secret = '';
                    _ui.instance.newAccount.show = false;
                    _ui.instance.closeInfo();
                    _ui.instance.class.edit = false;
                    const codes = document.getElementById('codes');
                    if (codes) {
                        // wait vue apply changes to dom
                        setTimeout(() => {
                            codes.scrollTop = 0;
                        }, 0);
                    }
                    return;
                }),
                beginCapture: () => __awaiter(this, void 0, void 0, function* () {
                    yield insertContentScript();
                    const entries = _ui.instance.entries;
                    for (let i = 0; i < entries.length; i++) {
                        // we have encrypted entry
                        // the current passphrase is incorrect
                        // shouldn't add new account with
                        // the current passphrase
                        if (entries[i].code === 'Encrypted') {
                            _ui.instance.alert(_ui.instance.i18n.phrase_incorrect);
                            return;
                        }
                    }
                    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
                        const tab = tabs[0];
                        if (!tab || !tab.id) {
                            return;
                        }
                        chrome.tabs.sendMessage(tab.id, { action: 'capture', passphrase: _ui.instance.passphrase }, (result) => {
                            if (result !== 'beginCapture') {
                                _ui.instance.alert(_ui.instance.i18n.capture_failed);
                            }
                            else {
                                window.close();
                            }
                        });
                    });
                    return;
                }),
                addAccountManually: () => {
                    const entries = _ui.instance.entries;
                    for (let i = 0; i < entries.length; i++) {
                        // we have encrypted entry
                        // the current passphrase is incorrect
                        // shouldn't add new account with
                        // the current passphrase
                        if (entries[i].code === 'Encrypted') {
                            _ui.instance.alert(_ui.instance.i18n.phrase_incorrect);
                            return;
                        }
                    }
                    _ui.instance.newAccount.show = true;
                }
            }
        };
        _ui.update(ui);
    });
}
//# sourceMappingURL=add-account.js.map
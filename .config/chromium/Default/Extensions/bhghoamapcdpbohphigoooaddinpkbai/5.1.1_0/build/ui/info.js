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
function info(_ui) {
    return __awaiter(this, void 0, void 0, function* () {
        const ui = {
            data: { info: '', dropboxToken: localStorage.dropboxToken || '' },
            methods: {
                getDropboxToken: () => {
                    chrome.runtime.sendMessage({ action: 'dropbox' });
                },
                logoutDropbox: () => __awaiter(this, void 0, void 0, function* () {
                    localStorage.removeItem('dropboxToken');
                    _ui.instance.dropboxToken = '';
                    _ui.instance.openLink('https://www.dropbox.com/account/connected_apps');
                }),
                showInfo: (tab) => {
                    if (tab === 'export' || tab === 'security') {
                        const entries = _ui.instance.entries;
                        for (let i = 0; i < entries.length; i++) {
                            // we have encrypted entry
                            // the current passphrase is incorrect
                            // cannot export account data
                            // or change passphrase
                            if (entries[i].code === 'Encrypted') {
                                _ui.instance.alert(_ui.instance.i18n.phrase_incorrect);
                                return;
                            }
                        }
                    }
                    else if (tab === 'dropbox') {
                        chrome.permissions.request({ origins: ['https://*.dropboxapi.com/*'] }, (granted) => __awaiter(this, void 0, void 0, function* () {
                            if (granted) {
                                _ui.instance.class.fadein = true;
                                _ui.instance.class.fadeout = false;
                                _ui.instance.info = tab;
                            }
                            return;
                        }));
                        return;
                    }
                    _ui.instance.class.fadein = true;
                    _ui.instance.class.fadeout = false;
                    _ui.instance.info = tab;
                    return;
                },
                closeInfo: () => {
                    _ui.instance.class.fadein = false;
                    _ui.instance.class.fadeout = true;
                    setTimeout(() => {
                        _ui.instance.class.fadeout = false;
                        _ui.instance.info = '';
                        _ui.instance.newAccount.show = false;
                    }, 200);
                    return;
                }
            }
        };
        _ui.update(ui);
    });
}
//# sourceMappingURL=info.js.map
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
function loadI18nMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            try {
                const xhr = new XMLHttpRequest();
                xhr.overrideMimeType('application/json');
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        const i18nMessage = JSON.parse(xhr.responseText);
                        const i18nData = {};
                        for (const key of Object.keys(i18nMessage)) {
                            i18nData[key] = chrome.i18n.getMessage(key);
                        }
                        return resolve(i18nData);
                    }
                    return;
                };
                xhr.open('GET', chrome.extension.getURL('/_locales/en/messages.json'));
                xhr.send();
            }
            catch (error) {
                return reject(error);
            }
        });
    });
}
function i18n(_ui) {
    return __awaiter(this, void 0, void 0, function* () {
        const i18n = yield loadI18nMessages();
        const ui = { data: { i18n } };
        _ui.update(ui);
    });
}
//# sourceMappingURL=i18n.js.map
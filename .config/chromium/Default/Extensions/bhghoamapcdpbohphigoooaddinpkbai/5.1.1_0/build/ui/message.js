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
function isCustomEvent(event) {
    return 'detail' in event;
}
function message(_ui) {
    return __awaiter(this, void 0, void 0, function* () {
        const ui = {
            data: { message: [], messageIdle: true, confirmMessage: '' },
            methods: {
                alert: (message) => {
                    _ui.instance.message.unshift(message);
                },
                closeAlert: () => {
                    _ui.instance.messageIdle = false;
                    _ui.instance.message.shift();
                    setTimeout(() => {
                        _ui.instance.messageIdle = true;
                    }, 200);
                },
                confirm: (message) => __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => {
                        _ui.instance.confirmMessage = message;
                        window.addEventListener('confirm', (event) => {
                            _ui.instance.confirmMessage = '';
                            if (!isCustomEvent(event)) {
                                return resolve(false);
                            }
                            return resolve(event.detail);
                        });
                        return;
                    });
                }),
                confirmOK: () => {
                    const confirmEvent = new CustomEvent('confirm', { detail: true });
                    window.dispatchEvent(confirmEvent);
                    return;
                },
                confirmCancel: () => {
                    const confirmEvent = new CustomEvent('confirm', { detail: false });
                    window.dispatchEvent(confirmEvent);
                    return;
                }
            }
        };
        _ui.update(ui);
    });
}
//# sourceMappingURL=message.js.map
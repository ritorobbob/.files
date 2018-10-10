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
function className(_ui) {
    return __awaiter(this, void 0, void 0, function* () {
        const ui = {
            data: {
                class: {
                    timeout: false,
                    edit: false,
                    slidein: false,
                    slideout: false,
                    fadein: false,
                    fadeout: false,
                    qrfadein: false,
                    qrfadeout: false,
                    notificationFadein: false,
                    notificationFadeout: false,
                    hotpDiabled: false
                }
            }
        };
        _ui.update(ui);
    });
}
//# sourceMappingURL=class.js.map
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
function getQrUrl(entry) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const label = entry.issuer ? (entry.issuer + ':' + entry.account) : entry.account;
            const type = entry.type === OTPType.hex ?
                OTPType[OTPType.totp] :
                (entry.type === OTPType.hhex ? OTPType[OTPType.hotp] :
                    OTPType[entry.type]);
            const otpauth = 'otpauth://' + type + '/' + label +
                '?secret=' + entry.secret +
                (entry.issuer ? ('&issuer=' + entry.issuer.split('::')[0]) : '') +
                ((entry.type === OTPType.hotp || entry.type === OTPType.hhex) ?
                    ('&counter=' + entry.counter) :
                    '') +
                (entry.type === OTPType.totp && entry.period ?
                    ('&period=' + entry.period) :
                    '');
            /* tslint:disable-next-line:no-unused-expression */
            new QRCode('qr', {
                text: otpauth,
                width: 128,
                height: 128,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.L
            }, resolve);
            return;
        });
    });
}
function qr(_ui) {
    return __awaiter(this, void 0, void 0, function* () {
        const ui = {
            data: { qr: '' },
            methods: {
                shouldShowQrIcon: (entry) => {
                    return entry.secret !== 'Encrypted' && entry.type !== OTPType.battle &&
                        entry.type !== OTPType.steam;
                },
                showQr: (entry) => __awaiter(this, void 0, void 0, function* () {
                    const qrUrl = yield getQrUrl(entry);
                    _ui.instance.qr = `url(${qrUrl})`;
                    _ui.instance.class.qrfadein = true;
                    _ui.instance.class.qrfadeout = false;
                    return;
                }),
                hideQr: () => {
                    _ui.instance.class.qrfadein = false;
                    _ui.instance.class.qrfadeout = true;
                    setTimeout(() => {
                        _ui.instance.class.qrfadeout = false;
                    }, 200);
                    return;
                }
            }
        };
        _ui.update(ui);
    });
}
//# sourceMappingURL=qr.js.map
"use strict";
/* tslint:disable:no-reference */
/// <reference path="../../node_modules/@types/crypto-js/index.d.ts" />
/// <reference path="./encryption.ts" />
/// <reference path="./interface.ts" />
/// <reference path="./key-utilities.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class OTPEntry {
    constructor(type, issuer, secret, account, index, counter, period, hash) {
        this.code = '&bull;&bull;&bull;&bull;&bull;&bull;';
        this.type = type;
        this.index = index;
        this.issuer = issuer;
        this.secret = secret;
        this.account = account;
        this.hash = hash && /^[0-9a-f]{32}$/.test(hash) ?
            hash :
            CryptoJS.MD5(secret).toString();
        this.counter = counter;
        if (this.type === OTPType.totp && period) {
            this.period = period;
        }
        else {
            this.period = 30;
        }
        if (this.type !== OTPType.hotp && this.type !== OTPType.hhex) {
            this.generate();
        }
    }
    create(encryption) {
        return __awaiter(this, void 0, void 0, function* () {
            yield EntryStorage.add(encryption, this);
            return;
        });
    }
    update(encryption) {
        return __awaiter(this, void 0, void 0, function* () {
            yield EntryStorage.update(encryption, this);
            return;
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            yield EntryStorage.delete(this);
            return;
        });
    }
    next(encryption) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.type !== OTPType.hotp && this.type !== OTPType.hhex) {
                return;
            }
            this.generate();
            this.counter++;
            yield this.update(encryption);
            return;
        });
    }
    generate() {
        if (this.secret === 'Encrypted') {
            this.code = 'Encrypted';
        }
        else {
            try {
                this.code = KeyUtilities.generate(this.type, this.secret, this.counter, this.period);
            }
            catch (error) {
                this.code = 'Invalid';
                if (parent) {
                    parent.postMessage(`Invalid secret: [${this.secret}]`, '*');
                }
            }
        }
    }
}
//# sourceMappingURL=otp.js.map
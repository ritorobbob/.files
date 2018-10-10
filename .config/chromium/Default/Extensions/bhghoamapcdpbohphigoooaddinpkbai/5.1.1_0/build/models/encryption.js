"use strict";
/* tslint:disable:no-reference */
/// <reference path="../../node_modules/@types/crypto-js/index.d.ts" />
class Encryption {
    constructor(password) {
        this.password = password;
    }
    getEncryptedSecret(secret) {
        if (!this.password) {
            return secret;
        }
        return CryptoJS.AES.encrypt(secret, this.password).toString();
    }
    getDecryptedSecret(secret, hash) {
        if (!this.password) {
            return secret;
        }
        try {
            let decryptedSecret = CryptoJS.AES.decrypt(secret, this.password)
                .toString(CryptoJS.enc.Utf8);
            if (!decryptedSecret) {
                return 'Encrypted';
            }
            if (decryptedSecret.length < 8) {
                return 'Encrypted';
            }
            if (hash === CryptoJS.MD5(decryptedSecret).toString()) {
                return decryptedSecret;
            }
            decryptedSecret = decryptedSecret.replace(/ /g, '');
            if (!/^[a-z2-7]+=*$/i.test(decryptedSecret) &&
                !/^[0-9a-f]+$/i.test(decryptedSecret) &&
                !/^blz\-/.test(decryptedSecret) && !/^bliz\-/.test(decryptedSecret) &&
                !/^stm\-/.test(decryptedSecret)) {
                return 'Encrypted';
            }
            return decryptedSecret;
        }
        catch (error) {
            return 'Encrypted';
        }
    }
    getEncryptionStatus() {
        return this.password ? true : false;
    }
    updateEncryptionPassword(password) {
        this.password = password;
    }
}
//# sourceMappingURL=encryption.js.map
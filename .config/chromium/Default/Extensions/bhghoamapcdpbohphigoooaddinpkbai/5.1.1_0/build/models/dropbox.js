"use strict";
/* tslint:disable:no-reference */
/// <reference path="../models/encryption.ts" />
/// <reference path="../models/interface.ts" />
/// <reference path="./storage.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Dropbox {
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return localStorage.dropboxToken || '';
        });
    }
    upload(encryption) {
        return __awaiter(this, void 0, void 0, function* () {
            const exportData = yield EntryStorage.getExport(encryption);
            for (const hash of Object.keys(exportData)) {
                if (exportData[hash].encrypted) {
                    throw new Error('Error passphrase.');
                }
            }
            const backup = JSON.stringify(exportData, null, 2);
            const url = 'https://content.dropboxapi.com/2/files/upload';
            const token = yield this.getToken();
            return new Promise((resolve, reject) => {
                if (!token) {
                    resolve(false);
                }
                try {
                    const xhr = new XMLHttpRequest();
                    const now = (new Date()).toISOString().slice(0, 10).replace(/-/g, '');
                    const apiArg = {
                        path: `/${now}.json`,
                        mode: 'add',
                        autorename: true
                    };
                    xhr.open('POST', url);
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                    xhr.setRequestHeader('Content-type', 'application/octet-stream');
                    xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify(apiArg));
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 401) {
                                localStorage.removeItem('dropboxToken');
                                resolve(false);
                            }
                            try {
                                const res = JSON.parse(xhr.responseText);
                                if (res.name) {
                                    resolve(true);
                                }
                                else {
                                    resolve(false);
                                }
                            }
                            catch (error) {
                                reject(error);
                            }
                        }
                        return;
                    };
                    xhr.send(backup);
                }
                catch (error) {
                    return reject(error);
                }
            });
        });
    }
}
//# sourceMappingURL=dropbox.js.map
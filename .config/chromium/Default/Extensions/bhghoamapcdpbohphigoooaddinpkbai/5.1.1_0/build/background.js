"use strict";
/* tslint:disable:no-reference */
/// <reference path="../js/jsqrcode/index.d.ts" />
/// <reference path="./models/encryption.ts" />
/// <reference path="./models/interface.ts" />
/// <reference path="./models/storage.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let cachedPassphrase = '';
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'position') {
        if (!sender.tab) {
            return;
        }
        getQr(sender.tab, message.info.left, message.info.top, message.info.width, message.info.height, message.info.windowWidth, message.info.passphrase);
    }
    else if (message.action === 'cachePassphrase') {
        cachedPassphrase = message.value;
    }
    else if (message.action === 'passphrase') {
        sendResponse(cachedPassphrase);
    }
    else if (message.action === 'dropbox') {
        getDropboxToken();
    }
    else if (message.action === 'lock') {
        cachedPassphrase = '';
    }
});
let contentTab;
function getQr(tab, left, top, width, height, windowWidth, passphrase) {
    chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (dataUrl) => {
        contentTab = tab;
        const qr = new Image();
        qr.src = dataUrl;
        qr.onload = () => {
            const devicePixelRatio = qr.width / windowWidth;
            const captureCanvas = document.createElement('canvas');
            captureCanvas.width = width * devicePixelRatio;
            captureCanvas.height = height * devicePixelRatio;
            const ctx = captureCanvas.getContext('2d');
            if (!ctx) {
                return;
            }
            ctx.drawImage(qr, left * devicePixelRatio, top * devicePixelRatio, width * devicePixelRatio, height * devicePixelRatio, 0, 0, width * devicePixelRatio, height * devicePixelRatio);
            const url = captureCanvas.toDataURL();
            qrcode.callback = (text) => {
                getTotp(text, passphrase);
            };
            qrcode.decode(url);
        };
    });
}
function getTotp(text, passphrase) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = contentTab.id;
        if (!id) {
            return;
        }
        if (text.indexOf('otpauth://') !== 0) {
            if (text === 'error decoding QR Code') {
                chrome.tabs.sendMessage(id, { action: 'errorqr' });
            }
            else {
                chrome.tabs.sendMessage(id, { action: 'text', text });
            }
        }
        else {
            let uri = text.split('otpauth://')[1];
            let type = uri.substr(0, 4).toLowerCase();
            uri = uri.substr(5);
            let label = uri.split('?')[0];
            const parameterPart = uri.split('?')[1];
            if (!label || !parameterPart) {
                chrome.tabs.sendMessage(id, { action: 'errorqr' });
            }
            else {
                let account = '';
                let secret = '';
                let issuer = '';
                let period = undefined;
                try {
                    label = decodeURIComponent(label);
                }
                catch (error) {
                    console.error(error);
                }
                if (label.indexOf(':') !== -1) {
                    issuer = label.split(':')[0];
                    account = label.split(':')[1];
                }
                else {
                    account = label;
                }
                const parameters = parameterPart.split('&');
                parameters.forEach((item) => {
                    const parameter = item.split('=');
                    if (parameter[0].toLowerCase() === 'secret') {
                        secret = parameter[1];
                    }
                    else if (parameter[0].toLowerCase() === 'issuer') {
                        try {
                            issuer = decodeURIComponent(parameter[1]);
                        }
                        catch (_a) {
                            issuer = parameter[1];
                        }
                    }
                    else if (parameter[0].toLowerCase() === 'counter') {
                        let counter = Number(parameter[1]);
                        counter = (isNaN(counter) || counter < 0) ? 0 : counter;
                    }
                    else if (parameter[0].toLowerCase() === 'period') {
                        period = Number(parameter[1]);
                        period = (isNaN(period) || period < 0 || period > 60 ||
                            60 % period !== 0) ?
                            undefined :
                            period;
                    }
                });
                if (!secret) {
                    chrome.tabs.sendMessage(id, { action: 'errorqr' });
                }
                else if (!/^[0-9a-f]+$/i.test(secret) && !/^[2-7a-z]+=*$/i.test(secret)) {
                    chrome.tabs.sendMessage(id, { action: 'secretqr', secret });
                }
                else {
                    const encryption = new Encryption(passphrase);
                    const hash = CryptoJS.MD5(secret).toString();
                    if (!/^[2-7a-z]+=*$/i.test(secret) && /^[0-9a-f]+$/i.test(secret) &&
                        type === 'totp') {
                        type = 'hex';
                    }
                    else if (!/^[2-7a-z]+=*$/i.test(secret) && /^[0-9a-f]+$/i.test(secret) &&
                        type === 'hotp') {
                        type = 'hhex';
                    }
                    const entryData = {};
                    entryData[hash] = {
                        account,
                        hash,
                        issuer,
                        secret,
                        type,
                        encrypted: false,
                        index: 0,
                        counter: 0
                    };
                    if (period) {
                        entryData[hash].period = period;
                    }
                    yield EntryStorage.import(encryption, entryData);
                    chrome.tabs.sendMessage(id, { action: 'added', account });
                }
            }
        }
        return;
    });
}
function getDropboxToken() {
    chrome.identity.launchWebAuthFlow({
        url: 'https://www.dropbox.com/oauth2/authorize?response_type=token&client_id=mmx38seexw3tvps&redirect_uri=' +
            encodeURIComponent(chrome.identity.getRedirectURL()),
        interactive: true
    }, (url) => {
        if (!url) {
            return;
        }
        const hashMatches = url.split('#');
        if (hashMatches.length < 2) {
            return;
        }
        const hash = hashMatches[1];
        const resData = hash.split('&');
        for (let i = 0; i < resData.length; i++) {
            const kv = resData[i];
            if (/^(.*?)=(.*?)$/.test(kv)) {
                const kvMatches = kv.match(/^(.*?)=(.*?)$/);
                if (!kvMatches) {
                    continue;
                }
                const key = kvMatches[1];
                const value = kvMatches[2];
                if (key === 'access_token') {
                    localStorage.dropboxToken = value;
                    chrome.runtime.sendMessage({ action: 'dropboxtoken', value });
                    return;
                }
            }
        }
        return;
    });
}
// Show issue page after first install
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason !== 'install') {
        return;
    }
    let url = null;
    if (navigator.userAgent.indexOf('Chrome') !== -1) {
        url =
            'https://github.com/Authenticator-Extension/Authenticator/wiki/Chrome-Issues';
    }
    else if (navigator.userAgent.indexOf('Firefox') !== -1) {
        url =
            'https://github.com/Authenticator-Extension/Authenticator/wiki/Firefox-Issues';
    }
    else if (navigator.userAgent.indexOf('Edge') !== -1) {
        url =
            'https://github.com/Authenticator-Extension/Authenticator/wiki/Edge-Issues';
    }
    if (url) {
        window.open(url, '_blank');
    }
});
//# sourceMappingURL=background.js.map
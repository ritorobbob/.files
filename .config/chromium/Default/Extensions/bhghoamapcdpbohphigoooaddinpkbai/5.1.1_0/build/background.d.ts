/// <reference path="../js/jsqrcode/index.d.ts" />
/// <reference path="models/encryption.d.ts" />
/// <reference path="models/interface.d.ts" />
/// <reference path="models/storage.d.ts" />
/// <reference types="chrome" />
declare let cachedPassphrase: string;
declare let contentTab: chrome.tabs.Tab;
declare function getQr(tab: chrome.tabs.Tab, left: number, top: number, width: number, height: number, windowWidth: number, passphrase: string): void;
declare function getTotp(text: string, passphrase: string): Promise<void>;
declare function getDropboxToken(): void;

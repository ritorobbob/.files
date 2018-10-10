/// <reference path="../models/encryption.d.ts" />
/// <reference path="../models/interface.d.ts" />
/// <reference path="../models/storage.d.ts" />
/// <reference path="ui.d.ts" />
/// <reference path="add-account.d.ts" />
declare function getEntries(encryption: Encryption): Promise<OTPEntry[]>;
declare function updateCode(app: any): Promise<void>;
declare function getBackupFile(entryData: {
    [hash: string]: OTPStorage;
}): string;
declare function getSiteName(): Promise<(string | null)[]>;
declare function hasMatchedEntry(siteName: Array<string | null>, entries: OTPEntry[]): boolean;
declare function isMatchedEntry(siteName: Array<string | null>, entry: OTPEntry): boolean;
declare function getCachedPassphrase(): Promise<string>;
declare function entry(_ui: UI): Promise<void>;

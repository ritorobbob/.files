/// <reference path="encryption.d.ts" />
/// <reference path="interface.d.ts" />
/// <reference path="otp.d.ts" />
declare class EntryStorage {
    private static getOTPStorageFromEntry(encryption, entry);
    private static ensureUniqueIndex(_data);
    private static isOTPStorage(entry);
    private static isValidEntry(_data, hash);
    static hasEncryptedEntry(): Promise<boolean>;
    static getExport(encryption: Encryption, encrypted?: boolean): Promise<{
        [hash: string]: OTPStorage;
    }>;
    static import(encryption: Encryption, data: {
        [hash: string]: OTPStorage;
    }): Promise<{}>;
    static add(encryption: Encryption, entry: OTPEntry): Promise<{}>;
    static update(encryption: Encryption, entry: OTPEntry): Promise<{}>;
    static set(encryption: Encryption, entries: OTPEntry[]): Promise<{}>;
    static get(encryption: Encryption): Promise<OTPEntry[]>;
    static remove(hash: string): Promise<{}>;
    static delete(entry: OTPEntry): Promise<{}>;
}

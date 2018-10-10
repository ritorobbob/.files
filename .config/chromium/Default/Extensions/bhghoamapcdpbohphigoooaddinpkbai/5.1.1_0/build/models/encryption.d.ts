/// <reference path="../../node_modules/@types/crypto-js/index.d.ts" />
declare class Encryption {
    private password;
    constructor(password: string);
    getEncryptedSecret(secret: string): string;
    getDecryptedSecret(secret: string, hash: string): string;
    getEncryptionStatus(): boolean;
    updateEncryptionPassword(password: string): void;
}

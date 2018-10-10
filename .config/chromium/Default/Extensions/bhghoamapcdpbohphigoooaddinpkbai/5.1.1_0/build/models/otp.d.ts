/// <reference path="../../node_modules/@types/crypto-js/index.d.ts" />
/// <reference path="encryption.d.ts" />
/// <reference path="interface.d.ts" />
/// <reference path="key-utilities.d.ts" />
declare class OTPEntry implements OTP {
    type: OTPType;
    index: number;
    issuer: string;
    secret: string;
    account: string;
    hash: string;
    counter: number;
    period: number;
    code: string;
    constructor(type: OTPType, issuer: string, secret: string, account: string, index: number, counter: number, period?: number, hash?: string);
    create(encryption: Encryption): Promise<void>;
    update(encryption: Encryption): Promise<void>;
    delete(): Promise<void>;
    next(encryption: Encryption): Promise<void>;
    generate(): void;
}

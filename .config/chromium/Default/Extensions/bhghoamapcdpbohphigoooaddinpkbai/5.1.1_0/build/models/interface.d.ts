/// <reference path="encryption.d.ts" />
declare enum OTPType {
    totp = 1,
    hotp = 2,
    battle = 3,
    steam = 4,
    hex = 5,
    hhex = 6,
}
interface OTP {
    type: OTPType;
    index: number;
    issuer: string;
    secret: string;
    account: string;
    hash: string;
    counter: number;
    code: string;
    period: number;
    create(encryption: Encryption): Promise<void>;
    update(encryption: Encryption): Promise<void>;
    next(encryption: Encryption): Promise<void>;
    delete(): Promise<void>;
    generate(): void;
}
interface OTPStorage {
    account: string;
    encrypted: boolean;
    hash: string;
    index: number;
    issuer: string;
    secret: string;
    type: string;
    counter: number;
    period?: number;
}
interface I18nMessage {
    [key: string]: {
        message: string;
        description: string;
    };
}
interface UIConfig {
    el?: string;
    data?: {
        [name: string]: any;
    };
    methods?: {
        [name: string]: (...arg: any[]) => any;
    };
    ready?: (...arg: any[]) => any;
}

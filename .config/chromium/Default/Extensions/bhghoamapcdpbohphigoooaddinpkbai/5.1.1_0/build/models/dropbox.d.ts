/// <reference path="encryption.d.ts" />
/// <reference path="interface.d.ts" />
/// <reference path="storage.d.ts" />
declare class Dropbox {
    getToken(): Promise<any>;
    upload(encryption: Encryption): Promise<boolean>;
}

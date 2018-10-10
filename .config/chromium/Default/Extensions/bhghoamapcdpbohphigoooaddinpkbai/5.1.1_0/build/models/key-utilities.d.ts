/// <reference path="../../node_modules/@types/jssha/index.d.ts" />
/// <reference path="interface.d.ts" />
declare class KeyUtilities {
    private static dec2hex(s);
    private static hex2dec(s);
    private static hex2str(hex);
    private static leftpad(str, len, pad);
    private static base32tohex(base32);
    private static base26(num);
    static generate(type: OTPType, secret: string, counter: number, period: number): string;
}

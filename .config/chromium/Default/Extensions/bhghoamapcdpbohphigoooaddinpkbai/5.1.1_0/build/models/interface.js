"use strict";
/* tslint:disable:no-reference */
/// <reference path="./encryption.ts" />
var OTPType;
(function (OTPType) {
    OTPType[OTPType["totp"] = 1] = "totp";
    OTPType[OTPType["hotp"] = 2] = "hotp";
    OTPType[OTPType["battle"] = 3] = "battle";
    OTPType[OTPType["steam"] = 4] = "steam";
    OTPType[OTPType["hex"] = 5] = "hex";
    OTPType[OTPType["hhex"] = 6] = "hhex";
})(OTPType || (OTPType = {}));
//# sourceMappingURL=interface.js.map
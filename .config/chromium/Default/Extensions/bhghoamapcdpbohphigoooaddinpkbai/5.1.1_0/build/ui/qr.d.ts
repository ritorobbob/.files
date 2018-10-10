/// <reference path="../models/interface.d.ts" />
/// <reference path="ui.d.ts" />
declare var QRCode: any;
declare function getQrUrl(entry: OTPEntry): Promise<string>;
declare function qr(_ui: UI): Promise<void>;

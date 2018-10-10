declare function showGrayLayout(passphrase: string): void;
declare function grayLayoutDown(event: MouseEvent): void;
declare function grayLayoutMove(event: MouseEvent): void;
declare function grayLayoutUp(event: MouseEvent, passphrase: string): false | undefined;
declare function sendPosition(left: number, top: number, width: number, height: number, passphrase: string): void;
declare function showQrCode(msg: string): void;
declare function pasteCode(code: string): void;

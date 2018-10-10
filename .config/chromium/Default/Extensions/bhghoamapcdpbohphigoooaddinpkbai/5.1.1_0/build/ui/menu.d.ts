/// <reference path="../models/interface.d.ts" />
/// <reference path="../models/dropbox.d.ts" />
/// <reference path="ui.d.ts" />
declare function getVersion(): string;
declare function syncTimeWithGoogle(): Promise<string>;
declare function resize(zoom: number): void;
declare function openHelp(): void;
declare function menu(_ui: UI): Promise<void>;

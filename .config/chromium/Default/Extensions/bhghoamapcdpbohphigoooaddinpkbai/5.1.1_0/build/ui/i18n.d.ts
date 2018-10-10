/// <reference path="../models/interface.d.ts" />
/// <reference path="ui.d.ts" />
declare function loadI18nMessages(): Promise<{
    [key: string]: string;
}>;
declare function i18n(_ui: UI): Promise<void>;

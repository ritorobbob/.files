/// <reference path="../models/interface.d.ts" />
/// <reference path="ui.d.ts" />
declare function isCustomEvent(event: Event): event is CustomEvent;
declare function message(_ui: UI): Promise<void>;

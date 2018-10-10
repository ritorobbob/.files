/// <reference path="../models/interface.d.ts" />
declare var Vue: any;
declare var vueDragula: any;
declare class UI {
    private ui;
    private modules;
    instance: any;
    constructor(ui: UIConfig);
    update(ui: UIConfig): void;
    load(module: (ui: UI) => void): this;
    render(): Promise<any>;
}

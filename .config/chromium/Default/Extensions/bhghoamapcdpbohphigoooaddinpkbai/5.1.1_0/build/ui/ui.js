"use strict";
/* tslint:disable:no-reference */
/// <reference path="../models/interface.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class UI {
    constructor(ui) {
        this.modules = [];
        this.ui = ui;
    }
    update(ui) {
        if (ui.data) {
            this.ui.data = this.ui.data || {};
            for (const key of Object.keys(ui.data)) {
                this.ui.data[key] = ui.data[key];
            }
        }
        if (ui.methods) {
            this.ui.methods = this.ui.methods || {};
            for (const key of Object.keys(ui.methods)) {
                this.ui.methods[key] = ui.methods[key];
            }
        }
    }
    load(module) {
        this.modules.push(module);
        return this;
    }
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.modules.length; i++) {
                yield this.modules[i](this);
            }
            Vue.use(vueDragula);
            this.ui.ready = () => {
                Vue.vueDragula.eventBus.$on('drop', () => __awaiter(this, void 0, void 0, function* () {
                    // wait for this.instance.entries sync from dom
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        let needUpdate = false;
                        for (let i = 0; i < this.instance.entries.length; i++) {
                            const entry = this.instance.entries[i];
                            if (entry.index !== i) {
                                needUpdate = true;
                                entry.index = i;
                            }
                        }
                        if (needUpdate) {
                            yield this.instance.updateStorage();
                        }
                        return;
                    }), 0);
                    return;
                }));
            };
            this.instance = new Vue(this.ui);
            // wait for all modules loaded
            setTimeout(() => {
                this.instance.updateCode();
                setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.instance.updateCode();
                }), 1000);
            }, 0);
            return this.instance;
        });
    }
}
//# sourceMappingURL=ui.js.map
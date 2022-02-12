"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lib = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vs = require("vscode");
const path = require("path");
class Lib extends vs.TreeItem {
    constructor(label, ext, contextValue, _path, collapsibleState, command) {
        super(label, collapsibleState = vs.TreeItemCollapsibleState.None);
        this.label = label;
        this.ext = ext;
        this.contextValue = contextValue;
        this._path = _path;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.tooltip = `${this.label}.${this.ext} -> ${this.contextValue}`;
        this.description = this.contextValue;
        if (this.ext.toLowerCase() === "lib") {
            this.iconPath = {
                light: path.join(__filename, '..', '../../', 'resources', 'light', 'Lib.svg'),
                dark: path.join(__filename, '..', '../../', 'resources', 'dark', 'Lib.svg')
            };
        }
        else if (this.ext.toLowerCase() === "dll") {
            this.iconPath = {
                light: path.join(__filename, '..', '../../', 'resources', 'light', 'dll.svg'),
                dark: path.join(__filename, '..', '../../', 'resources', 'dark', 'dll.svg')
            };
        }
        else if (this.ext.toLowerCase() === "a") {
            this.iconPath = {
                light: path.join(__filename, '..', '../../', 'resources', 'light', 'a.svg'),
                dark: path.join(__filename, '..', '../../', 'resources', 'dark', 'a.svg')
            };
        }
        else {
            this.iconPath = {
                light: path.join(__filename, '..', '../../', 'resources', 'light', 'file.svg'),
                dark: path.join(__filename, '..', '../../', 'resources', 'dark', 'file.svg')
            };
        }
    }
    toString() {
        return this.label + '.' + this.ext;
    }
    toObject() {
        return {
            label: this.label + '.' + this.ext,
            arch: this.contextValue
        };
    }
}
exports.Lib = Lib;
//# sourceMappingURL=Lib.js.map
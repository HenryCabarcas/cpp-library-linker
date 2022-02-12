"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Folder = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vs = require("vscode");
const path = require("path");
const slash = require("slash");
class Folder extends vs.TreeItem {
    constructor(label, _path, relative_path, contextValue, command) {
        super(label, vs.TreeItemCollapsibleState.None);
        this.label = label;
        this._path = _path;
        this.relative_path = relative_path;
        this.contextValue = contextValue;
        this.command = command;
        this.iconPath = {
            light: path.join(__filename, '..', '../../', 'resources', 'light', 'folder.svg'),
            dark: path.join(__filename, '..', '../../', 'resources', 'dark', 'folder.svg')
        };
        this.tooltip = `${this._path}`;
        this.description = this.relative_path;
        this.contextValue = contextValue ? contextValue : "ALL";
    }
    toString() {
        if (vs.workspace.rootPath) {
            return slash(path.relative(vs.workspace.rootPath, this._path));
        }
        return slash(this.relative_path);
    }
    toObject() {
        if (this.relative_path === "" || this.relative_path === "") {
            console.log(this.relative_path);
            return {
                path: "./",
                arch: this.contextValue
            };
        }
        return {
            path: slash(this.relative_path),
            arch: this.contextValue
        };
    }
}
exports.Folder = Folder;
//# sourceMappingURL=Folder.js.map
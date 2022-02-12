"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinFolders = exports.LibFolders = exports.IncludeFolders = exports.Libs = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
class Libs {
    constructor(element) {
        this.element = element;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.data = element;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.data);
        }
        if (element) {
            return Promise.resolve(this.data);
        }
        return Promise.resolve(this.data);
    }
}
exports.Libs = Libs;
class IncludeFolders {
    constructor(element) {
        this.element = element;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return Promise.resolve(this.element);
    }
}
exports.IncludeFolders = IncludeFolders;
class LibFolders {
    constructor(element) {
        this.element = element;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.element);
        }
        if (element) {
            return Promise.resolve(this.element);
        }
        return Promise.resolve(this.element);
    }
}
exports.LibFolders = LibFolders;
class BinFolders {
    constructor(element) {
        this.element = element;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve(this.element);
        }
        if (element) {
            return Promise.resolve(this.element); // return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
        }
        return Promise.resolve(this.element);
    }
}
exports.BinFolders = BinFolders;
//# sourceMappingURL=Trees.js.map
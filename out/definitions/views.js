"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWebView = exports.registerTrees = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
const webview_1 = require("./webview");
function registerTrees(providers) {
    vscode.window.registerTreeDataProvider("cpp-library-linker.includepaths", providers[0]);
    vscode.window.registerTreeDataProvider("cpp-library-linker.libs", providers[1]);
    vscode.window.registerTreeDataProvider("cpp-library-linker.libpaths", providers[2]);
    vscode.window.registerTreeDataProvider("cpp-library-linker.binpaths", providers[3]);
    let IncludeTree = vscode.window.createTreeView("cpp-library-linker.includepaths", {
        treeDataProvider: providers[0]
    });
    let LibTree = vscode.window.createTreeView("cpp-library-linker.libs", {
        treeDataProvider: providers[1]
    });
    let LibPathsTree = vscode.window.createTreeView("cpp-library-linker.libpaths", {
        treeDataProvider: providers[2]
    });
    let BinPathsTree = vscode.window.createTreeView("cpp-library-linker.binpaths", {
        treeDataProvider: providers[3]
    });
    return [
        IncludeTree,
        LibTree,
        LibPathsTree,
        BinPathsTree
    ];
}
exports.registerTrees = registerTrees;
function registerWebView(context) {
    let provider = new webview_1.HomePage(context.extensionUri, context);
    let view = vscode.window.registerWebviewViewProvider(webview_1.HomePage.viewType, provider);
    context.subscriptions.push(view);
    vscode.commands.registerCommand("calicoColors.addColor", () => {
        provider.addColor();
    });
    context.subscriptions.push(vscode.commands.registerCommand("calicoColors.clearColors", () => {
        provider.clearColors();
    }));
    return provider;
}
exports.registerWebView = registerWebView;
//# sourceMappingURL=Views.js.map
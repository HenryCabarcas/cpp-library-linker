"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFile = exports.writeJSONFile = exports.pathExists = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const fs = require("fs");
const vscode = require("vscode");
function pathExists(p) {
    try {
        fs.existsSync(p);
    }
    catch (err) {
        return false;
    }
    return true;
}
exports.pathExists = pathExists;
function writeJSONFile(obj, _path) {
    if (!pathExists(_path)) {
        vscode.window.showInformationMessage('the file ' + _path + " doesn't exists.");
    }
    fs.writeFileSync(_path, JSON.stringify(obj));
}
exports.writeJSONFile = writeJSONFile;
function createFile(name, rel_path) {
    if (!pathExists(vscode.workspace.rootPath + rel_path + name)) {
        const wsedit = new vscode.WorkspaceEdit();
        const wsPath = vscode.workspace.rootPath; // gets the path of the first workspace folder
        const filePath = vscode.Uri.file(wsPath + rel_path + name);
        wsedit.createFile(filePath, { ignoreIfExists: true });
        vscode.workspace.applyEdit(wsedit);
        vscode.window.showInformationMessage('Created a new file: ' + rel_path + name);
    }
    else {
        vscode.window.showInformationMessage('the file ' + rel_path + name + ' already exists.');
    }
}
exports.createFile = createFile;
//# sourceMappingURL=File.js.map
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBinPath = exports.loadLibPath = exports.loadIncludePath = exports.parseLibName = exports.loadLibFile = exports.createFile = exports.writeJSONFile = exports.parseJSONFile = exports.pathExists = exports.Configuration = exports.ConfigFile = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const path = require("path");
const fs = require("fs");
const tree_view_1 = require("../tree_view");
const vscode = require("vscode");
class ConfigFile {
    constructor(data, ver) {
        this.configuration = data;
        this.version = ver;
    }
}
exports.ConfigFile = ConfigFile;
class Configuration {
    constructor(_path) {
        this._path = _path;
        this._onJSONChanged = new vscode.EventEmitter();
        this.onJSONChanged = this._onJSONChanged.event;
        this.input = vscode.window.createInputBox();
        this.data = {};
        if (_path !== "" && pathExists(_path)) {
            this.data = this.parseJSON(this._path);
        }
    }
    refresh() {
        this.data = {};
        this.data = this.parseJSON(this._path);
        this._onJSONChanged.fire(this.data);
    }
    parseJSON(_path) {
        let done = false;
        while (!done) {
            try {
                let data = fs.readFileSync(_path).toString();
                const editor = vscode.window.activeTextEditor;
                let m = JSON.parse(data);
                return new ConfigFile(m.configurations.map((item) => {
                    let s = {};
                    s.name = item.Name;
                    // Includes
                    s.Includes = [];
                    s.Includes = this.parseIncludes(item.Includes);
                    // Both
                    s.Both = {};
                    s.Both.libs = this.parseLibs(item.Both.libs);
                    s.Both.libpaths = this.parseFolders(item.Both.libpaths);
                    s.Both.binpaths = this.parseFolders(item.Both.binpaths);
                    // Debug
                    s.Debug = {};
                    s.Debug.libs = this.parseLibs(item.Debug.libs);
                    s.Debug.libpaths = this.parseFolders(item.Debug.libpaths);
                    s.Debug.binpaths = this.parseFolders(item.Debug.binpaths);
                    // Release
                    s.Release = {};
                    s.Release.libs = this.parseLibs(item.Release.libs);
                    s.Release.libpaths = this.parseFolders(item.Release.libpaths);
                    s.Release.binpaths = this.parseFolders(item.Release.binpaths);
                    return s;
                }), m.Version);
            }
            catch (error) {
                console.log(error);
            }
        }
        vscode.window.showErrorMessage("No json filee");
        return {};
    }
    parseFolders(folders) {
        return folders.map((item) => {
            if (vscode.workspace.rootPath && item) {
                if (item.arch) {
                    return new tree_view_1.Folder(path.basename(path.resolve(vscode.workspace.rootPath, item.path)), path.resolve(vscode.workspace.rootPath, item.path), path.normalize(item.path), item.arch);
                }
                else {
                    return new tree_view_1.Folder(path.basename(path.resolve(vscode.workspace.rootPath, item.path)), path.resolve(vscode.workspace.rootPath, item.path), path.normalize(item.path), "ALL");
                }
            }
            return {};
        });
    }
    parseIncludes(folders) {
        return folders.map((item) => {
            if (vscode.workspace.rootPath && item) {
                return new tree_view_1.Folder(path.basename(path.join(vscode.workspace.rootPath, item)), path.resolve(vscode.workspace.rootPath, item), item, "ALL");
            }
            return {};
        });
    }
    parseLibs(libs) {
        return libs.map((item) => {
            return new tree_view_1.Lib(this.getLabel(item.label), this.getExt(item.label), item.arch);
        });
    }
    getLabel(name) {
        if (name.indexOf(".") > 0) {
            return name.substring(0, name.indexOf("."));
        }
        return name;
    }
    getExt(name) {
        if (name.indexOf(".")) {
            return name.substr(name.indexOf(".") + 1);
        }
        return "";
    }
    writeJSON(filename) {
    }
    addLib(debug, act) {
        return __awaiter(this, void 0, void 0, function* () {
            this.input.placeholder = "You can add multiple files separated by commas.";
            this.input.title = "Write the library file name";
            var canaccept = false;
            this.input.show();
            this.input.onDidChangeValue(() => {
                this.input.validationMessage = "";
                canaccept = true;
                if (!this.input.value.includes(".")) {
                    this.input.validationMessage = "The library file must have an extension.";
                    canaccept = false;
                }
                if (this.input.value.includes(" ")) {
                    this.input.validationMessage = "Blank spaces aren't allowed.";
                    canaccept = false;
                }
            });
            this.input.onDidAccept(() => __awaiter(this, void 0, void 0, function* () {
                if (canaccept) {
                    this.input.hide();
                    if (this.input.value.includes(",") && this.input.value.length > 1) {
                        var tempstr = '';
                        for (let i = 0; i < this.input.value.length; i++) {
                            if (this.input.value[i] === ",") {
                                if (tempstr.includes(".")) {
                                    if (debug) {
                                        this.data.configuration[act].Debug.libs.push(parseLibName(tempstr));
                                    }
                                    else {
                                        this.data.configuration[act].Release.libs.push(parseLibName(tempstr));
                                    }
                                }
                                else {
                                    vscode.window.showWarningMessage("The library: " + tempstr + " doesn't have an extension.");
                                }
                                tempstr = '';
                            }
                            else {
                                tempstr += this.input.value[i];
                            }
                        }
                        if (tempstr.includes(".")) {
                            if (debug) {
                                this.data.configuration[act].Debug.libs.push(parseLibName(tempstr));
                            }
                            else {
                                this.data.configuration[act].Release.libs.push(parseLibName(tempstr));
                            }
                        }
                        else {
                            vscode.window.showWarningMessage("The library: " + tempstr + " doesn't have an extension.");
                        }
                    }
                    else {
                        if (this.input.value.includes(".")) {
                            if (debug) {
                                this.data.configuration[act].Debug.libs.push(parseLibName(this.input.value));
                            }
                            else {
                                this.data.configuration[act].Release.libs.push(parseLibName(this.input.value));
                            }
                        }
                        else {
                            vscode.window.showWarningMessage("The library: " + this.input.value + " doesn't have an extension.");
                        }
                    }
                }
            }));
        });
    }
}
exports.Configuration = Configuration;
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
function parseJSONFile(_path) {
    if (pathExists(_path)) {
        var m = JSON.parse(fs.readFileSync(_path).toString());
        return m;
    }
    return [];
}
exports.parseJSONFile = parseJSONFile;
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
function loadLibFile() {
    return __awaiter(this, void 0, void 0, function* () {
        let options = {
            title: "Select Library Files",
            canSelectMany: true,
            openLabel: 'Select Files',
            canSelectFiles: true,
            filters: {
                'Lib Files': ['Lib', 'a'],
                'All files': ['*']
            }
        };
        var group;
        group = [];
        yield vscode.window.showOpenDialog(options).then(fileUri => {
            if (fileUri && fileUri[0]) {
                for (let i = 0; i < fileUri.length; i++) {
                    const element = fileUri[i];
                    var filename = element.fsPath.slice(element.fsPath.lastIndexOf("\\") + 1);
                    var name = filename.slice(0, filename.lastIndexOf("."));
                    var extension = filename.slice(filename.lastIndexOf(".") + 1);
                    var _path = element.fsPath.slice(0, element.fsPath.lastIndexOf("\\"));
                    group.push(new tree_view_1.Lib(name, extension, "ALL", _path));
                }
            }
        });
        return Promise.resolve(group);
    });
}
exports.loadLibFile = loadLibFile;
function parseLibName(value) {
    var i = value.lastIndexOf('.');
    return new tree_view_1.Lib(value.substring(0, i), value.substring(i + 1), "ALL", " ");
}
exports.parseLibName = parseLibName;
function loadIncludePath(workspace_path) {
    return __awaiter(this, void 0, void 0, function* () {
        let options = {
            title: "Select Include Folders",
            canSelectMany: true,
            openLabel: 'Select Folders',
            canSelectFolders: true,
            canSelectFiles: false,
            filters: {
                'All folders': ['*']
            }
        };
        var group;
        group = [];
        yield vscode.window.showOpenDialog(options).then(fileUri => {
            if (fileUri && fileUri[0]) {
                for (let i = 0; i < fileUri.length; i++) {
                    const element = fileUri[i];
                    var filename = element.fsPath.slice(element.fsPath.lastIndexOf("\\") + 1);
                    var rel = path.relative(workspace_path, element.fsPath);
                    group.push(new tree_view_1.Folder(filename, element.fsPath, rel, 'ALL'));
                }
            }
        });
        return Promise.resolve(group);
    });
}
exports.loadIncludePath = loadIncludePath;
function loadLibPath(workspace_path) {
    return __awaiter(this, void 0, void 0, function* () {
        let options = {
            title: "Select Library Path Folders",
            canSelectMany: true,
            openLabel: 'Select Folders',
            canSelectFolders: true,
            canSelectFiles: false,
            filters: {
                'All folders': ['*']
            }
        };
        var group;
        group = [];
        yield vscode.window.showOpenDialog(options).then(fileUri => {
            if (fileUri && fileUri[0]) {
                for (let i = 0; i < fileUri.length; i++) {
                    const element = fileUri[i];
                    var filename = element.fsPath.slice(element.fsPath.lastIndexOf("\\") + 1);
                    var rel = path.relative(workspace_path, element.fsPath);
                    group.push(new tree_view_1.Folder(filename, element.fsPath, rel, 'ALL'));
                }
            }
        });
        return Promise.resolve(group);
    });
}
exports.loadLibPath = loadLibPath;
function loadBinPath(workspace_path) {
    return __awaiter(this, void 0, void 0, function* () {
        let options = {
            title: "Select Binary Path Folders",
            canSelectMany: true,
            openLabel: 'Select Folders',
            canSelectFolders: true,
            canSelectFiles: false,
            filters: {
                'All folders': ['*']
            }
        };
        var group;
        group = [];
        yield vscode.window.showOpenDialog(options).then(fileUri => {
            if (fileUri && fileUri[0]) {
                for (let i = 0; i < fileUri.length; i++) {
                    const element = fileUri[i];
                    var filename = element.fsPath.slice(element.fsPath.lastIndexOf("\\") + 1);
                    var rel = path.relative(workspace_path, element.fsPath);
                    group.push(new tree_view_1.Folder(filename, element.fsPath, rel));
                }
            }
        });
        return Promise.resolve(group);
    });
}
exports.loadBinPath = loadBinPath;
//# sourceMappingURL=File.js.map
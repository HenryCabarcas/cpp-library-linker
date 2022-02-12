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
exports.Configuration = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vs = require("vscode");
const Lib_1 = require("./Lib");
const ConfigFile_1 = require("./ConfigFile");
const Folder_1 = require("./Folder");
const File_1 = require("../definitions/File");
const fs = require("fs");
const path = require("path");
const slash = require("slash");
class Configuration {
    constructor(_path, version) {
        this.version = version;
        this._onJSONChanged = new vs.EventEmitter();
        this.onJSONChanged = this._onJSONChanged.event;
        this.input = vs.window.createInputBox();
        this.data = {};
        if (vs.workspace.rootPath) {
            this.workspace = vs.workspace.rootPath;
        }
        else {
            this.workspace = undefined;
        }
        if (this.workspace && File_1.pathExists(_path)) {
            this.jsonFile = _path;
            this.data = this.parseJSON(this.jsonFile);
        }
        else {
            this.data = this.emptyData(version);
            this.jsonFile = undefined;
        }
    }
    refresh() {
        if (this.jsonFile) {
            this.data = {};
            this.data = this.parseJSON(this.jsonFile);
            this._onJSONChanged.fire(this.data);
        }
    }
    getLibs(debug, act) {
        if (debug) {
            return this.data.configuration[act].Debug.libs;
        }
        return this.data.configuration[act].Release.libs;
    }
    manyLibs(debug, act) {
        if (debug) {
            return this.data.configuration[act].Debug.libs.length;
        }
        return this.data.configuration[act].Release.libs.length;
    }
    getLibPaths(debug, act) {
        if (debug) {
            return this.data.configuration[act].Debug.libpaths;
        }
        return this.data.configuration[act].Release.libpaths;
    }
    manyLibPaths(debug, act) {
        if (debug) {
            return this.data.configuration[act].Debug.libpaths.length;
        }
        return this.data.configuration[act].Release.libpaths.length;
    }
    getBinPaths(debug, act) {
        if (debug) {
            return this.data.configuration[act].Debug.binpaths;
        }
        return this.data.configuration[act].Release.binpaths;
    }
    manyBinPaths(debug, act) {
        if (debug) {
            return this.data.configuration[act].Debug.binpaths.length;
        }
        return this.data.configuration[act].Release.binpaths.length;
    }
    getIncludes(act) {
        return this.data.configuration[act].Includes;
    }
    manyIncludes(act) {
        return this.data.configuration[act].Includes.length;
    }
    parseJSON(_path) {
        let done = false;
        while (!done) {
            let data = fs.readFileSync(_path, { encoding: 'utf-8' }).toString();
            if (data === "") {
                return this.emptyData(this.version);
            }
            ;
            let m = JSON.parse(data);
            if (m !== undefined) {
                done = true;
                this.version = m.version;
                return new ConfigFile_1.ConfigFile(m.configuration.map((item) => {
                    let s = {};
                    s.Name = item.Name;
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
                }), m.version);
            }
        }
        vs.window.showErrorMessage("No json config file defined.");
        return {};
    }
    writeJSON() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.jsonFile === undefined && this.workspace) {
                File_1.createFile(path.join(this.workspace, "./.vscode/cpp_lib_config.json")).then((result) => {
                    if (this.workspace && result) {
                        this.jsonFile = path.join(this.workspace, './.vscode', 'cpp_lib_config.json');
                        fs.writeFileSync(this.jsonFile, this.data.toString());
                    }
                    else {
                        vs.window.showWarningMessage("Error creating config file.");
                    }
                });
            }
            else if (this.jsonFile) {
                fs.writeFileSync(this.jsonFile, this.data.toString());
            }
            else {
                vs.window.showWarningMessage("Select a workspace folder first.");
            }
        });
    }
    parseFolders(folders) {
        if (folders !== undefined) {
            return folders.map((item) => {
                if (this.workspace && item) {
                    if (item.path === "") {
                        item.path = "./";
                    }
                    if (item.arch) {
                        return new Folder_1.Folder(path.basename(path.resolve(this.workspace, item.path)), path.resolve(this.workspace, item.path), slash(item.path), item.arch);
                    }
                    else {
                        return new Folder_1.Folder(path.basename(path.resolve(this.workspace, item.path)), path.resolve(this.workspace, item.path), slash(item.path), "ALL");
                    }
                }
                return {};
            });
        }
        return [];
    }
    parseIncludes(folders) {
        if (folders !== undefined) {
            return folders.map((item) => {
                if (this.workspace && item) {
                    if (item === "") {
                        item = "./";
                        return new Folder_1.Folder(path.basename(item), item, item, "ALL");
                    }
                    return new Folder_1.Folder(path.basename(path.resolve(this.workspace, item)), path.resolve(this.workspace, item), slash(item), "ALL");
                }
                return {};
            });
        }
        return [];
    }
    parseLibs(libs) {
        if (libs !== undefined) {
            return libs.map((item) => {
                return new Lib_1.Lib(this.getLabel(item.label), this.getExt(item.label), item.arch);
            });
        }
        return [];
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
            this.input.onDidAccept(() => {
                if (canaccept) {
                    if (this.input.value.includes(",") && this.input.value.length > 1) {
                        var tempstr = '';
                        for (let i = 0; i < this.input.value.length; i++) {
                            if (this.input.value[i] === ",") {
                                if (tempstr.includes(".")) {
                                    var t = this.parseLibName(tempstr);
                                    if (debug && !this.data.configuration[act].Debug.libs.includes(t)) {
                                        this.data.configuration[act].Debug.libs.push(t);
                                    }
                                    else if (!this.data.configuration[act].Release.libs.includes(t)) {
                                        this.data.configuration[act].Release.libs.push(t);
                                    }
                                }
                                else {
                                    vs.window.showWarningMessage("The library: " + tempstr + " doesn't have an extension.");
                                }
                                tempstr = '';
                            }
                            else {
                                tempstr += this.input.value[i];
                            }
                        }
                        if (tempstr.includes(".")) {
                            var t = this.parseLibName(tempstr);
                            if (debug && !this.data.configuration[act].Debug.libs.includes(t)) {
                                this.data.configuration[act].Debug.libs.push(t);
                            }
                            else if (!this.data.configuration[act].Release.libs.includes(t)) {
                                this.data.configuration[act].Release.libs.push(t);
                            }
                        }
                        else {
                            vs.window.showWarningMessage("The library: " + tempstr + " doesn't have an extension.");
                        }
                    }
                    else {
                        if (this.input.value.includes(".")) {
                            var t = this.parseLibName(this.input.value);
                            if (debug && !this.data.configuration[act].Debug.libs.includes(t)) {
                                this.data.configuration[act].Debug.libs.push(t);
                            }
                            else if (!this.data.configuration[act].Release.libs.includes(t)) {
                                this.data.configuration[act].Release.libs.push(t);
                            }
                        }
                        else {
                            vs.window.showWarningMessage("The library: " + this.input.value + " doesn't have an extension.");
                        }
                    }
                    this.writeJSON();
                    this.input.hide();
                }
            });
        });
    }
    loadLibFile(debug, act) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.workspace) {
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
                yield vs.window.showOpenDialog(options).then(fileUri => {
                    if (fileUri && fileUri[0]) {
                        for (let i = 0; i < fileUri.length; i++) {
                            const element = fileUri[i];
                            var filename = element.fsPath.slice(element.fsPath.lastIndexOf("\\") + 1);
                            var name = filename.slice(0, filename.lastIndexOf("."));
                            var extension = filename.slice(filename.lastIndexOf(".") + 1);
                            var _path = element.fsPath.slice(0, element.fsPath.lastIndexOf("\\"));
                            var t = new Lib_1.Lib(name, extension, "ALL", _path);
                            if (debug && !this.data.configuration[act].Debug.libs.includes(t)) {
                                this.data.configuration[act].Debug.libs.push(t);
                            }
                            else if (!this.data.configuration[act].Release.libs.includes(t)) {
                                this.data.configuration[act].Release.libs.push(t);
                            }
                        }
                        this.writeJSON();
                    }
                });
            }
            else {
                vs.window.showInformationMessage("Please select a workspace folder first.");
            }
        });
    }
    delLib(debug, act, element) {
        var temp;
        if (debug) {
            temp = this.data.configuration[act].Debug.libs;
        }
        else {
            temp = this.data.configuration[act].Release.libs;
        }
        if (temp.length > 0) {
            for (let i = 0; i < temp.length; i++) {
                const elem = temp[i];
                if (elem === element) {
                    if (debug) {
                        this.data.configuration[act].Debug.libs.splice(i, 1);
                    }
                    else {
                        this.data.configuration[act].Release.libs.splice(i, 1);
                    }
                }
            }
            this.writeJSON();
        }
    }
    parseLibName(value) {
        var i = value.lastIndexOf('.');
        return new Lib_1.Lib(value.substring(0, i), value.substring(i + 1), "ALL", " ");
    }
    loadIncludePath(act) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.workspace) {
                yield vs.window.showOpenDialog(this.getFolderConfig("Select Include Folders"))
                    .then(fileUri => {
                    if (fileUri && fileUri[0] && this.workspace) {
                        for (let i = 0; i < fileUri.length; i++) {
                            const element = fileUri[i];
                            var rel = slash(path.relative(this.workspace, element.fsPath));
                            if (rel === "") {
                                rel = './';
                            }
                            ;
                            this.data.configuration[act].Includes.push(new Folder_1.Folder(path.basename(element.fsPath), element.fsPath, rel));
                        }
                        this.writeJSON();
                    }
                });
            }
            else {
                vs.window.showInformationMessage("Please select a workspace folder first.");
            }
        });
    }
    delIncludePath(act, name) {
        if (this.data.configuration[act].Includes.length > 0) {
            for (let i = 0; i < this.data.configuration[act].Includes.length; i++) {
                const element = this.data.configuration[act].Includes[i];
                if (element === name) {
                    this.data.configuration[act].Includes.splice(i, 1);
                }
            }
            this.writeJSON();
        }
    }
    loadLibPath(debug, act) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.workspace) {
                yield vs.window.showOpenDialog(this.getFolderConfig("Select Library Path Folders"))
                    .then(fileUri => {
                    if (fileUri && fileUri[0] && this.workspace) {
                        for (let i = 0; i < fileUri.length; i++) {
                            const element = fileUri[i];
                            var filename = path.basename(element.fsPath);
                            var rel = slash(path.relative(this.workspace, element.fsPath));
                            if (rel === "") {
                                rel = './';
                            }
                            ;
                            if (debug) {
                                this.data.configuration[act].Debug.libpaths.push(new Folder_1.Folder(filename, element.fsPath, rel));
                            }
                            else {
                                this.data.configuration[act].Release.libpaths.push(new Folder_1.Folder(filename, element.fsPath, rel));
                            }
                        }
                        this.writeJSON();
                    }
                });
            }
            else {
                vs.window.showInformationMessage("Please select a workspace folder first.");
            }
        });
    }
    delLibPath(debug, act, name) {
        var temp;
        if (debug) {
            temp = this.data.configuration[act].Debug.libpaths;
        }
        else {
            temp = this.data.configuration[act].Release.libpaths;
        }
        if (temp.length > 0) {
            for (let i = 0; i < temp.length; i++) {
                const element = temp[i];
                if (element === name) {
                    if (debug) {
                        this.data.configuration[act].Debug.libpaths.splice(i, 1);
                    }
                    else {
                        this.data.configuration[act].Release.libpaths.splice(i, 1);
                    }
                }
            }
            this.writeJSON();
        }
    }
    loadBinPath(debug, act) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.workspace) {
                yield vs.window.showOpenDialog(this.getFolderConfig("Select Binary Path Folders"))
                    .then(fileUri => {
                    if (fileUri && fileUri[0] && this.workspace) {
                        for (let i = 0; i < fileUri.length; i++) {
                            const element = fileUri[i];
                            var filename = path.basename(element.fsPath);
                            var rel = slash(path.relative(this.workspace, element.fsPath));
                            if (rel === "") {
                                rel = './';
                            }
                            ;
                            if (debug) {
                                this.data.configuration[act].Debug.binpaths.push(new Folder_1.Folder(filename, element.fsPath, rel));
                            }
                            else {
                                this.data.configuration[act].Release.binpaths.push(new Folder_1.Folder(filename, element.fsPath, rel));
                            }
                        }
                        this.writeJSON();
                    }
                });
            }
            else {
                vs.window.showInformationMessage("Please select a workspace folder first.");
            }
        });
    }
    delBinPath(debug, act, name) {
        var temp;
        if (debug) {
            temp = this.data.configuration[act].Debug.binpaths;
        }
        else {
            temp = this.data.configuration[act].Release.binpaths;
        }
        for (let i = 0; i < temp.length; i++) {
            const element = temp[i];
            if (element === name) {
                if (debug) {
                    this.data.configuration[act].Debug.binpaths.splice(i, 1);
                }
                else {
                    this.data.configuration[act].Release.binpaths.splice(i, 1);
                }
            }
        }
        this.writeJSON();
    }
    getFolderConfig(_title) {
        let options = {
            title: _title,
            canSelectMany: true,
            openLabel: 'Select Folders',
            canSelectFolders: true,
            canSelectFiles: false,
            filters: {
                'All folders': ['*']
            }
        };
        return options;
    }
    switchArch(debug, act, arch, name) {
        if (debug) {
            if (this.data.configuration[act].Debug.libs.length > 0) {
                let i = this.data.configuration[act].Debug.libs.indexOf(name);
                this.data.configuration[act].Debug.libs[i].description = arch;
                this.data.configuration[act].Debug.libs[i].contextValue = arch;
                this.data.configuration[act].Debug.libs[i].tooltip = this.data.configuration[act].Debug.libs[i].label + "." + this.data.configuration[act].Debug.libs[i].ext + " -> " + this.data.configuration[act].Debug.libs[i].contextValue;
            }
        }
        else {
            if (this.data.configuration[act].Release.libs.length > 0) {
                let i = this.data.configuration[act].Release.libs.indexOf(name);
                this.data.configuration[act].Release.libs[i].description = arch;
                this.data.configuration[act].Release.libs[i].contextValue = arch;
                this.data.configuration[act].Release.libs[i].tooltip = this.data.configuration[act].Release.libs[i].label + "." + this.data.configuration[act].Release.libs[i].ext + " -> " + this.data.configuration[act].Release.libs[i].contextValue;
            }
        }
        this.writeJSON();
    }
    emptyData(version) {
        let f = {
            Name: "",
            Includes: [],
            Both: {
                libs: [],
                libpaths: [],
                binpaths: []
            },
            Debug: {
                libs: [],
                libpaths: [],
                binpaths: []
            },
            Release: {
                libs: [],
                libpaths: [],
                binpaths: []
            }
        };
        return new ConfigFile_1.ConfigFile([f], version);
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=Configuration.js.map
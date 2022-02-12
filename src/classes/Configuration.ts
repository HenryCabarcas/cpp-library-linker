/* eslint-disable @typescript-eslint/naming-convention */
import * as vs from 'vscode';
import { Lib } from './Lib';
import { ConfigFile } from './ConfigFile';
import { Folder } from './Folder';
import { pathExists, createFile } from '../definitions/File';
import { configTemplate } from './ConfigTemplate';
import * as fs from 'fs';
import * as path from 'path';
import slash = require('slash');



export class Configuration {
    private _onJSONChanged: vs.EventEmitter<ConfigFile> = new vs.EventEmitter<ConfigFile>();
    readonly onJSONChanged: vs.Event<ConfigFile> = this._onJSONChanged.event;
    public data: ConfigFile;
    public input = vs.window.createInputBox();
    private workspace: string | undefined;
    private jsonFile: string | undefined;
    constructor(_path: string, private version: string) {
        this.data = <ConfigFile>{};
        if (vs.workspace.rootPath) { this.workspace = vs.workspace.rootPath; }
        else { this.workspace = undefined; }
        if (this.workspace && pathExists(_path)) {
            this.jsonFile = _path;
            this.data = this.parseJSON(this.jsonFile);
        } else {
            this.data = this.emptyData(version);
            this.jsonFile = undefined;
        }
    }

    refresh() {
        if (this.jsonFile) {
            this.data = <ConfigFile>{};
            this.data = this.parseJSON(this.jsonFile);
            this._onJSONChanged.fire(this.data);
        }
    }
    getLibs(debug: boolean, act: number): Lib[] {
        if (debug) {
            return this.data.configuration[act].Debug.libs;
        }
        return this.data.configuration[act].Release.libs;

    }
    manyLibs(debug: boolean, act: number): number {
        if (debug) {
            return this.data.configuration[act].Debug.libs.length;
        }
        return this.data.configuration[act].Release.libs.length;
    }
    getLibPaths(debug: boolean, act: number): Folder[] {
        if (debug) {
            return this.data.configuration[act].Debug.libpaths;
        }
        return this.data.configuration[act].Release.libpaths;
    }
    manyLibPaths(debug: boolean, act: number): number {
        if (debug) {
            return this.data.configuration[act].Debug.libpaths.length;
        }
        return this.data.configuration[act].Release.libpaths.length;
    }
    getBinPaths(debug: boolean, act: number): Folder[] {
        if (debug) {
            return this.data.configuration[act].Debug.binpaths;
        }
        return this.data.configuration[act].Release.binpaths;
    }
    manyBinPaths(debug: boolean, act: number): number {
        if (debug) {
            return this.data.configuration[act].Debug.binpaths.length;
        }
        return this.data.configuration[act].Release.binpaths.length;
    }
    getIncludes(act: number): Folder[] {
        return this.data.configuration[act].Includes;
    }
    manyIncludes(act: number): number {
        return this.data.configuration[act].Includes.length;
    }
    parseJSON(_path: string): ConfigFile {
        let done = false;
        while (!done) {
            let data: string = fs.readFileSync(_path, { encoding: 'utf-8' }).toString();
            if (data === ""){
                return this.emptyData(this.version);
            };
            let m: any = JSON.parse(data);
            if (m !== undefined) {
                done = true;
                this.version = m.version;
                return new ConfigFile(
                    m.configuration.map((item: any): configTemplate => {
                        let s = <configTemplate>{};
                        s.Name = item.Name;
                        // Includes
                        s.Includes = [];
                        s.Includes = this.parseIncludes(item.Includes);
                        // Both
                        s.Both = <any>{};
                        s.Both.libs = this.parseLibs(item.Both.libs);
                        s.Both.libpaths = this.parseFolders(item.Both.libpaths);
                        s.Both.binpaths = this.parseFolders(item.Both.binpaths);
                        // Debug
                        s.Debug = <any>{};
                        s.Debug.libs = this.parseLibs(item.Debug.libs);
                        s.Debug.libpaths = this.parseFolders(item.Debug.libpaths);
                        s.Debug.binpaths = this.parseFolders(item.Debug.binpaths);
                        // Release
                        s.Release = <any>{};
                        s.Release.libs = this.parseLibs(item.Release.libs);
                        s.Release.libpaths = this.parseFolders(item.Release.libpaths);
                        s.Release.binpaths = this.parseFolders(item.Release.binpaths);
                        return s;
                    }),
                    m.version);
            }
        }
        vs.window.showErrorMessage("No json config file defined.");
        return <ConfigFile>{};
    }

    async writeJSON() {
        if (this.jsonFile === undefined && this.workspace) {
            createFile(path.join(this.workspace, "./.vscode/cpp_lib_config.json")).then((result) => {
                if (this.workspace && result) {
                    this.jsonFile = path.join(this.workspace, './.vscode', 'cpp_lib_config.json');
                    fs.writeFileSync(this.jsonFile, this.data.toString());
                } else {
                    vs.window.showWarningMessage("Error creating config file.");
                }
            });
        } else if (this.jsonFile) {
            fs.writeFileSync(this.jsonFile, this.data.toString());
        } else {
            vs.window.showWarningMessage("Select a workspace folder first.");
        }

    }

    private parseFolders(folders: any[]): Folder[] {
        if (folders!==undefined) {
            return folders.map((item): Folder => {
                if (this.workspace && item) {
                    if (item.path === "") {
                        item.path = "./";
                    }
                    if (item.arch) {
                        return new Folder(path.basename(path.resolve(this.workspace, item.path)), path.resolve(this.workspace, item.path), slash(item.path), item.arch);
                    } else {
                        return new Folder(path.basename(path.resolve(this.workspace, item.path)), path.resolve(this.workspace, item.path), slash(item.path), "ALL");
                    }
                }
                return <Folder>{};
            });
        }
            return [];
        
    }

    private parseIncludes(folders: any[]): Folder[] {
        if (folders !== undefined) {
        return folders.map((item): Folder => {
            if (this.workspace && item) {
                if (item === "") {
                    item = "./";
                    return new Folder(path.basename(item), item, item, "ALL");
                }
                return new Folder(path.basename(path.resolve(this.workspace, item)), path.resolve(this.workspace, item), slash(item), "ALL");
            }
            return <Folder>{};
        });
        }
        return [];
    }

    private parseLibs(libs: any[]): Lib[] {
        if (libs !== undefined) {
            return libs.map((item): Lib => {
                return new Lib(this.getLabel(item.label), this.getExt(item.label), item.arch);
            });
        }
        return [];
    }

    private getLabel(name: string): string {
        if (name.indexOf(".") > 0) {
            return name.substring(0, name.indexOf("."));
        }
        return name;
    }
    private getExt(name: string): string {
        if (name.indexOf(".")) {
            return name.substr(name.indexOf(".") + 1);
        }
        return "";
    }

    async addLib(debug: boolean, act: number) {
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
                                } else if (!this.data.configuration[act].Release.libs.includes(t)) {
                                    this.data.configuration[act].Release.libs.push(t);
                                }
                            }
                            else { vs.window.showWarningMessage("The library: " + tempstr + " doesn't have an extension."); }
                            tempstr = '';
                        } else { tempstr += this.input.value[i]; }
                    }
                    if (tempstr.includes(".")) {
                        var t = this.parseLibName(tempstr);
                        if (debug && !this.data.configuration[act].Debug.libs.includes(t)) {
                            this.data.configuration[act].Debug.libs.push(t);
                        } else if (!this.data.configuration[act].Release.libs.includes(t)) {
                            this.data.configuration[act].Release.libs.push(t);
                        }
                    }
                    else { vs.window.showWarningMessage("The library: " + tempstr + " doesn't have an extension."); }
                } else {
                    if (this.input.value.includes(".")) {
                        var t = this.parseLibName(this.input.value);
                        if (debug && !this.data.configuration[act].Debug.libs.includes(t)) {
                            this.data.configuration[act].Debug.libs.push(t);
                        } else if (!this.data.configuration[act].Release.libs.includes(t)) {
                            this.data.configuration[act].Release.libs.push(t);
                        }
                    } else { vs.window.showWarningMessage("The library: " + this.input.value + " doesn't have an extension."); }
                }
                this.writeJSON();
                this.input.hide();
            }
        });
    }

    async loadLibFile(debug: boolean, act: number) {
        if (this.workspace) {
            let options: vs.OpenDialogOptions = {
                title: "Select Library Files",
                canSelectMany: true,
                openLabel: 'Select Files',
                canSelectFiles: true,
                filters: {
                    'Lib Files': ['Lib', 'a'],
                    'All files': ['*']
                }
            };
            await vs.window.showOpenDialog(options).then(fileUri => {
                if (fileUri && fileUri[0]) {
                    for (let i = 0; i < fileUri.length; i++) {
                        const element = fileUri[i];
                        var filename = element.fsPath.slice(element.fsPath.lastIndexOf("\\") + 1);
                        var name = filename.slice(0, filename.lastIndexOf("."));
                        var extension = filename.slice(filename.lastIndexOf(".") + 1);
                        var _path = element.fsPath.slice(0, element.fsPath.lastIndexOf("\\"));
                        var t = new Lib(name, extension, "ALL", _path);
                        if (debug && !this.data.configuration[act].Debug.libs.includes(t)) {
                            this.data.configuration[act].Debug.libs.push(t);
                        } else if (!this.data.configuration[act].Release.libs.includes(t)) {
                            this.data.configuration[act].Release.libs.push(t);
                        }
                    }
                    this.writeJSON();
                }
            });
        }
        else { vs.window.showInformationMessage("Please select a workspace folder first."); }
    }

    delLib(debug: boolean, act: number, element: Lib) {
        var temp: Lib[];
        if (debug) { temp = this.data.configuration[act].Debug.libs; }
        else { temp = this.data.configuration[act].Release.libs; }
        if (temp.length > 0) {
            for (let i = 0; i < temp.length; i++) {
                const elem = temp[i];
                if (elem === element) {
                    if (debug) { this.data.configuration[act].Debug.libs.splice(i, 1); }
                    else { this.data.configuration[act].Release.libs.splice(i, 1); }
                }
            }
            this.writeJSON();
        }

    }

    private parseLibName(value: string): Lib {
        var i = value.lastIndexOf('.');
        return new Lib(value.substring(0, i), value.substring(i + 1), "ALL", " ");
    }

    async loadIncludePath(act: number) {
        if (this.workspace) {
            await vs.window.showOpenDialog(this.getFolderConfig("Select Include Folders"))
                .then(fileUri => {
                    if (fileUri && fileUri[0] && this.workspace) {
                        for (let i = 0; i < fileUri.length; i++) {
                            const element = fileUri[i];
                            var rel = slash(path.relative(this.workspace, element.fsPath));
                            if (rel === "") { rel = './'; };
                            this.data.configuration[act].Includes.push(new Folder(path.basename(element.fsPath), element.fsPath, rel));
                        }
                        this.writeJSON();
                    }
                });
        }
        else { vs.window.showInformationMessage("Please select a workspace folder first."); }
    }

    delIncludePath(act: number, name: Folder) {
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

    async loadLibPath(debug: boolean, act: number) {
        if (this.workspace) {
            await vs.window.showOpenDialog(this.getFolderConfig("Select Library Path Folders"))
                .then(fileUri => {
                    if (fileUri && fileUri[0] && this.workspace) {
                        for (let i = 0; i < fileUri.length; i++) {
                            const element = fileUri[i];
                            var filename = path.basename(element.fsPath);
                            var rel = slash(path.relative(this.workspace, element.fsPath));
                            if (rel === "") { rel = './'; };
                            if (debug) {
                                this.data.configuration[act].Debug.libpaths.push(new Folder(filename, element.fsPath, rel));
                            } else {
                                this.data.configuration[act].Release.libpaths.push(new Folder(filename, element.fsPath, rel));
                            }
                        }
                        this.writeJSON();
                    }
                });
        }
        else {
            vs.window.showInformationMessage("Please select a workspace folder first.");
        }
    }

    delLibPath(debug: boolean, act: number, name: Folder) {
        var temp: Folder[];
        if (debug) { temp = this.data.configuration[act].Debug.libpaths; }
        else { temp = this.data.configuration[act].Release.libpaths; }
        if (temp.length > 0) {
            for (let i = 0; i < temp.length; i++) {
                const element = temp[i];
                if (element === name) {
                    if (debug) { this.data.configuration[act].Debug.libpaths.splice(i, 1); }
                    else { this.data.configuration[act].Release.libpaths.splice(i, 1); }
                }
            }
            this.writeJSON();
        }
    }

    async loadBinPath(debug: boolean, act: number) {
        if (this.workspace) {
            await vs.window.showOpenDialog(this.getFolderConfig("Select Binary Path Folders"))
                .then(fileUri => {
                    if (fileUri && fileUri[0] && this.workspace) {
                        for (let i = 0; i < fileUri.length; i++) {
                            const element = fileUri[i];
                            var filename = path.basename(element.fsPath);
                            var rel = slash(path.relative(this.workspace, element.fsPath));
                            if (rel === "") { rel = './'; };
                            if (debug) {
                                this.data.configuration[act].Debug.binpaths.push(new Folder(filename, element.fsPath, rel));
                            } else {
                                this.data.configuration[act].Release.binpaths.push(new Folder(filename, element.fsPath, rel));
                            }
                        }
                        this.writeJSON();
                    }
                });
        } else {
            vs.window.showInformationMessage("Please select a workspace folder first.");
        }
    }

    delBinPath(debug: boolean, act: number, name: Folder) {
        var temp: Folder[];
        if (debug) { temp = this.data.configuration[act].Debug.binpaths; }
        else { temp = this.data.configuration[act].Release.binpaths; }
        for (let i = 0; i < temp.length; i++) {
            const element = temp[i];
            if (element === name) {
                if (debug) { this.data.configuration[act].Debug.binpaths.splice(i, 1); }
                else { this.data.configuration[act].Release.binpaths.splice(i, 1); }
            }

        }
        this.writeJSON();
    }

    private getFolderConfig(_title: string): vs.OpenDialogOptions {
        let options: vs.OpenDialogOptions = {
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

    switchArch(debug: boolean, act: number, arch: string, name: Lib) {
        if (debug) {
            if (this.data.configuration[act].Debug.libs.length > 0) {
                let i = this.data.configuration[act].Debug.libs.indexOf(name);
                this.data.configuration[act].Debug.libs[i].description = arch;
                this.data.configuration[act].Debug.libs[i].contextValue = arch;
                this.data.configuration[act].Debug.libs[i].tooltip = this.data.configuration[act].Debug.libs[i].label + "." + this.data.configuration[act].Debug.libs[i].ext + " -> " + this.data.configuration[act].Debug.libs[i].contextValue;
            }
        } else {
            if (this.data.configuration[act].Release.libs.length > 0) {
                let i = this.data.configuration[act].Release.libs.indexOf(name);
                this.data.configuration[act].Release.libs[i].description = arch;
                this.data.configuration[act].Release.libs[i].contextValue = arch;
                this.data.configuration[act].Release.libs[i].tooltip = this.data.configuration[act].Release.libs[i].label + "." + this.data.configuration[act].Release.libs[i].ext + " -> " + this.data.configuration[act].Release.libs[i].contextValue;
            }
        }
        this.writeJSON();
    }
    emptyData(version: string): ConfigFile {
        let f: configTemplate = {
            Name: "",
            Includes: [],
            Both: <any>{
                libs: [],
                libpaths: [],
                binpaths: []
            },
            Debug: <any>{
                libs: [],
                libpaths: [],
                binpaths: []
            },
            Release: <any>{
                libs: [],
                libpaths: [],
                binpaths: []
            }
        };
        return new ConfigFile([f], version);
    }
}
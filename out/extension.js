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
exports.deactivate = exports.activate = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vs = require("vscode");
const path = require("path");
const fs = require("fs");
const Views_1 = require("./definitions/Views");
const commands_1 = require("./definitions/commands");
const Trees_1 = require("./trees/Trees");
const Configuration_1 = require("./classes/Configuration");
const File_1 = require("./definitions/File");
const CodeLens_1 = require("./classes/CodeLens");
const config_completion_1 = require("./definitions/config_completion");
var chokidar = require("chokidar");
let compiled = false;
let debug = false;
let jsonReady = false;
let act = 0;
let fileExist = false;
let configPath;
let Include_provider;
let Lib_provider;
let LibPath_provider;
let BinPath_provider;
let dis;
var watcher;
let disposables = [];
const version = "0.0.1";
// $Env:Path
// workbench.action.tasks.configureDefaultTestTask
//workbench.action.tasks.configureTaskRunner
//Get-ChildItem -Path Env:\ >> envs.txt
function activate(context) {
    /*let PATH = getPATH().then(() => {
        getENVS();
    });*/
    config_completion_1.registerConfigCompletion(context);
    console.log(context.asAbsolutePath("./"));
    commands_1.initContext();
    disposables.push(commands_1.registerStatusBarIcon());
    Views_1.registerWebView(context);
    disposables.push(commands_1.registerRun(context, true));
    disposables.push(commands_1.registerCompile(context));
    disposables.concat(CodeLens_1.registerCodeLens());
    var equal = [];
    const findFile = (dirs, id, stopAtMatch) => {
        dirs.forEach((dir) => {
            let files = fs.readdirSync(dir);
            let advance = true;
            for (let i = 0; i < files.length; i++) {
                const item = files[i];
                let state = fs.statSync(path.resolve(dir, item));
                if (state.isDirectory()) {
                    findFile([path.resolve(dir, item)], id, stopAtMatch);
                }
                else if (item === id) {
                    equal.push(path.resolve(dir, item));
                    if (stopAtMatch) {
                        return;
                    }
                }
            }
        });
    };
    if (File_1.pathExists("C:/Program Files (x86)/Microsoft Visual Studio")) {
        console.log("hay ward");
        findFile(["C:/Program Files (x86)/Microsoft Visual Studio"], "cl.exe", true);
        console.log(equal);
        equal = [];
        findFile(["C:/libs"], "gcc.exe", true);
        console.log(equal);
    }
    if (vs.workspace.rootPath) {
        configPath = path.join(vs.workspace.rootPath, "/.vscode/cpp_lib_config.json");
        fileExist = File_1.pathExists(configPath);
        if (fileExist) {
            console.log("existo");
            dis = new Configuration_1.Configuration(configPath, version);
            updateWelcome();
            watcher = chokidar.watch(configPath, {
                persistent: true,
                ignoreInitial: true,
                usePolling: false,
                interval: 100,
                binaryInterval: 300,
                alwaysStat: false,
                awaitWriteFinish: {
                    stabilityThreshold: 2000,
                    pollInterval: 100
                },
            });
        }
        else {
            console.log("no Existo");
            dis = new Configuration_1.Configuration("", version);
        }
    }
    else {
        dis = new Configuration_1.Configuration("", version);
    }
    Include_provider = new Trees_1.IncludeFolders(dis.getIncludes(act));
    Lib_provider = new Trees_1.Libs(dis.getLibs(debug, act));
    LibPath_provider = new Trees_1.LibFolders(dis.getLibPaths(debug, act));
    BinPath_provider = new Trees_1.BinFolders(dis.getBinPaths(debug, act));
    let Trees = Views_1.registerTrees([Include_provider, Lib_provider, LibPath_provider, BinPath_provider,]);
    if (fileExist && configPath) {
        watcher
            .on("change", (item) => {
            if (jsonReady) {
                dis.refresh();
                if (debug) {
                    Include_provider = new Trees_1.IncludeFolders(dis.getIncludes(act));
                    Lib_provider = new Trees_1.Libs(dis.getLibs(debug, act));
                    LibPath_provider = new Trees_1.LibFolders(dis.getLibPaths(debug, act));
                    BinPath_provider = new Trees_1.BinFolders(dis.getBinPaths(debug, act));
                }
                else {
                    Include_provider = new Trees_1.IncludeFolders(dis.getIncludes(act));
                    Lib_provider = new Trees_1.Libs(dis.getLibs(debug, act));
                    LibPath_provider = new Trees_1.LibFolders(dis.getLibPaths(debug, act));
                    BinPath_provider = new Trees_1.BinFolders(dis.getBinPaths(debug, act));
                }
                updateWelcome();
                Trees = Views_1.registerTrees([
                    Include_provider,
                    Lib_provider,
                    LibPath_provider,
                    BinPath_provider,
                ]);
            }
        })
            .on("ready", () => {
            console.log("Initial scan complete. Ready for changes");
            jsonReady = true;
        });
    }
    let refreshLibFiles = vs.commands.registerCommand("_refreshLibFiles", (folder) => {
        Lib_provider.refresh();
        updateWelcome();
    });
    let switchDebug = vs.commands.registerCommand("_Release", () => {
        vs.commands.executeCommand("setContext", "cpp-library-linker:showDebug", true);
        debug = true;
        Trees[1].title = "Library Files: DEBUG";
        Trees[2].title = "Lib Folders: DEBUG";
        Trees[3].title = "Bin Folders: DEBUG";
        Lib_provider = new Trees_1.Libs(dis.getLibs(debug, act));
        LibPath_provider = new Trees_1.LibFolders(dis.getLibPaths(debug, act));
        BinPath_provider = new Trees_1.BinFolders(dis.getBinPaths(debug, act));
        updateWelcome();
        Trees = Views_1.registerTrees([Include_provider, Lib_provider, LibPath_provider, BinPath_provider,]);
        //WebView.refresh();
    });
    let switchRelease = vs.commands.registerCommand("_Debug", () => {
        vs.commands.executeCommand("setContext", "cpp-library-linker:showDebug", false);
        debug = false;
        Trees[1].title = "Library Files: RELEASE";
        Trees[2].title = "Lib Folders: RELEASE";
        Trees[3].title = "Bin Folders: RELEASE";
        Lib_provider = new Trees_1.Libs(dis.getLibs(debug, act));
        LibPath_provider = new Trees_1.LibFolders(dis.getLibPaths(debug, act));
        BinPath_provider = new Trees_1.BinFolders(dis.getBinPaths(debug, act));
        updateWelcome();
        Trees = Views_1.registerTrees([Include_provider, Lib_provider, LibPath_provider, BinPath_provider,]);
        //WebView.refresh();
    });
    let addLib = vs.commands.registerCommand("_addLibFile", () => __awaiter(this, void 0, void 0, function* () {
        dis.addLib(debug, act);
        dis.input.onDidHide(() => {
            updateWelcome();
            Lib_provider.refresh();
        });
    }));
    let addLib_folder = vs.commands.registerCommand("_addLibFile_folder", () => __awaiter(this, void 0, void 0, function* () {
        yield dis.loadLibFile(debug, act);
        updateWelcome();
        Lib_provider.refresh();
    }));
    let delLib = vs.commands.registerCommand("_delLibFile", (name) => {
        dis.delLib(debug, act, name);
        updateWelcome();
        Lib_provider.refresh();
    });
    let refreshCompilers = vs.commands.registerCommand("_refreshCompilers", () => { });
    let addLibFolder = vs.commands.registerCommand("_addLibPath", () => __awaiter(this, void 0, void 0, function* () {
        yield dis.loadLibPath(debug, act);
        updateWelcome();
        LibPath_provider.refresh();
    }));
    let delLibFolder = vs.commands.registerCommand("_delLibPath", (name) => {
        dis.delLibPath(debug, act, name);
        updateWelcome();
        LibPath_provider.refresh();
    });
    let addBinFolder = vs.commands.registerCommand("_addBinPath", () => __awaiter(this, void 0, void 0, function* () {
        yield dis.loadBinPath(debug, act);
        updateWelcome();
        BinPath_provider.refresh();
    }));
    let delBinFolder = vs.commands.registerCommand("_delBinPath", (name) => {
        dis.delBinPath(debug, act, name);
        updateWelcome();
        BinPath_provider.refresh();
    });
    let addIncludeFolder = vs.commands.registerCommand("_addIncludePath", () => __awaiter(this, void 0, void 0, function* () {
        yield dis.loadIncludePath(act);
        updateWelcome();
        Include_provider.refresh();
    }));
    let delIncludeFolder = vs.commands.registerCommand("_delIncludePath", (name) => {
        dis.delIncludePath(act, name);
        updateWelcome();
        Include_provider.refresh();
    });
    let switchAll = vs.commands.registerCommand("_switchAll", (name) => {
        dis.switchArch(debug, act, "x64", name);
        Lib_provider.refresh();
    });
    let switchx64 = vs.commands.registerCommand("_switchx64", (name) => {
        dis.switchArch(debug, act, "x86", name);
        Lib_provider.refresh();
    });
    let switchx86 = vs.commands.registerCommand("_switchx86", (name) => {
        dis.switchArch(debug, act, "ALL", name);
        Lib_provider.refresh();
    });
    //let cmd = vs.window.createTerminal("C++ Shell");
    //cmd.sendText('cd "${cwd}"');
    //cmd.sendText("gcc --version");
    // vs.window.onDidWriteTerminalData((e) => { console.log(e.data); });
    //cmd.show(true);
    /*vs.window.onDidOpenTerminal(() => {
        if (vs.window.activeTerminal?.name === cmd.name) {
            vs.commands.executeCommand("workbench.action.terminal.clear");
        }
    });*/
    context.subscriptions.push(refreshCompilers);
    context.subscriptions.push(addLib);
    context.subscriptions.push(addLib_folder);
    context.subscriptions.push(delLib);
    context.subscriptions.push(addBinFolder);
    context.subscriptions.push(delBinFolder);
    context.subscriptions.push(addLibFolder);
    context.subscriptions.push(delLibFolder);
    context.subscriptions.push(addIncludeFolder);
    context.subscriptions.push(delIncludeFolder);
    context.subscriptions.push(switchDebug);
    context.subscriptions.push(switchRelease);
    context.subscriptions.push(switchAll);
    context.subscriptions.push(switchx64);
    context.subscriptions.push(switchx86);
    context.subscriptions.push(refreshLibFiles);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (disposables) {
        disposables.forEach(item => item.dispose());
    }
    disposables = [];
}
exports.deactivate = deactivate;
function updateWelcome() {
    if (dis.manyBinPaths(debug, act) > 0) {
        vs.commands.executeCommand("setContext", "cpp-library-linker:showBinPaths", false);
    }
    else {
        vs.commands.executeCommand("setContext", "cpp-library-linker:showBinPaths", true);
    }
    if (dis.manyLibPaths(debug, act) > 0) {
        vs.commands.executeCommand("setContext", "cpp-library-linker:showLibPaths", false);
    }
    else {
        vs.commands.executeCommand("setContext", "cpp-library-linker:showLibPaths", true);
    }
    if (dis.manyIncludes(act) > 0) {
        vs.commands.executeCommand("setContext", "cpp-library-linker:showIncludes", false);
    }
    else {
        vs.commands.executeCommand("setContext", "cpp-library-linker:showIncludes", true);
    }
    if (dis.manyLibs(debug, act) > 0) {
        vs.commands.executeCommand("setContext", "cpp-library-linker:showLibs", false);
    }
    else {
        vs.commands.executeCommand("setContext", "cpp-library-linker:showLibs", true);
    }
}
//# sourceMappingURL=extension.js.map
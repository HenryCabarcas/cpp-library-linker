"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initContext = exports.registerStatusBarIcon = exports.registerRun = exports.registerCompile = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vs = require("vscode");
const File_1 = require("./File");
function registerCompile(context) {
    let Compile = vs.commands.registerCommand("_Compile", () => {
        console.log(vs.workspace.rootPath);
        if (File_1.pathExists(vs.workspace.rootPath + "/.vs/tasks.json")) {
            console.log("Done");
        }
        else {
            console.log("Path Error");
        }
        loadCppExtension();
    });
    context.subscriptions.push(Compile);
    return Compile;
}
exports.registerCompile = registerCompile;
function loadCppExtension() {
    var cppDefault = vs.extensions.getExtension("vs.cpptools");
    console.log(cppDefault === null || cppDefault === void 0 ? void 0 : cppDefault.extensionPath);
    if (cppDefault === null || cppDefault === void 0 ? void 0 : cppDefault.isActive) {
        vs.commands.executeCommand("C_Cpp.ConfigurationSelect");
        console.log("CPP Extension activated");
    }
    else {
        cppDefault === null || cppDefault === void 0 ? void 0 : cppDefault.activate().then(function () {
            console.log("CPP Extension activated");
            vs.commands.executeCommand("C_Cpp.ConfigurationSelect");
        }, function () {
            console.log("CPP Extension activation failed");
        });
    }
    console.log("'Done'");
}
function registerRun(context, compiled) {
    vs.window.showInformationMessage(`CodeLens action clicked with any`);
    let Run = vs.commands.registerCommand("_Run", (e) => {
        if (!compiled) {
            vs.window.showQuickPick(["01", "02", "03"], { canPickMany: false });
            let list = vs.window.createQuickPick();
            list.canSelectMany = false;
            list.sortByLabel = true;
            list.title = "Select a task";
            list.items = [{
                    label: "01",
                    description: "Descripcion",
                    detail: "Detalle"
                }, {
                    label: "02",
                    description: "Descripcion",
                    detail: "Detalle"
                },
                {
                    label: "03",
                    description: "Descripcion",
                    detail: "Detalle"
                }];
            list.show();
            list.onDidAccept((item) => {
                list.hide();
                list.selectedItems.forEach((item) => {
                    vs.window.showInformationMessage(item.label);
                });
                vs.commands.executeCommand("workbench.action.tasks.configureDefaultTestTask");
            });
            vs.commands.executeCommand("_Compile");
        }
        // vs.commands.executeCommand("vs.openFolder", e, true);
    });
    context.subscriptions.push(Run);
    return Run;
}
exports.registerRun = registerRun;
function registerStatusBarIcon() {
    let Statusbar_item = vs.window.createStatusBarItem(vs.StatusBarAlignment.Left);
    Statusbar_item.text = "$(debug-start) Run C++ Code";
    Statusbar_item.command = "_Run";
    Statusbar_item.show();
    Statusbar_item.tooltip = "Compile and Run the main C++ file.";
    return Statusbar_item;
}
exports.registerStatusBarIcon = registerStatusBarIcon;
function initContext() {
    vs.commands.executeCommand("setContext", "cpp-library-linker:showDebug", false);
    vs.commands.executeCommand("setContext", "cpp-library-linker:showIncludes", true);
    vs.commands.executeCommand("setContext", "cpp-library-linker:showLibs", true);
    vs.commands.executeCommand("setContext", "cpp-library-linker:showLibPaths", true);
    vs.commands.executeCommand("setContext", "cpp-library-linker:showBinPaths", true);
}
exports.initContext = initContext;
//# sourceMappingURL=commands.js.map
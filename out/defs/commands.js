"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStatusBarIcon = exports.registerRun = exports.registerCompile = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
const File_1 = require("./File");
function registerCompile(context) {
    let Compile = vscode.commands.registerCommand("_Compile", () => {
        console.log(vscode.workspace.rootPath);
        if (File_1.pathExists(vscode.workspace.rootPath + "/.vscode/tasks.json")) {
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
    var cppDefault = vscode.extensions.getExtension("vscode.cpptools");
    console.log(cppDefault === null || cppDefault === void 0 ? void 0 : cppDefault.extensionPath);
    if (cppDefault === null || cppDefault === void 0 ? void 0 : cppDefault.isActive) {
        vscode.commands.executeCommand("C_Cpp.ConfigurationSelect");
        console.log("CPP Extension activated");
    }
    else {
        cppDefault === null || cppDefault === void 0 ? void 0 : cppDefault.activate().then(function () {
            console.log("CPP Extension activated");
            vscode.commands.executeCommand("C_Cpp.ConfigurationSelect");
        }, function () {
            console.log("CPP Extension activation failed");
        });
    }
    console.log("'Done'");
}
function registerRun(context, compiled) {
    let Run = vscode.commands.registerCommand("_Run", (e) => {
        if (!compiled) {
            vscode.window.showQuickPick(["01", "02", "03"], { canPickMany: false });
            let list = vscode.window.createQuickPick();
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
                    vscode.window.showInformationMessage(item.label);
                });
                vscode.commands.executeCommand("workbench.action.tasks.configureDefaultTestTask");
            });
            vscode.commands.executeCommand("_Compile");
        }
        // vscode.commands.executeCommand("vscode.openFolder", e, true);
    });
    context.subscriptions.push(Run);
    return Run;
}
exports.registerRun = registerRun;
function registerStatusBarIcon() {
    let Statusbar_item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    Statusbar_item.text = "$(debug-start) Run C++ Code";
    Statusbar_item.command = "_Run";
    Statusbar_item.show();
    Statusbar_item.tooltip = "Compile and Run the main C++ file.";
    return Statusbar_item;
}
exports.registerStatusBarIcon = registerStatusBarIcon;
//# sourceMappingURL=commands.js.map
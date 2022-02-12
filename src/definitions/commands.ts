/* eslint-disable @typescript-eslint/naming-convention */
import * as vs from 'vscode';
import { pathExists } from './File';

export function registerCompile(context: vs.ExtensionContext): vs.Disposable {
    let Compile = vs.commands.registerCommand("_Compile", () => {
        console.log(vs.workspace.rootPath);
        if (pathExists(vs.workspace.rootPath + "/.vs/tasks.json")) {
            console.log("Done");
        } else {
            console.log("Path Error");
        }
        loadCppExtension();
    });
    context.subscriptions.push(Compile);
    return Compile;

}

function loadCppExtension() {
    var cppDefault = vs.extensions.getExtension("vs.cpptools");
    console.log(cppDefault?.extensionPath);
    if (cppDefault?.isActive) {
        vs.commands.executeCommand("C_Cpp.ConfigurationSelect");
        console.log("CPP Extension activated");
    } else {

        cppDefault?.activate().then(
            function () {
                console.log("CPP Extension activated");
                vs.commands.executeCommand("C_Cpp.ConfigurationSelect");
            },
            function () {
                console.log("CPP Extension activation failed");
            }
        );

    }
    console.log("'Done'");

}

export function registerRun(context: vs.ExtensionContext, compiled: boolean): vs.Disposable {
    
    vs.window.showInformationMessage(`CodeLens action clicked with any`);
    let Run = vs.commands.registerCommand("_Run", (e) => {
        if (!compiled) {
            vs.window.showQuickPick(["01", "02", "03"], { canPickMany: false });
            let list = vs.window.createQuickPick();
            list.canSelectMany = false;
            list.sortByLabel = true;
            list.title = "Select a task";
            list.items=[{
                label: "01",
                description: "Descripcion",
                detail:"Detalle"
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

export function registerStatusBarIcon():vs.StatusBarItem {
    let Statusbar_item = vs.window.createStatusBarItem(vs.StatusBarAlignment.Left);
    Statusbar_item.text = "$(debug-start) Run C++ Code";
    Statusbar_item.command = "_Run";
    Statusbar_item.show();
    Statusbar_item.tooltip = "Compile and Run the main C++ file.";
    return Statusbar_item;
}

export function initContext() {
    vs.commands.executeCommand("setContext", "cpp-library-linker:showDebug", false);
    vs.commands.executeCommand("setContext", "cpp-library-linker:showIncludes", true);
    vs.commands.executeCommand("setContext", "cpp-library-linker:showLibs", true);
    vs.commands.executeCommand("setContext", "cpp-library-linker:showLibPaths", true);
    vs.commands.executeCommand("setContext", "cpp-library-linker:showBinPaths", true);
}


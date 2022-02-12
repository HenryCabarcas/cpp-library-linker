"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCodeLens = exports.CodelensProvider = void 0;
const vs = require("vscode");
class CodelensProvider {
    constructor() {
        this.codeLenses = [];
        this._onDidChangeCodeLenses = new vs.EventEmitter();
        this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
        this.regex = /(int main)/g;
        vs.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }
    provideCodeLenses(document, token) {
        if (vs.workspace.getConfiguration("cpp-library-linker").get("enableCodeLens-RunOnCode", true)) {
            this.codeLenses = [];
            const regex = new RegExp(this.regex);
            const text = document.getText();
            let matches;
            while ((matches = regex.exec(text)) !== null) {
                const line = document.lineAt(document.positionAt(matches.index).line);
                const indexOf = line.text.indexOf(matches[0]);
                const position = new vs.Position(line.lineNumber, indexOf);
                const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));
                if (range) {
                    this.codeLenses.push(new vs.CodeLens(range));
                }
            }
            return this.codeLenses;
        }
        return [];
    }
    resolveCodeLens(codeLens, token) {
        if (vs.workspace.getConfiguration("cpp-library-linker").get("enableCodeLens-RunOnCode", true)) {
            codeLens.command = {
                title: "$(debug-start) Run C++ Code",
                tooltip: "Run the C++ code",
                command: "_Run",
                arguments: ["Argument 1", false]
            };
            return codeLens;
        }
        return null;
    }
}
exports.CodelensProvider = CodelensProvider;
function registerCodeLens() {
    const codelensProvider = new CodelensProvider();
    let f = [];
    f.push(vs.languages.registerCodeLensProvider({
        language: 'cpp',
        scheme: 'file',
    }, codelensProvider));
    f.push(vs.commands.registerCommand("_enableCodeLensOnCode", () => {
        vs.workspace.getConfiguration("cpp-library-linker").update("enableCodeLens-RunOnCode", true, true);
    }));
    f.push(vs.commands.registerCommand("_disableCodeLensOnCode", () => {
        vs.workspace.getConfiguration("cpp-library-linker").update("enableCodeLens-RunOnCode", false, true);
    }));
    return f;
}
exports.registerCodeLens = registerCodeLens;
//# sourceMappingURL=CodeLens.js.map
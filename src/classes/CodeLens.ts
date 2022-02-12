import * as vs from 'vscode';

export class CodelensProvider implements vs.CodeLensProvider {

    private codeLenses: vs.CodeLens[] = [];
    private regex: RegExp;
    private _onDidChangeCodeLenses: vs.EventEmitter<void> = new vs.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vs.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.regex = /(int main)/g;

        vs.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vs.TextDocument, token: vs.CancellationToken): vs.CodeLens[] | Thenable<vs.CodeLens[]> {

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

    public resolveCodeLens(codeLens: vs.CodeLens, token: vs.CancellationToken) {
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

export function registerCodeLens():vs.Disposable[] {
    const codelensProvider = new CodelensProvider();
    let f:vs.Disposable[]=[];
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

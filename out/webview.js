"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomePage = void 0;
const vscode = require("vscode");
class HomePage {
    constructor(_extensionUri, context) {
        this._extensionUri = _extensionUri;
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(data => {
            var _a;
            switch (data.type) {
                case 'colorSelected':
                    {
                        (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.insertSnippet(new vscode.SnippetString(`#${data.value}`));
                        break;
                    }
            }
        });
    }
    addColor() {
        var _a, _b;
        if (this._view) {
            (_b = (_a = this._view).show) === null || _b === void 0 ? void 0 : _b.call(_a, true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._view.webview.postMessage({ type: 'addColor' });
        }
    }
    clearColors() {
        if (this._view) {
            this._view.webview.postMessage({ type: 'clearColors' });
        }
    }
    _getHtmlForWebview(webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const imagesUri = webview.asWebviewUri(vscode.Uri.file("resources/del_data.svg"));
        // Do the same for the stylesheet.
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', 'vscode-codicons', 'dist', 'codicon.css'));
        const codiconsFontUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', 'vscode-codicons', 'dist', 'codicon.ttf'));
        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();
        const html = `<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">

        <!--		Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
                -->
        <meta http-equiv="Content-Security-Policy"
            content="default-src 'none'; font-src ${codiconsFontUri}; style-src ${webview.cspSource} ${codiconsUri};">
        <meta http-equiv="Content-Security-Policy"
            content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${styleUri}" rel="stylesheet" />
        <link href="${codiconsUri}" rel="stylesheet" />
        <title>Cat Colors</title>
    </head>

    <body>
        <div class="dropdown">
            <div class="dropbtn">
                <div><a id="Actual-compiler">GCC v8.1.0 x64</a></div>
                <div>
                    <svg id="svgdrop" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16"
                        viewBox="0 0 172 172" <g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1"
                        stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray=""
                        stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none"
                        style="mix-blend-mode: normal">
                        <path d="M0,172v-172h172v172z" fill="none"></path>
                        <g fill="#000000">
                            <path
                                d="M26.875,10.75c-8.86035,0 -16.125,7.26465 -16.125,16.125v107.5c0,8.86035 7.26465,16.125 16.125,16.125h107.5c8.86035,0 16.125,-7.26465 16.125,-16.125v-107.5c0,-8.86035 -7.26465,-16.125 -16.125,-16.125zM26.875,21.5h107.5c3.02344,0 5.375,2.35156 5.375,5.375v107.5c0,3.02344 -2.35156,5.375 -5.375,5.375h-107.5c-3.02344,0 -5.375,-2.35156 -5.375,-5.375v-107.5c0,-3.02344 2.35156,-5.375 5.375,-5.375zM46.7793,59.88086l-7.55859,7.60058l41.40429,41.40429l41.44629,-41.40429l-7.64258,-7.60058l-33.80371,33.8457z">
                            </path>
                        </g>
                        </g>
                    </svg>
                </div>
            </div>
            <div id="compilerlist" class="dropdown-content">
            </div>
        </div>
        <div class="icon"><i class="codicon codicon-debug-restart-frame"></i></div>
        <ul class="color-list">
        </ul>
        <button id="create_project" class="add-color-button">Create C++ Project</button>

        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>

</html>`;
        return html;
    }
}
exports.HomePage = HomePage;
HomePage.viewType = 'cpp-library-linker.principalView';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=webview.js.map
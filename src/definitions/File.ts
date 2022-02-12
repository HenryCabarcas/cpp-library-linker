/* eslint-disable @typescript-eslint/naming-convention */
import * as fs from 'fs';
import * as vs from 'vscode';
import * as path from 'path';
var lineReader = require('line-reader');

export function pathExists(p: string): boolean {

    try {
        return fs.existsSync(p);
    } catch (err) {
        return false;
    }
    return true;
}

export function writeJSONFile(obj: object, _path: string) {
    if (!pathExists(_path)) {
        vs.window.showInformationMessage('the file ' + _path + " doesn't exists.");
    }
    fs.writeFileSync(_path, JSON.stringify(obj));
}

export function createFile(name: string): Thenable<boolean> {
    if (!pathExists(name)) {
        const wsedit = new vs.WorkspaceEdit();
        const filePath = vs.Uri.file(name);
        wsedit.createFile(filePath, { ignoreIfExists: true });
        console.log(filePath);
        vs.window.showInformationMessage('Created a new file: ' + path.basename(name));
        return vs.workspace.applyEdit(wsedit);



    } else {
        vs.window.showInformationMessage('the file ' + path.basename(name) + ' already exists.');
    }
    return <Thenable<false>>{};

}

export async function getPATH(): Promise<string[] | undefined> {
    if (vs.workspace.rootPath) {
        let cmd = vs.window.createTerminal("path obtainer");
        cmd.hide();
        await sleep(1000);
        cmd.sendText("cd " + vs.workspace.rootPath);
        cmd.sendText("$Env:PATH -split ';' *> path.log");
        await sleep(1000);
        var pathVar: string[] = [];
        lineReader.eachLine(path.join(vs.workspace.rootPath, 'path.log'), { encoding: 'utf-16le' }, function (line: string) {
            if (line.length > 1) {
                pathVar.push(line);
                console.log(line);
            }
        });
        cmd.dispose();
        return Promise.resolve(pathVar);
    }
    return undefined;
}

export async function getENVS(): Promise<string[] | undefined> {
    if (vs.workspace.rootPath) {
        let cmd = vs.window.createTerminal("envs obtainer");
        cmd.hide();
        await sleep(1000);
        cmd.sendText("cd " + vs.workspace.rootPath);
        cmd.sendText("Get-ChildItem Env: | Sort Name | Format-Table -AutoSize | Out-String -Width 10000 *> path.log");
        await sleep(1000);
        var pathVar: string[] = [];
        lineReader.eachLine(path.join(vs.workspace.rootPath, 'path.log'), { encoding: 'utf-16le' }, function (line: string) {
            if (line.length > 1 && !line.includes('Path') && !line.includes('--') && !line.includes('Name') && !line.includes('PSModulePath')) {
                pathVar.push(line);
                console.log(line);
            }
        });

        cmd.dispose();
        return Promise.resolve(pathVar);


    }
    return undefined;
}

export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}  
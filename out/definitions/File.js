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
exports.sleep = exports.getENVS = exports.getPATH = exports.createFile = exports.writeJSONFile = exports.pathExists = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const fs = require("fs");
const vs = require("vscode");
const path = require("path");
var lineReader = require('line-reader');
function pathExists(p) {
    try {
        return fs.existsSync(p);
    }
    catch (err) {
        return false;
    }
    return true;
}
exports.pathExists = pathExists;
function writeJSONFile(obj, _path) {
    if (!pathExists(_path)) {
        vs.window.showInformationMessage('the file ' + _path + " doesn't exists.");
    }
    fs.writeFileSync(_path, JSON.stringify(obj));
}
exports.writeJSONFile = writeJSONFile;
function createFile(name) {
    if (!pathExists(name)) {
        const wsedit = new vs.WorkspaceEdit();
        const filePath = vs.Uri.file(name);
        wsedit.createFile(filePath, { ignoreIfExists: true });
        console.log(filePath);
        vs.window.showInformationMessage('Created a new file: ' + path.basename(name));
        return vs.workspace.applyEdit(wsedit);
    }
    else {
        vs.window.showInformationMessage('the file ' + path.basename(name) + ' already exists.');
    }
    return {};
}
exports.createFile = createFile;
function getPATH() {
    return __awaiter(this, void 0, void 0, function* () {
        if (vs.workspace.rootPath) {
            let cmd = vs.window.createTerminal("path obtainer");
            cmd.hide();
            yield sleep(1000);
            cmd.sendText("cd " + vs.workspace.rootPath);
            cmd.sendText("$Env:PATH -split ';' *> path.log");
            yield sleep(1000);
            var pathVar = [];
            lineReader.eachLine(path.join(vs.workspace.rootPath, 'path.log'), { encoding: 'utf-16le' }, function (line) {
                if (line.length > 1) {
                    pathVar.push(line);
                    console.log(line);
                }
            });
            cmd.dispose();
            return Promise.resolve(pathVar);
        }
        return undefined;
    });
}
exports.getPATH = getPATH;
function getENVS() {
    return __awaiter(this, void 0, void 0, function* () {
        if (vs.workspace.rootPath) {
            let cmd = vs.window.createTerminal("envs obtainer");
            cmd.hide();
            yield sleep(1000);
            cmd.sendText("cd " + vs.workspace.rootPath);
            cmd.sendText("Get-ChildItem Env: | Sort Name | Format-Table -AutoSize | Out-String -Width 10000 *> path.log");
            yield sleep(1000);
            var pathVar = [];
            lineReader.eachLine(path.join(vs.workspace.rootPath, 'path.log'), { encoding: 'utf-16le' }, function (line) {
                if (line.length > 1 && !line.includes('Path') && !line.includes('--') && !line.includes('Name') && !line.includes('PSModulePath')) {
                    pathVar.push(line);
                    console.log(line);
                }
            });
            cmd.dispose();
            return Promise.resolve(pathVar);
        }
        return undefined;
    });
}
exports.getENVS = getENVS;
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
exports.sleep = sleep;
//# sourceMappingURL=File.js.map
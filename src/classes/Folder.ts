/* eslint-disable @typescript-eslint/naming-convention */
import * as vs from 'vscode';
import * as path from 'path';
import slash = require('slash');

export class Folder extends vs.TreeItem {

    constructor(
        public label: string,
        public _path: string,
        public relative_path: string,
        public contextValue?: string,
        public command?: vs.Command
    ) {
        super(label, vs.TreeItemCollapsibleState.None);
        this.tooltip = `${this._path}`;
        this.description = this.relative_path;
        this.contextValue = contextValue ? contextValue : "ALL";
    }
    iconPath = {
        light: path.join(__filename, '..', '../../', 'resources', 'light', 'folder.svg'),
        dark: path.join(__filename, '..', '../../', 'resources', 'dark', 'folder.svg')
    };
    toString(): string {
        if (vs.workspace.rootPath) {
           
            return slash(path.relative(vs.workspace.rootPath, this._path));
        }
        return slash(this.relative_path);
    }
    toObject(): object {
        if (this.relative_path === "" || this.relative_path === "") {
            console.log(this.relative_path);
            return <object>{
                path: "./",
                arch: this.contextValue
            };
        }
            return <object>{
                path: slash(this.relative_path),
                arch: this.contextValue
            };
        
    }
}
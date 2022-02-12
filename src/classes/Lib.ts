/* eslint-disable @typescript-eslint/naming-convention */
import * as vs from 'vscode';
import * as path from 'path';


export class Lib extends vs.TreeItem {

    constructor(
        public label: string,
        public ext: string,
        public contextValue: string,
        public _path?: string,
        public collapsibleState?: vs.TreeItemCollapsibleState,
        public command?: vs.Command
    ) {
        super(label, collapsibleState = vs.TreeItemCollapsibleState.None);
        this.tooltip = `${this.label}.${this.ext} -> ${this.contextValue}`;
        this.description = this.contextValue;
        if (this.ext.toLowerCase() === "lib") {
            this.iconPath = {
                light: path.join(__filename, '..', '../../', 'resources', 'light', 'Lib.svg'),
                dark: path.join(__filename, '..', '../../', 'resources', 'dark', 'Lib.svg')
            };
        } else if (this.ext.toLowerCase() === "dll") {
            this.iconPath = {
                light: path.join(__filename, '..', '../../', 'resources', 'light', 'dll.svg'),
                dark: path.join(__filename, '..', '../../', 'resources', 'dark', 'dll.svg')
            };
        } else if (this.ext.toLowerCase() === "a") {
            this.iconPath = {
                light: path.join(__filename, '..', '../../', 'resources', 'light', 'a.svg'),
                dark: path.join(__filename, '..', '../../', 'resources', 'dark', 'a.svg')
            };
        } else {
            this.iconPath = {
                light: path.join(__filename, '..', '../../', 'resources', 'light', 'file.svg'),
                dark: path.join(__filename, '..', '../../', 'resources', 'dark', 'file.svg')
            };
        }
    }
    iconPath?: object;
    toString(): string {
        return this.label + '.' + this.ext;
    }
    toObject(): object {
        return <object>{
            label: this.label + '.' + this.ext,
            arch: this.contextValue
        };
    }

}
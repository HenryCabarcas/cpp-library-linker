/* eslint-disable @typescript-eslint/naming-convention */
import { Lib } from './Lib';
import { Folder } from './Folder';

export interface configTemplate {
    Name: string,
    Includes: Folder[],
    Both: {
        libs: Lib[],
        libpaths: Folder[],
        binpaths: Folder[]

    },
    Debug: {
        libs: Lib[],
        libpaths: Folder[],
        binpaths: Folder[]

    },
    Release: {
        libs: Lib[],
        libpaths: Folder[],
        binpaths: Folder[]
    }
}
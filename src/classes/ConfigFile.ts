/* eslint-disable @typescript-eslint/naming-convention */
import { configTemplate } from './ConfigTemplate';

export class ConfigFile {
    constructor(data: configTemplate[], ver: string) {
        this.configuration = data;
        this.version = ver;
        this.object = <object>{};
    }
    configuration: configTemplate[];
    version: string;
    private object: object;
    toString(): string {
        this.object = this.parseObject();
        let text = JSON.stringify(this.object, null, 2);
        return text;
    }
    private parseObject(): object {
        return <object>{
            version: this.version,
            configuration: this.configuration.map((item): object => {
                return <object>{
                    Name: item.Name,
                    Includes: item.Includes ? item.Includes.map((include): string => {
                        return include.relative_path;
                    }) : [],
                    Both: {
                        libs: item.Both.libs ? item.Both.libs.map((lib): object => {
                            return lib.toObject();
                        }) : [],
                        libpaths: item.Both.libpaths ? item.Both.libpaths.map((_path): object => {
                            return _path.toObject();
                        }) : [],
                        binpaths: item.Both.binpaths ? item.Both.binpaths.map((_path): object => {
                            return _path.toObject();
                        }) : []
                    },
                    Debug: {
                        libs: item.Debug.libs ? item.Debug.libs.map((lib): object => {
                            return lib.toObject();
                        }) : [],
                        libpaths: item.Debug.libpaths ? item.Debug.libpaths.map((_path): object => {
                            return _path.toObject();
                        }) : [],
                        binpaths: item.Debug.binpaths ? item.Debug.binpaths.map((_path): object => {
                            return _path.toObject();
                        }) : []
                    },
                    Release: {
                        libs: item.Release.libs ? item.Release.libs.map((lib): object => {
                            return lib.toObject();
                        }) : [],
                        libpaths: item.Release.libpaths ? item.Release.libpaths.map((_path): object => {
                            return _path.toObject();
                        }) : [],
                        binpaths: item.Release.binpaths ? item.Release.binpaths.map((_path): object => {
                            return _path.toObject();
                        }) : []
                    }
                };
            })

        };
    }

}
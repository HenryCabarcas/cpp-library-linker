"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFile = void 0;
class ConfigFile {
    constructor(data, ver) {
        this.configuration = data;
        this.version = ver;
        this.object = {};
    }
    toString() {
        this.object = this.parseObject();
        let text = JSON.stringify(this.object, null, 2);
        return text;
    }
    parseObject() {
        return {
            version: this.version,
            configuration: this.configuration.map((item) => {
                return {
                    Name: item.Name,
                    Includes: item.Includes ? item.Includes.map((include) => {
                        return include.relative_path;
                    }) : [],
                    Both: {
                        libs: item.Both.libs ? item.Both.libs.map((lib) => {
                            return lib.toObject();
                        }) : [],
                        libpaths: item.Both.libpaths ? item.Both.libpaths.map((_path) => {
                            return _path.toObject();
                        }) : [],
                        binpaths: item.Both.binpaths ? item.Both.binpaths.map((_path) => {
                            return _path.toObject();
                        }) : []
                    },
                    Debug: {
                        libs: item.Debug.libs ? item.Debug.libs.map((lib) => {
                            return lib.toObject();
                        }) : [],
                        libpaths: item.Debug.libpaths ? item.Debug.libpaths.map((_path) => {
                            return _path.toObject();
                        }) : [],
                        binpaths: item.Debug.binpaths ? item.Debug.binpaths.map((_path) => {
                            return _path.toObject();
                        }) : []
                    },
                    Release: {
                        libs: item.Release.libs ? item.Release.libs.map((lib) => {
                            return lib.toObject();
                        }) : [],
                        libpaths: item.Release.libpaths ? item.Release.libpaths.map((_path) => {
                            return _path.toObject();
                        }) : [],
                        binpaths: item.Release.binpaths ? item.Release.binpaths.map((_path) => {
                            return _path.toObject();
                        }) : []
                    }
                };
            })
        };
    }
}
exports.ConfigFile = ConfigFile;
//# sourceMappingURL=ConfigFile.js.map
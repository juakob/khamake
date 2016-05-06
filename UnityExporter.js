"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const fs = require('fs-extra');
const path = require('path');
const KhaExporter_1 = require('./KhaExporter');
const Converter_1 = require('./Converter');
const Haxe_1 = require('./Haxe');
const ImageTool_1 = require('./ImageTool');
const uuid = require('./uuid.js');
class UnityExporter extends KhaExporter_1.KhaExporter {
    constructor(khaDirectory, directory) {
        super(khaDirectory, directory);
        this.directory = directory;
    }
    sysdir() {
        return 'unity';
    }
    exportSolution(name, platform, khaDirectory, haxeDirectory, from, _targetOptions, defines) {
        return __awaiter(this, void 0, void 0, function* () {
            this.addSourceDirectory("Kha/Backends/Unity");
            defines.push('no-root');
            defines.push('no-compilation');
            defines.push('sys_' + platform);
            defines.push('sys_g1');
            defines.push('sys_g2');
            defines.push('sys_g3');
            defines.push('sys_g4');
            defines.push('sys_a1');
            const options = {
                from: from.toString(),
                to: path.join(this.sysdir(), 'Assets', 'Sources'),
                sources: this.sources,
                libraries: this.libraries,
                defines: defines,
                parameters: this.parameters,
                haxeDirectory: haxeDirectory.toString(),
                system: this.sysdir(),
                language: 'cs',
                width: this.width,
                height: this.height,
                name: name
            };
            fs.removeSync(path.join(this.directory, this.sysdir(), 'Assets', 'Sources'));
            let result = yield Haxe_1.executeHaxe(this.directory, haxeDirectory, ['project-' + this.sysdir() + '.hxml']);
            var copyDirectory = (from, to) => {
                let files = fs.readdirSync(path.join(__dirname, 'Data', 'unity', from));
                fs.ensureDirSync(path.join(this.directory, this.sysdir(), to));
                for (let file of files) {
                    var text = fs.readFileSync(path.join(__dirname, 'Data', 'unity', from, file), { encoding: 'utf8' });
                    fs.writeFileSync(path.join(this.directory, this.sysdir(), to, file), text);
                }
            };
            copyDirectory('Assets', 'Assets');
            copyDirectory('Editor', 'Assets/Editor');
            copyDirectory('ProjectSettings', 'ProjectSettings');
            return result;
        });
    }
    /*copyMusic(platform, from, to, encoders, callback) {
        callback([to]);
    }*/
    copySound(platform, from, to, encoders) {
        return __awaiter(this, void 0, void 0, function* () {
            let ogg = yield Converter_1.convert(from, path.join(this.directory, this.sysdir(), 'Assets', 'Resources', 'Sounds', to + '.ogg'), encoders.oggEncoder);
            return [to + '.ogg'];
        });
    }
    copyImage(platform, from, to, asset) {
        return __awaiter(this, void 0, void 0, function* () {
            let format = yield ImageTool_1.exportImage(from, path.join(this.directory, this.sysdir(), 'Assets', 'Resources', 'Images', to), asset, undefined, false, true);
            return [to + '.' + format];
        });
    }
    copyBlob(platform, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            fs.copySync(from.toString(), path.join(this.directory, this.sysdir(), 'Assets', 'Resources', 'Blobs', to + '.bytes'), { clobber: true });
            return [to];
        });
    }
    copyVideo(platform, from, to, encoders) {
        return __awaiter(this, void 0, void 0, function* () {
            return [to];
        });
    }
}
exports.UnityExporter = UnityExporter;
//# sourceMappingURL=UnityExporter.js.map
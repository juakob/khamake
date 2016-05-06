"use strict";

import * as fs from 'fs-extra';
import * as path from 'path';
import {KhaExporter} from './KhaExporter';
import {convert} from './Converter';
import {executeHaxe} from './Haxe';
import {Options} from './Options';
import {exportImage} from './ImageTool';
import {writeHaxeProject} from './HaxeProject';

export class JavaExporter extends KhaExporter {
	parameters: Array<string>;
	
	constructor(khaDirectory, directory) {
		super(khaDirectory, directory);
	}

	sysdir() {
		return 'java';
	}

	async exportSolution(name, platform, khaDirectory, haxeDirectory, from, _targetOptions, defines) {
		this.addSourceDirectory("Kha/Backends/" + this.backend());

		fs.ensureDirSync(path.join(this.directory, this.sysdir()));
		
		defines.push('no-compilation');
		defines.push('sys_' + platform);
		defines.push('sys_g1');
		defines.push('sys_g2');
		defines.push('sys_a1');

		const options = {
			from: from.toString(),
			to: path.join(this.sysdir(), 'Sources'),
			sources: this.sources,
			libraries: this.libraries,
			defines: defines,
			parameters: this.parameters,
			haxeDirectory: haxeDirectory.toString(),
			system: this.sysdir(),
			language: 'java',
			width: this.width,
			height: this.height,
			name: name
		};
		await writeHaxeProject(this.directory.toString(), options);

		fs.removeSync(path.join(this.directory, this.sysdir(), 'Sources'));

		let result = await executeHaxe(this.directory, haxeDirectory, ['project-' + this.sysdir() + '.hxml']);
		this.exportEclipseProject();
		return result;
	}

	backend() {
		return 'Java';
	}

	exportEclipseProject() {
		this.writeFile(path.join(this.directory, this.sysdir(), '.classpath'));
		this.p("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
		this.p("<classpath>");
		this.p("\t<classpathentry kind=\"src\" path=\"Sources/src\"/>");
		this.p("\t<classpathentry kind=\"con\" path=\"org.eclipse.jdt.launching.JRE_CONTAINER\"/>");
		this.p("\t<classpathentry kind=\"output\" path=\"bin\"/>");
		this.p("</classpath>");
		this.closeFile();

		this.writeFile(path.join(this.directory, this.sysdir(), '.project'));
		this.p("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
		this.p("<projectDescription>");
		this.p("\t<name>" + this.getCurrentDirectoryName(this.directory) + "</name>");
		this.p("\t<comment></comment>");
		this.p("\t<projects>");
		this.p("\t</projects>");
		this.p("\t<buildSpec>");
		this.p("\t\t<buildCommand>");
		this.p("\t\t\t<name>org.eclipse.jdt.core.javabuilder</name>");
		this.p("\t\t\t<arguments>");
		this.p("\t\t\t</arguments>");
		this.p("\t\t</buildCommand>");
		this.p("\t</buildSpec>");
		this.p("\t<natures>");
		this.p("\t\t<nature>org.eclipse.jdt.core.javanature</nature>");
		this.p("\t</natures>");
		this.p("</projectDescription>");
		this.closeFile();
	}

	/*copyMusic(platform, from, to, encoders) {
		this.copyFile(from, this.directory.resolve(this.sysdir()).resolve(to + '.wav'));
		callback([to + '.wav']);
	}*/

	async copySound(platform, from, to, encoders) {
		fs.copySync(from.toString(), path.join(this.directory, this.sysdir(), to + '.wav'), { clobber: true });
		return [to + '.wav'];
	}

	async copyImage(platform, from, to, asset) {
		let format = exportImage(from, path.join(this.directory, this.sysdir(), to), asset, undefined, false);
		return [to + '.' + format];
	}

	async copyBlob(platform, from, to) {
		fs.copySync(from.toString(), path.join(this.directory, this.sysdir(), to), { clobber: true });
		return [to];
	}

	async copyVideo(platform, from, to, encoders) {
		return [to];
	}
}

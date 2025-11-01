// https://www.npmjs.com/package/emscripten-data-loader
//#region src/index.ts
function loadData(module, metadata, data, dependencyId) {
	function createDataFiles() {
		const bytes = new Uint8Array(data);
		for (const { filename, start, end } of metadata.files) {
			const data$1 = bytes.subarray(start, end);
			module.FS_createDataFile(filename, null, data$1, true, true, true);
		}
		module.removeRunDependency(dependencyId);
	}
	module.addRunDependency(dependencyId);
	if (module.calledRun) createDataFiles();
	else {
		if (!module.preRun) module.preRun = [];
		module.preRun.push(createDataFiles);
	}
}

//#endregion
export { loadData };
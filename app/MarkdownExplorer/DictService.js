const fs = require('fs');
const _ = require('lodash');

class DictService {
	constructor() {
		this.initDb();
	}

	initDb() {
		this.filesDictDb = new PouchDB('files-dict');
	}

	deleteDb() {
		return this.filesDictDb.destroy().then(() => this.initDb());
	}

	genDictionaries(mdList) {
		mdList.forEach(mdFile => this.genDictionary(mdFile));
	}

	genDictionary(mdFile) {
		this.getFsStatPromise(mdFile).then(fstat =>
			this.filesDictDb
				.get(mdFile)
				.then(dictData => {
					this.updateDictData(mdFile, fstat, dictData);
				})
				.catch(() => this.createDictData(mdFile, fstat))
		);
	}

	updateDictData(mdFile, fstat, dictData) {
		if (
			dictData.mtimeMs !== fstat.mtimeMs ||
			dictData.size !== fstat.size
		) {
			// update dict
			this.getDictOfFilePromise(mdFile).then(dict => {
				dictData.dict = dict;
				dictData.mtimeMs = fstat.mtimeMs;
				dictData.size = fstat.size;
				this.filesDictDb.put(dictData);
			});
		}
	}

	createDictData(mdFile, fstat) {
		this.getDictOfFilePromise(mdFile).then(dict => {
			this.filesDictDb.put({
				_id: mdFile,
				dict: dict,
				mtimeMs: fstat.mtimeMs,
				size: fstat.size,
			});
		});
	}

	getFsStatPromise(mdFile) {
		return new Promise((resolve, reject) =>
			fs.stat(mdFile, (err, fstat) => {
				if (err) {
					reject(err);
				} else {
					resolve(fstat);
				}
			})
		);
	}

	getDictOfFilePromise(mdFile) {
		return new Promise((resolve, reject) => {
			fs.readFile(mdFile, 'utf8', (err, content) => {
				if (err) {
					reject(err);
				} else {
					const words = this.getWords(content);
					resolve(words);
				}
			});
		});
	}

	getWords(text) {
		return _(text.toLowerCase().match(/[-_0-9a-zÀ-ÿ\u00C0-\u017F]{4,}/g))
			.sortBy()
			.sortedUniq()
			.value();
	}

	fileContainFilterStrArrayPromise(filePath, filterStrArray) {
		return this.filesDictDb
			.get(filePath)
			.then(dictData =>
				filterStrArray.every(filterStr =>
					dictData.dict.some(word =>
						word.includes(filterStr.toLowerCase())
					)
				)
			);
	}
}

module.exports = DictService;

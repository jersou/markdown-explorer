class ConfigController {
	constructor(
		$uibModalInstance,
		ConfigService,
		MarkdownExplorerService,
		DictService
	) {
		Object.assign(this, {
			$uibModalInstance,
			ConfigService,
			MarkdownExplorerService,
			DictService,
		});
		this.updateDbInfo();
		this.ingoreFolderNames = this.ConfigService.config.ingoreFolderNames.join(
			', '
		);
		this.removeNumbersAtBeginOfFileNames = this.ConfigService.config.removeNumbersAtBeginOfFileNames;
		$uibModalInstance.closed.then(() => this.onClose());
	}

	updateDbInfo() {
		this.MarkdownExplorerService.treeDb
			.info()
			.then(info => (this.treeDbCount = info.doc_count));

		this.DictService.filesDictDb
			.info()
			.then(info => (this.fileDbCount = info.doc_count));
	}

	clearFileDb() {
		this.DictService.deleteDb().then(() => this.updateDbInfo());
	}

	clearTreeDb() {
		this.MarkdownExplorerService
			.deleteTreeDb()
			.then(() => this.updateDbInfo());
	}

	ok() {
		this.$uibModalInstance.close();
	}

	onClose() {
		this.ConfigService.updateFromStr(this.ingoreFolderNames);
		this.ConfigService.updateRemoveNumbersAtBegin(
			this.removeNumbersAtBeginOfFileNames
		);
	}
}

module.exports = ConfigController;

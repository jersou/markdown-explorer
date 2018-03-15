class MarkdownExplorerController {
	constructor(MarkdownExplorerService, ConfigService) {
		Object.assign(this, {
			MarkdownExplorerService,
			ConfigService,
		});
	}

	toggleIncludeFoldrNameFilter() {
		this.MarkdownExplorerService.filterFolder = !this
			.MarkdownExplorerService.filterFolder;
		this.MarkdownExplorerService.filterTree();
	}

	showHelp() {
		this.MarkdownExplorerService.showAppHelp();
	}
}

module.exports = MarkdownExplorerController;

class MarkdownExplorerController {
	constructor(MarkdownExplorerService, ConfigService, $timeout) {
		Object.assign(this, {
			MarkdownExplorerService,
			ConfigService,
			$timeout,
		});
	}

	$onInit() {
		// FIXME
		this.$timeout(() => {
			const element = angular.element(
				document.getElementsByClassName('filter-input')
			);
			if (element && element[0]) {
				element[0].focus();
			}
		}, 1000);
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

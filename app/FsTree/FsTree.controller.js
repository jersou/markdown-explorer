class FsTreeController {
	constructor(
		MarkdownExplorerService,
		$rootScope,
		FsTreeService,
		ConfigService
	) {
		Object.assign(this, {
			MarkdownExplorerService,
			$rootScope,
			FsTreeService,
			ConfigService,
		});
	}

	$onInit() {
		this.$rootScope.$on('md-file-changed', (event, { mdPath }) =>
			this.selectedFileChanged(mdPath)
		);
		this.$rootScope.$on('expand-all', () => this.expandAll());
	}

	selectedFileChanged(mdPath) {
		this.filePath = mdPath;
		if (this.filePath) {
			this.FsTreeService.expandToFile(
				this.MarkdownExplorerService.fsTree,
				this.FsTreeService.getRelativePath(
					this.ConfigService.path,
					this.filePath
				)
			);
		}
	}

	comparator(v1, v2) {
		if (!v1.isFolder && v2.isFolder) {
			return 1;
		}
		if (v1.isFolder && !v2.isFolder) {
			return -1;
		}
		return v1.baseName.localeCompare(v2.baseName);
	}

	sortFolder(folder) {
		if (folder) {
			return Object.values(folder).sort(this.comparator);
		}
		return folder;
	}

	expandAll(nodes = this.MarkdownExplorerService.fsTree.nodes) {
		Object.values(nodes).map(node => {
			if (node.isFolder) {
				node.expanded = true;
				this.expandAll(node.nodes);
			}
		});
	}

	collapseAll(nodes = this.MarkdownExplorerService.fsTree.nodes) {
		this.isExpandLocked = false;
		Object.values(nodes).map(node => {
			if (node.isFolder) {
				node.expanded = false;
				this.collapseAll(node.nodes);
			}
		});
	}
}

module.exports = FsTreeController;

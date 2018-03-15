const fs = require('fs');
const { remote, ipcMain, ipcRenderer, shell } = require('electron');
const util = require('util');
const _ = require('lodash');
const path = require('path');

class MarkdownExplorerService {
	constructor(
		$timeout,
		DictService,
		TreeFilterService,
		FsTreeService,
		ConfigService,
		$rootScope
	) {
		Object.assign(this, {
			$timeout,
			DictService,
			TreeFilterService,
			FsTreeService,
			ConfigService,
			$rootScope,
		});
		this.filterContent = true;
		this.filterFolder = true;
		this.isSave = true;
		this.mainWindow = remote.getGlobal('mainWindow');
		this.initConfig = remote.getGlobal('initConfig');
		if (this.initConfig) {
			this.ConfigService.patchConfig(this.initConfig);
		}

		this.initTreeDb();
		this.ConfigService.isDebugMode = remote.getGlobal(
			'markdownExplorerDebugEnable'
		);
		this.ConfigService.electronConnectDebugEnable = remote.getGlobal(
			'electronConnectDebugEnable'
		);

		if (this.ConfigService.electronConnectDebugEnable) {
			require('electron-connect').client.create();
		}
		if (this.mainWindow.isVisible()) {
			this.init();
		} else {
			this.mainWindow.webContents.on('did-finish-load', () =>
				this.$timeout(() => this.init(), 10)
			);
		}
		ipcRenderer.on('selected-directory', (event, path) => {
			this.loadFsTree(path[0]);
			this.$rootScope.$apply();
		});

		this.$rootScope.$on('reloadFsTreeRequired', () =>
			this.loadFsTree(this.ConfigService.path, false)
		);
	}

	init() {
		this.$timeout(() => (this.ready = true), 10);

		document.ondragover = document.ondrop = ev => {
			ev.preventDefault();
		};

		document.ondrop = ev => {
			ev.preventDefault();
			const path = ev.dataTransfer.files[0].path;
			this.$timeout(() => {
				this.loadFsTree(path);
			}, 0);
		};

		this.previousStack = [];
		this.nextStack = [];

		this.openLastTreeAndMd();
	}

	initTreeDb() {
		this.treeDb = new PouchDB('trees');
	}

	showMdFile(filePath, updateHistory = true, scrollPosition = 0) {
		if (/*this.filePath !== filePath &&*/ filePath) {
			this.filePath = filePath;
			if (updateHistory) {
				this.updateHistory();
			}
			this.$rootScope.$broadcast('md-file-changed', {
				mdPath: this.filePath,
				scrollPosition,
			});
			this.updateLastOpenedFile();

			this.FsTreeService.expandToFile(
				this.fsTree,
				this.FsTreeService.getRelativePath(
					this.ConfigService.path,
					this.filePath
				)
			);
		} else {
			this.filePath = filePath;
		}
	}

	updateScroll(position) {
		this.scrollPosition = position;
	}

	updateHistory() {
		if (this.previousStack.length > 0) {
			const last = this.previousStack[this.previousStack.length - 1];

			if (
				last.treePath === this.ConfigService.path &&
				last.filePath === this.filePath
			) {
				return;
			}

			last.scrollPosition = this.scrollPosition;
		}

		this.previousStack.push({
			treePath: this.ConfigService.path,
			filePath: this.filePath,
		});
		if (
			this.nextStack.length > 0 &&
			this.nextStack[0].treePath === this.ConfigService.path &&
			this.nextStack[0].filePath === this.filePath
		) {
			this.nextStack.shift();
		} else {
			this.nextStack = [];
		}
	}

	goToPreviousMd() {
		this.nextStack.unshift(this.previousStack.pop());
		this.nextStack[0].scrollPosition = this.scrollPosition;
		const last = this.previousStack[this.previousStack.length - 1];
		if (last.treePath !== this.ConfigService.path) {
			this.loadFsTree(last.treePath, false);
		}
		if (last.filePath !== this.filePath) {
			this.scrollPosition = last.scrollPosition;
			this.showMdFile(last.filePath, false, last.scrollPosition);
		}
	}

	goToNextMd() {
		const next = this.nextStack[0];
		if (next.treePath !== this.ConfigService.path) {
			this.loadFsTree(next.treePath, false);
		}
		if (next.filePath !== this.filePath) {
			this.scrollPosition = next.scrollPosition;
			this.showMdFile(next.filePath, true, next.scrollPosition);
		}
	}

	updateLastOpenedFile() {
		this.ConfigService.patchConfig({
			lastOpenedFile: this.filePath,
			lastOpenedTree: this.ConfigService.path,
		});
	}

	openDialogFsTree() {
		ipcRenderer.send('open-file-dialog');
	}

	clearCache() {
		this.DictService.deleteDb();
		this.deleteTreeDb();
	}

	deleteTreeDb() {
		return this.treeDb.destroy().then(() => this.initTreeDb());
	}

	openLastTreeAndMd() {
		if (this.ConfigService.config.lastOpenedFile) {
			this.ConfigService.path = this.ConfigService.config.lastOpenedTree;
			this.showMdFile(this.ConfigService.config.lastOpenedFile);
			this.loadFsTree(
				this.ConfigService.config.lastOpenedTree,
				false
			).then(() => {
				this.FsTreeService.expandToFile(
					this.fsTree,
					this.FsTreeService.getRelativePath(
						this.ConfigService.path,
						this.filePath
					)
				);
				this.$rootScope.$apply();
			});
		} else {
			this.showAppHelp();
		}
	}

	showAppHelp() {
		const docPath = path.normalize(
			__dirname + path.sep + '..' + path.sep + '..' + path.sep + 'doc'
		);
		this.loadFsTree(docPath);
	}

	setFsTree(tree) {
		this.TreeFilterService.reducePath(tree);
		if (!this.fsTreeOrig) {
			this.fsTreeOrig = {};
		}
		this.sync(tree, this.fsTreeOrig);
		if (!this.fsTree) {
			this.fsTree = {};
		}
		this.sync(this.fsTreeOrig, this.fsTree);
	}

	// faire assign sans écraser ref, pour garder pliages arbo
	sync(source, dest) {
		const sourceKeys = Object.keys(source);
		sourceKeys.forEach(key => {
			if (_.isObject(sourceKeys[key])) {
				if (_.isUndefined(dest[key])) {
					dest[key] = _.cloneDeep(source[key]);
				} else {
					this.sync(source[key], dest[key]);
				}
			} else {
				if (!_.isEqual(dest[key], source[key])) {
					dest[key] = source[key];
				}
			}
		});
		Object.keys(dest)
			.filter(key => !sourceKeys.includes(key))
			.forEach(key => delete dest[key]);
	}

	reloadFsTree() {
		this.loadFsTree(this.ConfigService.path);
	}

	loadFsTree(path, resetMd = true) {
		this.ConfigService.path = path;
		this.ready = false;
		if (resetMd) {
			this.showMdFile(null);
		}
		return this.treeDb
			.get(path)
			.then(resp => {
				this.setFsTree(resp.tree);
				this.$timeout(() => {
					this.ready = true;
					this.$rootScope.$apply();
				}, 0);
				this.updatingFsTree = true;
				return this.$timeout(() => {
					const tree = this.FsTreeService.getFsTree(path);
					this.mdList = this.getMdListFromTree(tree);
					this.DictService.genDictionaries(this.mdList);
					this.setFsTree(tree);
					this.updatingFsTree = false;
					resp.tree = tree;
					resp.timestamp = Date.now();
					this.treeDb.put(resp);
				}, 10);
			})
			.catch(err => {
				this.updatingFsTree = true;
				return this.$timeout(() => {
					const tree = this.FsTreeService.getFsTree(path);
					this.mdList = this.getMdListFromTree(tree);
					this.DictService.genDictionaries(this.mdList);
					this.setFsTree(tree);
					this.updatingFsTree = false;
					this.ready = true;
					this.treeDb.put({
						_id: path,
						tree: tree,
						timestamp: Date.now(),
					});
				}, 10);
			})
			.then(() => this.openFirstMd());
	}

	openFirstMd() {
		if (this.mdList && this.mdList.length && this.filePath === null) {
			const ordererdList = _.sortBy(
				this.mdList,
				mPath => mPath.split(path.sep).length
			);
			this.showMdFile(ordererdList[0]);
		}
	}

	getMdListFromTree(tree, list = []) {
		if (tree.isFolder) {
			for (const [key, node] of Object.entries(tree.nodes)) {
				this.getMdListFromTree(node, list);
			}
		} else {
			list.push(tree.filePath);
		}
		return list;
	}

	filterTree() {
		if (this.filterStr) {
			const strArray = this.filterStr.split(/\s+/);
			this.$rootScope.$broadcast('expand-all');
			const fsTree = angular.copy(this.fsTreeOrig);
			if (this.filterContent) {
				this.TreeFilterService
					.removeFilteredByFileContent(fsTree, strArray)
					.then(() => {
						this.TreeFilterService.reducePath(fsTree);
						this.fsTree = fsTree;
						this.$rootScope.$apply();
					});
			} else {
				this.TreeFilterService.removeFilteredByFileName(
					fsTree,
					this.filterFolder,
					strArray
				);
				this.TreeFilterService.reducePath(fsTree);
				this.fsTree = fsTree;
			}
		} else {
			this.fsTree = this.TreeFilterService.reducePath(
				angular.copy(this.fsTreeOrig)
			);
		}
	}

	openMdInFileBrowser() {
		shell.showItemInFolder(this.ConfigService.config.lastOpenedFile);
	}
}

module.exports = MarkdownExplorerService;

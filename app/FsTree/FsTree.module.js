const FsTreeController = require('./FsTree.controller');
const FsTreeService = require('./FsTree.service');
const TreeFilterService = require('./TreeFilterService');
const FsTreeComponent = require('./FsTree.component');

const FsTreeModule = angular
	.module('markdown-explorer.fs-tree', [])
	.controller(FsTreeController.name, FsTreeController)
	.service(FsTreeService.name, FsTreeService)
	.service(TreeFilterService.name, TreeFilterService)
	.component('markdownExplorerFsTree', new FsTreeComponent());

module.exports = FsTreeModule;

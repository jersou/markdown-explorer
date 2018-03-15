class FsTreeComponent {
	constructor() {
		this.controller = 'FsTreeController as vm';
		this.templateUrl =
			__dirname.replace('\\', '/') + '/FsTree.template.html';
		this.bindings = { fsTree: '<', isExpandLocked: '=', treePath: '=' };
	}
}

module.exports = FsTreeComponent;

class MdPartComponent {
	constructor() {
		this.controller = 'MdPartController as vm';
		this.templateUrl =
			__dirname.replace('\\', '/') + '/MdPart.template.html';
		this.bindings = { path: '=', filterStr: '=' };
	}
}

module.exports = MdPartComponent;

const MdPartComponent = require('./MdPart.component');
const MdPartController = require('./MdPart.controller');

const MdPartModule = angular
	.module('markdown-explorer.MdPart', [])
	.controller(MdPartController.name, MdPartController)
	.component('markdownExplorerMdPart', new MdPartComponent());

module.exports = MdPartModule;

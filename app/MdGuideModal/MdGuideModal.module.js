const MdGuideModalController = require('./MdGuideModal.controller');
const MdGuideModalService = require('./MdGuideModal.service');

const MdGuideModalModule = angular
	.module('markdown-explorer.mdGuideModal', ['ngAnimate', 'ui.bootstrap'])
	.service(MdGuideModalService.name, MdGuideModalService)
	.controller(MdGuideModalController.name, MdGuideModalController);

module.exports = MdGuideModalModule;

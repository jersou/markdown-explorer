'use strict';

const MarkdownExplorerController = require('./MarkdownExplorer.controller');
const DictService = require('./DictService');
const MdPartModule = require('../MdPart/MdPart.module');
const FsTreeModule = require('../FsTree/FsTree.module');
const MarkdownExplorerService = require('./MarkdownExplorer.service');
const ConfigModule = require('../Config/Config.module');
const MdGuideModalModule = require('../MdGuideModal/MdGuideModal.module');

angular
	.module('app', [
		'ui.bootstrap',
		'ui.layout',
		MdPartModule.name,
		FsTreeModule.name,
		ConfigModule.name,
		MdGuideModalModule.name,
		'ngAnimate',
	])
	.service(DictService.name, DictService)
	.service(MarkdownExplorerService.name, MarkdownExplorerService)
	.controller(MarkdownExplorerController.name, MarkdownExplorerController)
	.filter('highlight', $sce => (str, termsToHighlight) => {
		if (str && termsToHighlight) {
			const regex = new RegExp(
				'(' +
					termsToHighlight.split(' ').join('|') +
					')' +
					'(?![^<>]*>)',
				'gi'
			);
			return $sce.trustAsHtml(
				str.replace(regex, '<span class="highlightedText">$&</span>')
			);
		}
		return $sce.trustAsHtml(str);
	});

const ConfigController = require('./Config.controller');
const ConfigService = require('./Config.service');

const ConfigModule = angular
	.module('markdown-explorer.config', ['ngAnimate', 'ui.bootstrap'])
	.service(ConfigService.name, ConfigService)
	.controller(ConfigController.name, ConfigController);

module.exports = ConfigModule;

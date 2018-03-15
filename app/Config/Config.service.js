const _ = require('lodash');

class ConfigService {
	constructor($uibModal, $rootScope) {
		Object.assign(this, { $uibModal, $rootScope });
		this.loadConfig();
	}

	openConfigModal() {
		this.modalInstance = this.$uibModal.open({
			animation: true,
			templateUrl: __dirname.replace('\\', '/') + '/Config.template.html',
			controller: 'ConfigController',
			controllerAs: 'vm',
			size: 'lg',
		});

		this.modalInstance.result.then(() => {});
	}

	loadConfig() {
		const config = localStorage.getItem('config');
		if (config) {
			try {
				this.config = angular.fromJson(config);
			} catch (err) {
				this.config = {};
			}
		} else {
			this.config = { removeNumbersAtBeginOfFileNames: true };
		}
		if (!this.config.ingoreFolderNames) {
			this.config.ingoreFolderNames = [
				'node_modules',
				'bower_components',
			];
		}
	}

	updateFromStr(str) {
		const old = this.config.ingoreFolderNames;
		this.config.ingoreFolderNames = str.split(',').map(name => name.trim());
		if (!_.isEqual(old, this.config.ingoreFolderNames)) {
			this.requestReloadFsTree();
			this.saveConfig();
		}
	}

	requestReloadFsTree() {
		this.$rootScope.$broadcast(
			'reloadFsTreeRequired',
			this.config.ingoreFolderNames
		);
	}

	saveConfig() {
		localStorage.setItem('config', angular.toJson(this.config));
	}

	patchConfig(patch) {
		Object.assign(this.config, patch);
		this.saveConfig();
	}

	updateRemoveNumbersAtBegin(removeNumbersAtBeginOfFileNames) {
		if (
			removeNumbersAtBeginOfFileNames !==
			this.config.removeNumbersAtBeginOfFileNames
		) {
			this.config.removeNumbersAtBeginOfFileNames = removeNumbersAtBeginOfFileNames;
			this.saveConfig();
			this.requestReloadFsTree();
		}
	}
}

module.exports = ConfigService;

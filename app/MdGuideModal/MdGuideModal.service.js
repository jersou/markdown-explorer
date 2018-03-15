const _ = require('lodash');

class MdGuideModalService {
	constructor($uibModal, $rootScope) {
		Object.assign(this, { $uibModal, $rootScope });
	}

	open() {
		this.modalInstance = this.$uibModal.open({
			animation: true,
			templateUrl:
				__dirname.replace('\\', '/') + '/MdGuideModal.template.html',
			controller: 'MdGuideModalController',
			controllerAs: 'vm',
			size: 'lg',
		});
	}
}

module.exports = MdGuideModalService;

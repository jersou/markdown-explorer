class MdGuideModalController {
	constructor($uibModalInstance) {
		Object.assign(this, { $uibModalInstance });
		$uibModalInstance.closed.then(() => this.onClose());
	}

	ok() {
		this.$uibModalInstance.close();
	}
}

module.exports = MdGuideModalController;

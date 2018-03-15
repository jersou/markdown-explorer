const fs = require('fs');
const _ = require('lodash');

class TreeFilterService {
	constructor(DictService) {
		Object.assign(this, { DictService });
	}

	reducePath(tree, level) {
		if (!level) {
			level = 0;
		}
		if (tree.isFolder) {
			Object.values(tree.nodes).forEach(node => {
				this.reducePath(node, level + 1);
			});
			const first = Object.values(tree.nodes)[0];
			if (
				Object.keys(tree.nodes).length == 1 &&
				first.isFolder &&
				level > 0
			) {
				tree.name += '/' + first.name;
				tree.nodes = first.nodes;
			}
		}
		return tree;
	}

	// FIXME
	removeFilteredByFileContent(tree, filterStrArray) {
		if (tree.isFolder) {
			return Promise.all(
				Object.entries(tree.nodes).map(([key, node]) => {
					if (node.isFolder) {
						return Promise.all(
							Object.entries(
								node.nodes
							).map(([subKey, subTree]) =>
								this.removeFilteredByFileContent(
									subTree,
									filterStrArray
								).then(result => {
									if (!result) {
										delete node.nodes[subKey];
									}
									return result;
								})
							)
						).then(() => {
							if (Object.keys(node.nodes).length === 0) {
								delete tree.nodes[key];
							}
							return false;
						});
					} else {
						return this.DictService
							.fileContainFilterStrArrayPromise(
								node.filePath,
								filterStrArray
							)
							.then(result => {
								if (!result) {
									delete tree.nodes[key];
								}
								return result;
							});
					}
				})
			).then(() => Object.keys(tree.nodes).length);
		} else {
			return this.DictService.fileContainFilterStrArrayPromise(
				tree.filePath,
				filterStrArray
			);
		}
	}

	// return true if the tree need to be removed
	filterTreeByFileName(tree, filterFolder, filterStrArray) {
		if (tree.isFolder) {
			if (
				!filterFolder ||
				!this.nameIsFiltered(tree.name, filterStrArray)
			) {
				this.filterTreeByFileName(tree, filterFolder, filterStrArray);
			}
			return Object.keys(tree.nodes).length == 0;
		}
		return this.nameIsFiltered(tree.name, filterStrArray);
	}

	removeFilteredByFileName(tree, filterFolder, filterStrArray) {
		for (const [key, node] of Object.entries(tree.nodes)) {
			if (node.isFolder) {
				if (
					(!filterFolder ||
						this.nameIsFiltered(node.name, filterStrArray)) &&
					this.removeFilteredByFileName(
						node,
						filterFolder,
						filterStrArray
					)
				) {
					delete tree.nodes[key];
				}
			} else if (this.nameIsFiltered(node.name, filterStrArray)) {
				delete tree.nodes[key];
			}
		}
		return Object.keys(tree.nodes).length == 0;
	}

	// return true if the tree need to be removed
	nameIsFiltered(name, filterStrArray) {
		return filterStrArray.some(
			str => !name.toLowerCase().includes(str.toLowerCase())
		);
	}
}

module.exports = TreeFilterService;

const fs = require('fs');
const path = require('path');

class FsTreeService {
	constructor(ConfigService) {
		Object.assign(this, { ConfigService });
	}

	getFsTree(filePath) {
		const baseName = path.basename(filePath);
		if (fs.lstatSync(filePath).isDirectory()) {
			let name = baseName.replace(/_/g, ' ');
			if (this.ConfigService.config.removeNumbersAtBeginOfFileNames) {
				name = name.replace(/^\d+/, ' ');
			}

			const node = {
				nodes: {},
				isFolder: true,
				name,
				baseName,
			};
			const files = fs
				.readdirSync(filePath)
				.filter(
					filename =>
						!this.ConfigService.config.ingoreFolderNames.includes(
							filename
						)
				);
			files.forEach(file => {
				const tree = this.getFsTree(path.join(filePath, file));
				if (
					tree &&
					(!tree.isFolder ||
						(tree.nodes && Object.values(tree.nodes).length > 0))
				) {
					node.nodes[(tree.isFolder ? '0-' : '1-') + file] = tree;
				}
			});
			return node;
		} else {
			if (/\.md$/i.test(filePath)) {
				let name = baseName
					.replace(/_/g, ' ')
					.replace(/\.md$/, '')
					.trim();
				if (this.ConfigService.config.removeNumbersAtBeginOfFileNames) {
					name = name.replace(/^\d+/, ' ');
				}
				return {
					name,
					baseName,
					filePath,
				};
			}
		}
		return null;
	}

	getRelativePath(basePath, path) {
		return path.replace(basePath, '.');
	}

	expandToFile(tree, relativePath) {
		if (tree) {
			Object.values(tree.nodes).forEach(node => {
				const regex = new RegExp('^./' + node.name + '/');
				if (node.isFolder && regex.test(relativePath)) {
					node.expanded = true;
					this.expandToFile(node, relativePath.replace(regex, './'));
				}
			});
		}
	}
}

module.exports = FsTreeService;

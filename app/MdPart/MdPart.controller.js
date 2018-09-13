const $ = require('jquery');
const fs = require('fs');
const path = require('path');
const showdown = require('showdown');
const showdownToc = require('./showdown-toc');
const _ = require('lodash');
const { shell } = require('electron');
const uri2path = require('file-uri-to-path');

class MdPartController {
	constructor(
		$timeout,
		$anchorScroll,
		$location,
		$scope,
		$rootScope,
		FsTreeService,
		ConfigService,
		DictService,
		MarkdownExplorerService,
		MdGuideModalService
	) {
		Object.assign(this, {
			$timeout,
			$anchorScroll,
			$location,
			$rootScope,
			FsTreeService,
			ConfigService,
			DictService,
			MarkdownExplorerService,
			MdGuideModalService,
		});
		this.$scope = $scope;

		this.debouncedSave = _.debounce((path, content) => {
			this.save(path, content);
			this.$scope.$apply();
		}, 2000);

		this.$rootScope.$on(
			'md-file-changed',
			(event, { mdPath, scrollPosition }) =>
				this.showMdFile(mdPath, scrollPosition)
		);

		this.setClickEventCatch();

		this.viewerEl = angular.element(
			document.getElementsByClassName('viewer-part')
		);

		this.viewerEl.on('scroll', () =>
			this.MarkdownExplorerService.updateScroll(
				this.viewerEl[0].scrollTop
			)
		);
	}

	$onInit() {
		this.converter = new showdown.Converter({
			tables: true,
			strikethrough: true,
			omitExtraWLInCodeBlocks: true,
			parseImgDimensions: true,
			simplifiedAutoLink: true,
			excludeTrailingPunctuationFromURLs: true,
			tasklists: true,
			disableForced4SpacesIndentedSublists: true,
			openLinksInNewWindow: true,
			emoji: true,
			underline: true,
			extensions: [showdownToc],
		});

		// console.log(util.inspect(tree, { showHidden: false, depth: null }));
		this.simplemde = new SimpleMDE({
			autoDownloadFontAwesome: false,
			status: false,
			spellChecker: false,
			element: document.getElementById('txt'),

			previewRender: (plainText, preview) => {
				setTimeout(
					() => (preview.innerHTML = this.getHtml(plainText)),
					0
				);
				return '...';
			},

			toolbar: [
				{
					className: 'fa fa-bold',
					default: true,
					name: 'bold',
					title: 'Bold',
					action: SimpleMDE.toggleBold,
				},
				{
					className: 'fa fa-italic',
					default: true,
					name: 'italic',
					title: 'Italic',
					action: SimpleMDE.toggleItalic,
				},
				{
					className: 'fa fa-header',
					default: true,
					name: 'heading',
					title: 'Heading',
					action: SimpleMDE.toggleHeadingSmaller,
				},
				'|',
				{
					className: 'fa fa-quote-left',
					default: true,
					name: 'quote',
					title: 'Quote',
					action: SimpleMDE.toggleBlockquote,
				},
				{
					className: 'fa fa-list-ul',
					default: true,
					name: 'unordered-list',
					title: 'Generic List',
					action: SimpleMDE.toggleUnorderedList,
				},
				{
					className: 'fa fa-list-ol',
					default: true,
					name: 'ordered-list',
					title: 'Numbered List',
					action: SimpleMDE.toggleOrderedList,
				},
				'|',
				{
					className: 'fa fa-link',
					default: true,
					name: 'link',
					title: 'Create Link',
					action: SimpleMDE.drawLink,
				},
				{
					className: 'fa fa-picture-o',
					default: true,
					name: 'image',
					title: 'Insert Image',
					action: SimpleMDE.drawImage,
				},
				'|',
				{
					// TODO
					action: () => this.MdGuideModalService.open(),
					className: 'fa fa-question-circle',
					default: true,
					name: 'guide',
					title: 'Markdown Guide',
				},
				{
					className: 'fa fa-columns no-disable no-mobile hide-button',
					default: true,
					name: 'side-by-side',
					title: 'Toggle Side by Side',
				},
				{
					className:
						'fa fa-arrows-alt no-disable no-mobile hide-button',
					default: true,
					name: 'fullscreen',
					title: 'Toggle Fullscreen',
				},
			],
		});

		this.simplemde.toggleSideBySide();

		this.simplemde.codemirror.on('change', (inst, changeObj) => {
			this.text = this.simplemde.value();
			if (changeObj.origin !== 'setValue') {
				this.isSave = false;
				this.$scope.$apply();
				this.debouncedSave(this.filePath, this.text);
			}
		});
	}

	$onChanges() {
		if (this.filePath) {
			this.showMdFile(this.filePath);
		}
	}

	toggleMode() {
		this.editMode = !this.editMode;
		if (this.editMode) {
			this.$timeout(() => this.simplemde.value(this.text), 0);
		} else {
			this.text = this.simplemde.value();
			this.convertToHtml();
		}
	}

	showMdFile(path, scrollPosition = 0) {
		this.filePath = path;
		this.isSave = true;
		this.text = '';
		if (this.filePath) {
			this.text = fs.readFileSync(this.filePath, 'utf8');
			this.editMode = false;
			if (this.editMode) {
				this.simplemde.value(this.text);
			} else {
				this.convertToHtml();

				this.$timeout(() => {
					this.viewerEl[0].scrollTop = scrollPosition;
				}, 100);
			}
		}
	}

	convertToHtml() {
		let text;
		if (/^\[NO-TOC\]/.test(this.text)) {
			text = this.text.substring(8);
		} else {
			text = '[toc]\n\n------\n\n' + this.text;
		}

		this.html = '<div id="top"></div>' + this.getHtml(text);
	}

	getHtml(text) {
		return this.converter
				.makeHtml(text)
				.replace(/^\w*<p>(\[toc\])?<\/p>/, '')
				.replace(/<img src="(?!https?:\/\/|\.\/)/g, `<img src="./`)
			.replace(/<img src="\.\//g, `<img src="${this.getParentPath()}/`);
	}

	getParentPath() {
		return path.dirname(this.filePath);
	}

	save(path, content) {
		fs.writeFileSync(path, content, { encoding: 'utf8' });
		this.DictService.genDictionary(path);
		this.isSave = true;
	}

	setClickEventCatch() {
		//open links externally by default
		$(document).on('click', 'a[href^="http"]', function(event) {
			event.preventDefault();
			shell.openExternal(this.href);
		});
		// FIXME
		$(document).on('click', 'a[href]', event => {
			if (
				_.get(event, 'target.href') &&
				!/^http/.test(event.target.href)
			) {
				const appPath = path
					.normalize(__dirname + path.sep + '..')
					.concat(path.sep, 'MarkdownExplorer')
					.replace(/\\/g, '/');
				const newPath = event.target.href.replace(
					appPath,
					this.path.replace(/\\/g, '/')
				);

				if (/\.md$/gi.test(newPath)) {
					event.preventDefault();
					event.stopPropagation();
					this.MarkdownExplorerService.showMdFile(uri2path(newPath));
				}
			}
		});
	}
}

module.exports = MdPartController;

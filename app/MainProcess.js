'use strict';

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { client } = require('electron-connect');
const contextMenu = require('electron-context-menu');
const path = require('path');

class Main {
	constructor() {
		this.initDebugMode();
		this.initConfig();
		this.setEvents();
		this.finishInitDebugMode();
	}

	setEvents() {
		app.on('ready', () => this.createMainWindow());
		app.on(
			'activate',
			() => this.mainWindow === null && this.createMainWindow()
		);
		app.on(
			'window-all-closed',
			() => process.platform !== 'darwin' && app.quit()
		);

		ipcMain.on('open-file-dialog', event => {
			dialog.showOpenDialog({ properties: ['openDirectory'] }, files => {
				if (files) {
					event.sender.send('selected-directory', files);
				}
			});
		});
	}

	createMainWindow() {
		this.mainWindow = new BrowserWindow({
			width: 1200,
			height: 800,
			show: false,
			icon: path.normalize(
				__dirname + path.sep + '..' + path.sep + 'icon.png'
			),
		});

		if (global.markdownExplorerDebugEnable) {
			// debug mode
			this.mainWindow.setPosition(1300, 30);
			this.mainWindow.setSize(800, 400);
			//	this.mainWindow.setAlwaysOnTop(true);
		} else {
			this.mainWindow.setMenu(null);
		}

		contextMenu({ showInspectElement: global.markdownExplorerDebugEnable });

		global.mainWindow = this.mainWindow;

		this.mainWindow.loadURL(
			`file://${__dirname}/MarkdownExplorer/MarkdownExplorer.html`,
			{ extraHeaders: 'pragma: no-cache\n' }
		);
		this.mainWindow.webContents.on('did-finish-load', () =>
			this.mainWindow.show()
		);
		this.mainWindow.on('closed', () => (this.mainWindow = null));
	}

	initDebugMode() {
		global.markdownExplorerDebugEnable = process.argv.includes(
			'--debug-markdown-explorer'
		);

		global.electronConnectDebugEnable = process.argv.includes(
			'--enable-electron-connect'
		);

		if (global.electronConnectDebugEnable) {
			app.commandLine.appendSwitch('remote-debugging-port', '9222');
		}
	}

	initConfig() {
		if (process.argv.includes('--config')) {
			//
			const index = process.argv.indexOf('--config');
			global.initConfig = JSON.parse(process.argv[index + 1]);
		}
	}

	finishInitDebugMode() {
		if (global.markdownExplorerDebugEnable) {
			client.create(this.mainWindow);
		}
	}
}

new Main();

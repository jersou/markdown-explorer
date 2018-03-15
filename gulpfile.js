'use strict';

const gulp = require('gulp');
const electron = require('electron-connect').server.create();

gulp.task('default', () => {
	electron.start([
		'.',
		'--debug-markdown-explorer',
		'--enable-electron-connect',
		//		'--config',
		//		'{"ingoreFolderNames": ["node_modules","bower_components"], "lastOpenedFile": "doc/test1.md", "lastOpenedTree": "./doc"}',
	]);
	gulp.watch('app/MainProcess.js', electron.restart);
	gulp.watch(['app/**'], electron.reload);
});

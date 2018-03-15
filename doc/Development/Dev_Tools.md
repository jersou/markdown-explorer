[NO-TOC]


## Scripts

cf NPM scripts (package.json) :

* `npm start`: `electron .`,
* `npm run serve`: `gulp`,
* `npm run build`: `electron-packager . --out=dist --app-version=$npm_package_version --prune --asar --overwrite --all`,
* `npm run build-lin64`: `electron-packager . --out=dist --app-version=$npm_package_version --prune --asar --overwrite --icon=./icon.png --arch=x64 --platform=linux && cp -a ./doc dist/MarkdownExplorer-linux-x64/doc   && cp ./icon.png launchers/MarkdownExplorer.sh dist/MarkdownExplorer-linux-x64/`,
* `npm run build-win64`: `electron-packager . --out=dist --app-version=$npm_package_version --prune --asar --overwrite --icon=./icon.png --arch=x64 --platform=win32 && cp -a ./doc dist/MarkdownExplorer-windows-x64/doc && cp ./icon.png dist/MarkdownExplorer-linux-x64/`


## debug port

If the --debug-markdown-explorer arg is present, the port 9222 is open in the chronium instance.



[NO-TOC]
# CLI usage
## Configuration

Open with a specific configuration at app launch :
```
--config '{"ingoreFolderNames": ["node_modules"], "lastOpenedFile": "doc/test2.md", "lastOpenedTree": "./doc"}',
```

The argument is the configuration to extends, in json format.

Variables :
* ingoreFolderNames : array of folder names
* lastOpenedFile : path the file
* lastOpenedTree : path of the folder
* removeNumbersAtBeginOfFileNames : boolean

## Debug
T enable debug mode :
```
--debug-markdown-explorer
```
# VSCode-Hovering-Dictionary

Hovering-Dictionary is a VSCode extension for looking up words your mouse cursor is indicating.

This extension is inspired by [Mouse Dictionary](https://github.com/wtetsu/mouse-dictionary/) (MIT License, wtetsu, 2018).

## Features

**Fast looking up words with case sensitivity**

![demo.gif](https://github.com/Take-Me1010/vscode-hovering-dictionary/blob/main/image/demo.gif?raw=true)
(Note that this demonstration was held after importing 英辞郎(EIJIRO) dictionary data, see [#importing-dictionaries](#importing-dictionaries). Many expressions such as "on one's own" are NOT included in the default dictionary.)

[Mouse Dictionary](https://github.com/wtetsu/mouse-dictionary/) provides a very fast and flexible way to refer to a dictionary.
By partially using the code in this Chrome extension, I realize its similar function in VSCode!

### Importing dictionaries

This extension includes the default dictionary provided in [ejdict-hand](https://github.com/kujirahand/EJDict) (Public Domain).
In addition, you can import any dictionary formats you could import in [Mouse Dictionary](https://github.com/wtetsu/mouse-dictionary/).

You can import the dictionaries via the command `hovering-dictionary.import-dictionary`.

[This page](https://github.com/wtetsu/mouse-dictionary/wiki/Download-dictionary-data) which shows much information about some kinds of available dictionary files is also helpful.

## development

```shell
git clone https://github.com/Take-Me1010/vscode-hovering-dictionary.git
cd vscode-hovering-dictionary
yarn        # or npm i
code .
# debug this extension by F5 key.
```

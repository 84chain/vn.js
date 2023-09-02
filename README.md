# vn.js
A simple Visual Novel engine built with Electron and PIXI

### Quickstart
- npm install electron
- npm install pixi.js

## TODO before running
### index.js
- getNextScene
  
### renderer.js
- render
- loadFile
- create data files
- game object explained below


### Game object
A game object has a few default attributes: background, bgm, sprites, buttons, keybinds. Sprites and buttons are objects (PIXI.Sprite and button), keybind is a hash table, bgm is an object, and background is a path to an image file. You may create variables to keep track of within the game object and interact with these stored values via the callbacks of buttons and keybinds.

### Known (maybe unknown bugs)
- static scene rendering and animations were changed so they may be buggy

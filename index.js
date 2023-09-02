const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require("fs")
const util = require("./util/util.js")

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'

const createWindow = () => {
    const win = new BrowserWindow({
        width: util.WINDOW_WIDTH,
        height: util.WINDOW_HEIGHT,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        }
    })
    win.loadFile('index.html')
}

// game logic
function getNextScene(scene_id) {
    // game logic goes here
}


// ipc communication
ipcMain.on("ready", (event) => {
    console.log("renderer is ready")
    event.sender.send("ready")
})

ipcMain.on("save", (event, scene_id) => {
    fs.writeFile("savefile.txt", scene_id, (err) => {
        if (err) throw err
        event.sender.send("saved")
    })
    
})

ipcMain.on("save-settings", (event, settings_json) => {
    fs.writeFile("settings.txt", settings_json,  (err) => {
        if (err) throw err
        event.sender.send("settings-saved")
    })
})

ipcMain.on("next-scene", (event, scene_id) => {
    event.sender.send("next-scene", getNextScene(scene_id))
})

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
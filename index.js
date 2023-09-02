const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require("fs")

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        }
    })
    win.loadFile('index.html')
}


ipcMain.on("ready", (event) => {
    console.log("renderer is ready")
    event.sender.send("ready")
})

ipcMain.on("save", (event, arg) => {
    fs.writeFile("savefile.txt", arg, (err) => {
        if (err) throw err
        event.sender.send("saved")
    })
    
})

ipcMain.on("save-settings", (event, arg) => {
    fs.writeFile("settings.txt", arg,  (err) => {
        if (err) throw err
        event.sender.send("settings-saved")
    })
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
const { app, BrowserWindow, ipcMain } = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    })
    win.loadFile('index.html')
}

ipcMain.on("async", (event, arg) => {
    console.log(arg)
    event.sender.send("async-reply", "pepega")
})

ipcMain.on("sync", (event, arg) => {
    console.log(arg)
    event.returnValue = "pog"
})

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
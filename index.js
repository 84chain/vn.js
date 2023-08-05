const { app, BrowserWindow, ipcMain } = require('electron')

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

ipcMain.on('asynchronous-message', (event, arg) => {
    switch (arg) {
        case "ready":
            console.log("renderer is ready, sending saved scene")
            break
    }
 
    // Event emitter for sending asynchronous messages
    event.sender.send('asynchronous-reply', 'saved scene')
 })
 
 // Event handler for synchronous incoming messages
 ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg) 
 
    // Synchronous event emmision
    event.returnValue = 'sync pong'
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
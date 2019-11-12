const electron = require('electron');
const app = electron.app;
const globalShortcut = electron.globalShortcut;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences:
    {
      nodeIntegration: true,
      webSecurity: false
    }
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on('closed', () => mainWindow = null);

  globalShortcut.register("MediaNextTrack", () =>
  {
    mainWindow.webContents.send("app-command", "media-nexttrack");
  });

  globalShortcut.register("MediaPreviousTrack", () =>
  {
    mainWindow.webContents.send("app-command", "media-previoustrack");
  });

  globalShortcut.register("MediaPlayPause", () =>
  {
    mainWindow.webContents.send("app-command", "media-play-pause");
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("will-quit", () =>
{
  globalShortcut.unregisterAll();
});
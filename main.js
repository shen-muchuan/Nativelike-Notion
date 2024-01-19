const { app, BrowserWindow, shell } = require('electron');
const os = require('os');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const isWindows = os.platform() === 'win32';

  const win = new BrowserWindow({
    show: false,
    minWidth: 660,
    minHeight: 400,
    titleBarStyle: isWindows ? undefined : 'hiddenInset',
    /*frame: false,*/
    maximizable: false,
    autoHideMenuBar: isWindows ? true : false,
    vibrancy: 'sidebar',
    trafficLightPosition: { x: 18, y: 18 },
    backgroundMaterial: 'mica',
    webPreferences: {
      sandbox: true,
      spellcheck: false,
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.webContents.on('did-finish-load', () => {
    const cssFile = isWindows ? 'windows.css' : 'macos.css';
    const css = fs.readFileSync(path.join(__dirname, cssFile), 'utf8');
    win.webContents.insertCSS(css);
    const js = fs.readFileSync(path.join(__dirname, 'inject.js'), 'utf8');
    win.webContents.executeJavaScript(js);
  });

  win.loadURL('https://www.notion.so');

  win.once('ready-to-show', () => {
    win.show();
  });

  /*// Custom titlebar functionality
  ipcMain.on('minimize-app', () => {
    win.minimize();
  });

  ipcMain.on('maximize-app', () => {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });

  ipcMain.on('close-app', () => {
    win.close();
  });*/

  // Intercept new-window events and open URLs in the default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.includes('notion.so')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Intercept all navigation events
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.includes('notion.so')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
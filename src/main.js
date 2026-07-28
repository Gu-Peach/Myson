const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height: 220,
    x: 0,
    y: Math.max(0, height - 220),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  const menu = Menu.buildFromTemplate([
    { label: '叫爸', click: () => mainWindow.webContents.send('pet-command', 'dad') },
    { type: 'separator' },
    { label: '暂停猴群', click: () => mainWindow.webContents.send('pet-command', 'pause') },
    { label: '重新散开', click: () => mainWindow.webContents.send('pet-command', 'scatter') },
    { type: 'separator' },
    { label: '退出猴群', click: () => app.quit() },
  ]);

  ipcMain.on('show-context-menu', () => {
    menu.popup({ window: mainWindow });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

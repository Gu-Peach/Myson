const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('monkeyPets', {
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  onCommand: (callback) => ipcRenderer.on('pet-command', (_event, command) => callback(command)),
});

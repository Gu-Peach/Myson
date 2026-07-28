const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('monkeyPets', {
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  setMouseEventsIgnored: (shouldIgnore) => ipcRenderer.send('set-mouse-events', shouldIgnore),
  onCommand: (callback) => ipcRenderer.on('pet-command', (_event, command) => callback(command)),
});

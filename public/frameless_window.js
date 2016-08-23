"use strict";

function closeWindow() {
  window.close();
}

function minWindow() {
  const remote = require('electron');
  const BrowserWindow = remote;
  const win = BrowserWindow.getFocusedWindow();
  win.isMaximized() ? win.unmaximize() : win.maximize();
}

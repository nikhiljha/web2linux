"use strict";

// VARIABLES
// Just set these and you'll be fine 99% of the time.
var webAppURL = ""; // This is the URL of the webapp. Cookies and logins are handled by default.
var frame = true; // Leave this at true unless you build your webapp for electron.
var title = ""; // The window title, by default it will say "for X platform" after it.

// We are based on electron, so we need to initiate it.
const electron = require('electron');
const {app, BrowserWindow} = electron;
var system = "Unknown OS";
var os = require('os')
if(require('electron-squirrel-startup')) return;

// Initial setup fixes
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};

switch(os.type()) {
    case "Linux":
        system = "Linux";
        break;
    case "Darwin":
        system = "Mac";
        break;
    case "Windows_NT":
        system = "Windows";
        break;
    default:
        system = "Unknown OS";
}

// When the app is ready...
app.on('ready', function () {

  // Create a new window and let it load in the background.
  var win = new BrowserWindow({frame: frame, nodeIntegration: true, width: 1280, height: 720, show: false, title: title + " for " + system});

  // When it is closed, delete the window.
  win.on('closed', function() {
    win = null;
  });

  // Don't let the page title change!
  win.on('page-title-updated', function(event) {
    event.preventDefault();
  });

  win.loadURL(webAppURL);
  win.show();
})

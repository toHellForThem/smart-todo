const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const fs = require('fs/promises');

const isDev = process.env.NODE_ENV === 'development';

// Register custom scheme
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true
    }
  }
]);

// Simple MIME-type map
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
  };
  return mimes[ext] || 'application/octet-stream';
};

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    title: 'ToDoSoDo',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:8081');
    win.webContents.openDevTools();
  } else {
    win.loadURL('app://./index.html');
  }
}

app.whenReady().then(() => {
  // Setup custom app:// handler
  protocol.handle('app', async (request) => {
    const url = new URL(request.url);
    let relativePath = url.pathname;
    
    if (relativePath.startsWith('/')) {
      relativePath = relativePath.slice(1);
    }
    if (!relativePath) {
      relativePath = 'index.html';
    }

    const absolutePath = path.normalize(
      path.join(__dirname, '../frontend/dist', relativePath)
    );

    try {
      const data = await fs.readFile(absolutePath);
      return new Response(data, {
        headers: { 'content-type': getMimeType(absolutePath) }
      });
    } catch (err) {
      try {
        const indexData = await fs.readFile(path.join(__dirname, '../frontend/dist/index.html'));
        return new Response(indexData, {
          headers: { 'content-type': 'text/html' }
        });
      } catch (indexErr) {
        return new Response('Not Found', { status: 404 });
      }
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

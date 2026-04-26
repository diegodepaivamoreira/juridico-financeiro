/**
 * JurisFinance — Electron Main Process
 * Aplicativo desktop para Windows 11
 */
import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import isDev from "electron-is-dev";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, "assets/icon.png"),
  });

  const startUrl = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "../dist/public/index.html")}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Menu
const template: any[] = [
  {
    label: "Arquivo",
    submenu: [
      {
        label: "Sair",
        accelerator: "CmdOrCtrl+Q",
        click: () => app.quit(),
      },
    ],
  },
  {
    label: "Editar",
    submenu: [
      { label: "Desfazer", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Refazer", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cortar", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copiar", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Colar", accelerator: "CmdOrCtrl+V", selector: "paste:" },
    ],
  },
  {
    label: "Ajuda",
    submenu: [
      {
        label: "Sobre JurisFinance",
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send("show-about");
          }
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// IPC handlers
ipcMain.handle("get-app-version", () => app.getVersion());
ipcMain.handle("get-app-name", () => "JurisFinance");
